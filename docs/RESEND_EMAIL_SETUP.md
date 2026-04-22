# Resend Email Integration - Railway Configuration Guide

## Overview
This guide explains how to configure Resend email notifications for Allianz Shield Plus on Railway. The application will send transactional emails for:
- ✉️ Application submission confirmation
- ✅ Application approval notifications  
- ❌ Application rejection notifications

---

## Prerequisites

1. **Resend Account** (https://resend.com)
   - Create a free account
   - No credit card required for testing
   - Free tier: 100 emails/day

2. **Railway Account** (already configured)
3. **Verified Domain** (optional but recommended for production)

---

## Step 1: Get Your Resend API Key

### Option A: Quick Setup (Development)
1. Go to https://resend.com/dashboard
2. Log in or create account
3. Navigate to **API Keys** section
4. Click **"Create API Key"**
5. Give it a name like "Brightbeam API Key"
6. Copy the API key (starts with `re_`)
   - Example: `re_6v2xjTYX_Fidp8dFEk15jL4fzyWpZ3oyt`

### Option B: Production Setup (Custom Domain)
For production, verify your domain:
1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `allianzshield.com`)
4. Add the DNS records provided
5. Wait for verification (usually instant)
6. Update `RESEND_FROM_EMAIL` to use your domain

---

## Step 2: Configure Railway Environment Variables

### Access Railway Dashboard
1. Go to https://railway.app/dashboard
2. Select your **brightbeam** project
3. Click on the **service** (likely named "web" or "brightbeam")
4. Navigate to the **Variables** tab

### Add Environment Variables
Click **"New Variable"** and add these three variables:

#### Variable 1: Resend API Key
```
KEY: RESEND_API_KEY
VALUE: re_6v2xjTYX_Fidp8dFEk15jL4fzyWpZ3oyt
```
(Replace with your actual API key from Step 1)

#### Variable 2: From Email Address
```
KEY: RESEND_FROM_EMAIL
VALUE: noreply@allianzshield.com
```
- For development: Use `noreply@resend.dev`
- For production: Use your verified domain

#### Variable 3: Reply-To Email Address
```
KEY: RESEND_FROM_REPLY_TO
VALUE: support@allianzshield.com
```
(Can be same as RESEND_FROM_EMAIL)

### Complete Variable List (Reference)
All variables should look like:
```
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:pass@host/db
RESEND_API_KEY=re_6v2xjTYX_Fidp8dFEk15jL4fzyWpZ3oyt
RESEND_FROM_EMAIL=noreply@allianzshield.com
RESEND_REPLY_TO=support@allianzshield.com
```

---

## Step 3: Deploy Updated Code

### Deploy from Git
1. **Commit changes locally**:
   ```bash
   cd /home/jalloh/Desktop/ALL/brightbeam
   git add requirements.txt backend/utils/email_service.py backend/applications/viewsets.py
   git commit -m "feat: add Resend email integration for notifications"
   ```

2. **Push to GitHub**:
   ```bash
   git push origin main
   ```

3. **Railway Auto-Deploy**:
   - Railway automatically detects the push
   - Rebuilds the application
   - Deploys with new environment variables
   - Watch the deployment logs in Railway dashboard

### Verify Deployment
1. In Railway dashboard, go to **Deployments**
2. Wait for status to show **"Success"** (green checkmark)
3. Check **Logs** tab for any errors:
   ```
   Successfully installed resend
   Application server started
   ```

---

## Step 4: Test Email Functionality

### Test Confirmation Email (Application Submission)
```bash
# Using curl
curl -X POST https://your-domain.com/api/applications/ \
  -H "Content-Type: application/json" \
  -d '{
    "applicant_type": "worker",
    "full_name": "Test User",
    "email": "your-email@example.com",
    "date_of_birth": "1990-05-15",
    "nationality": "Malaysia",
    "gender": "male",
    "marital_status": "single",
    "id_type": "passport",
    "id_number": "E12345678",
    "phone_country_code": "+60",
    "phone_number": "123456789",
    "address_line_1": "123 Main St",
    "city": "Kuala Lumpur",
    "state_province": "KL",
    "postcode": "50000",
    "country": "Malaysia",
    "worker_category": "category_1",
    "pdpa_consent": true
  }'
```

**Expected Result**: Check your email for confirmation message

### Test Approval Email (Admin Panel)
1. Log in to admin panel: `https://your-domain.com/admin/`
2. Select an application
3. Click **"Approve"** button
4. Applicant receives approval email with premium amount

### Test Rejection Email (Admin Panel)
1. Log in to admin panel
2. Select an application
3. Click **"Reject"** button
4. Enter rejection reason
5. Applicant receives rejection email with reason

---

## Step 5: Verify in Railway Logs

Monitor email sending in real-time:

### Option A: Railway Dashboard
1. Go to **Railway Dashboard** → Your Project
2. Select **"web"** service
3. Click **Logs** tab
4. Search for `"email sent"` or `"ResendEmailService"`

