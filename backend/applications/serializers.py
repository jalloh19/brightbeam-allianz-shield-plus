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
            
            # Applicant type & categorization
            'applicant_type',
            
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
            'passport_photo_url',
            'passport_photo_upload_date',
            'passport_photo_exif_date',
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
            
            # Worker-specific fields
            'worker_category',
            'monthly_salary',
            'employment_type',
            'work_permit_status',
            'work_permit_expiry_date',
            'employer_registration_number',
            'employer_sponsorship_approved',
            'years_of_experience',
            'professional_license_number',
            
            # Student status (conditional)
            'is_student',
            'university_name',
            'course_of_study',
            'field_of_study',
            'university_country',
            'expected_graduation',
            
            # Student-specific fields
            'study_sponsor_type',
            'study_level',
            'scholarship_name',
            'scholarship_award_amount',
            'financial_proof_type',
            'financial_proof_submitted',
            'intended_duration_months',
            'semester_start_date',
            'on_campus_residential',
            'employer_sponsoring_study',
            
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
            'calculated_premium',
            'total_annual_premium',
            'created_at',
            'updated_at',
            'submitted_at',
            'passport_photo_upload_date',
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
    
    def validate_applicant_type(self, value):
        """Validate applicant type is properly selected."""
        if not value:
            raise serializers.ValidationError("Applicant type (worker/student) must be specified.")
        return value
    
    def validate_worker_category(self, value):
        """Validate worker category when applicant is a worker."""
        if self.initial_data.get('applicant_type') == 'worker' and not value:
            raise serializers.ValidationError("Worker category must be specified for foreign workers.")
        return value
    
    def validate_monthly_salary(self, value):
        """Validate monthly salary is positive when provided."""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Monthly salary must be a positive amount.")
        return value
    
    def validate_employment_type(self, value):
        """Validate employment type when applicant is a worker."""
        if self.initial_data.get('applicant_type') == 'worker' and not value:
            raise serializers.ValidationError("Employment type must be specified for workers.")
        return value
    
    def validate_work_permit_status(self, value):
        """Validate work permit status for workers."""
        if self.initial_data.get('applicant_type') == 'worker' and not value:
            raise serializers.ValidationError("Work permit status must be specified.")
        return value
    
    def validate_work_permit_expiry_date(self, value):
        """Validate work permit expiry date."""
        if value is not None and value < timezone.now().date():
            raise serializers.ValidationError("Work permit expiry date cannot be in the past.")
        return value
    
    def validate_study_level(self, value):
        """Validate study level when applicant is a student."""
        if self.initial_data.get('is_student') and not value:
            raise serializers.ValidationError("Level of study must be specified for students.")
        return value
    
    def validate_study_sponsor_type(self, value):
        """Validate study sponsor type when applicant is a student."""
        if self.initial_data.get('is_student') and not value:
            raise serializers.ValidationError("Study sponsorship type must be specified for students.")
        return value
    
    def validate_scholarship_award_amount(self, value):
        """Validate scholarship amount is positive when provided."""
        if value is not None and value <= 0:
            raise serializers.ValidationError("Scholarship amount must be a positive value.")
        return value
    
    def validate_intended_duration_months(self, value):
        """Validate intended duration of study is reasonable."""
        if value is not None:
            if value < 1 or value > 84:  # Max 7 years
                raise serializers.ValidationError("Intended duration must be between 1 and 84 months.")
        return value
    
    def validate_years_of_experience(self, value):
        """Validate years of experience is non-negative."""
        if value is not None and value < 0:
            raise serializers.ValidationError("Years of experience cannot be negative.")
        return value
    
    def validate_passport_photo_url(self, value):
        """Validate passport photo URL is from Uploadcare CDN."""
        if not value:
            # Photo is optional during form filling, only required on submission
            return value
        
        # Check that URL is from Uploadcare CDN
        if not isinstance(value, str) or 'ucarecdn.com' not in value:
            raise serializers.ValidationError("Photo must be uploaded through Uploadcare service. Invalid URL provided.")
        
        # Basic URL format check
        if not value.startswith('http'):
            raise serializers.ValidationError("Invalid URL format for photo.")
        
        return value
    
    def create(self, validated_data):
        """Override create to set data retention expiry (7 years from now) and photo upload date."""
        # Public submissions must always start as submitted, regardless of client payload.
        validated_data['status'] = 'submitted'

        # Set photo upload date if photo URL is provided
        if validated_data.get('passport_photo_url') and not validated_data.get('passport_photo_upload_date'):
            validated_data['passport_photo_upload_date'] = timezone.now()
        
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

    def to_representation(self, instance):
        """Mask sensitive identifiers in API responses."""
        data = super().to_representation(instance)
        id_number = data.get('id_number')
        if id_number:
            data['id_number'] = f"****{id_number[-4:]}"
        return data


class ApplicationListSerializer(serializers.ModelSerializer):
    """Simplified serializer for application listings (admin dashboard)."""
    
    class Meta:
        model = Application
        fields = [
            'id',
            'full_name',
            'email',
            'plan',
            'applicant_type',
            'worker_category',
            'study_level',
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
