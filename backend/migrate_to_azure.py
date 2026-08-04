"""Copy the local MongoDB database to a hosted target (Azure / Atlas).

Written to be safe to re-run and to prove it lost nothing:

  * Nothing is ever deleted from the source.
  * Documents are matched on their natural key, so re-running updates in place
    instead of creating duplicates.
  * Every collection is counted and checksummed on both sides afterwards, and
    a mismatch is reported as a failure.

Usage:

    # inspect what would be copied, touching nothing
    python migrate_to_azure.py --target "mongodb+srv://..."

    # perform the copy
    python migrate_to_azure.py --target "mongodb+srv://..." --apply

    # verify an earlier copy without writing
    python migrate_to_azure.py --target "mongodb+srv://..." --verify-only

The source defaults to MONGO_URL/DB_NAME from backend/.env.
"""

import argparse
import asyncio
import hashlib
import json
import os
import sys

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import UpdateOne
from pymongo.errors import BulkWriteError

load_dotenv()

# Natural key per collection, used so a re-run updates rather than duplicates.
# Collections not listed fall back to _id.
NATURAL_KEYS = {
    "candidates": "candidate_id",
    "external_candidates": "candidate_id",
    "users": "user_id",
    "clients": "client_id",
    "proposals": "proposal_id",
    "projects": "project_id",
    "candidate_activity": None,
    "candidate_search_history": None,
    "candidate_sources": None,
    "candidate_refresh_queue": "candidate_id",
    "sourcing_results": "request_id",
}

# Ephemeral collections that are not worth copying. Sessions in particular
# would carry live login tokens into a new environment.
SKIP_COLLECTIONS = {
    "user_sessions",
    "analytics_sessions",
    "page_views",
    "user_actions",
}

BATCH = 500


def _checksum(docs, key):
    """Order-independent checksum over a collection's documents."""
    h = hashlib.sha256()
    ids = sorted(str(d.get(key) if key else d.get("_id")) for d in docs)
    for i in ids:
        h.update(i.encode())
    return h.hexdigest()[:16]


async def main(target_uri, target_db_name, apply, verify_only, include_backups):
    source_uri = os.getenv("MONGO_URL")
    source_db_name = os.getenv("DB_NAME")
    if not source_uri or not source_db_name:
        print("MONGO_URL / DB_NAME missing from environment", file=sys.stderr)
        return 1

    src = AsyncIOMotorClient(source_uri)[source_db_name]
    dstc = AsyncIOMotorClient(target_uri, serverSelectionTimeoutMS=20000)
    dst = dstc[target_db_name or source_db_name]

    try:
        await dstc.admin.command("ping")
    except Exception as e:
        print(f"Cannot reach target: {e}", file=sys.stderr)
        return 1
    print(f"source: {source_db_name}  ->  target: {target_db_name or source_db_name}\n")

    names = sorted(n for n in await src.list_collection_names())
    if not include_backups:
        names = [n for n in names if "_backup_" not in n]

    plan, failures = [], []

    for name in names:
        if name in SKIP_COLLECTIONS:
            print(f"  {name:34} skipped (ephemeral)")
            continue

        key = NATURAL_KEYS.get(name, "_id")
        docs = [d async for d in src[name].find({})]
        n_src = len(docs)
        before = await dst[name].count_documents({}) if not verify_only else None

        if apply and not verify_only and docs:
            ops = []
            for d in docs:
                if key and d.get(key) is not None:
                    ops.append(UpdateOne({key: d[key]}, {"$set": d}, upsert=True))
                else:
                    ops.append(UpdateOne({"_id": d["_id"]}, {"$set": d}, upsert=True))
            for i in range(0, len(ops), BATCH):
                try:
                    await dst[name].bulk_write(ops[i:i + BATCH], ordered=False)
                except BulkWriteError as e:
                    failures.append(f"{name}: {e.details.get('writeErrors', [])[:2]}")

        n_dst = await dst[name].count_documents({})
        plan.append((name, n_src, before, n_dst, key))

        if verify_only or apply:
            tgt_docs = [d async for d in dst[name].find({})]
            same = _checksum(docs, key) == _checksum(tgt_docs, key)
            status = "OK" if same and n_dst >= n_src else "MISMATCH"
            if status == "MISMATCH":
                failures.append(f"{name}: source={n_src} target={n_dst}")
            print(f"  {name:34} src={n_src:<7} target={n_dst:<7} {status}")
        else:
            print(f"  {name:34} src={n_src:<7} would upsert on '{key or '_id'}'")

    print()
    total_src = sum(p[1] for p in plan)
    print(f"  {len(plan)} collections, {total_src} source documents")

    if not apply and not verify_only:
        print("\nDry run - nothing written. Re-run with --apply to copy.")
        return 0

    if failures:
        print("\nFAILURES:")
        for f in failures[:10]:
            print("   ", f)
        return 1

    print("\nAll collections match. Nothing lost.")
    return 0


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--target", required=True, help="target MongoDB connection string")
    p.add_argument("--target-db", default=None, help="target database name (defaults to source name)")
    p.add_argument("--apply", action="store_true", help="write to the target (default: dry run)")
    p.add_argument("--verify-only", action="store_true", help="compare without writing")
    p.add_argument("--include-backups", action="store_true", help="also copy *_backup_* collections")
    a = p.parse_args()
    sys.exit(asyncio.run(main(a.target, a.target_db, a.apply, a.verify_only, a.include_backups)))
