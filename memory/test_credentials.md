# Test Credentials

## THCO Executive Portal

### Super Admin (use for all admin/role-based testing)
- Email: `joshua@thcohq.com`
- Password: `THCOAdmin2024!`
- Role: `super_admin` (also has is_hr, is_fulfillment, is_engineer flags)

### Secondary Admin
- Email: `adoption@thcohqs.com`
- Password: `THCOAdmin2024!`

## Login API
```
POST /api/auth/login
Content-Type: application/json
{"email":"joshua@thcohq.com","password":"THCOAdmin2024!"}
```
Response field for the bearer token: `session_token` (NOT `token`).
Frontend stores as `localStorage.session_token`.
