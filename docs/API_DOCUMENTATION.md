# API Documentation - Allianz Shield Plus

**Version:** 1.0 | **Base URL:** `https://brightbeam-allianz.railway.app/api/` | **Date:** April 22, 2026

---

## Overview

RESTful API built with Django REST Framework for managing Allianz Shield Plus insurance applications. All endpoints return JSON and support pagination, filtering, and searching.

**Authentication Methods:**
- Anonymous (public endpoints)
- Token-based (authenticated endpoints)
- Admin-only endpoints

---

## Table of Contents

1. [Error Handling](#error-handling)
2. [Pagination & Filtering](#pagination--filtering)
3. [Public Endpoints](#public-endpoints)
4. [Application Endpoints](#application-endpoints)
5. [Admin Endpoints](#admin-endpoints)
6. [Data Models](#data-models)

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| `200` | OK | Successful GET request |
| `201` | Created | Successful POST (form submission) |
| `400` | Bad Request | Invalid form data |
| `401` | Unauthorized | Missing auth token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `422` | Unprocessable Entity | Validation error |
| `500` | Server Error | Internal error |

### Error Response Format

```json
{
  "error": "Field validation failed",
  "details": {
    "email": ["Enter a valid email address"],
    "date_of_birth": ["Applicant must be 18+ years old"]
  },
  "timestamp": "2026-04-22T08:30:00Z"
}
```

---

## Pagination & Filtering

### Pagination

All list endpoints support `page` parameter:

```bash
GET /api/admin/applications/?page=1
```

**Response:**
```json
{
  "count": 150,
  "next": "/api/admin/applications/?page=2",
  "previous": null,
  "results": [
    { "id": "uuid", ... },
    { "id": "uuid", ... }
  ]
}
```

**Page Size:** 20 items per page (max 100)

### Filtering

Supported query parameters:

| Parameter | Example | Description |
|-----------|---------|-------------|
| `status` | `?status=approved` | Filter by application status |
| `plan` | `?plan=plan_6` | Filter by insurance plan |
| `applicant_type` | `?applicant_type=worker` | Filter by category |
| `search` | `?search=john` | Search by name/email |
| `ordering` | `?ordering=-created_at` | Sort by field |

**Example:**
```bash
GET /api/admin/applications/?status=approved&ordering=-created_at&page=1
```

---

## Public Endpoints

### 1. Get Countries (Dropdown)

**GET** `/api/data/countries/`

**Authentication:** None

**Response:**
```json
{
  "countries": [
    { "code": "MY", "name": "Malaysia" },
    { "code": "CN", "name": "China" },
    { "code": "IN", "name": "India" },
    { "code": "PH", "name": "Philippines" }
  ]
}
```

---

### 2. Get Occupations (Dropdown)

**GET** `/api/data/occupations/`

**Authentication:** None

**Response:**
```json
{
  "occupations": [
    "Software Engineer",
    "Doctor",
    "Nurse",
    "Teacher",
    "Accountant",
    "Manager",
    "Electrician",
    "Plumber",
    "Chef",
    "Driver",
    "Constructor",
    "Factory Worker",
    "Retail Staff",
    "Other"
  ]
}
```

---

### 3. Get ID Types (Dropdown)

**GET** `/api/data/id-types/`

**Authentication:** None

**Response:**
```json
{
  "id_types": [
    { "code": "passport", "label": "Passport" },
    { "code": "work_permit", "label": "Work Permit" },
    { "code": "student_pass", "label": "Student Pass" },
    { "code": "residence_permit", "label": "Residence Permit" }
  ]
}
```

---

## Application Endpoints

### 4. Submit Application (Create)

**POST** `/applications/`

**Authentication:** None (anonymous submission)

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "applicant_type": "worker",
  "full_name": "John Doe",
  "preferred_name": "John",
  "email": "john@example.com",
  "date_of_birth": "1990-05-15",
  "nationality": "China",
  "gender": "male",
  "marital_status": "married",
  "id_type": "passport",
  "id_number": "E12345678",
  "phone_country_code": "+60",
  "phone_number": "123456789",
  "address_line_1": "123 Main Street",
  "city": "Kuala Lumpur",
  "state_province": "Kuala Lumpur",
  "postcode": "50000",
  "country": "Malaysia",
  "worker_category": "category_1",
  "occupation": "Software Engineer",
  "industry": "technology",
  "employer_name": "Tech Company Ltd",
  "monthly_salary": 8000,
  "employment_type": "permanent",
  "years_of_experience": 5,
  "professional_license_number": "PROF123",
  "work_permit_status": "valid",
  "plan": "plan_6",
  "coverage_addons": ["employment_protection", "family_coverage"],
  "pdpa_consent": true,
  "terms_accepted": true,
  "marketing_opt_in": true
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "application_number": "ASP-2026-001234",
  "status": "submitted",
  "created_at": "2026-04-22T08:30:00Z",
  "submitted_at": "2026-04-22T08:30:00Z",
  "calculated_premium": 480.00,
  "total_annual_premium": 480.00,
  "email": "john@example.com",
  "full_name": "John Doe"
}
```

**Validation Rules:**
- `full_name`: Required, 3-100 characters
- `email`: Required, unique, valid email format
- `date_of_birth`: Required, must result in age ≥ 18 years
- `postcode`: 5 digits for Malaysia
- `phone_number`: 7-15 digits
- `pdpa_consent`: MUST be `true` (cannot be pre-checked)
- `monthly_salary`: Required for workers, ≥ 0
- `id_number`: Required, encrypted before storage

**Error Response:**
```json
{
  "email": ["This field must be unique."],
  "date_of_birth": ["Applicant must be 18 or older."],
  "pdpa_consent": ["You must consent to data processing."]
}
```

---

### 5. Get Application Status

**GET** `/applications/{application_id}/`

**Authentication:** Token (user's own application or admin)

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "application_number": "ASP-2026-001234",
  "status": "under_review",
  "full_name": "John Doe",
  "email": "john@example.com",
  "plan": "plan_6",
  "total_annual_premium": 480.00,
  "submitted_at": "2026-04-22T08:30:00Z",
  "review_status": {
    "current_step": "document_verification",
    "notes": "Waiting for passport copy"
  }
}
```

---

## Admin Endpoints

### 6. List All Applications

**GET** `/admin/applications/`

**Authentication:** Admin token required

**Query Parameters:**
- `status` (draft, submitted, under_review, approved, rejected)
- `plan` (plan_5, plan_6, plan_7)
- `applicant_type` (worker, student)
- `search` (name or email)
- `ordering` (created_at, status, submitted_at)

**Example:**
```bash
GET /admin/applications/?status=submitted&ordering=-created_at&page=1
```

**Response:**
```json
{
  "count": 145,
  "next": "/admin/applications/?page=2",
  "previous": null,
  "results": [
    {
      "id": "550e8400...",
      "application_number": "ASP-2026-001234",
      "full_name": "John Doe",
      "email": "john@example.com",
      "plan": "plan_6",
      "status": "submitted",
      "applicant_type": "worker",
      "created_at": "2026-04-22T08:30:00Z",
      "submitted_at": "2026-04-22T08:31:00Z"
    }
  ]
}
```

---

### 7. Get Application Details

**GET** `/admin/applications/{application_id}/`

**Authentication:** Admin token required

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "application_number": "ASP-2026-001234",
  "status": "submitted",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+60123456789",
  "date_of_birth": "1990-05-15",
  "nationality": "China",
  "id_type": "passport",
  "id_number": "****5678",
  "address": "123 Main Street, Kuala Lumpur",
  "plan": "plan_6",
  "coverage_addons": ["employment_protection"],
  "calculated_premium": 480.00,
  "pdpa_consent": true,
  "created_at": "2026-04-22T08:30:00Z",
  "submitted_at": "2026-04-22T08:31:00Z",
  "review_notes": "Pending document verification",
  "beneficiaries": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "relationship": "spouse",
      "is_primary": true
    }
  ],
  "audit_trail": [
    {
      "action": "submitted",
      "timestamp": "2026-04-22T08:31:00Z",
      "user": "system"
    }
  ]
}
```

---

### 8. Approve Application

**POST** `/admin/applications/{application_id}/approve/`

**Authentication:** None in current deployment (`AllowAny`)

**Request Body:**
```json
{
  "notes": "Approved after document verification"
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "application_number": "ASP-2026-001234",
  "status": "approved",
  "full_name": "John Doe",
  "email": "john@example.com"
}
```

**Triggers:**
- Application status changed to `approved`
- Confirmation email sent to applicant
- AuditLog entry created
- NotificationLog entry created

---

### 9. Reject Application

**POST** `/admin/applications/{application_id}/reject/`

**Authentication:** None in current deployment (`AllowAny`)

**Request Body:**
```json
{
  "reason": "Incomplete documentation provided"
}
```

`reason` is required. Empty values return `400 Bad Request`.

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "application_number": "ASP-2026-001234",
  "status": "rejected",
  "full_name": "John Doe",
  "email": "john@example.com"
}
```

---

### 10. Dashboard Analytics

**GET** `/admin/analytics/`

**Authentication:** Admin token required

**Response:**
```json
{
  "total_applications": 450,
  "submitted_this_week": 42,
  "pending_review": 18,
  "approved_this_month": 35,
  "conversion_rate": 78.5,
  "status_breakdown": {
    "draft": 5,
    "submitted": 18,
    "under_review": 25,
    "approved": 380,
    "rejected": 22
  },
  "plan_distribution": {
    "plan_5": 120,
    "plan_6": 250,
    "plan_7": 80
  },
  "applicant_distribution": {
    "worker": 300,
    "student": 150
  },
  "average_processing_time_hours": 48
}
```

---

### 11. Drop-off Analysis

**GET** `/admin/analytics/dropoff/`

**Authentication:** Admin token required

**Response:**
```json
{
  "step_analysis": [
    {
      "step": 1,
      "name": "Category Selection",
      "started": 500,
      "completed": 480,
      "drop_off_rate": 4.0
    },
    {
      "step": 2,
      "name": "Personal Information",
      "started": 480,
      "completed": 465,
      "drop_off_rate": 3.1
    },
    {
      "step": 9,
      "name": "Review & Submit",
      "started": 440,
      "completed": 420,
      "drop_off_rate": 4.5
    }
  ],
  "total_completions": 420,
  "overall_completion_rate": 84.0,
  "average_time_to_submit_minutes": 8.5
}
```

---

## Data Models

### Application Model

```json
{
  "id": "UUID (primary key)",
  "application_number": "ASP-YYYY-XXXXXX (unique reference)",
  "status": "draft|submitted|under_review|approved|rejected|archived",
  "applicant_type": "worker|student",
  "full_name": "String (max 100)",
  "preferred_name": "String (optional)",
  "email": "Email (unique)",
  "phone_country_code": "String (+XX)",
  "phone_number": "String (7-15 digits)",
  "date_of_birth": "Date (YYYY-MM-DD)",
  "nationality": "String (country name)",
  "gender": "male|female|other|prefer_not_to_say",
  "marital_status": "single|married|divorced|widowed",
  "id_type": "passport|work_permit|student_pass|...",
  "id_number": "String (encrypted)",
  "address_line_1": "String",
  "address_line_2": "String (optional)",
  "city": "String",
  "state_province": "String",
  "postcode": "String (5 digits for Malaysia)",
  "country": "String",
  "worker_category": "category_1|category_2|category_3",
  "occupation": "String",
  "industry": "String",
  "employer_name": "String",
  "monthly_salary": "Decimal (MYR)",
  "employment_type": "permanent|contract|freelance|temporary",
  "years_of_experience": "Integer",
  "professional_license_number": "String (optional)",
  "work_permit_status": "valid|pending|eligible|expired",
  "plan": "plan_5|plan_6|plan_7",
  "coverage_addons": "JSON Array (selected add-ons)",
  "calculated_premium": "Decimal (MYR/year)",
  "total_annual_premium": "Decimal (MYR/year)",
  "pdpa_consent": "Boolean (must be true)",
  "terms_accepted": "Boolean (must be true)",
  "marketing_opt_in": "Boolean",
  "created_at": "DateTime (ISO 8601)",
  "updated_at": "DateTime (ISO 8601)",
  "submitted_at": "DateTime (ISO 8601)",
  "ip_address": "String (IP where submitted)",
  "user_agent": "String (browser info)",
  "data_retention_expiry": "DateTime (7 years after submission)"
}
```

---

## Rate Limiting

Public endpoints: 100 requests per hour per IP
Authenticated endpoints: 1000 requests per hour per user

---

## Examples

### cURL: Submit Application
```bash
curl -X POST https://api.brightbeam-allianz.my/applications/ \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com",
    "date_of_birth": "1990-05-15",
    "nationality": "China",
    "applicant_type": "worker",
    "plan": "plan_6",
    "pdpa_consent": true,
    "terms_accepted": true
  }'
```

### JavaScript: Fetch Application List (Admin)
```javascript
const response = await fetch('/api/admin/applications/?status=submitted', {
  method: 'GET',
  headers: {
    'Authorization': `Token ${authToken}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

---

## Support

- **Issues:** [GitHub Issues](https://github.com/jalloh19/brightbeam-allianz-shield-plus/issues)
- **Email:** support@brightbeam-allianz.my
- **Documentation:** Full API docs at `/api/`

---

**Last Updated:** April 22, 2026 | **Version:** 1.0 | **Status:** Production Ready
