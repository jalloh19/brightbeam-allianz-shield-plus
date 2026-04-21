# International Applicant Data Fields & Compliance Guide

**Project:** Brightbeam Allianz Shield Plus  
**Purpose:** Document all data fields relevant to international applicants and compliance requirements  
**Updated:** April 22, 2026

---

## 1. International Applicant Identification

### 1.1 Visa & Residency Information

#### Visa Type (varchar(30), choices)
```python
VISA_TYPE_CHOICES = [
    ('tourist', 'Tourist Visa'),
    ('business', 'Business Visa'),
    ('work', 'Work Visa'),
    ('student', 'Student Visa'),
    ('family', 'Family Visa'),
    ('residence', 'Residence Permit'),
    ('mm2h', 'MM2H (Malaysia My Second Home)'),
    ('other', 'Other'),
]
```

**Why:** Different visa types have different coverage requirements and insurance eligibility rules.

**Examples:**
- Student Visa → Show "Study Interruption" add-on
- Work Visa → Show "Employment Protection" coverage
- MM2H → Show "Retirement Lifestyle" add-on
- Tourist → Standard coverage only

---

#### Visa Expiry Date (DateField, nullable)
- **Purpose:** Track visa validity for compliance
- **Validation:** Must be future date at time of application
- **Action:** Flag for renewal if expiring within 3 months
- **Compliance:** Required for annual policy renewal eligibility

**Example Use Case:**
```
Applicant has Work Visa expiring in 6 months
→ Policy should end 1 month before visa expiry
→ Send renewal reminder at 3-month mark
```

---

#### Visa Number (CharField, nullable)
- **Purpose:** Unique identifier for visa document
- **Use:** Reference for verification against immigration records
- **Format:** Varies by visa type and issuing country

---

#### ID Issuing Country (CharField)
- **Purpose:** Track which country issued the ID
- **Critical for:** Passport validation, document verification
- **Example:** Passport issued by China, Bangladesh, India, etc.

---

#### ID Expiry Date (DateField, nullable)
- **Purpose:** Track document validity
- **Compliance:** Ensure document is valid at time of claim
- **Action:** Require renewal if expiring within 6 months

---

### 1.2 Residency & Nationality

#### Nationality (CharField)
- **Purpose:** Country of citizenship (for claims, compliance)
- **Default:** Not pre-filled (allow user selection)
- **Options:** 200+ countries supported

**Why Separate from Country of Residence:**
```
Example: Chinese national (nationality) working in Malaysia (country of residence)
→ Different PDPA compliance requirements
→ Different premium calculation
→ Different claims process
```

---

#### Country of Residence (CharField)
- **Purpose:** Where applicant currently lives
- **Default:** "Malaysia"
- **Impact:** Tax jurisdiction, PDPA compliance, coverage availability

**Compliance:** All applicants selected must currently reside in Malaysia for Allianz Shield Plus.

---

#### State/Province (CharField, nullable)
- **Purpose:** Region within country
- **Required for:** Some countries (USA, Australia, India)
- **Example:** Selangor, Kuala Lumpur (Malaysia), New York (USA)

**Conditional Validation:**
```
IF country = 'Malaysia' → Show Malaysian states dropdown
IF country = 'USA' → Show US states dropdown
ELSE → Show free text field or hide
```

---

### 1.3 Address for International Applicants

#### Address Line 1 & 2 (CharField)
- **Support:** International address formats
- **No:** Street-only validation (allow building names, landmarks)
- **Example:** "Lot 123, Jalan Merdeka, Block A"

#### City (CharField)
- **Purpose:** City/municipality name
- **No:** Auto-population assumptions

#### Postcode (CharField)
- **Validation:** Country-specific format
  - Malaysia: 5 digits (00000-98858)
  - UK: Format like SW1A 1AA
  - USA: 5 digits (12345)
  - Multiple formats supported

**Conditional Validation:**
```javascript
if (country === 'Malaysia') {
  validate_postcode_regex(/^\d{5}$/)
} else if (country === 'UK') {
  validate_postcode_regex(/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i)
} else {
  // Accept most formats
}
```

---

## 2. Student-Specific Fields (Conditional)

### 2.1 Student Status

#### Is Student (BooleanField)
- **Triggers:** Conditional display of student-related fields
- **Impact:** Premium calculation, add-on availability

**Conditional Logic:**
```javascript
IF is_student = true OR industry = 'student' OR visa_type = 'student' {
  SHOW(['university_name', 'course_of_study', 'field_of_study', 
        'university_country', 'expected_graduation'])
  ENABLE_ADDON('study_interruption')
  RECALCULATE_PREMIUM()
}
```