### Option B: Command Line
```bash
# Login to Railway
npm i -g @railway/cli
railway login

# View logs
railway logs --follow
```

**Look for messages like**:
```
Confirmation email sent to test@example.com - Message ID: xxx
Approval email sent to applicant@example.com - Message ID: yyy
Rejection email sent to applicant@example.com - Message ID: zzz
```

---

## Step 6: Monitor Email Delivery

### Check Resend Dashboard
1. Go to https://resend.com/dashboard
2. Click **"Events"** or **"Emails"**
3. See all sent emails with status:
   - ✅ **Delivered** - Successfully received
   - ⏳ **Bounced** - Invalid email
   - 💀 **Complained** - Marked as spam
   - ❌ **Failed** - Send error

### Check Application Notification Logs
Access the notification history in the database:
```sql
-- Query notifications by application
SELECT 
    id,
    application_id,
    type,
    recipient,
    status,
    subject,
    message,
    error_message,
    created_at
FROM applications_notificationlog
ORDER BY created_at DESC
LIMIT 20;

-- Query failed notifications
SELECT * FROM applications_notificationlog 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

---

## Troubleshooting

### Issue 1: Email Not Sending
**Symptoms**: Notifications show status='failed'

**Solution**:
```bash
# Check RESEND_API_KEY is correct
railway variables ls | grep RESEND

# Check API key format (should start with 're_')
# Verify in Resend dashboard that key is active

# Test API directly
python manage.py shell
>>> from backend.utils.email_service import get_email_service
>>> service = get_email_service()
>>> result = service.send_confirmation_email('test@example.com', 'Test User', 'TEST-001')
>>> print(result)
```

### Issue 2: "RESEND_API_KEY not found" Warning
**Cause**: Environment variable not set in Railway

**Solution**:
1. Go to Railway Dashboard
2. Click **Variables**
3. Verify `RESEND_API_KEY` is present
4. Restart the deployment:
   ```bash
   railway deployment restart
   ```

### Issue 3: Emails Going to Spam
**Cause**: Domain not verified / SPF/DKIM records missing

**Solution**:
1. Use verified domain in Resend (see Production Setup)
2. Add SPF/DKIM records to your domain DNS
3. Send test emails to multiple providers
4. Mark as "not spam" in email client

### Issue 4: Rate Limiting (Too Many Emails)
**Symptoms**: Error 429 or "Rate limit exceeded"

**Resend Free Tier**: 100 emails/day
**Upgrade**: Premium plan if needed

**Workaround**: Queue emails with Celery (optional)

---

## Email Template Customization

To customize email templates, edit `/home/jalloh/Desktop/ALL/brightbeam/backend/utils/email_service.py`:

### Modify Confirmation Email
```python
# Around line 65 in email_service.py
html_content = f"""
<html>
    <body>
        <!-- Edit HTML here -->
        <p>Dear {full_name},</p>
        <!-- Add your custom content -->
    </body>
</html>
"""
```

### Change From/Reply-To
Environment variables (preferred):
```
RESEND_FROM_EMAIL=custom@yourdomain.com
RESEND_REPLY_TO=reply@yourdomain.com
```

Or hardcode in code (not recommended):
```python
self.from_email = "custom@example.com"
self.reply_to = "support@example.com"
```

---

## Production Checklist

Before going live, ensure:

- [ ] **Verify domain** in Resend dashboard
- [ ] **Add SPF record** to DNS:
  ```
  v=spf1 resend.com ~all
  ```
- [ ] **Add DKIM record** (provided by Resend)
- [ ] **Test all three email types**: confirmation, approval, rejection
- [ ] **Verify** emails not going to spam
- [ ] **Monitor** Resend dashboard for bounces/complaints
- [ ] **Set up alerts** for failed notifications
- [ ] **Document** email templates for future reference
- [ ] **Backup** API key securely (use Railway's secret management)

---

## Advanced: Queue Emails (Optional)

For better reliability, queue emails asynchronously:

### Install Celery
```bash
pip install celery redis
```

### Create Task
```python
# backend/applications/tasks.py
from celery import shared_task
from backend.utils.email_service import get_email_service

@shared_task
def send_confirmation_email_task(email, name, app_number):
    service = get_email_service()
    return service.send_confirmation_email(email, name, app_number)
```

### Use in Viewsets
```python
# In create() method
send_confirmation_email_task.delay(
    application.email,
    application.full_name,
    application.application_number
)
```

---

## References

- **Resend Documentation**: https://resend.com/docs
- **Railway Docs**: https://docs.railway.app
- **Django Email**: https://docs.djangoproject.com/en/4.2/topics/email/

---

## Support

For issues:
1. Check Railway logs: `railway logs --follow`
2. Check Resend dashboard for delivery status
3. Verify all environment variables are set
4. Test locally before deploying:
   ```bash
   # In local development with .env file
   python manage.py shell
   from backend.utils.email_service import get_email_service
   service = get_email_service()
   # Test functions...
   ```

---

**Last Updated**: April 22, 2026
**Status**: Production Ready ✅
