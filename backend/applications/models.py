"""
Database models for Allianz Shield Plus application.
Stores form submissions, beneficiaries, audit logs, payments, and notifications.
"""

from django.db import models
from django.core.validators import EmailValidator
from uuid import uuid4
import json

class Application(models.Model):
    """
    Core application model for insurance form submissions.
    Stores all user-submitted data with encryption for sensitive fields.
    Enhanced for international applicants with comprehensive data fields.
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('archived', 'Archived'),
    ]
    
    PLAN_CHOICES = [
        ('plan_5', 'Plan 5 (RM360,000)'),
        ('plan_6', 'Plan 6 (RM600,000)'),
        ('plan_7', 'Plan 7 (RM900,000)'),
    ]
    
    ID_TYPE_CHOICES = [
        ('passport', 'Passport'),
        ('residence_permit', 'Residence Permit'),
        ('work_permit', 'Work Permit'),
        ('student_pass', 'Student Pass'),
        ('employment_pass', 'Employment Pass'),
        ('national_id', 'National ID'),
        ('other', 'Other'),
    ]
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    MARITAL_STATUS_CHOICES = [
        ('single', 'Single'),
        ('married', 'Married'),
        ('divorced', 'Divorced'),
        ('widowed', 'Widowed'),
        ('other', 'Other'),
    ]
    
    INDUSTRY_CHOICES = [
        ('technology', 'Technology'),
        ('finance', 'Finance & Banking'),
        ('education', 'Education'),
        ('healthcare', 'Healthcare'),
        ('manufacturing', 'Manufacturing'),
        ('retail', 'Retail'),
        ('hospitality', 'Hospitality & Tourism'),
        ('construction', 'Construction'),
        ('student', 'Student'),
        ('other', 'Other'),
    ]
    
    WORK_ENVIRONMENT_CHOICES = [
        ('office', 'Office-based'),
        ('outdoor', 'Outdoor/Field Work'),
        ('construction', 'Construction Site'),
        ('driving', 'Driving/Transportation'),
        ('student', 'Student'),
        ('other', 'Other'),
    ]
    
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
    
    CONTACT_PREFERENCE_CHOICES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('phone', 'Phone Call'),
        ('both', 'Both Email & SMS'),
    ]
    
    # ============ APPLICANT TYPE (Worker vs Student) ============
    APPLICANT_TYPE_CHOICES = [
        ('worker', 'Foreign Worker'),
        ('student', 'Foreign Student'),
        ('other', 'Other'),
    ]
    
    # ============ WORKER CATEGORIES (Malaysia Labor Regulation June 2026) ============
    # Effective June 2026: New Malaysia labor framework classifies foreign workers into 3 categories
    WORKER_CATEGORY_CHOICES = [
        ('category_1', 'Category 1: High-Skilled Professional (Specialist/Expert)'),
        ('category_2', 'Category 2: Skilled Worker (Technician/Supervisor)'),
        ('category_3', 'Category 3: General Worker (Administrative/Support)'),
    ]
    
    EMPLOYMENT_TYPE_CHOICES = [
        ('permanent', 'Permanent Employment'),
        ('contract', 'Contract-Based'),
        ('freelance', 'Freelance/Self-Employed'),
        ('temporary', 'Temporary Assignment'),
    ]
    
    WORK_PERMIT_STATUS_CHOICES = [
        ('valid', 'Valid Work Permit'),
        ('pending', 'Pending Application'),
        ('eligible', 'Eligible but Not Applied'),
        ('expired', 'Expired (Renewal Pending)'),
        ('other', 'Other Status'),
    ]
    
    # ============ STUDENT SPONSOR TYPE ============
    STUDY_SPONSOR_TYPE_CHOICES = [
        ('self_sponsored', 'Self-Sponsored'),
        ('scholarship', 'Scholarship-Funded'),
        ('employer_sponsored', 'Employer-Sponsored Study'),
        ('government_grant', 'Government Grant'),
        ('other', 'Other Funding'),
    ]
    
    STUDY_LEVEL_CHOICES = [
        ('diploma', 'Diploma'),
        ('bachelor', 'Bachelor Degree'),
        ('master', 'Master Degree'),
        ('phd', 'PhD / Doctoral'),
        ('certificate', 'Professional Certificate'),
        ('other', 'Other'),
    ]
    
    FINANCIAL_PROOF_TYPE_CHOICES = [
        ('bank_statement', 'Bank Statement'),
        ('scholarship_letter', 'Scholarship Award Letter'),
        ('sponsor_letter', 'Sponsor Letter from Employer'),
        ('parents_declaration', 'Parents Financial Declaration'),
        ('investment_proof', 'Investment/Asset Proof'),
        ('other', 'Other Documentation'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    
    # ============ PLAN SELECTION ============
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    
    # ============ PERSONAL INFORMATION ============
    full_name = models.CharField(max_length=255, help_text="Full name as per identification document")
    preferred_name = models.CharField(max_length=255, blank=True, help_text="Preferred name for communication")
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    
    # Contact
    phone_country_code = models.CharField(max_length=5, default='+60')  # Malaysia default
    phone_number = models.CharField(max_length=20)
    contact_preference = models.CharField(max_length=10, choices=CONTACT_PREFERENCE_CHOICES, default='email')
    
    # Demographics
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, blank=True)
    
    # ============ NATIONALITY & RESIDENCY (International) ============
    nationality = models.CharField(max_length=100, help_text="Country of citizenship")
    country_of_residence = models.CharField(max_length=100, default='Malaysia')
    
    # ============ IDENTIFICATION & VISA ============
    id_type = models.CharField(max_length=30, choices=ID_TYPE_CHOICES)
    id_number = models.CharField(max_length=255, help_text="Identification number (encrypted)")
    id_expiry_date = models.DateField(null=True, blank=True, help_text="ID/Passport expiration date")
    id_issuing_country = models.CharField(max_length=100, blank=True)
    
    # Visa Information (for international applicants)
    visa_type = models.CharField(max_length=30, choices=VISA_TYPE_CHOICES, blank=True)
    visa_expiry_date = models.DateField(null=True, blank=True, help_text="Visa/Work permit expiration date")
    visa_number = models.CharField(max_length=100, blank=True)
    
    # ============ ADDRESS ============
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state_province = models.CharField(max_length=100, blank=True, help_text="State/Province (required for some countries)")
    postcode = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='Malaysia')
    
    # ============ EMPLOYMENT & OCCUPATION ============
    occupation = models.CharField(max_length=255)
    industry = models.CharField(max_length=30, choices=INDUSTRY_CHOICES, blank=True)
    employer_name = models.CharField(max_length=255, blank=True, help_text="Company, institution, or self-employed")
    work_environment = models.CharField(max_length=30, choices=WORK_ENVIRONMENT_CHOICES, blank=True)
    
    # ============ WORKER-SPECIFIC FIELDS (Foreign Workers) ============
    applicant_type = models.CharField(
        max_length=20, 
        choices=APPLICANT_TYPE_CHOICES, 
        default='other',
        help_text="Distinguish between worker, student, and other applicants"
    )
    
    # Worker categorization under Malaysia labor regulation (effective June 2026)
    worker_category = models.CharField(
        max_length=20,
        choices=WORKER_CATEGORY_CHOICES,
        blank=True,
        help_text="Malaysia labor regulation: 3 categories of foreign workers"
    )
    
    # Worker employment details
    monthly_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Monthly gross salary in MYR"
    )
    
    employment_type = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_TYPE_CHOICES,
        blank=True,
        help_text="Permanent, contract, freelance, or temporary"
    )
    
    work_permit_status = models.CharField(
        max_length=20,
        choices=WORK_PERMIT_STATUS_CHOICES,
        blank=True,
        help_text="Current work permit status in Malaysia"
    )
    
    work_permit_expiry_date = models.DateField(
        null=True,
        blank=True,
        help_text="Work permit expiration date"
    )
    
    employer_registration_number = models.CharField(
        max_length=100,
        blank=True,
        help_text="Company registration number or employer ID"
    )
    
    employer_sponsorship_approved = models.BooleanField(
        default=False,
        help_text="Whether employer has approved/sponsored the work visa"
    )
    
    years_of_experience = models.IntegerField(
        null=True,
        blank=True,
        help_text="Years of work experience in current field"
    )
    
    professional_license_number = models.CharField(
        max_length=100,
        blank=True,
        help_text="Professional license/certification number (if applicable)"
    )
    
    # ============ STUDENT STATUS (Conditional) ============
    is_student = models.BooleanField(default=False, help_text="Whether applicant is currently a student")
    university_name = models.CharField(max_length=255, blank=True)
    course_of_study = models.CharField(max_length=255, blank=True)
    field_of_study = models.CharField(max_length=100, blank=True)
    university_country = models.CharField(max_length=100, blank=True, help_text="Country where studying")
    expected_graduation = models.DateField(null=True, blank=True)
    
    # ============ STUDENT-SPECIFIC FIELDS (Foreign Students) ============
    study_sponsor_type = models.CharField(
        max_length=25,
        choices=STUDY_SPONSOR_TYPE_CHOICES,
        blank=True,
        help_text="How is the student's education being funded?"
    )
    
    study_level = models.CharField(
        max_length=20,
        choices=STUDY_LEVEL_CHOICES,
        blank=True,
        help_text="Level of study: Diploma, Bachelor, Master, PhD, etc."
    )
    
    scholarship_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Name of scholarship or funding program"
    )
    
    scholarship_award_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Annual scholarship/funding amount in MYR"
    )
    
    financial_proof_type = models.CharField(
        max_length=25,
        choices=FINANCIAL_PROOF_TYPE_CHOICES,
        blank=True,
        help_text="Type of financial proof provided"
    )
    
    financial_proof_submitted = models.BooleanField(
        default=False,
        help_text="Whether financial proof documents have been submitted"
    )
    
    intended_duration_months = models.IntegerField(
        null=True,
        blank=True,
        help_text="Intended duration of stay in Malaysia (in months)"
    )
    
    semester_start_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date when current semester/course starts"
    )
    
    on_campus_residential = models.BooleanField(
        default=False,
        help_text="Whether student will reside on campus"
    )
    
    employer_sponsoring_study = models.CharField(
        max_length=255,
        blank=True,
        help_text="Employer name if study is employer-sponsored"
    )
    
    # ============ INSURANCE DETAILS ============
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    coverage_addons = models.JSONField(default=dict, blank=True, help_text="JSON of selected add-ons with prices")
    calculated_premium = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_annual_premium = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # ============ BENEFICIARY INFORMATION ============
    beneficiary_name = models.CharField(max_length=255, blank=True)
    beneficiary_relationship = models.CharField(max_length=100, blank=True)
    beneficiary_phone = models.CharField(max_length=20, blank=True)
    secondary_beneficiary_name = models.CharField(max_length=255, blank=True)
    secondary_beneficiary_relationship = models.CharField(max_length=100, blank=True)
    
    # ============ PAYMENT INFORMATION ============
    preferred_payment_method = models.CharField(max_length=30, blank=True, help_text="Preferred payment method")
    
    # ============ COMPLIANCE & STATUS ============
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    
    # PDPA Consent (IMPORTANT: Not pre-checked in frontend)
    pdpa_consent = models.BooleanField(default=False, help_text="Explicit PDPA consent - MUST be false by default")
    pdpa_consent_timestamp = models.DateTimeField(null=True, blank=True)
    
    # Terms & Conditions
    terms_accepted = models.BooleanField(default=False)
    terms_accepted_timestamp = models.DateTimeField(null=True, blank=True)
    
    # Marketing/Communication
    marketing_opt_in = models.BooleanField(default=False)
    
    # Data retention
    data_retention_expiry = models.DateField(null=True, blank=True, help_text="Auto-delete date (7 years from submission)")
    
    # ============ METADATA & TRACKING ============
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.CharField(max_length=45, blank=True, help_text="IPv4 or IPv6 at submission")
    user_agent = models.TextField(blank=True, help_text="Browser/device information")
    
    # Application tracking
    application_number = models.CharField(max_length=50, unique=True, blank=True, help_text="User-friendly reference number")
    last_reviewed_by = models.CharField(max_length=255, blank=True)
    review_notes = models.TextField(blank=True, help_text="Internal admin notes")
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.full_name} - {self.plan} ({self.status})"


class Beneficiary(models.Model):
    """
    Insurance beneficiary information linked to an application.
    Supports primary and secondary beneficiaries.
    """
    
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='beneficiaries')
    name = models.CharField(max_length=255)
    relationship = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=20)
    is_primary = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', '-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.relationship}) - {self.application.full_name}"


class AuditLog(models.Model):
    """
    Audit trail for PDPA compliance.
    Logs all changes to application data for regulatory purposes.
    """
    
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('deleted', 'Deleted'),
        ('viewed', 'Viewed'),
    ]
    
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    field_name = models.CharField(max_length=255, blank=True)
    old_value = models.TextField(blank=True)
    new_value = models.TextField(blank=True)
    user = models.CharField(max_length=255, blank=True)  # Username or 'system'
    ip_address = models.CharField(max_length=45, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['application']),
        ]
    
    def __str__(self):
        return f"{self.application.full_name} - {self.action} - {self.timestamp}"


class PaymentRecord(models.Model):
    """
    Payment tracking for each application.
    Records payment method, status, and transaction details.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    METHOD_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('online_banking', 'Online Banking'),
        ('e_wallet', 'E-Wallet'),
        ('check', 'Check'),
    ]
    
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='MYR')
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=255, blank=True, unique=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.application.full_name} - {self.amount} {self.currency} ({self.status})"


class NotificationLog(models.Model):
    """
    Log of all notifications sent to applicants.
    Tracks email/SMS delivery status for compliance and debugging.
    """
    
    TYPE_CHOICES = [
        ('confirmation', 'Application Confirmation'),
        ('approved', 'Approval Notification'),
        ('rejected', 'Rejection Notification'),
        ('reminder', 'Payment Reminder'),
        ('status_update', 'Status Update'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('bounced', 'Bounced'),
    ]
    
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    recipient = models.CharField(max_length=255)  # Email or phone number
    channel = models.CharField(max_length=10, choices=[('email', 'Email'), ('sms', 'SMS')])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    subject = models.CharField(max_length=255, blank=True)
    message = models.TextField(blank=True)
    error_message = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.type} → {self.recipient} ({self.status})"
