# Brightbeam Allianz Shield Plus — Project Structure

**Status:** ✅ File structure created  
**Repository:** https://github.com/jalloh19/brightbeam-allianz-shield-plus.git  
**Last Updated:** 2026-04-22  

---

## 📁 Complete Project Structure

```
brightbeam-allianz/
│
├── 📄 ROOT CONFIGURATION FILES
│   ├── manage.py                     # Django CLI
│   ├── Procfile                      # Railway deployment (npm build + gunicorn)
│   ├── runtime.txt                   # Python 3.11.3
│   ├── requirements.txt              # Python dependencies (empty, ready for code)
│   ├── package.json                  # npm dependencies (Tailwind, PostCSS)
│   ├── tailwind.config.js            # Tailwind theme & content paths
│   ├── postcss.config.js             # CSS processing pipeline
│   ├── .env.example                  # Environment variables template
│   ├── .gitignore                    # Git ignore rules
│   └── .git/                         # Git repository (linked to GitHub)
│
├── 📁 BACKEND (Django Application)
│   ├── backend/
│   │   ├── __init__.py
│   │   │
│   │   ├── 🔧 CONFIG (Django Settings)
│   │   │   ├── config/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── settings.py       # Production Django settings (empty)
│   │   │   │   ├── urls.py           # URL routing (empty)
│   │   │   │   ├── wsgi.py           # WSGI entry point (empty)
│   │   │   │   └── asgi.py           # ASGI async support (empty)
│   │   │
│   │   ├── 📊 APPLICATIONS (Models & API)
│   │   │   ├── applications/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py         # 5 Django models (empty)
│   │   │   │   │                     #   - Application
│   │   │   │   │                     #   - Beneficiary
│   │   │   │   │                     #   - AuditLog
│   │   │   │   │                     #   - PaymentRecord
│   │   │   │   │                     #   - NotificationLog
│   │   │   │   ├── serializers.py    # DRF serializers (empty)
│   │   │   │   ├── views.py          # API views (empty)
│   │   │   │   ├── viewsets.py       # ViewSets for CRUD (empty)
│   │   │   │   ├── urls.py           # API routing (empty)
│   │   │   │   ├── permissions.py    # Custom permissions (empty)
│   │   │   │   ├── pagination.py     # Pagination config (empty)
│   │   │   │   ├── admin.py          # Django admin registration (empty)
│   │   │   │   ├── apps.py           # App config (empty)
│   │   │   │   └── migrations/
│   │   │   │       └── __init__.py   # Database migration tracking
│   │   │
│   │   ├── 🔌 API (Custom API Endpoints)
│   │   │   ├── api/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── views.py          # Analytics, exports, custom views (empty)
│   │   │   │   └── urls.py           # API v1 routing (empty)
│   │   │
│   │   ├── 🛠️ UTILS (Helper Functions)
│   │   │   ├── utils/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── validators.py     # Custom validators (passport, phone) (empty)
│   │   │   │   ├── encryption.py     # PII encryption/decryption (empty)
│   │   │   │   ├── email_service.py  # Email notifications (empty)
│   │   │   │   └── analytics.py      # Analytics calculations (empty)
│   │   │
│   │   └── 📦 STATIC (Frontend Assets)
│   │       ├── static/
│   │       │   ├── css/
│   │       │   │   └── output.css    # Generated Tailwind CSS (auto-generated)
│   │       │   ├── js/
│   │       │   │   ├── form.js       # Form step navigation (empty)
│   │       │   │   ├── validation.js # Field validation rules (empty)
│   │       │   │   ├── state.js      # Form state management (empty)
│   │       │   │   ├── conditional.js # Conditional logic engine (empty)
│   │       │   │   ├── api.js        # API communication (empty)
│   │       │   │   └── dashboard.js  # Admin dashboard logic (empty)
│   │       │   ├── icons/            # SVG icons (empty directory)
│   │       │   └── data/
│   │       │       ├── occupations.json # Job titles dropdown (empty)
│   │       │       ├── countries.json   # Countries/nationalities (empty)
│   │       │       └── id-types.json    # ID validation rules (empty)
│   │
├── 📁 FRONTEND (HTML + Tailwind CSS + JS)
│   ├── frontend/
│   │   ├── 📑 TEMPLATES (Django HTML)
│   │   │   ├── templates/
│   │   │   │   ├── base.html         # Base template (Tailwind CSS link) (empty)
│   │   │   │   ├── index.html        # Landing page (empty)
│   │   │   │   ├── form.html         # 7-step form container (empty)
│   │   │   │   ├── confirmation.html # Post-submission (empty)
│   │   │   │   ├── dashboard.html    # Admin dashboard (empty)
│   │   │   │   ├── error.html        # Error pages (empty)
│   │   │   │   └── components/       # Reusable form components
│   │   │   │       ├── step1_plan.html           # Plan selection (empty)
│   │   │   │       ├── step2_id.html             # ID & personal (empty)
│   │   │   │       ├── step3_contact.html        # Contact & address (empty)
│   │   │   │       ├── step4_coverage.html       # Coverage & add-ons (empty)
│   │   │   │       ├── step5_beneficiary.html    # Beneficiary (empty)
│   │   │   │       ├── step6_payment.html        # Payment & declaration (empty)
│   │   │   │       └── step7_review.html         # Review & submit (empty)
│   │   │
│   │   └── 🎨 TAILWIND CSS
│   │       └── css/
│   │           └── input.css         # Source Tailwind directives (empty)
│   │
├── 📁 DOCUMENTATION
│   ├── docs/
│   │   ├── README.md                 # Setup, deployment, credentials (empty)
│   │   ├── ARCHITECTURE.md           # System design, ERD, data flow (empty)
│   │   ├── API_DOCUMENTATION.md      # API endpoints, examples (empty)
│   │   ├── COMPLIANCE.md             # PDPA, encryption, retention (empty)
│   │   ├── DATABASE_SCHEMA.md        # SQL schema, indexes (empty)
│   │   ├── DEPLOYMENT.md             # Railway deployment checklist (empty)
│   │   └── BUSINESS_PROPOSAL.md      # 10-15 page business proposal (empty)
│
└── 📋 PROJECT METADATA
    ├── PLAN.md                       # Complete implementation phases
    ├── BRIGHTBREAM.md                # Original assessment brief
    ├── ALLIANZ_SHIELD_PLUS_INFO.md   # Product information
    └── REQUIREMENTS.md               # Assessment requirements
```

