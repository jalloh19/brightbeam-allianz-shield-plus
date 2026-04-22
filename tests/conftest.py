"""
Pytest configuration and fixtures for Allianz Shield Plus tests.
Provides reusable fixtures for API client, users, auth tokens, and test data.
"""

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from backend.applications.models import Application, AuditLog
from tests.factories import ApplicationFactory, UserFactory


# ============ API CLIENT FIXTURES ============

@pytest.fixture
def api_client():
    """Unauthenticated API client."""
    return APIClient()


@pytest.fixture
def authenticated_client(admin_user):
    """API client authenticated as admin."""
    token, _ = Token.objects.get_or_create(user=admin_user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return client


@pytest.fixture
def user_client(user):
    """API client authenticated as regular user."""
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
    return client


# ============ USER FIXTURES ============

@pytest.fixture
def user(db):
    """Regular (non-admin) user."""
    return UserFactory(is_staff=False, is_superuser=False)


@pytest.fixture
def admin_user(db):
    """Admin user with superuser privileges."""
    return UserFactory(is_staff=True, is_superuser=True)


@pytest.fixture
def auth_token(admin_user):
    """Token for admin user."""
    token, _ = Token.objects.get_or_create(user=admin_user)
    return token.key


# ============ APPLICATION FIXTURES ============

@pytest.fixture
def sample_application(db):
    """Create a sample application for testing."""
    from datetime import date
    return ApplicationFactory(
        status='submitted',
        plan='plan_5',
        full_name='John Doe',
        preferred_name='John',
        email='john@example.com',
        phone_number='+60123456789',
        date_of_birth=date(1990, 1, 15),
        id_number='123456-01-1234',
        passport_photo_url='https://ucarecdn.com/test-photo-uuid/'
    )


@pytest.fixture
def sample_application_with_photo(db):
    """Application with all required photo fields."""
    from datetime import date, timedelta
    from django.utils import timezone
    
    return ApplicationFactory(
        status='submitted',
        passport_photo_url='https://ucarecdn.com/test-photo-uuid/',
        passport_photo_upload_date=timezone.now(),
        passport_photo_exif_date=date.today() - timedelta(days=30)  # 30 days old
    )


@pytest.fixture
def draft_application(db):
    """Application in draft status."""
    return ApplicationFactory(status='draft')


@pytest.fixture
def approved_application(db):
    """Application in approved status."""
    return ApplicationFactory(status='approved')


@pytest.fixture
def rejected_application(db):
    """Application in rejected status."""
    return ApplicationFactory(status='rejected')


# ============ VALID/INVALID DATA FIXTURES ============

@pytest.fixture
def valid_application_data():
    """Valid application submission data."""
    return {
        'plan': 'plan_5',
        'applicant_type': 'worker',
        'full_name': 'Test Applicant',
        'preferred_name': 'Test',
        'email': 'test@example.com',
        'phone_country_code': '+60',
        'phone_number': '123456789',
        'date_of_birth': '1990-01-15',
        'gender': 'M',
        'marital_status': 'single',
        'nationality': 'Malaysia',
        'country_of_residence': 'Malaysia',
        'id_type': 'passport',
        'id_number': 'A12345678',
        'address_line_1': '123 Test Street',
        'city': 'Kuala Lumpur',
        'state_province': 'FT',
        'postcode': '50000',
        'country': 'Malaysia',
        'occupation': 'Engineer',
        'worker_category': 'category_2',
        'employment_type': 'permanent',
        'work_permit_status': 'valid',
        'contact_preference': 'email',
        'passport_photo_url': 'https://ucarecdn.com/test-photo-uuid/',
        'pdpa_consent': True,
        'terms_accepted': True,
    }


@pytest.fixture
def invalid_application_data_missing_required():
    """Application data missing required fields."""
    return {
        'plan': 'plan_5',
        # Missing full_name, email, phone_number, etc.
    }


@pytest.fixture
def invalid_application_data_bad_email():
    """Application data with invalid email."""
    return {
        'plan': 'plan_5',
        'full_name': 'Test User',
        'email': 'invalid@@example.com',  # Double @
        'phone_number': '+60123456789',
        'date_of_birth': '1990-01-15',
        'id_type': 'passport',
        'id_number': 'A12345678',
        'address_line_1': '123 Test St',
        'city': 'KL',
        'country': 'Malaysia',
    }


@pytest.fixture
def invalid_photo_url_non_uploadcare():
    """Photo URL not from Uploadcare."""
    return {
        'passport_photo_url': 'https://example.com/fake-photo.jpg',
    }


# ============ PDF/AUDIT FIXTURES ============

@pytest.fixture
def audit_log_entry(db, sample_application, admin_user):
    """Create an audit log entry."""
    return AuditLog.objects.create(
        application=sample_application,
        action='pdf_exported',
        user=admin_user.username,
        ip_address='127.0.0.1',
        details={'filename': 'ASP-20240422.pdf'}
    )


def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "api: marks tests as API endpoint tests"
    )
    config.addinivalue_line(
        "markers", "security: marks tests as security tests"
    )
