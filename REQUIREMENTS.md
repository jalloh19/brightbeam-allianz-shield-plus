# Enhanced Assessment Requirements: Brightbeam Business Systems Intern

---

# Project Title
Digital Application Portal for Allianz Shield Plus  
(Client-Facing Insurance Onboarding System for Foreign Applicants in Malaysia)

---

# Core Objective

Design and develop a professional **client-facing HTML application form** for **Allianz Shield Plus**, supported by a strong **Business Proposal Write-Up** explaining how the solution should operate in a real business environment.

The final submission should demonstrate:

- Strong business systems thinking
- Customer-centric UX design
- Clean technical execution
- Understanding of insurance onboarding workflows
- Initiative beyond baseline requirements

---

# Strategic Interpretation of the Task

This is not only a form-building task.

The assessment is intended to evaluate whether the candidate can:

- Understand a real insurance product
- Translate vague business needs into usable systems
- Improve customer onboarding processes
- Capture accurate operational data
- Think beyond front-end into business operations
- Build scalable, practical solutions

---

# Target Audience Constraint (Critical)

The solution must be intentionally optimized for:

## Primary Users:
Foreign nationals applying for:

- Visa processing
- Residency applications
- Work permits
- Long-term stay in Malaysia

## UX Implications:

The form must accommodate users who may:

- Be unfamiliar with Malaysian insurance terminology
- Use passports instead of Malaysian IC
- Use international phone numbers
- Have non-local addresses
- Need simple language and guided steps
- Be accessing on mobile devices

---

# Submission Components

---

# Part A — HTML Application Form

## Mandatory Deliverable

A working HTML-based insurance application portal.

The final result should feel like a real customer onboarding product, not a basic school form.

---

# Functional Scope

---

## 1. Plan Selection (Strictly Required)

Only the following plans should be available:

- [x] Plan 5 — RM360,000
- [x] Plan 6 — RM600,000
- [x] Plan 7 — RM900,000

## Recommended UX Enhancements

- Card-based plan selector
- Highlight recommended plan
- Comparison layout
- Coverage summary
- Selected state indicator

---

## 2. Applicant Information (Mandatory)

Capture the following fields accurately:

### Identity

- [x] Full Name (as per passport)
- [x] Preferred Name (optional enhancement)
- [x] Identification Type
- [x] Identification Number
- [x] Identification Expiry Date (recommended)

### Personal Details

- [x] Nationality
- [x] Date of Birth
- [x] Auto-calculated Age (recommended)
- [x] Gender
- [x] Marital Status (optional enhancement)

### Contact

- [x] Contact Number with Country Code
- [x] Email Address

### Address

- [x] Full Address
- [x] Address Line 1
- [x] Address Line 2
- [x] City
- [x] State
- [x] Postcode
- [x] Country

### Employment

- [x] Occupation
- [x] Industry (recommended)
- [x] Employer Name (optional)

---

## 3. Identification Types (Foreign-Friendly)

Must support:

- [x] Passport
- [x] Residence Permit
- [x] Work Permit
- [x] Student Pass
- [x] Other Government ID

---

## 4. Additional Mandatory Sections

### Coverage / Plan Section

- Selected plan confirmation
- Optional add-ons (recommended)
- Family cover option (recommended)

### Payment Section

Must include at least:

- [x] Payment method selector
- [x] Card / FPX / Online Banking / Manual follow-up

### Declaration & Consent

Must include:

- [x] Accuracy confirmation
- [x] Privacy consent
- [x] Terms acceptance
- [x] Communication consent

---

# Strongly Recommended Advanced Sections

These are not explicitly required but increase score significantly.

---

## Nominee / Beneficiary Section

- Full name
- Relationship
- Contact number
- ID number

## Eligibility Questions

Yes / No declarations:

- Existing disability
- Current hospitalization
- Hazardous occupation
- Hazardous sports activity

## Review Before Submit

Display final summary before submission.

---

# UX / UI Requirements

The form should be modern, clear, and conversion-friendly.

---

## Recommended Layout

Multi-step wizard flow:

1. Welcome / Product Intro  
2. Plan Selection  
3. Personal Details  
4. Contact Details  
5. Address  
6. Occupation  
7. Coverage Options  
8. Payment  
9. Declaration  
10. Review & Submit

---

## Required UX Quality

- Responsive on mobile and desktop
- Clear section labels
- Minimal clutter
- Error messages
- Easy navigation
- Logical field grouping

---

## Recommended UX Enhancements

- Progress bar
- Save draft (LocalStorage)
- Real-time validation
- Auto-format passport field
- Tooltips for insurance terms
- Searchable country dropdown

---

# Branding & Product Context

Should reflect Allianz Shield Plus positioning:

- 24/7 Worldwide Protection
- High accidental coverage
- Cashless hospital support
- Optional lifestyle benefits
- Family discount options

## Recommended Marketing Banner

25th Anniversary Campaign:

- 25% Special Bonus
- Valid until 31 Dec 2026

(Used visually to simulate real commercial deployment)

---

# Technical Requirements

## Minimum

- HTML
- CSS
- JavaScript

## Recommended Standards

- Semantic HTML
- Clean CSS structure
- Modular JS
- Responsive design
- Input validation

---

# Deliverable File Structure

```text
submission/
├── index.html
├── style.css
├── script.js
├── assets/
└── README.md