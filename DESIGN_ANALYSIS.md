# Figma Design Analysis & Implementation Enhancements

**Date:** April 22, 2026  
**Project:** Brightbeam Allianz Shield Plus  
**Status:** Design reference analyzed, data model enhanced, documentation updated

---

## 1. Figma Design Reference Analysis

### Source
- **Figma Project:** figma_frontend (React + TypeScript with shadcn/ui components)
- **Location:** `/home/jalloh/Desktop/ALL/brightbeam/figma_frontend/`
- **Status:** Used as temporary inspiration source; insights extracted and integrated

### Key Observations

#### 1.1 Form Structure
**Figma Design:** 8-step form + landing page + success page
```
1. Landing Page (plan comparison, introduction)
2. Step 1: Plan Selection (Plan 5/6/7 with pricing)
3. Step 2: Personal Information (full name, preferred name, DOB, age auto-calc, gender, nationality, marital status)
4. Step 3: Identity & Visa (ID type, ID number, expiry, country of issue, document upload)
5. Step 4: Contact & Address (country code, phone, email, address, city, state, postcode, country)
6. Step 5: Occupation & Industry (occupation, industry, employer/institution, work environment)
7. Step 6: Student Info (CONDITIONAL - university, course, graduation date)
8. Step 7: Coverage Add-ons (Lifestyle, Study Interruption, Family Cover, Frequent Traveler)
9. Step 8: Payment & Declaration (payment method, PDPA consent, T&Cs)
10. Review & Submit (summary view)
11. Success Page (confirmation with reference number)
```

**Our Implementation:** Updated from 7 steps to 8 steps to align with Figma design

#### 1.2 Component Patterns
- **Form Inputs:** Reusable `FormInput` and `FormSelect` components
- **Validation:** Real-time with visual feedback (checkmarks, error states)
- **Conditional Logic:** If occupation="student" → show student-specific fields
- **Progress Tracking:** Visual progress bar with step indicators
- **Mobile First:** Responsive grid layout (md:grid-cols-2 for two-column on desktop)

#### 1.3 Design System
- **Colors:** Dark theme with light mode support
- **Primary:** #030213 (dark navy/black) with oklch color system
- **Secondary:** Light backgrounds with accent colors
- **Theme Variables:** CSS custom properties for dark/light mode switching

#### 1.4 Identification Types Supported
From Figma:
- Passport ✅
- Residence Permit ✅
- Work Permit ✅
- Student Pass ✅
- Other ✅

#### 1.5 Industry Categories
From Figma:
- Technology, Finance, Education, Healthcare, Manufacturing
- Retail, Hospitality, Construction
- **Student** ← Important for international applicants ✅
- Other

---

## 2. International Applicant Data Model Enhancements

### 2.1 New Fields Added to Application Model

#### Personal Information Enhancement
```python
preferred_name          # CharField - In addition to full name
contact_preference      # Choice: email, SMS, phone, both
```

#### Nationality & Residency (Critical for International Users)
```python
country_of_residence    # CharField - Where they currently live
nationality             # CharField - Country of citizenship (existing, clarified)
```

#### Visa & Identification Enhancement
```python
id_expiry_date          # DateField - Passport/ID expiration
id_issuing_country      # CharField - Which country issued ID
visa_type               # Choice: tourist, business, work, student, family, residence, MM2H, other
visa_expiry_date        # DateField - When visa expires (CRITICAL for international)
visa_number             # CharField - Visa/permit reference number
```

#### Address Enhancements
```python
state_province          # CharField - For countries with states/provinces
# Explicitly supports international address formats
```

#### Occupation & Industry Enhancements
```python
industry                # Choice field - now includes "Student" option
work_environment        # Choice: office, outdoor, construction, driving, student, other
```

#### Student Status (Conditional Fields - NEW)
```python
is_student              # BooleanField - Triggers conditional logic
university_name         # CharField - Institution name
course_of_study         # CharField - E.g., "Computer Science"
field_of_study          # CharField - More general category
university_country      # CharField - Where studying (international students)
expected_graduation     # DateField - When they complete studies
```

#### Beneficiary Enhancement
```python
secondary_beneficiary_name           # CharField
secondary_beneficiary_relationship   # CharField
# Supports multiple beneficiaries
```

#### Payment & Communication
```python
preferred_payment_method   # CharField - Stores user preference
contact_preference         # Choice - How to contact (email/SMS/phone/both)
```

#### Compliance & Tracking (PDPA/Legal)
```python
pdpa_consent_timestamp              # DateTimeField - WHEN consent was given
terms_accepted_timestamp            # DateTimeField - WHEN terms accepted
marketing_opt_in                    # BooleanField - Marketing communications opt-in
last_reviewed_by                    # CharField - Admin who reviewed
review_notes                        # TextField - Internal admin comments
application_number                  # CharField - User-friendly reference
user_agent                          # TextField - Device/browser info
```

### 2.2 Rationale for Enhancements

