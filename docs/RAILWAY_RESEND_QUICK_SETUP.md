# Railway Configuration Quick Reference - Resend Email Setup

## TL;DR (30 seconds)

1. **Get API Key**: Go to https://resend.com → Sign up → API Keys → Copy key (starts with `re_`)
2. **Add to Railway**:
   - Dashboard → Your Project → Variables (tab)
   - Add 3 variables:
     ```
     RESEND_API_KEY = re_6v2xjTYX_Fidp8dFEk15jL4fzyWpZ3oyt
     RESEND_FROM_EMAIL = noreply@allianzshield.com
     RESEND_REPLY_TO = support@allianzshield.com
     ```
3. **Commit & Push**: 
   ```bash
   git add . && git commit -m "add resend email" && git push origin main
   ```
4. **Railway Auto-Deploys** → Done ✅

---

## Step-by-Step Railway Dashboard

### Screenshot Path:
```
Railway Dashboard
├── Projects
│   └── brightbeam
│       ├── Services
│       │   └── web (click here)
│       │       ├── Deployments (watch for "Success")
│       │       ├── Variables (ADD HERE) ← 
│       │       └── Logs
│       └── Postgres
```

### Add Variables (Detailed)
1. Click on **web** service
2. Click **Variables** tab
3. Click **"New Variable"** button
4. Fill in:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_6v2xjTYX_Fidp8dFEk15jL4fzyWpZ3oyt`
5. Click **"Save"**
6. Repeat for `RESEND_FROM_EMAIL` and `RESEND_REPLY_TO`
7. Wait 30 seconds for auto-redeploy

---

## Verify It's Working

### Check Logs
```bash
# Terminal command (requires Railway CLI installed)
railway logs --follow | grep -i "email\|resend"

# Or watch in Dashboard: web service → Logs tab
# Look for: "Confirmation email sent to..."
```

### Test API
```bash
curl -X POST https://your-domain.com/api/applications/ \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test","email":"your@email.com","applicant_type":"worker",...}'

# Check email inbox for confirmation
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Emails not sending | Check `RESEND_API_KEY` starts with `re_` |
| "API key not found" warning | Verify variable name is exactly `RESEND_API_KEY` |
| Deployment failed | Check code has no syntax errors: `git diff` |
| Emails going to spam | Use verified domain (optional but recommended) |
| Rate limit error | Resend free tier = 100/day. Upgrade if needed |

---

## What Gets Deployed

```
✅ /backend/utils/email_service.py       (NEW - email service)
✅ /backend/applications/viewsets.py      (UPDATED - sends emails)
✅ /requirements.txt                      (UPDATED - adds resend)
✅ /docs/RESEND_EMAIL_SETUP.md           (NEW - full guide)
```

---

## Email Flow

```
Application Submission
    ↓
API creates Application object
    ↓
Sends confirmation email (Resend API)
    ↓
Logs result in NotificationLog
    ↓
Response sent to user


Admin Clicks Approve/Reject
    ↓
API updates Application.status
    ↓
Sends approval/rejection email (Resend API)
    ↓
Logs result in NotificationLog
    ↓
Admin dashboard updates
```

---

## Resend API Key - Where to Get It

1. https://resend.com/dashboard
2. Sign up (free)
3. **API Keys** section (left sidebar)
4. **Create API Key** button
5. Name: "Brightbeam"
6. Copy: `re_xxxxxxxxxxxxxxxx`

**Your provided key**: `re_6v2xjTYX_Fidp8dFEk15jL4fzyWpZ3oyt`

---

## Production Best Practices

1. **Use verified domain** (not `resend.dev`)
   - Resend → Domains → Add → Verify DNS
   - Update `RESEND_FROM_EMAIL` to use it

2. **Monitor deliverability**
   - Check Resend dashboard weekly
   - Look for bounces/complaints

3. **Set up error monitoring**
   - Railway logs
   - Database NotificationLog table

4. **Test before going live**
   - Submit test application
   - Approve/reject test application
   - Verify emails received

---

## Database Query - Check Email Status

```sql
-- Failed notifications
SELECT * FROM applications_notificationlog 
WHERE status='failed' 
ORDER BY created_at DESC;

-- All emails sent today
SELECT * FROM applications_notificationlog 
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- Delivery rate
SELECT 
  status,
  COUNT(*) as count
FROM applications_notificationlog
GROUP BY status;
```

---

## Quick Commands

```bash
# View current variables
railway variables ls

# Restart deployment (apply changes)
railway deployment restart

# Watch logs live
railway logs --follow

# Go to dashboard
railway open

# Push code to deploy
git push origin main
```

---

## Files Changed

1. **Created**: `/backend/utils/email_service.py` (380 lines)
   - ResendEmailService class
   - Three email methods: confirmation, approval, rejection
   - Error handling and logging

2. **Updated**: `/backend/applications/viewsets.py`
   - Import: `from backend.utils.email_service import get_email_service`
   - Modified `create()` to send confirmation email
   - Modified `approve()` to send approval email
   - Modified `reject()` to send rejection email

3. **Updated**: `/requirements.txt`
   - Added: `resend>=0.9.0`

---

## Timeline

- **Deployment time**: ~2 minutes
- **Email send time**: < 1 second per email (Resend API)
- **Testing time**: ~5 minutes
- **Go-live**: Ready immediately after first email test

---

**Status**: ✅ Ready to Deploy

Next: Push code → Add variables → Test → Monitor
