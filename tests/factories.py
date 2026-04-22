"""
Factory definitions for creating test data for Allianz Shield Plus.
Uses factory-boy and faker to generate realistic test data.
"""

import factory
from factory.django import DjangoModelFactory
from faker import Faker
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date, timedelta
from backend.applications.models import Application, Beneficiary, AuditLog

fake = Faker()


class UserFactory(DjangoModelFactory):
    """Factory for creating test users."""
    
    class Meta:
        model = User
    
    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.Sequence(lambda n: f'user{n}@example.com')
    first_name = factory.LazyAttribute(lambda _: fake.first_name())
    last_name = factory.LazyAttribute(lambda _: fake.last_name())
    is_staff = False
    is_superuser = False
    is_active = True
    
    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        """Set the password after user creation."""
        if create:
            obj.set_password(extracted or 'testpass123')
            obj.save()


class ApplicationFactory(DjangoModelFactory):
    """Factory for creating test applications."""
    
    class Meta:
        model = Application
    
    # Identifiers
    full_name = factory.LazyAttribute(lambda _: fake.name())
    preferred_name = factory.LazyAttribute(lambda obj: obj.full_name.split()[0])
    email = factory.Sequence(lambda n: f"applicant{n}@example.com")
    
    # Contact Info
    phone_country_code = '+60'
    phone_number = factory.LazyAttribute(lambda _: fake.numerify(text='1########'))
    contact_preference = 'email'
    
    # Demographics
    date_of_birth = factory.LazyFunction(
        lambda: date.today() - timedelta(days=365*30)  # 30 years old
    )
    gender = 'M'
    marital_status = 'single'
    
    # Nationality & Residency
    nationality = 'Malaysia'
    country_of_residence = 'Malaysia'
    
    # Identification
    id_type = 'passport'
    id_number = factory.LazyAttribute(lambda _: fake.bothify(text='??######'))
    id_expiry_date = factory.LazyAttribute(
        lambda _: date.today() + timedelta(days=365*5)
    )
    id_issuing_country = 'Malaysia'
    
    # Passport Photo
    passport_photo_url = 'https://ucarecdn.com/test-photo-uuid/'
    passport_photo_upload_date = factory.LazyFunction(timezone.now)
    passport_photo_exif_date = factory.LazyFunction(lambda: date.today())
    
    # Visa (if applicable)
    visa_type = 'work'
    visa_expiry_date = factory.LazyAttribute(
        lambda _: date.today() + timedelta(days=365)
    )
    visa_number = factory.LazyAttribute(lambda _: fake.bothify(text='VZ-########'))
    
    # Address
    address_line_1 = factory.LazyAttribute(lambda _: fake.street_address())
    address_line_2 = factory.LazyAttribute(lambda _: fake.secondary_address())
    city = factory.LazyAttribute(lambda _: fake.city())
    state_province = 'FT'
    postcode = factory.LazyAttribute(lambda _: fake.postcode())
    country = 'Malaysia'
    
    # Employment/Category
    applicant_type = 'worker'
    worker_category = 'category_2'
    employment_type = 'permanent'
    occupation = factory.LazyAttribute(lambda _: fake.job())
    work_permit_status = 'valid'
    
    # Plan & Coverage
    plan = 'plan_5'
    coverage_addons = []
    calculated_premium = 360000.00
    total_annual_premium = 360000.00
    
    # Consent & Terms
    pdpa_consent = True
    terms_accepted = True
    
    # Student-specific
    expected_graduation = factory.LazyAttribute(
        lambda _: date.today() + timedelta(days=730)
    )
    
    # Status
    status = 'submitted'
    created_at = factory.LazyFunction(timezone.now)
    updated_at = factory.LazyFunction(timezone.now)
    submitted_at = factory.LazyFunction(timezone.now)


class BeneficiaryFactory(DjangoModelFactory):
    """Factory for creating beneficiary records."""
    
    class Meta:
        model = Beneficiary
    
    application = factory.SubFactory(ApplicationFactory)
    name = factory.LazyAttribute(lambda _: fake.name())
    relationship = factory.LazyAttribute(
        lambda _: fake.random_element(['Spouse', 'Child', 'Parent', 'Sibling'])
    )
    contact_number = factory.LazyAttribute(lambda _: fake.phone_number())
    is_primary = True


class AuditLogFactory(DjangoModelFactory):
    """Factory for creating audit log entries."""
    
    class Meta:
        model = AuditLog
    
    application = factory.SubFactory(ApplicationFactory)
    action = 'created'
    user = factory.LazyAttribute(lambda _: fake.user_name())
    ip_address = factory.LazyAttribute(lambda _: fake.ipv4())
    details = {}
    created_at = factory.LazyFunction(timezone.now)