---

### 2.2 University Information

#### University Name (CharField)
- **Example:** "Universiti Malaya", "Universiti Kebangsaan Malaysia"
- **Purpose:** Risk assessment, claims verification

---

#### Course of Study (CharField)
- **Example:** "Bachelor of Computer Science", "Master of Business Administration"
- **Purpose:** Detailed academic tracking

---

#### Field of Study (CharField)
- **Example:** "Science", "Engineering", "Commerce", "Arts", "Medicine"
- **Purpose:** Risk categorization for premium calculation

**Risk Mapping Example:**
```
Engineering → Higher accident risk → Higher premium
Arts → Lower accident risk → Lower premium
Medicine → Clinical exposure → Specialized coverage required
```

---

#### University Country (CharField)
- **Purpose:** Where student is studying
- **Critical:** Student in Malaysia vs. studying abroad

**Example:**
```
Student Visa applicant:
- Nationality: China
- University Country: Malaysia → "Study Interruption" covers loss of education
- University Country: USA → "Study Abroad" coverage applies
```

---

#### Expected Graduation (DateField)
- **Purpose:** Policy end date planning
- **Action:** Auto-renewal reminder before graduation
- **Compliance:** Help student transition to working applicant status

---

## 3. Occupation & Employment

### 3.1 Occupation Classification

#### Occupation (CharField)
- **Examples:** "Software Engineer", "Marketing Manager", "Nurse", "Student"
- **Purpose:** Risk assessment, claims classification
- **Validation:** Custom validator checks against approved list

---

#### Industry (CharField with choices)
```python
INDUSTRY_CHOICES = [
    'technology', 'finance', 'education', 'healthcare',
    'manufacturing', 'retail', 'hospitality', 'construction',
    'student', 'other'
]
```

**Why:** Insurance premium depends heavily on occupational risk

**Examples:**
- Technology → Lower accident risk
- Construction → Higher accident risk
- Healthcare → Disease exposure risk
- Student → Special coverage available

---

#### Employer Name (CharField)
- **Purpose:** Employer verification, claims processing
- **For Students:** University/Institution name
- **For Self-employed:** Own company name

---

#### Work Environment (CharField with choices)
```python
WORK_ENVIRONMENT_CHOICES = [
    'office', 'outdoor', 'construction', 'driving', 'student', 'other'
]
```

**Premium Impact:**
- Office-based → Lowest risk
- Outdoor → Moderate risk
- Construction Site → High risk
- Driving/Transportation → High risk
- Student → Special rates

---

## 4. Personal Identification

### 4.1 Full Name

#### Full Name (CharField)
- **Requirement:** Must match identification document exactly
- **Validation:** Allow international characters (Chinese, Arabic, etc.)
- **Example:** "Mohamed bin Abdullah", "李明", "Juan García"

**Important:** No transliteration assumptions; use exact name from document.

---

#### Preferred Name (CharField)
- **Purpose:** Personalization, address in communications
- **Optional:** User can use common/English name for convenience
- **Example:**
  - Full Name: "Sathiyavani Thamsaraman"
  - Preferred Name: "Sathi"

---

### 4.2 Identification Documents

#### ID Type (CharField with choices)
```python
ID_TYPE_CHOICES = [
    ('passport', 'Passport'),
    ('residence_permit', 'Residence Permit'),
    ('work_permit', 'Work Permit'),
    ('student_pass', 'Student Pass'),
    ('employment_pass', 'Employment Pass'),
    ('national_id', 'National ID'),
    ('other', 'Other'),
]
```

**Why Multiple Types:** International applicants have various valid documents

**Validation Rules by Type:**
```
Passport:
  - Number format varies by country
  - Typically 6-9 characters
  - Contains letters and numbers

Student Pass (Malaysia):
  - Format: S1234567 (S + 7 digits)
  - Issued by Malaysian Immigration

Work Permit:
  - Format varies by country
  - Must be valid and not expired

Residence Permit:
  - Format varies by country/region
  - May include city code
```

---

#### ID Number (CharField, encrypted)
- **Encryption:** AES-256 at rest
- **Purpose:** Unique identification, document verification
- **Validation:** Country-specific format checking

**Example Formats:**
```
Passport: 123456789 (Singapore)
Passport: 001234567 (China)
Student Pass: S1234567 (Malaysia)
Work Permit: WP20240001 (Malaysia)
```

