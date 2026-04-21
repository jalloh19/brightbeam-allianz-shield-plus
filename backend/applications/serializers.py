"""
Django REST Framework serializers for validation and JSON transformation.
"""

from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Application, Beneficiary, AuditLog, PaymentRecord, NotificationLog


class BeneficiarySerializer(serializers.ModelSerializer):
    """Serializer for insurance beneficiary data."""
    
    class Meta:
        model = Beneficiary
        fields = ['id', 'name', 'relationship', 'contact_number', 'is_primary']
        read_only_fields = ['id']


class PaymentRecordSerializer(serializers.ModelSerializer):
    """Serializer for payment tracking."""
    
    class Meta:
        model = PaymentRecord
        fields = ['id', 'amount', 'currency', 'method', 'status', 'transaction_id', 'completed_at']
        read_only_fields = ['id', 'created_at']


class NotificationLogSerializer(serializers.ModelSerializer):
    """Read-only serializer for notification audit trail."""
    
    class Meta:
        model = NotificationLog
        fields = ['id', 'type', 'recipient', 'channel', 'status', 'sent_at', 'created_at']
        read_only_fields = ['id', 'created_at', 'sent_at']


class ApplicationSerializer(serializers.ModelSerializer):
    """
    Main serializer for insurance application form submissions.
    Includes nested beneficiaries and payment data.
    """
    
    beneficiaries = BeneficiarySerializer(many=True, read_only=True)
    payment = PaymentRecordSerializer(read_only=True)
    notifications = NotificationLogSerializer(many=True, read_only=True)
    
    class Meta:
        model = Application
        fields = [
            # Core identifiers
            'id',
            'application_number',
            
            # Plan selection
            'plan',
            'coverage_addons',
            'calculated_premium',
            'total_annual_premium',
            
            # Personal information
            'full_name',
            'preferred_name',
            'email',
            'phone_country_code',
            'phone_number',
            'contact_preference',
            
            # Demographics
            'date_of_birth',
            'gender',
            'marital_status',
            
            # Nationality & residency
            'nationality',
            'country_of_residence',
            
            # Identification & Visa
            'id_type',
            'id_number',
            'id_expiry_date',
            'id_issuing_country',
            'visa_type',
            'visa_expiry_date',
            'visa_number',
            
            # Address
            'address_line_1',
            'address_line_2',
            'city',
            'state_province',
            'postcode',
            'country',
            
            # Occupation
            'occupation',
            'industry',
            'employer_name',
            'work_environment',
            
            # Student status (conditional)
            'is_student',
            'university_name',
            'course_of_study',
            'field_of_study',
            'university_country',
            'expected_graduation',
            
            # Beneficiary
            'beneficiary_name',
            'beneficiary_relationship',
            'beneficiary_phone',
            'secondary_beneficiary_name',
            'secondary_beneficiary_relationship',
            'beneficiaries',
            
            # Payment
            'preferred_payment_method',
            'payment',
            
            # Status & Compliance
            'status',
            'pdpa_consent',
            'pdpa_consent_timestamp',
            'terms_accepted',
            'terms_accepted_timestamp',
            'marketing_opt_in',
            'data_retention_expiry',
            
            # Metadata
            'created_at',
            'updated_at',
            'submitted_at',
            'ip_address',
            'last_reviewed_by',
            'review_notes',
            
            # Related
            'notifications',
        ]
        read_only_fields = [
            'id',
            'application_number',
            'status',
            'calculated_premium',
            'total_annual_premium',
            'created_at',
            'updated_at',
            'submitted_at',
            'beneficiaries',
            'payment',
            'notifications',
            'data_retention_expiry',
        ]
    
    def validate_email(self, value):
        """Ensure email is unique (excluding current instance)."""
        instance = self.instance
        if Application.objects.filter(email=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("An application with this email already exists.")
        return value
    
    def validate_date_of_birth(self, value):
        """Ensure applicant is at least 18 years old."""
        age = (timezone.now().date() - value).days / 365.25
        if age < 18:
            raise serializers.ValidationError("Applicant must be at least 18 years old.")
        return value
    
    def validate_postcode(self, value):
        """Validate Malaysia postcode format."""
        if not value.isdigit() or len(value) != 5:
            raise serializers.ValidationError("Malaysian postcode must be 5 digits.")
        return value
    
    def validate_pdpa_consent(self, value):
        """Ensure PDPA consent is explicitly given (NOT pre-checked)."""
        if not value:
            raise serializers.ValidationError("You must consent to data processing to proceed.")
        return value
    
    def create(self, validated_data):
        """Override create to set data retention expiry (7 years from now)."""
        instance = Application.objects.create(**validated_data)
        instance.data_retention_expiry = timezone.now().date() + timedelta(days=365*7)
        instance.save()
        
        # Log creation in audit trail
        AuditLog.objects.create(
            application=instance,
            action='created',
            user='system',
        )
        
        return instance


class ApplicationListSerializer(serializers.ModelSerializer):
    """Simplified serializer for application listings (admin dashboard)."""
    
    class Meta:
        model = Application
        fields = [
            'id',
            'full_name',
            'email',
            'plan',
            'status',
            'calculated_premium',
            'created_at',
            'submitted_at',
        ]
        read_only_fields = fields


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for audit trail (read-only, admin only)."""
    
    class Meta:
        model = AuditLog
        fields = [
            'id',
            'action',
            'field_name',
            'old_value',
            'new_value',
            'user',
            'timestamp',
        ]
        read_only_fields = fields