**Why These Fields Matter for International Applicants:**

1. **Visa Information** (visa_type, visa_expiry_date)
   - Different visa types have different coverage requirements
   - Expiry date is critical for eligibility determination
   - Risk assessment depends on visa status

2. **Student Tracking** (is_student, university_name, expected_graduation)
   - Students have different premium structures
   - Study Interruption add-on only applies to students
   - Graduation date helps predict policy end date

3. **Country Context** (nationality, country_of_residence, university_country)
   - Enables location-based risk assessment
   - Supports multi-country data retention policies
   - Helps with regional compliance requirements

4. **Document Verification** (id_issuing_country, visa_number)
   - Tracks provenance of documents
   - Supports verification workflows
   - Required for anti-fraud procedures

5. **Contact Preferences** (contact_preference, preferred_payment_method)
   - International applicants may prefer SMS over email (data costs)
   - Different payment methods in different countries
   - Improves user experience for diverse applicants

6. **Compliance Tracking** (pdpa_consent_timestamp, last_reviewed_by, review_notes)
   - Audit trail for PDPA compliance
   - Documents explicit consent with timestamp
   - Admin accountability for approvals/rejections

---

## 3. Data Model Alignment with Allianz Brand

### 3.1 Updated Field Naming & Structure
- Changed "basic/plus/premium" plans to "Plan 5/6/7" (matches Allianz terminology)
- Added "RM currency" values (RM360,000 / RM600,000 / RM900,000)
- Used industry-standard terminology for insurance (beneficiary, coverage addons, premium)

### 3.2 Database Indexes Added
```python
class Meta:
    ordering = ['-created_at']
    indexes = [
        models.Index(fields=['-created_at']),
        models.Index(fields=['status']),
        models.Index(fields=['email']),
        models.Index(fields=['visa_expiry_date']),  # NEW - for compliance
        models.Index(fields=['is_student']),        # NEW - for student filtering
    ]
```

---

## 4. Updated Form Flow (8 Steps)

### Step Breakdown with International Applicant Support

| Step | Component | Fields | Conditional Logic | International Features |
|------|-----------|--------|-------------------|--------------------------|
| **Landing** | landing_page.html | Plan comparison, intro | - | Shows plans with RM pricing |
| **1** | step1_plan.html | Plan selection (5/6/7) | - | Clear pricing in local currency |
| **2** | step2_personal.html | Name, preferred name, DOB, gender, nationality, marital status | Age auto-calc from DOB | Nationality field for international |
| **3** | step3_identity.html | ID type, ID number, expiry, country of issue, upload document | ID type changes validation | Supports passport/work permit/student pass |
| **4** | step4_contact.html | Phone (country code), email, address (address_line_1/2, city, state, postcode, country) | Postcode validation differs by country | Full international address support |
| **5** | step5_occupation.html | Occupation, industry, employer, work environment | - | Industry includes "Student" |
| **6** | step6_student.html | University, course, field, country, graduation date | **CONDITIONAL: IF is_student=true** | University country supports international study |
| **7** | step7_benefits.html | Add-ons: Lifestyle, Study Interruption, Family Cover, Traveler | Study Interruption only if student | Traveler add-on for international applicants |
| **8** | step8_payment.html | Payment method, PDPA consent, T&Cs | Consent NOT pre-checked | Contact preference (email/SMS) |
| **Review** | step9_review.html | Summary of all data | - | Masked sensitive data (ID number, visa) |
| **Success** | success_page.html | Confirmation, reference number | - | Shows application number for tracking |

---

## 5. Figma Design System Integration

### 5.1 Tailwind CSS Theme Alignment
The Figma design uses shadcn/ui (based on Radix UI with Tailwind), which provides:
- Accessible form components (FormInput, FormSelect)
- Consistent design tokens
- Dark mode support

**Our Approach:** Use vanilla Tailwind CSS with custom theme for Allianz brand colors

### 5.2 Allianz Brand Colors
```css
:root {
  --primary: #0051BA;      /* Allianz Blue */
  --secondary: #003DA5;    /* Darker Allianz Blue */
  --accent: #F59E0B;       /* Allianz Gold/Accent */
  --background: #FFFFFF;   /* White */
  --foreground: #1F2937;   /* Dark Gray */
  --muted: #E5E7EB;        /* Light Gray */
  --success: #10B981;      /* Green for success */
  --destructive: #EF4444;  /* Red for errors */
}
```

### 5.3 Component Variants
**Form Inputs:**
- Outlined (default)
- Filled (alternate)
- Error state (red border + error message)
- Success state (green checkmark)

**Buttons:**
- Primary (solid Allianz Blue)
- Secondary (outlined)
- Tertiary (text-only)
- Disabled state

**Cards:**
- Standard card (white with shadow)
- Highlighted card (blue background for current step)
- Success card (green background for confirmation)

---

## 6. Validation & Conditional Logic Engine

