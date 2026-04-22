# Brightbeam Allianz Shield Plus — Project Structure

**Status:** ✅ Fully Implemented (Production Ready)
**Repository:** https://github.com/jalloh19/brightbeam-allianz-shield-plus.git
**Last Updated:** April 22, 2026

---

## 📁 Complete Project Structure

```
brightbeam-allianz-shield-plus/
│
├── 📄 ROOT CONFIGURATION FILES
│   ├── manage.py                     # Django CLI
│   ├── Procfile                      # Railway deployment configuration
│   ├── runtime.txt                   # Python version specification
│   ├── requirements.txt              # Python dependencies
│   ├── requirements-dev.txt          # Development dependencies
│   ├── package.json                  # npm dependencies (Tailwind, PostCSS)
│   ├── tailwind.config.js            # Tailwind theme & content paths
│   ├── postcss.config.js             # CSS processing pipeline
│   ├── pytest.ini                    # Pytest configuration
│   ├── .env.example                  # Environment variables template
│   └── .gitignore                    # Git ignore rules
│
├── 📁 BACKEND (Django Application)
│   ├── backend/
│   │   ├── config/                   # Main project configuration
│   │   │   ├── settings.py           # Django production-ready settings
│   │   │   ├── urls.py               # Main URL routing
│   │   │   └── wsgi.py               # WSGI entry point
│   │   │
│   │   ├── applications/             # Core business logic app
│   │   │   ├── models.py             # 5 Models: Application, Beneficiary, AuditLog, etc.
│   │   │   ├── serializers.py        # DRF serializers with complex validation
│   │   │   ├── viewsets.py           # ViewSets for Application CRUD
│   │   │   ├── urls.py               # Application-specific API routing
│   │   │   ├── admin.py              # Custom Django admin interface
│   │   │   └── migrations/           # Database migration files
│   │   │
│   │   ├── api/                      # Custom API endpoints
│   │   │   ├── views.py              # Analytics and dropdown data views
│   │   │   └── urls.py               # API v1 routing
│   │   │
│   │   ├── services/                 # External service integrations
│   │   │   ├── email_service.py      # Resend/SendGrid integration
│   │   │   └── pdf_service.py        # Report generation service
│   │   │
│   │   ├── utils/                    # Helper functions
│   │   │   ├── encryption.py         # AES-256 encryption for PII
│   │   │   └── validators.py         # Custom field validators
│   │   │
│   │   └── static/                   # Backend-managed static assets
│   │       ├── css/                  # Generated styles
│   │       ├── js/                   # Frontend logic modules
│   │       │   ├── form-engine.js    # Step-by-step form navigation
│   │       │   ├── premium-calculator.js # Real-time pricing logic
│   │       │   ├── field-visibility.js # Conditional logic engine
│   │       │   └── state-manager.js  # LocalStorage persistence
│   │       └── data/                 # JSON data files (occupations, countries)
│   │
├── 📁 FRONTEND (Templates & Styling)
│   ├── frontend/
│   │   ├── templates/                # Django HTML templates
│   │   │   ├── base.html             # Main layout with Allianz branding
│   │   │   ├── landing.html          # Product landing page
│   │   │   ├── form.html             # 9-step application form
│   │   │   ├── confirmation.html     # Success page
│   │   │   ├── dashboard.html        # Admin analytics dashboard
│   │   │   └── components/           # UI components
│   │   └── css/
│   │       └── input.css             # Tailwind source file
│   │
├── 📁 TESTS (Automated Suite)
│   ├── tests/
│   │   ├── api/                      # API endpoint tests
│   │   └── integration/              # End-to-end flow tests
│   │
└── 📁 DOCUMENTATION
    ├── docs/
    │   ├── ARCHITECTURE.md           # System design & data flow
    │   ├── API_DOCUMENTATION.md      # API reference
    │   ├── COMPLIANCE.md             # PDPA & security measures
    │   ├── DATABASE_SCHEMA.md        # DB design & ERD
    │   └── DEPLOYMENT.md             # Railway setup guide
```

---

## 📊 Statistics

| Category | Count |
|----------|-------|
| **Python Modules** | ~25 |
| **HTML Templates** | 12 |
| **JavaScript Modules** | 8 |
| **Test Cases** | ~50 (85%+ coverage) |
| **Database Models** | 5 |

---

## 🔧 Key Commands

```bash
# Development
python manage.py runserver            # Start Django server
npm run watch                         # Watch Tailwind changes

# Testing
pytest                                # Run all tests
pytest --cov=.                        # Run with coverage report

# Production
npm run build                         # Build production assets
python manage.py collectstatic        # Prepare static files
```

---

**All systems fully operational and documented.** 🎉
