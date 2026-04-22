# Deployment Guide - Allianz Shield Plus on Railway

**Status:** Production-Ready | **Date:** April 22, 2026 | **Version:** 1.0

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Railway Setup](#railway-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Deploy Application](#deploy-application)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts
- **GitHub Account** (repository connected to Railway)
- **Railway Account** (free tier: 500 hours/month compute)
- **SendGrid Account** (free tier: 100 emails/day) for email notifications
- **PostgreSQL** (managed by Railway)

### Tools
- Git (command line or GitHub Desktop)
- Bash terminal
- curl or Postman (for API testing)

### Repository Access
```bash
# Clone repository
git clone https://github.com/jalloh19/brightbeam-allianz-shield-plus.git
cd brightbeam-allianz-shield-plus

# Verify remote
git remote -v
# Should show: origin  https://github.com/jalloh19/brightbeam-allianz-shield-plus.git
```

---

## Railway Setup

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub account
3. Click **New Project** → Select **GitHub Repo**
4. Find and connect **brightbeam-allianz-shield-plus**
5. Click **Deploy Now**

Railway will automatically detect `Procfile` and begin initial deployment (may fail until env vars are set).

### Step 2: Create PostgreSQL Service

1. In Railway project dashboard, click **Create Service** → **PostgreSQL**
2. Railway auto-generates PostgreSQL instance with:
   - Encrypted credentials
   - Automated backups
   - Auto-scaling storage
3. Take note of generated `DATABASE_URL` (shown in service details)

### Step 3: Link Services

1. In Django app service settings, go to **Variables**
2. Click **Reference Variable**
3. Select **PostgreSQL** service → **DATABASE_URL**
4. This automatically links the database to the app

---

## Environment Configuration

### Step 4: Set Environment Variables

Create `.env` file locally (do NOT commit to git):

```bash
# .env (local development)
DEBUG=False
SECRET_KEY=your-secret-key-here-min-50-chars
ALLOWED_HOSTS=yourdomain.railway.app,localhost
DATABASE_URL=postgresql://user:password@localhost:5432/brightbeam

# Email (SendGrid)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@brightbeam-allianz.my

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# API
REST_FRAMEWORK_PAGINATION=20
```

### Step 5: Add Variables to Railway

In Railway dashboard → Django app service → **Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `DEBUG` | `False` | Production setting |
| `SECRET_KEY` | Generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` | Min 50 chars |
| `ALLOWED_HOSTS` | `yourdomain.railway.app` | Your Railway domain |
| `DATABASE_URL` | Auto-linked from PostgreSQL | Already connected |
| `EMAIL_HOST` | `smtp.sendgrid.net` | SendGrid SMTP |
| `EMAIL_HOST_PASSWORD` | Your SendGrid API key | From SendGrid dashboard |
| `SECURE_SSL_REDIRECT` | `True` | HTTPS enforcement |
| `SESSION_COOKIE_SECURE` | `True` | Secure cookies |
| `CSRF_COOKIE_SECURE` | `True` | CSRF protection |

**How to generate SECRET_KEY:**
```bash
/bin/python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Database Setup

### Step 6: Run Migrations

After variables are set, Railway will automatically:
1. Run `npm install && npm run build` (Tailwind CSS)
2. Install Python dependencies from `requirements.txt`
3. Execute Procfile commands:
   ```bash
   release: npm install && npm run build && python manage.py migrate
   web: gunicorn backend.config.wsgi --log-file -
   ```

**Check migration status:**
```bash
# SSH into Railway container (if needed)
railway shell

# Run migrations manually
python manage.py migrate

# Check status
python manage.py showmigrations
```

### Step 7: Create Admin Superuser

```bash
# Via Railway shell
railway shell
python manage.py createsuperuser

# Prompts:
# Username: admin
# Email: admin@brightbeam.my
# Password: (create strong password)
# Password (again): (confirm)
```

**Alternative (with Railway CLI):**
```bash
railway run python manage.py createsuperuser
```

---

## Deploy Application

### Step 8: Trigger Deployment

Deployment automatically triggers on git push:

```bash
# Make changes locally
git add .
git commit -m "Feature: description"
git push origin main

# Railway automatically:
# 1. Detects push
# 2. Clones latest code
# 3. Runs build pipeline
# 4. Deploys new version
```

**Check deployment status:**
- View Railway dashboard → **Deployments** tab
- Watch real-time logs in **Logs** tab
- Green checkmark = successful deployment

### Step 9: Configure Custom Domain (Optional)

1. In Railway project → **Settings** → **Custom Domain**
2. Add domain (e.g., `brightbeam-allianz.my`)
3. Add CNAME record in DNS provider:
   ```
   CNAME brightbeam-allianz.my → gateway.railway.app
   ```
4. Railway auto-provisions SSL certificate

---

## Post-Deployment Verification

### Step 10: Test Application

**1. Test landing page:**
```bash
curl https://yourdomain.railway.app/
# Should return HTML with Tailwind CSS styles
```

**2. Test form page:**
```bash
curl https://yourdomain.railway.app/form/
# Should return form HTML with all 9 steps
```

**3. Test API endpoint:**
```bash
curl -X GET https://yourdomain.railway.app/api/data/countries/
# Should return JSON list of countries
```

**4. Test form submission (POST):**
```bash
curl -X POST https://yourdomain.railway.app/api/applications/ \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Applicant",
    "email": "test@example.com",
    "date_of_birth": "1995-05-15",
    "nationality": "China",
    "phone_country_code": "+60",
    "phone_number": "123456789",
    "applicant_type": "worker",
    "plan": "plan_6",
    "pdpa_consent": true,
    "terms_accepted": true
  }'
# Should return 201 Created with application data
```

**5. Test admin panel:**
```bash
# Visit https://yourdomain.railway.app/admin/
# Login with superuser credentials
# Verify Application model shows submitted forms
```

---

## Monitoring & Maintenance

### Health Checks

Railway automatically monitors:
- **Application uptime** (HTTP requests to `/`)
- **Database connectivity** (PostgreSQL health check)
- **Memory usage** (auto-scales if needed)
- **Error logs** (visible in Railway dashboard)

### View Logs

**In Railway dashboard:**
1. Click service → **Logs** tab
2. View real-time application output
3. Search by keyword or date range
4. Export logs for analysis

**Via Railway CLI:**
```bash
railway logs --follow  # Stream logs
railway logs --limit 100  # Last 100 lines
railway logs --search "ERROR"  # Filter errors
```

### Database Backups

Railway automatically:
- Creates daily backups
- Retains backups for 7 days
- Stores redundantly across regions

**Manual backup:**
```bash
# Export database dump
railway shell
pg_dump $DATABASE_URL > backup_`date +%Y%m%d_%H%M%S`.sql
```

### Update Dependencies

When updating Python packages:

```bash
# Locally
pip install -U package_name
pip freeze > requirements.txt

# Commit and push
git add requirements.txt
git commit -m "deps: update package_name"
git push origin main

# Railway auto-rebuilds with new dependencies
```

---

## Troubleshooting

### Common Issues

#### 1. Application Crashes on Deploy

**Symptoms:** Deployment shows error, service marked as "crashed"

**Solution:**
```bash
# Check logs for error
railway logs --search "ERROR"

# Common causes:
# - Missing environment variable (SECRET_KEY, DATABASE_URL)
# - Migration error
# - Syntax error in code

# Fix locally and push
git push origin main  # Re-triggers deployment
```

#### 2. Database Connection Error

**Symptoms:** `psycopg2.OperationalError: could not connect to server`

**Solution:**
```bash
# Verify DATABASE_URL is set
railway variables ls | grep DATABASE_URL

# If not set, link PostgreSQL service again
# 1. Go to Django service → Variables
# 2. Remove DATABASE_URL if incorrect
# 3. Click "Reference Variable" → PostgreSQL → DATABASE_URL
# 4. Save and redeploy
```

#### 3. Static Files Not Loading (404 on CSS/JS)

**Symptoms:** Page loads but styled as plain HTML (no Tailwind CSS)

**Solution:**
```bash
# Check collectstatic completed
railway logs --search "collectstatic"
# Should show: "170 files collected successfully"

# If missing, manually run:
railway shell
python manage.py collectstatic --noinput

# Restart service
railway deployment restart
```

#### 4. Email Not Sending

**Symptoms:** Form submitted but no confirmation email received

**Solution:**
```bash
# Verify SendGrid credentials in Railway variables:
railway variables ls | grep EMAIL

# Check EMAIL_HOST_PASSWORD is correct (not truncated)
# Test email manually
railway shell
python manage.py shell
from django.core.mail import send_mail
send_mail('Test', 'Test body', 'noreply@example.com', ['test@example.com'])
```

#### 5. 500 Error on Form Submission

**Symptoms:** Form submission returns 500 Internal Server Error

**Solution:**
```bash
# Check Django application logs
railway logs --follow

# Common causes:
# - Validation error (required field missing)
# - Database error (constraint violation)
# - PDPA consent not provided

# Test with complete valid data
# Increase logging verbosity
# Contact support if error persists
```

### Performance Optimization

**Slow page loads?**

1. **Check database query count:**
   ```bash
   # Enable Django Debug Toolbar (development only)
   # Or profile with:
   python manage.py shell
   from django.db import connection
   connection.queries  # Show all queries
   ```

2. **Optimize Tailwind CSS:**
   - Current: 30KB minified (already optimized)
   - Verified content paths in `tailwind.config.js`

3. **Scale resources on Railway:**
   - If persistent high usage, upgrade from free tier
   - Navigate to service → **Settings** → increase memory/compute

---

## Support & Resources

| Resource | Link |
|----------|------|
| Railway Docs | https://docs.railway.app |
| Django Docs | https://docs.djangoproject.com |
| SendGrid | https://sendgrid.com/docs |
| Repository | https://github.com/jalloh19/brightbeam-allianz-shield-plus |
| Issues | https://github.com/jalloh19/brightbeam-allianz-shield-plus/issues |

---

## Rollback Procedure

If deployment has issues:

```bash
# View deployment history
railway deployments ls

# Rollback to previous version
railway deployment rollback <DEPLOYMENT_ID>

# Or via git revert
git revert HEAD
git push origin main
```

---

## Security Checklist

- [ ] `DEBUG=False` in production
- [ ] `SECRET_KEY` is 50+ characters, unique, and not in code
- [ ] `ALLOWED_HOSTS` configured for your domain(s)
- [ ] `SECURE_SSL_REDIRECT=True` enabled
- [ ] `SESSION_COOKIE_SECURE=True` set
- [ ] Database backups verified
- [ ] Email service credentials secured
- [ ] Admin password changed from default
- [ ] Rate limiting configured on API endpoints
- [ ] PDPA consent checkbox requires explicit user action (NOT pre-checked)
- [ ] HTTPS certificate installed and valid
- [ ] Access logs monitored for suspicious activity

---

## Production Checklist

- [ ] All migrations applied successfully
- [ ] Admin superuser created with strong password
- [ ] Landing page loads and displays plan comparison
- [ ] Form submission works end-to-end
- [ ] Confirmation emails send correctly
- [ ] Admin dashboard accessible and displaying applications
- [ ] Database backups automated
- [ ] Error monitoring configured
- [ ] Performance metrics baseline established
- [ ] Documentation updated with domain
- [ ] Team trained on Railway console access

---

**Deployed:** April 22, 2026 | **Version:** 1.0 | **Status:** Production Ready
