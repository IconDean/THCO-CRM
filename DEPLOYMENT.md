# Deploying THCO CRM to Azure

The application runs as **one container**: FastAPI serves the API under `/api`
and the compiled React bundle for everything else. There is no separate
frontend service to deploy.

## 1. Database

The candidate search uses MongoDB **`$text` indexes**. Choose accordingly:

| Option | Text search | Notes |
|---|---|---|
| **Cosmos DB for MongoDB — vCore** | supported | Recommended. Azure-native, supports the indexes the app builds. |
| **MongoDB Atlas on Azure** | supported | Full compatibility, deploy into the same Azure region. |
| Cosmos DB for MongoDB — RU (serverless/provisioned) | **not supported** | The app degrades to a regex fallback instead of failing, but candidate search becomes a collection scan. Avoid. |

Create the database, then allow outbound access from the Web App (Cosmos:
add the Web App outbound IPs or use a private endpoint; Atlas: add them to the
IP access list).

### Migrating existing data

`backend/migrate_to_azure.py` copies every collection from the current database
to the target. It never deletes from the source, matches documents on their
natural key so re-runs update in place rather than duplicating, and verifies
counts and checksums per collection afterwards.

```bash
# 1. Preview - writes nothing
python backend/migrate_to_azure.py --target "<target-connection-string>"

# 2. Copy
python backend/migrate_to_azure.py --target "<target-connection-string>" --apply

# 3. Re-verify at any time, without writing
python backend/migrate_to_azure.py --target "<target-connection-string>" --verify-only
```

It exits non-zero if any collection fails to match, so it can gate a release.

Login sessions and analytics page-views are intentionally not copied - they are
ephemeral, and sessions would carry live tokens into the new environment. Users
sign in again after the move; no candidate data is affected.

## 2. Container registry and Web App

```bash
az group create --name thco-rg --location uksouth

az acr create --resource-group thco-rg --name <acrname> --sku Basic --admin-enabled true

az appservice plan create --resource-group thco-rg --name thco-plan \
  --is-linux --sku B1

az webapp create --resource-group thco-rg --plan thco-plan \
  --name <webappname> --deployment-container-image-name <acrname>.azurecr.io/thco-crm:latest
```

`B1` is the smallest plan that stays warm. The image installs `tesseract-ocr`
and `poppler-utils`, so CV OCR works without further setup.

## 3. Application settings

Set these on the Web App (Configuration → Application settings). They are read
from the environment; none belong in the image or the repository.

| Setting | Required | Purpose |
|---|---|---|
| `MONGO_URL` | yes | Database connection string |
| `DB_NAME` | yes | Database name, e.g. `thco_crm` |
| `JWT_SECRET` | yes | Session signing. Use a fresh random value, not the README default. |
| `CORS_ORIGINS` | yes | Comma-separated; include the Web App URL and any custom domain |
| `SERPER_KEY` | for sourcing | External candidate search |
| `SERPAPI_KEY` | for sourcing | External candidate search (fallback provider) |
| `GEMINI_API_KEY` | for enrichment | JD analysis, candidate enrichment |
| `GROQ_API_KEY` | optional | Alternative LLM provider |
| `RESEND_API_KEY` | for email | Stage-transition notifications |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | for Drive import | CV import from Google Drive |
| `WEBSITES_PORT` | yes | `8000` - tells App Service which port the container listens on |

The app starts without the optional keys; the corresponding features are
inactive rather than broken.

## 4. Continuous deployment

`.github/workflows/azure-deploy.yml` builds and deploys on every push to
`main`. Add three repository secrets:

- `AZURE_CREDENTIALS` - output of `az ad sp create-for-rbac --sdk-auth`
- `ACR_NAME` - registry name, without `.azurecr.io`
- `AZURE_WEBAPP_NAME` - Web App name

Images are tagged with the commit SHA, so rolling back means pointing the Web
App at an earlier tag. The workflow polls `/healthz` after deploying and fails
if the app does not come up.

## 5. Known constraints

**Uploaded files are not durable.** Proposal attachments are written to the
container filesystem (`backend/uploads/`), which is wiped on restart, scale, or
redeploy. Candidate data lives in MongoDB and is unaffected. To make uploads
durable, mount Azure Files at `/app/backend/uploads` (Web App → Configuration →
Path mappings) or move the upload path to Azure Blob Storage.

**Scaling beyond one instance.** The SLA scheduler runs in-process, so multiple
instances would each run it and could send duplicate reminders. Keep the app at
one instance, or move the scheduler out before scaling.

## 6. Verifying a deployment

```bash
curl https://<webappname>.azurewebsites.net/healthz        # {"status":"ok"}
curl https://<webappname>.azurewebsites.net/api/health     # includes a timestamp
```

Then sign in and open **Talent → Talent Network**; it should list the migrated
candidates. If the page renders but shows zero candidates, the container is
healthy and the database connection is pointing somewhere empty - check
`MONGO_URL` and `DB_NAME`.
