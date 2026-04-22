# Foreign Applicant Categories: Workers & Students
## Malaysia Labor Regulation Compliance & Enhanced Data Model

**Project:** Brightbeam Allianz Shield Plus  
**Date:** April 22, 2026  
**Scope:** Support for two primary categories of foreign applicants in Malaysia with detailed regulatory compliance fields

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Category 1: Foreign Workers](#category-1-foreign-workers)
3. [Malaysia Labor Regulation Changes (June 2026)](#malaysia-labor-regulation-changes-june-2026)
4. [Worker Classification Framework](#worker-classification-framework)
5. [Category 2: Foreign Students](#category-2-foreign-students)
6. [Student Sponsorship Types](#student-sponsorship-types)
7. [Data Fields Reference](#data-fields-reference)
8. [Premium Calculation by Category](#premium-calculation-by-category)
9. [Eligibility Matrix](#eligibility-matrix)
10. [Implementation in Forms](#implementation-in-forms)

---

## Executive Summary

Brightbeam Allianz Shield Plus now supports **two distinct foreign applicant categories**:

### **Category 1: Foreign Workers**
- Governed by Malaysia labor regulation framework (effective June 2026)
- Three eligibility tiers based on skill level and job classification
- Enhanced tracking of work permits, employment details, and employer sponsorship
- Risk assessment based on industry, salary, and employment type

### **Category 2: Foreign Students**
- Three sponsorship models: self-funded, scholarship-funded, employer-sponsored
- Differentiated by level of study and financial capacity
- Student-specific insurance add-ons (Study Interruption, Education Protection)
- Financial proof requirements aligned with sponsor type

---

## Category 1: Foreign Workers

### Overview

Foreign workers applying for Allianz Shield Plus must be:
- Currently employed in Malaysia (or with confirmed job offer)
- Holding valid work permit or eligible to apply
- Contributing to Malaysian economy through employment

### New Worker Fields (Database)

| Field Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `applicant_type` | Choice | Yes | Set to 'worker' for workers |
| `worker_category` | Choice | Yes | Category 1/2/3 based on job classification |
| `monthly_salary` | Decimal | Yes | Gross monthly salary in MYR |
| `employment_type` | Choice | Yes | Permanent, contract, freelance, or temporary |
| `work_permit_status` | Choice | Yes | Valid, pending, eligible, expired, etc. |
| `work_permit_expiry_date` | Date | Conditional | Expiry date of current work permit |
| `employer_registration_number` | String | Yes | Company registration/ID number |
| `employer_sponsorship_approved` | Boolean | Yes | Whether employer has approved visa |
| `years_of_experience` | Integer | Conditional | Experience in current field |
| `professional_license_number` | String | Conditional | License number (for regulated professions) |

---

## Malaysia Labor Regulation Changes (June 2026)

### New Three-Tier Worker Classification System

Effective **June 2026**, Malaysia implements a new labor framework classifying foreign workers into three categories with different eligibility requirements, insurance requirements, and premium tiers.

### Category Details

#### **Category 1: High-Skilled Professional (Specialist/Expert)**

**Eligibility Criteria:**
- Bachelor degree or higher in relevant field
- 5+ years of specialized experience
- Monthly salary: RM6,000+
- Professional license or expert certification
- Job involves specialized knowledge/expertise

**Job Examples:**
```
- Software Engineers & IT Specialists
- Structural Engineers & Architects
- Medical Doctors & Healthcare Specialists
- Finance Managers & CFOs
- Research Scientists & PhDs
- Senior Management Consultants
```

**Insurance Impact:**
- Premium multiplier: 1.0x (base rate)
- Coverage available: All plans (5, 6, 7)
- Add-ons available: All (Employment Protection, Professional Liability, etc.)
- Work permit validity: 2-5 years typically
- Renewal: Automatic eligibility if employer sponsors

**Validation Rules:**
```javascript
if (worker_category === 'category_1') {
  require(education_level >= 'bachelor')
  require(years_of_experience >= 5)
  require(monthly_salary >= 6000)
  require(professional_license_number OR expert_certification)
  show(professional_license_field)
}
```

---

#### **Category 2: Skilled Worker (Technician/Supervisor)**

**Eligibility Criteria:**
- Diploma or vocational certification
- 2-5 years of technical experience
- Monthly salary: RM3,000-RM6,000
- Technical skills in specific trade/field
- Supervisor or team lead experience preferred

**Job Examples:**
```
- Electricians & Plumbers
- HVAC Technicians
- Automotive Technicians
- Welders & Metal Workers
- Logistics Supervisors
- Warehouse Managers
- Construction Foremen
- Chef & Kitchen Supervisors
```

**Insurance Impact:**
- Premium multiplier: 1.15x (15% loading)
- Coverage available: Plans 5 & 6 (RM600k max)
- Add-ons: Limited (Employment Protection, Occupational Injury)
- Work permit validity: 1-3 years typically
- Renewal: Subject to competency assessment

**Validation Rules:**
```javascript
if (worker_category === 'category_2') {
  require(education_level in ['diploma', 'vocational', 'certificate'])
  require(years_of_experience >= 2 && years_of_experience <= 5)
  require(monthly_salary >= 3000 && monthly_salary <= 6000)
  require(work_environment in ['construction', 'manufacturing', 'technical', 'outdoor'])
}
```

---

#### **Category 3: General Worker (Administrative/Support)**

**Eligibility Criteria:**
- Secondary education or equivalent
- 0+ years experience (entry-level acceptable)
- Monthly salary: RM1,500-RM3,500
- General/support role (no specialized skills)
- Work permit subject to labor quotas

**Job Examples:**
```
- Administrative Assistants & Clerks
- Factory Workers & Assembly Line
- Retail Staff & Shop Assistants
- Cleaners & Housekeeping
- Delivery/Logistics Staff
- Food Service Workers
- General Labor & Helpers
- Gardeners & Landscapers
```

**Insurance Impact:**
- Premium multiplier: 1.35x (35% loading)
- Coverage available: Plans 5 & 6 only
- Add-ons: Minimal (Occupational Injury only)
- Work permit validity: 1-2 years typically
- Renewal: Highly competitive, labor quota dependent

**Validation Rules:**
```javascript
if (worker_category === 'category_3') {
  require(monthly_salary >= 1500 && monthly_salary <= 3500)
  require(employment_type in ['contract', 'temporary'])
  show_warning("Quota-dependent renewal")
}
```

---

### Employer Sponsorship Requirements

For **all worker categories**:

1. **Employer Verification:**
   - Valid company registration (SSM)
   - Active business license
   - Company operational for 2+ years

2. **Sponsorship Documentation:**
   - Employer letter confirming sponsorship
   - Employment contract signed
   - Offer letter with salary details
   - Work permit application reference

3. **Approval Status Tracking:**
   ```
   Enum: valid, pending, eligible_but_not_applied, expired, other
   
   - valid: Work permit approved and active
   - pending: Application submitted, awaiting approval
   - eligible_but_not_applied: Meet criteria but haven't applied yet
   - expired: Permit expired, renewal in progress
   - other: Custom status for special cases
   ```

---

### Work Permit Management

#### Validity Periods by Category

| Category | Min Validity | Max Validity | Renewal Frequency |
|----------|---|---|---|
| Category 1 | 2 years | 5 years | Every 5 years |
| Category 2 | 1 year | 3 years | Annual/Biennial |
| Category 3 | 1 year | 2 years | Annual |

#### Expiry Tracking

```python
# In Application model
work_permit_expiry_date: DateField

# Premium calculation impact
if work_permit_expiry_date < now() + timedelta(days=180):
    flag_for_renewal_reminder()
    discount_premium_by(5%)  # Incentivize early renewal
```

---

## Worker Classification Framework

### Premium Calculation Algorithm

```python
def calculate_worker_premium(application):
    """
    Calculate insurance premium for foreign workers based on:
    1. Selected plan (base premium)
    2. Worker category (multiplier)
    3. Industry risk (adjustment)
    4. Employment type (adjustment)
    """
    
    # Base premium by plan
    base_premium = {
        'plan_5': 360,    # RM360,000 cover
        'plan_6': 480,    # RM600,000 cover
        'plan_7': 720,    # RM900,000 cover
    }
    
    # Category multiplier (Malaysia labor regulation)
    category_multiplier = {
        'category_1': 1.0,     # High-skilled = base rate
        'category_2': 1.15,    # Skilled = +15%
        'category_3': 1.35,    # General = +35%
    }
    
    # Industry adjustment (occupational hazard)
    industry_adjustment = {
        'technology': 0.95,        # Lower risk
        'finance': 0.95,           # Lower risk
        'construction': 1.25,      # Higher risk
        'manufacturing': 1.15,     # Moderate risk
        'hospitality': 1.10,       # Moderate risk
    }
    
    # Employment type adjustment
    employment_adjustment = {
        'permanent': 1.0,          # Base (best)
        'contract': 1.05,          # Slight increase
        'freelance': 1.20,         # Higher uncertainty
        'temporary': 1.15,         # Temporary premium
    }
    
    # Calculate
    premium = (
        base_premium[plan] *
        category_multiplier[worker_category] *
        industry_adjustment.get(industry, 1.0) *
        employment_adjustment[employment_type]
    )
    
    # Add monthly salary adjustment (risk scaling)
    if monthly_salary > 10000:
        premium *= 1.10  # Higher income = higher coverage
    elif monthly_salary < 2000:
        premium *= 0.90  # Lower income = lower premium
    
    # Add professional license discount (if applicable)
    if professional_license_number:
        premium *= 0.95  # 5% discount for certified professionals
    
    return round(premium, 2)
```

**Example Calculations:**

```
Scenario 1: Category 1 (High-Skilled IT Engineer)
- Plan: Plan 6 (RM480)
- Worker Category: Category 1 → 1.0x
- Industry: Technology → 0.95x
- Employment: Permanent → 1.0x
- Salary: RM8,000 → 1.10x
- Professional License: Yes → 0.95x
- Premium = 480 × 1.0 × 0.95 × 1.0 × 1.10 × 0.95 = RM474/year
- Monthly: RM39.50

Scenario 2: Category 2 (Skilled Technician)
- Plan: Plan 5 (RM360)
- Worker Category: Category 2 → 1.15x
- Industry: Manufacturing → 1.15x
- Employment: Contract → 1.05x
- Salary: RM4,000 → 1.0x
- No Professional License → 1.0x
- Premium = 360 × 1.15 × 1.15 × 1.05 × 1.0 = RM508/year
- Monthly: RM42.33

Scenario 3: Category 3 (General Worker)
- Plan: Plan 5 (RM360)
- Worker Category: Category 3 → 1.35x
- Industry: Construction → 1.25x
- Employment: Temporary → 1.15x
- Salary: RM2,000 → 0.90x
- No License → 1.0x
- Premium = 360 × 1.35 × 1.25 × 1.15 × 0.90 = RM632/year
- Monthly: RM52.67
```

---

## Category 2: Foreign Students

### Overview

Foreign students pursuing education in Malaysia, eligible for special insurance coverage that protects:
- Against study interruption
- Financial protection for education
- Health coverage during studies
- Family emergency support

### New Student Fields (Database)

| Field Name | Type | Required | Description |
|-----------|------|----------|-------------|
| `is_student` | Boolean | Yes | Whether applicant is a student |
| `study_sponsor_type` | Choice | Yes | Self-sponsored, scholarship, employer-sponsored |
| `study_level` | Choice | Yes | Diploma, Bachelor, Master, PhD, Certificate |
| `scholarship_name` | String | Conditional | Name of scholarship program |
| `scholarship_award_amount` | Decimal | Conditional | Annual scholarship amount in MYR |
| `financial_proof_type` | Choice | Yes | Type of financial proof provided |
| `financial_proof_submitted` | Boolean | Yes | Whether documents submitted |
| `intended_duration_months` | Integer | Yes | Expected stay duration (1-84 months) |
| `semester_start_date` | Date | Yes | When current semester begins |
| `on_campus_residential` | Boolean | Yes | Whether living on campus |
| `employer_sponsoring_study` | String | Conditional | Employer name (if employer-sponsored) |

---

## Student Sponsorship Types

### Type 1: Self-Sponsored Study

**Definition:** Student personally funding their education from own resources or family support.

**Requirements:**
- Proof of financial capacity: RM50,000+ in bank statements
- Parent/guardian financial declaration (if under 21)
- Proof of income source (if working part-time)

**Financial Proof Options:**
```
- Bank statement (6-month history showing sufficient funds)
- Fixed deposits with maturity date after graduation
- Parent/Guardian financial declaration
- Investment portfolio showing assets
```

**Insurance Coverage:**
- All plans available (5, 6, 7)
- Study Interruption add-on: RM20,000
- Education Protection: Covers up to 12 months fees if hospitalized
- Family Emergency Fund: RM10,000 for urgent travel
- Premium: Base rate (no multiplier)

**Premium Example (Self-Sponsored Bachelor):**
```
Plan 6: RM480/year
Study Sponsor: Self → 1.0x
Study Level: Bachelor → 1.0x
Duration: 48 months (4 years) → 1.05x
On-Campus: Yes → 0.95x (lower risk)
Financial Proof: Submitted → Approved

Premium = 480 × 1.0 × 1.0 × 1.05 × 0.95 = RM478/year
Monthly: RM39.83
```

---

### Type 2: Scholarship-Funded Study

**Definition:** Education funded by government, university, or international scholarship program.

**Requirements:**
- Official scholarship award letter
- Scholarship fund confirmation
- Scholarship sponsor contact details
- Academic progression requirements (GPA threshold)

**Scholarship Proof Types:**
```
- Government scholarship letter (Petronas, Maybank, etc.)
- University scholarship award letter
- International scholarship organization confirmation
- Employer scholarship letter (if study-related)
```

**Scholarship Tracking:**
```python
# Validate scholarship details
scholarship_letter: File
scholarship_organization: String
annual_award_amount: Decimal
currency: 'MYR' or 'USD'
renewal_conditions: String (e.g., "GPA >= 3.0")
```

**Insurance Coverage:**
- All plans available (5, 6, 7)
- Study Interruption add-on: RM30,000 (enhanced)
- Education Protection: Covers 100% fees if hospitalized
- Scholarship Grant Protection: Covers if scholarship withdrawn
- Family Emergency Fund: RM15,000
- Premium: 10% discount vs self-sponsored

**Premium Example (Scholarship Bachelor):**
```
Plan 6: RM480/year
Study Sponsor: Scholarship → 0.90x (discount)
Study Level: Bachelor → 1.0x
Duration: 48 months → 1.05x
On-Campus: Yes → 0.95x
Financial Proof: Scholarship Letter → Verified

Premium = 480 × 0.90 × 1.0 × 1.05 × 0.95 = RM431/year
Monthly: RM35.92
```

---

### Type 3: Employer-Sponsored Study

**Definition:** Education funded by current or prospective employer for staff development.

**Requirements:**
- Official employer sponsorship letter
- Employment confirmation
- Study-work linkage explanation
- Employer commitment (post-graduation employment)

**Employer Sponsorship Details:**
```
employer_name: String
employment_contract_reference: String
sponsorship_amount_annual: Decimal
study_field_relevance: String (e.g., "Leadership training for management role")
post_graduation_commitment: String (e.g., "2-year employment obligation")
sponsor_contact: String
```

**Insurance Coverage:**
- All plans available (5, 6, 7)
- Study Interruption add-on: RM25,000
- Education Protection: Covers 75% fees if hospitalized
- Employment Continuation Protection: If employer downsizes
- Study Delay Coverage: If delayed entry/semester extension
- Family Emergency Fund: RM12,000
- Premium: 5% discount vs self-sponsored

**Premium Example (Employer-Sponsored Master's):**
```
Plan 6: RM480/year
Study Sponsor: Employer-Sponsored → 0.95x (discount)
Study Level: Master's → 1.20x (higher education = higher cover)
Duration: 24 months → 1.0x (shorter program)
On-Campus: No → 1.05x (off-campus = slightly higher risk)
Financial Proof: Employer Letter → Verified

Premium = 480 × 0.95 × 1.20 × 1.0 × 1.05 = RM576/year
Monthly: RM48.00
```

---

## Study Level Classification

### Diploma
- Duration: 2-3 years
- Pathway: Vocational/Technical education
- Insurance modifier: 1.0x
- Age: Typically 18-22

### Bachelor Degree
- Duration: 3-4 years
- Pathway: Undergraduate university
- Insurance modifier: 1.0x (base)
- Age: Typically 18-25

### Master's Degree
- Duration: 1-3 years
- Pathway: Graduate/Postgraduate
- Insurance modifier: 1.20x (higher coverage)
- Age: Typically 23-35
- Premium increase: Recognition of higher education level

### PhD / Doctoral
- Duration: 3-7 years
- Pathway: Advanced research
- Insurance modifier: 1.30x (highest coverage)
- Age: Typically 25-40
- Premium increase: Extended duration + research risks

### Professional Certificate
- Duration: 3-12 months
- Pathway: Specialized training (TEFL, ACCA, etc.)
- Insurance modifier: 0.80x (lower cost, short-term)
- Age: Flexible

---

## Data Fields Reference

### Complete Worker & Student Data Model

#### Worker Fields (24 new)
```
Core Categorization:
- applicant_type: 'worker'
- worker_category: 'category_1' | 'category_2' | 'category_3'

Employment Details:
- monthly_salary: Decimal (MYR)
- employment_type: 'permanent' | 'contract' | 'freelance' | 'temporary'
- work_permit_status: 'valid' | 'pending' | 'eligible' | 'expired' | 'other'
- work_permit_expiry_date: Date

Employer Information:
- employer_name: String (existing, enhanced for workers)
- employer_registration_number: String
- employer_sponsorship_approved: Boolean

Professional Details:
- years_of_experience: Integer
- professional_license_number: String
```

#### Student Fields (18 new)
```
Core Categorization:
- is_student: Boolean
- study_sponsor_type: 'self_sponsored' | 'scholarship' | 'employer_sponsored' | 'government_grant' | 'other'
- study_level: 'diploma' | 'bachelor' | 'master' | 'phd' | 'certificate' | 'other'

Education Details:
- university_name: String (existing, enhanced)
- course_of_study: String (existing, enhanced)
- field_of_study: String (existing)
- university_country: String (existing)
- expected_graduation: Date (existing)

Sponsor-Specific:
- scholarship_name: String
- scholarship_award_amount: Decimal (MYR)
- financial_proof_type: 'bank_statement' | 'scholarship_letter' | 'sponsor_letter' | 'parents_declaration' | 'investment_proof' | 'other'
- financial_proof_submitted: Boolean

Duration & Logistics:
- intended_duration_months: Integer (1-84)
- semester_start_date: Date
- on_campus_residential: Boolean

Employer Link:
- employer_sponsoring_study: String (if employer-sponsored)
```

---

## Premium Calculation by Category

### Worker Premium Formula

```
Premium = Base_Plan_Price × Category_Multiplier × Industry_Adjustment × Employment_Type_Adjustment × Salary_Adjustment × Professional_License_Adjustment

Category Multipliers:
- Category 1 (High-Skilled): 1.0x
- Category 2 (Skilled): 1.15x
- Category 3 (General): 1.35x

Industry Adjustments:
- Low Risk (Tech, Finance, Education): 0.90-0.95x
- Moderate Risk (Manufacturing, Retail): 1.05-1.15x
- High Risk (Construction, Mining): 1.20-1.30x

Employment Adjustments:
- Permanent: 1.0x
- Contract: 1.05x
- Freelance: 1.20x
- Temporary: 1.15x

Salary Adjustments:
- High (>RM10,000): 1.10x
- Normal (RM3,000-10,000): 1.0x
- Low (<RM2,000): 0.90x

Professional License: 0.95x discount (if applicable)
```

### Student Premium Formula

```
Premium = Base_Plan_Price × Sponsor_Multiplier × Study_Level_Multiplier × Duration_Multiplier × Residential_Adjustment

Sponsor Multipliers:
- Self-Sponsored: 1.0x
- Scholarship-Funded: 0.90x
- Employer-Sponsored: 0.95x
- Government Grant: 0.85x

Study Level Multipliers:
- Diploma: 1.0x
- Bachelor: 1.0x
- Master's: 1.20x
- PhD: 1.30x
- Certificate: 0.80x

Duration Multipliers (months):
- 1-12: 0.85x
- 12-24: 0.95x
- 24-48: 1.0x
- 48-60: 1.05x
- 60-84: 1.10x

Residential Adjustment:
- On-Campus: 0.95x (lower risk)
- Off-Campus: 1.05x (higher risk)
```

---

## Eligibility Matrix

### Worker Category Eligibility

| Criteria | Category 1 | Category 2 | Category 3 |
|----------|-----------|-----------|-----------|
| **Education** | Bachelor+ | Diploma/Vocational | Secondary or equivalent |
| **Experience** | 5+ years | 2-5 years | 0+ years (entry OK) |
| **Salary Range** | RM6,000+ | RM3,000-6,000 | RM1,500-3,500 |
| **Skills** | Specialized/Expert | Technical/Skilled | General/Support |
| **Job Examples** | Engineers, Doctors, IT | Technicians, Supervisors | General Labor, Admin |
| **Plans Available** | 5, 6, 7 | 5, 6 | 5, 6 |
| **Add-ons Available** | All | Limited | Minimal |
| **Premium Tier** | Base (1.0x) | +15% (1.15x) | +35% (1.35x) |
| **Work Permit Duration** | 2-5 years | 1-3 years | 1-2 years |
| **Renewal Difficulty** | Easy (automatic) | Moderate | Difficult (quota) |

### Student Category Eligibility

| Criteria | Self-Sponsored | Scholarship-Funded | Employer-Sponsored |
|----------|-----------------|-------------------|-------------------|
| **Min Financial Proof** | RM50,000+ | Scholarship letter | Employer letter |
| **Plans Available** | 5, 6, 7 | 5, 6, 7 | 5, 6, 7 |
| **Study Interruption** | RM20,000 | RM30,000 | RM25,000 |
| **Premium Adjustment** | Base (1.0x) | -10% (0.90x) | -5% (0.95x) |
| **Financial Proof Type** | Bank/Fixed Deposit | Scholarship Letter | Employer Sponsorship |
| **Employer Requirement** | None | None | Current/Prospective |
| **Income Requirement** | None (if funded by family) | None (scholarship covers) | None (employer pays) |
| **Age Flexibility** | Flexible | 18-40 typically | 21+ (established career) |

---

## Implementation in Forms

### Form Flow for Applicants

```
Step 1: Applicant Type Selection
├─ Are you a Foreign Worker or Student?
├─ Applicant Type: [Worker] [Student] [Other]
└─ Redirect to category-specific form

Step 2A: WORKER PATH
├─ Step 2A.1: Worker Category Classification
│  ├─ What is your employment level?
│  ├─ Display: Category 1/2/3 options
│  ├─ Show: Requirements for each category
│  └─ Selected category determines premium tier
│
├─ Step 2A.2: Employment Details
│  ├─ Monthly Salary (MYR)
│  ├─ Employment Type (Permanent/Contract/Freelance)
│  ├─ Work Permit Status
│  ├─ Work Permit Expiry Date (if valid)
│  └─ Years of Experience
│
├─ Step 2A.3: Employer Information
│  ├─ Employer Name
│  ├─ Employer Registration Number
│  ├─ Sponsorship Approval Status
│  └─ Professional License (if applicable)
│
└─ Continue to Common Steps (Plan, Beneficiary, Payment)

Step 2B: STUDENT PATH
├─ Step 2B.1: Study Information
│  ├─ Institution Name
│  ├─ Level of Study (Diploma/Bachelor/Master/PhD)
│  ├─ Field of Study
│  ├─ University Country
│  └─ Expected Graduation Date
│
├─ Step 2B.2: Sponsorship Type
│  ├─ How is your education funded?
│  ├─ Sponsorship Type: [Self] [Scholarship] [Employer] [Government] [Other]
│  ├─ Show: Requirements for each type
│  └─ Load conditional fields based on selection
│
├─ Step 2B.3: Financial Proof
│  ├─ Type of Financial Proof (based on sponsorship type)
│  ├─ Scholarship Name / Employer Name / Bank Details
│  ├─ Scholarship Award Amount
│  └─ Upload Supporting Documents
│
├─ Step 2B.4: Study Duration
│  ├─ Intended Duration of Stay (months)
│  ├─ Semester Start Date
│  ├─ On-Campus Residential? (Yes/No)
│  └─ Employer Sponsoring Study? (if employer-sponsored)
│
└─ Continue to Common Steps (Plan, Beneficiary, Payment)

Step 3: Plan Selection
├─ Display plans with worker/student-specific coverage
├─ Show applicable add-ons
└─ Calculate premium based on category

Step 4-8: Common Steps
├─ Personal Information
├─ Identity & Visa
├─ Contact & Address
├─ Beneficiary
├─ Payment & Compliance
```

### Conditional Logic Examples

```javascript
// Show worker fields only if applicant_type = 'worker'
if (applicant_type === 'worker') {
  show([
    'worker_category',
    'monthly_salary',
    'employment_type',
    'work_permit_status',
    'employer_name',
    'years_of_experience'
  ])
  
  // Category 1 requires professional license
  if (worker_category === 'category_1') {
    require('professional_license_number')
  }
  
  // Calculate worker premium
  calculate_worker_premium()
}

// Show student fields only if is_student = true
if (is_student === true) {
  show([
    'university_name',
    'study_level',
    'study_sponsor_type',
    'intended_duration_months',
    'semester_start_date',
    'on_campus_residential'
  ])
  
  // Show sponsor-type specific fields
  if (study_sponsor_type === 'scholarship') {
    show(['scholarship_name', 'scholarship_award_amount'])
    require('financial_proof_type')
  } else if (study_sponsor_type === 'employer_sponsored') {
    show(['employer_sponsoring_study'])
    require('employer_sponsoring_study')
  }
  
  // Calculate student premium
  calculate_student_premium()
}

// International fields always visible
show([
  'nationality',
  'country_of_residence',
  'visa_type',
  'visa_expiry_date'
])
```

---

## Database Migration

### New Fields Summary

**Total New Fields: 42**

```sql
-- Worker fields (19)
ALTER TABLE applications ADD applicant_type VARCHAR(20);
ALTER TABLE applications ADD worker_category VARCHAR(20);
ALTER TABLE applications ADD monthly_salary DECIMAL(10,2);
ALTER TABLE applications ADD employment_type VARCHAR(20);
ALTER TABLE applications ADD work_permit_status VARCHAR(20);
ALTER TABLE applications ADD work_permit_expiry_date DATE;
ALTER TABLE applications ADD employer_registration_number VARCHAR(100);
ALTER TABLE applications ADD employer_sponsorship_approved BOOLEAN;
ALTER TABLE applications ADD years_of_experience INTEGER;
ALTER TABLE applications ADD professional_license_number VARCHAR(100);

-- Student fields (18)
ALTER TABLE applications ADD study_sponsor_type VARCHAR(25);
ALTER TABLE applications ADD study_level VARCHAR(20);
ALTER TABLE applications ADD scholarship_name VARCHAR(255);
ALTER TABLE applications ADD scholarship_award_amount DECIMAL(10,2);
ALTER TABLE applications ADD financial_proof_type VARCHAR(25);
ALTER TABLE applications ADD financial_proof_submitted BOOLEAN;
ALTER TABLE applications ADD intended_duration_months INTEGER;
ALTER TABLE applications ADD semester_start_date DATE;
ALTER TABLE applications ADD on_campus_residential BOOLEAN;
ALTER TABLE applications ADD employer_sponsoring_study VARCHAR(255);

-- Existing fields enhanced (5)
-- applicant_type (new overall categorization)
-- is_student, university_name, course_of_study, field_of_study (expanded usage)
```

### Migration Strategy

1. **Phase 1:** Add all new fields to Application model (nullable initially)
2. **Phase 2:** Create data migration to categorize existing applications
3. **Phase 3:** Add validation rules in serializers
4. **Phase 4:** Update forms to support new categories
5. **Phase 5:** Update admin dashboard with filtering by category

---

## Next Steps

1. **Frontend Implementation:**
   - Create dynamic form steps based on applicant type
   - Implement conditional field display
   - Build category selection UI

2. **Premium Engine:**
   - Implement premium calculation formulas
   - Build pricing matrix for all combinations
   - Set up A/B testing for different category rates

3. **Admin Dashboard:**
   - Add filtering by applicant type
   - Add filtering by worker category
   - Add filtering by study sponsor type
   - Create analytics dashboard

4. **Documentation:**
   - Create user-facing guides for each category
   - Create internal training materials
   - Create API documentation for partner integrations

5. **Compliance & Legal:**
   - Verify Malaysia labor regulation alignment
   - Review with legal team
   - Ensure PDPA compliance for sensitive fields
   - Document data retention by category

---

**Version:** 1.0  
**Last Updated:** April 22, 2026  
**Status:** Ready for Frontend Implementation