### 6.1 Conditional Rules (From Figma Analysis)

```javascript
// If student is selected
if (is_student === true || industry === 'student') {
  // Show student-specific fields
  show(['university_name', 'course_of_study', 'expected_graduation'])
  
  // Enable Study Interruption add-on
  enable_addon('study_interruption')
  
  // Show Study Interruption in benefits step
}

// If visa type is student
if (visa_type === 'student') {
  // Show visa expiry as critical
  mark_as_critical('visa_expiry_date')
}

// If international (country_of_residence !== 'Malaysia')
if (country_of_residence !== 'Malaysia') {
  // Show country-specific address format
  show_international_address_fields()
}
```

### 6.2 Real-Time Validation

```javascript
// Email: unique check against database
validate_email_unique(email)

// Phone: format check based on country code
validate_phone_format(phone_country_code, phone_number)

// Passport: format based on nationality
validate_id_format(nationality, id_type, id_number)

// Age: must be ≥18
validate_age(date_of_birth) >= 18

// Visa Expiry: must be in future
validate_date_not_expired(visa_expiry_date)

// Postcode: format based on country
validate_postcode_format(country, postcode)
```

---

## 7. Admin Dashboard Enhancements

### 7.1 New Filtering Options
```
- Filter by visa_expiry_date (identify expiring visas)
- Filter by is_student (target student-specific communications)
- Filter by country_of_residence (geographic insights)
- Filter by application_number (user-friendly search)
```

### 7.2 Analytics Insights
```
- Student applicants vs working professionals
- International student concentration by country
- Visa type distribution (work vs student vs other)
- Premium trends by industry
```

---

## 8. PDPA Compliance Enhancements

### 8.1 Explicit Consent Tracking
- `pdpa_consent` field NOT pre-checked in form
- `pdpa_consent_timestamp` records WHEN consent was given
- Audit log tracks all changes (required by PDPA)
- `data_retention_expiry` auto-calculated on submission

### 8.2 International Data Residency
- All personal data stored in Malaysia (Railway PostgreSQL)
- Compliance with Malaysia's PDPA Act 2010
- 7-year retention policy with auto-delete
- User has right to request data deletion

---

## 9. Performance Optimization Insights

### 9.1 From Figma Analysis
- Form auto-saves every 30 seconds to localStorage
- Lazy-load conditional fields (don't render until needed)
- Progress bar shows which steps are completed
- Back button allows easy navigation and editing

### 9.2 Implementation Plan
- Redux/Zustand for client-side state (alternatives to localStorage)
- Pagination for admin application list (20 per page)
- Database indexes on frequently filtered fields
- API rate limiting (100 requests/min per IP)

---

## 10. File Cleanup

**Figma Directory Status:**
```
/home/jalloh/Desktop/ALL/brightbeam/figma_frontend/
```

**Files to delete after extraction (if needed):**
- These files are for reference only
- Can be deleted once this document is finalized
- All insights have been captured in PLAN.md and data models

---

## 11. Summary of Changes

### Database Model
✅ Added 25+ new fields for international applicants  
✅ Enhanced student tracking with conditional logic  
✅ Improved compliance tracking (timestamps, admin notes)  
✅ Better support for visa and residency information  

### Form Flow
✅ Updated from 7 steps to 8 steps  
✅ Added landing page with plan comparison  
✅ Added success page with confirmation number  
✅ Enhanced each step with international data fields  

### Serializers & Validation
✅ Updated ApplicationSerializer with all new fields  
✅ Enhanced validation for international applicants  
✅ Added unique constraint on application_number  
✅ PDPA consent validation (must be true)  

### Documentation
✅ Created comprehensive DESIGN_ANALYSIS.md  
✅ Updated PLAN.md with 8-step structure  
✅ Documented all new fields and their purpose  
✅ Added international applicant considerations  

---

## 12. Next Steps

### Phase 1: Frontend Templates (In Progress)
- Create landing page with plan comparison
- Build 8 form step templates with Tailwind CSS
- Implement conditional logic engine in JavaScript
- Add document upload functionality

### Phase 2: Static Asset Optimization
- Finalize Tailwind CSS build
- Optimize images and icons
- Create responsive design for all breakpoints

### Phase 3: Integration & Testing
- Test form submission with real data
- Verify database insertion
- Test conditional logic flows
- Validate international address formats

---

## Appendix: Figma Component Reference

**Key React Components (for reference):**
- `FormInput.tsx` - Text input with validation
- `FormSelect.tsx` - Dropdown select
- `StepContainer.tsx` - Step wrapper
- `ProgressBar.tsx` - Step progress indicator
- `LandingPage.tsx` - Initial landing page

**Figma Project Link:**
https://www.figma.com/design/VDtljXQEqsbMkekJWhroka/figma_frontend

---

**Document Version:** 1.0  
**Last Updated:** April 22, 2026  
**Status:** Design analysis complete, data model enhanced, ready for Phase 1 implementation