---

## 5. Contact & Communication

### 5.1 Phone Number

#### Phone Country Code (CharField)
- **Default:** "+60" (Malaysia)
- **Options:** All international country codes
- **Storage:** Separate field for easier validation

**Example:**
- "+60" → Malaysia
- "+86" → China
- "+91" → India
- "+44" → UK

---

#### Phone Number (CharField)
- **Format:** Country-specific validation
- **Storage:** Without country code (only digits)
- **Example:** "123456789" (with country code "+60" = +60123456789)

**Validation by Country Code:**
```javascript
if (country_code === '+60') {
  // Malaysia: 10-11 digits
  validate_regex(/^[0-9]{10,11}$/)
} else if (country_code === '+86') {
  // China: 11 digits
  validate_regex(/^[0-9]{11}$/)
} else {
  // General: 7-15 digits
  validate_regex(/^[0-9]{7,15}$/)
}
```

---

#### Contact Preference (CharField with choices)
```python
CONTACT_PREFERENCE_CHOICES = [
    ('email', 'Email'),
    ('sms', 'SMS'),
    ('phone', 'Phone Call'),
    ('both', 'Both Email & SMS'),
]
```

**Why:** International applicants may prefer SMS (often cheaper than calls abroad)

---

### 5.2 Email

#### Email (CharField, unique)
- **Validation:** Standard email format
- **Uniqueness:** One email per application
- **Purpose:** Primary notification channel

---

## 6. Compliance & Legal

### 6.1 PDPA Consent

#### PDPA Consent (BooleanField, NOT pre-checked)
- **Critical:** Must be explicitly checked by user
- **Default:** False (to ensure compliance)
- **Validation:** Cannot submit form without checking

**Malaysia PDPA Requirements:**
- Explicit consent before processing personal data
- Clear information about data use
- Right to access and correct data
- Deletion after retention period (7 years)

---

#### PDPA Consent Timestamp (DateTimeField)
- **Purpose:** Audit trail of when consent was given
- **Value:** timestamp when form was submitted
- **Compliance:** Required for PDPA audit

---

### 6.2 Terms & Conditions

#### Terms Accepted (BooleanField)
- **Purpose:** Accept insurance terms and conditions
- **Validation:** Cannot submit without checking

---

#### Terms Accepted Timestamp (DateTimeField)
- **Value:** Timestamp when terms were accepted
- **Use:** Proof of acceptance for disputes

---

### 6.3 Marketing Communications

#### Marketing Opt-In (BooleanField, default False)
- **Purpose:** Whether to receive marketing emails
- **Default:** False (opt-out by default, better for international users)
- **Compliance:** User controls their own communications

---

## 7. Admin & Review

### 7.1 Application Tracking

#### Application Number (CharField, unique)
- **Format:** E.g., "ASP-2024-001234"
- **Purpose:** User-friendly reference for customer service
- **Auto-generated:** On submission

---

#### Status (CharField with choices)
```python
STATUS_CHOICES = [
    ('draft', 'Draft'),
    ('submitted', 'Submitted'),
    ('under_review', 'Under Review'),
    ('approved', 'Approved'),
    ('rejected', 'Rejected'),
    ('archived', 'Archived'),
]
```

---

#### Last Reviewed By (CharField)
- **Purpose:** Track which admin reviewed application
- **Value:** Username of reviewer

---

#### Review Notes (TextField)
- **Purpose:** Internal comments on application
- **Access:** Admin only
- **Examples:**
  - "Verified passport with immigration"
  - "Student status confirmed with university"
  - "Visa expiry within 6 months, recommend early renewal"

---

## 8. Data Retention & Deletion

### 8.1 Retention Policy

#### Data Retention Expiry (DateField)
- **Calculation:** Current date + 7 years
- **Purpose:** Auto-delete personal data after retention period
- **Compliance:** Malaysia PDPA requirement

**Timeline Example:**
```
Application submitted: 2024-04-22
Data retention expires: 2031-04-22
→ Personal data deleted automatically on 2031-04-22
→ Aggregate/anonymized data may be retained
```

---

### 8.2 Right to Deletion

**User Rights (PDPA):**
1. Right to know data is being collected
2. Right to access their data
3. Right to correct inaccurate data
4. Right to delete data (after retention period)
5. Right to transfer data (data portability)

**Implementation:**
- Admin dashboard: View all user data
- Email request: "Request My Data"
- Form field: "Request Data Deletion" (after retention period)
- Email response: Data deletion confirmation

