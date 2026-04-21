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
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('archived', 'Archived'),
    ]
    
    PLAN_CHOICES = [
        ('basic', 'Basic Shield'),
        ('plus', 'Shield Plus'),
        ('premium', 'Premium Shield'),
    ]
    
    ID_TYPE_CHOICES = [
        ('passport', 'Passport'),
        ('visa', 'Visa'),
        ('employment_pass', 'Employment Pass'),
        ('national_id', 'National ID'),
    ]
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    
    # Plan selection
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    
    # Personal information
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    phone_number = models.CharField(max_length=20)
    phone_country_code = models.CharField(max_length=5, default='+60')  # Malaysia default
    
    # Identification
    id_type = models.CharField(max_length=20, choices=ID_TYPE_CHOICES)
    id_number = models.CharField(max_length=255)  # Will be encrypted
    
    # Demographics
    nationality = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    
    # Address
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    postcode = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default='Malaysia')
    
    # Employment
    occupation = models.CharField(max_length=255)
    employer_name = models.CharField(max_length=255, blank=True)
    
    # Insurance details
    coverage_addons = models.JSONField(default=dict, blank=True)  # JSON of selected add-ons
    calculated_premium = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Beneficiary
    beneficiary_name = models.CharField(max_length=255, blank=True)
    beneficiary_relationship = models.CharField(max_length=100, blank=True)
    beneficiary_phone = models.CharField(max_length=20, blank=True)
    
    # Payment & Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    
    # Compliance
    pdpa_consent = models.BooleanField(default=False)  # IMPORTANT: Not pre-checked
    terms_accepted = models.BooleanField(default=False)
    data_retention_expiry = models.DateField(null=True, blank=True)  # 7 years from submission
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.CharField(max_length=45, blank=True)  # IPv4 or IPv6
    
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