---

## 📊 Statistics

| Category | Count |
|----------|-------|
| **Total Files** | 69 |
| **Python Modules** | 18 |
| **HTML Templates** | 14 |
| **JavaScript Files** | 6 |
| **JSON Data Files** | 3 |
| **Documentation Files** | 13 |
| **Configuration Files** | 8 |
| **Directories** | 17 |

---

## 🔗 Git Repository Setup

**Remote:** `https://github.com/jalloh19/brightbeam-allianz-shield-plus.git`  
**Status:** ✅ Linked and ready

**Current Git Status:**
```bash
$ cd /home/jalloh/Desktop/ALL/brightbeam
$ git remote -v
origin  https://github.com/jalloh19/brightbeam-allianz-shield-plus.git (fetch)
origin  https://github.com/jalloh19/brightbeam-allianz-shield-plus.git (push)
```

**To push to GitHub:**
```bash
git add .
git commit -m "Initial project structure setup"
git push -u origin main
```

---

## 🔧 Configuration Files Overview

### Backend Configuration

**Procfile** (Railway Deployment)
```
release: npm install && npm run build
web: gunicorn config.wsgi
```

**runtime.txt** (Python Version)
```
python-3.11.3
```

**requirements.txt** (Python Dependencies - Ready for Implementation)
```
# To be filled during Phase 0
# Will include:
# - Django==4.2.0
# - djangorestframework==3.14.0
# - psycopg2-binary==2.9.6
# - etc.
```