---

## 9. International Payment Methods

### 9.1 Preferred Payment Method (CharField)

**Supported Methods:**
```
- Credit Card (Visa, Mastercard, Amex)
- Bank Transfer (SWIFT, LocalBank)
- Online Banking (E-wallet, m-banking)
- Others (Check, Money Order)
```

**Why Separate:** Different countries prefer different methods

**Examples:**
- Malaysia: FPX (Malaysian bank transfer), Credit Card
- China: AliPay, WeChat Pay
- India: UPI, Bank Transfer
- Singapore: PayNow, Credit Card

---

## 10. Validation Checklist for International Applicants

### Pre-Submission Validation

- [ ] **Nationality:** Selected from country list
- [ ] **Country of Residence:** "Malaysia" selected (business requirement)
- [ ] **Visa Type:** Appropriate type selected
- [ ] **Visa Expiry:** Date is in the future
- [ ] **ID Type:** Matches nationality (passport if available)
- [ ] **ID Number:** Valid format for ID type
- [ ] **ID Expiry:** Not expired (or within acceptable range)
- [ ] **Age:** Must be 18+ (calculated from DOB)
- [ ] **Email:** Valid format, unique in system
- [ ] **Phone:** Valid format with country code
- [ ] **Address:** Complete with city, postcode, country
- [ ] **Student Status:** If true, all student fields must be filled
- [ ] **University Country:** If student, must be selected
- [ ] **Expected Graduation:** If student, must be in future
- [ ] **PDPA Consent:** Must be explicitly checked (NOT pre-checked)
- [ ] **Terms Accepted:** Must be explicitly checked
- [ ] **Contact Preference:** Must be selected

---

## 11. Premium Calculation Factors (International)

### 11.1 Risk Assessment Inputs

**From International Fields:**
```
1. Nationality → Risk profile by country
2. Visa Type → Insurance eligibility
3. Work Environment → Occupational hazard
4. Industry → Sector-specific risk
5. Is Student → Special student rates
6. Visa Expiry → Coverage timeline

Premium Calculation:
Base Premium = Plan Level (5/6/7)
+ Occupational Loading (industry/environment)
+ Student Discount (if student)
+ Add-ons (Study Interruption, Family Cover, Traveler)
= Total Annual Premium
```

**Example Calculation:**
```
Plan 6 (RM600,000 cover): RM480/year base
+ Construction Industry (25% loading): +RM120
- Student Discount (20%): -RM144
+ Study Interruption add-on: +RM150
+ Family Cover add-on: +RM300
= Total: RM906/year

Installment: RM906 / 12 = RM75.50/month
```

---

## 12. Document Upload & Verification

### 12.1 ID Document Upload

**Supported Formats:**
- PDF, JPG, PNG
- Max file size: 5MB
- Min resolution: 300x200 pixels

**Upload Fields:**
```
- ID Front (mandatory)
- ID Back (mandatory for passport)
- Visa Page (conditional - if visa type selected)
- Proof of Residence (optional)
```

**Security:**
- Virus scan on upload
- Encrypted storage
- Access limited to admin
- Auto-delete after 7 years

---

## 13. Comparative International Features

| Feature | Malaysia | Work Visa | Student Visa | MM2H |
|---------|----------|-----------|--------------|------|
| ID Types | National ID, Passport | Work Permit, Passport | Student Pass, Passport | Residence Permit, Passport |
| Address Format | Standard | International | Student/Host | Primary Residence |
| Special Add-ons | Family Cover | Employment Protect | Study Interrupt | Lifestyle |
| Premium Impact | Base | +10% | -20% | -5% |
| Visa Tracking | Not required | Required | Required | Required |
| Data Retention | 7 years | 7 years + 1 extra | 7 years after grad | 7 years |

---

## 14. Summary

This document outlines 30+ data fields specifically designed to support international applicants to Allianz Shield Plus insurance in Malaysia. The form captures comprehensive information about:

1. **Visa & Residency Status** - Critical for eligibility & coverage
2. **Student Status** - For special student coverage & pricing
3. **International Identity** - Passports, permits, visas
4. **Address & Contact** - International format support
5. **Occupation & Risk** - For premium calculation
6. **Compliance & Legal** - PDPA, consent tracking, data retention

All fields support the principle of treating international applicants with equal care and attention as domestic applicants, while maintaining rigorous compliance with Malaysian regulations.

---

**Document Version:** 1.0  
**Last Updated:** April 22, 2026  
**Prepared by:** Brightbeam Development Team