### Frontend Configuration

**package.json** (npm Dependencies - Ready for Implementation)
```
# To be filled during Phase 0
# Will include:
# - tailwindcss
# - postcss
# - autoprefixer
```

**tailwind.config.js** (Tailwind Theme - Ready for Implementation)
```
# Content paths and theme customization
```

**postcss.config.js** (CSS Pipeline - Ready for Implementation)
```
# Tailwind → autoprefixer → minified CSS
```

### Environment Configuration

**.env.example** (Environment Template)
```
✅ Already populated with:
- Django settings (SECRET_KEY, DEBUG, ALLOWED_HOSTS)
- Database URL
- Email configuration (SendGrid)
- CORS settings
- Security headers
- Encryption key
- Application timezone
```

### Git Configuration

**.gitignore** (Git Ignore Rules)
```
✅ Already configured for:
- Python (__pycache__, *.pyc, venv/)
- Django (db.sqlite3, /staticfiles, /media)
- Node.js (node_modules/, npm-debug.log)
- IDEs (.vscode/, .idea/)
- OS files (.DS_Store, Thumbs.db)
- Environment (.env files)
- Build artifacts
```

---

## 📋 Phase-by-Phase File Population

| Phase | Focus | Files to Populate |
|-------|-------|-------------------|
| **0: Setup** | Django + Tailwind config | requirements.txt, package.json, settings.py |
| **1: Database** | Models | backend/applications/models.py, admin.py |
| **2: API** | REST endpoints | serializers.py, views.py, viewsets.py, urls.py |
| **3: Frontend** | 7-step form | frontend/templates/*.html, static/js/*.js |
| **4: Admin** | Dashboard | dashboard.html, dashboard.js, api/views.py |
| **5: Security** | Configuration | config/settings.py, utils/encryption.py |
| **6: Documentation** | Write-ups | docs/*.md |
| **7: Deploy** | Testing | Test all files, push to Railway |

---

## 🚀 Next Steps

**Now that the structure is created:**

1. ✅ **Repository linked** to GitHub
2. ✅ **Directory structure created** (17 folders)
3. ✅ **Placeholder files created** (69 files)
4. ✅ **.env.example configured**
5. ✅ **.gitignore configured**

**Ready to:**
- [ ] Populate Phase 0 files (requirements.txt, package.json, settings.py)
- [ ] Create database models (Phase 1)
- [ ] Build REST API (Phase 2)
- [ ] Implement frontend form (Phase 3)
- [ ] Deploy to Railway

---

## 📞 Quick Reference

### Key Directories

- **Backend code:** `backend/`
- **Frontend templates:** `frontend/templates/`
- **Static files:** `backend/static/`
- **Documentation:** `docs/`
- **Configuration:** Root directory (`Procfile`, `runtime.txt`, etc.)

### Key Files

- **Django settings:** `backend/config/settings.py`
- **URL routing:** `backend/config/urls.py`
- **Database models:** `backend/applications/models.py`
- **API endpoints:** `backend/applications/urls.py`
- **Admin dashboard:** `frontend/templates/dashboard.html`
- **Business proposal:** `docs/BUSINESS_PROPOSAL.md`

### Commands to Remember

```bash
# Django commands
python manage.py runserver              # Start development server
python manage.py makemigrations         # Create database migrations
python manage.py migrate                # Apply migrations
python manage.py createsuperuser        # Create admin user

# npm commands
npm install                             # Install dependencies
npm run build                           # Build Tailwind CSS
npm run watch                           # Watch for changes

# Git commands
git add .                               # Stage files
git commit -m "message"                 # Commit changes
git push origin main                    # Push to GitHub
```

---

**All set! Structure is ready for code implementation.** 🎉
