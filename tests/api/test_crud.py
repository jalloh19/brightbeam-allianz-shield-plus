"""
API endpoint tests for Application CRUD operations and custom actions.
Tests all REST endpoints with various authentication and permission scenarios.
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from backend.applications.models import Application, AuditLog
from tests.factories import ApplicationFactory, UserFactory


pytestmark = [pytest.mark.api, pytest.mark.django_db]


# ============ APPLICATION CREATE TESTS ============

class TestApplicationCreate:
    """Test POST /api/applications/ endpoint."""
    
    def test_create_application_success(self, api_client, valid_application_data):
        """POST with valid data returns 201 Created."""
        response = api_client.post('/api/applications/', valid_application_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'id' in response.data
        assert 'application_number' in response.data
        assert response.data['status'] == 'submitted'
    
    def test_create_application_no_auth_required(self, api_client, valid_application_data):
        """POST /api/applications/ works without authentication."""
        response = api_client.post('/api/applications/', valid_application_data)
        
        assert response.status_code in [
            status.HTTP_201_CREATED, 
            status.HTTP_400_BAD_REQUEST  # May fail validation, but not auth
        ]
        assert response.status_code != status.HTTP_401_UNAUTHORIZED
    
    def test_create_application_missing_required_fields(self, api_client):
        """POST missing required fields returns 400."""
        incomplete_data = {
            'plan': 'plan_5',
            # Missing full_name, email, phone_number, etc.
        }
        response = api_client.post('/api/applications/', incomplete_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'errors' in response.data or any(
            field in response.data for field in ['full_name', 'email', 'phone_number']
        )
    
    def test_create_application_invalid_email(self, api_client):
        """POST with invalid email returns 400."""
        data = {
            'plan': 'plan_5',
            'full_name': 'Test User',
            'email': 'invalid@@example.com',
            'phone_number': '+60123456789',
            'date_of_birth': '1990-01-15',
            'id_type': 'passport',
            'id_number': 'A12345678',
            'address_line_1': '123 Test',
            'city': 'KL',
            'country': 'Malaysia',
        }
        response = api_client.post('/api/applications/', data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        # Should have email error
        assert 'email' in str(response.data).lower()
    
    def test_create_application_with_valid_photo_url(self, api_client, valid_application_data):
        """POST with valid Uploadcare photo URL stores it."""
        response = api_client.post('/api/applications/', valid_application_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['passport_photo_url'] == valid_application_data['passport_photo_url']
    
    def test_create_application_invalid_photo_url(self, api_client, valid_application_data):
        """POST with non-Uploadcare photo URL rejected."""
        valid_application_data['passport_photo_url'] = 'https://example.com/photo.jpg'
        response = api_client.post('/api/applications/', valid_application_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST


# ============ APPLICATION LIST TESTS ============

class TestApplicationList:
    """Test GET /api/applications/ endpoint."""
    
    def test_list_applications_requires_admin(self, api_client, db):
        """GET /api/applications/ requires admin authentication."""
        response = api_client.get('/api/applications/')
        
        # Unauthenticated should get 401 or 403
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN
        ]
    
    def test_list_applications_admin_success(self, authenticated_client, db):
        """Admin can list applications."""
        # Create some applications
        ApplicationFactory.create_batch(3)
        
        response = authenticated_client.get('/api/applications/')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data or isinstance(response.data, list)
    
    def test_list_applications_pagination(self, authenticated_client, db):
        """List endpoint respects page size."""
        ApplicationFactory.create_batch(25)
        
        response = authenticated_client.get('/api/applications/')
        
        assert response.status_code == status.HTTP_200_OK
        # Should have pagination
        if 'results' in response.data:
            assert len(response.data['results']) <= 20  # Default page size
    
    def test_list_applications_filter_by_status(self, authenticated_client, db):
        """Can filter applications by status."""
        ApplicationFactory.create_batch(2, status='submitted')
        ApplicationFactory.create_batch(1, status='approved')
        
        response = authenticated_client.get('/api/applications/?status=submitted')
        
        assert response.status_code == status.HTTP_200_OK
        # Should only return submitted applications
        apps = response.data.get('results', response.data)
        for app in apps:
            assert app['status'] == 'submitted'


# ============ APPLICATION DETAIL TESTS ============

class TestApplicationDetail:
    """Test GET /api/applications/{id}/ endpoint."""
    
    def test_get_application_success(self, api_client, db):
        """GET application by ID returns full details."""
        app = ApplicationFactory()
        
        response = api_client.get(f'/api/applications/{app.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == str(app.id)
        assert response.data['full_name'] == app.full_name
    
    def test_get_application_not_found(self, api_client):
        """GET with invalid ID returns 404."""
        response = api_client.get('/api/applications/99999/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_application_masks_id_in_response(self, api_client, db):
        """API response masks ID number."""
        app = ApplicationFactory(id_number='A12345678')
        
        response = api_client.get(f'/api/applications/{app.id}/')
        
        assert response.status_code == status.HTTP_200_OK
        # Full ID should not be in response
        assert app.id_number not in str(response.data)


# ============ APPLICATION UPDATE TESTS ============

class TestApplicationUpdate:
    """Test PUT /api/applications/{id}/ endpoint."""
    
    def test_update_application_requires_admin(self, api_client, db):
        """PUT requires admin authentication."""
        app = ApplicationFactory()
        
        response = api_client.put(
            f'/api/applications/{app.id}/',
            {'status': 'approved'}
        )
        
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN
        ]
    
    def test_update_application_admin_success(self, authenticated_client, db):
        """Admin can update application."""
        app = ApplicationFactory(status='submitted')
        
        response = authenticated_client.put(
            f'/api/applications/{app.id}/',
            {'status': 'under_review', 'full_name': app.full_name}
        )
        
        assert response.status_code == status.HTTP_200_OK
        
        # Verify in DB
        app.refresh_from_db()
        assert app.status == 'under_review'


# ============ APPLICATION DELETE TESTS ============

class TestApplicationDelete:
    """Test DELETE /api/applications/{id}/ endpoint."""
    
    def test_delete_application_requires_admin(self, api_client, db):
        """DELETE requires admin authentication."""
        app = ApplicationFactory()
        
        response = api_client.delete(f'/api/applications/{app.id}/')
        
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN
        ]
    
    def test_delete_application_admin_success(self, authenticated_client, db):
        """Admin can delete application."""
        app = ApplicationFactory()
        app_id = app.id
        
        response = authenticated_client.delete(f'/api/applications/{app_id}/')
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify deleted from DB
        assert not Application.objects.filter(id=app_id).exists()


# ============ PDF EXPORT ACTION TESTS ============

class TestPDFExportAction:
    """Test GET /api/applications/{id}/export-pdf/ endpoint."""
    
    def test_export_pdf_requires_admin(self, api_client, db):
        """PDF export requires admin authentication."""
        app = ApplicationFactory()
        
        response = api_client.get(f'/api/applications/{app.id}/export-pdf/')
        
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN
        ]
    
    def test_export_pdf_admin_success(self, authenticated_client, db):
        """Admin can export application as PDF."""
        app = ApplicationFactory()
        
        response = authenticated_client.get(f'/api/applications/{app.id}/export-pdf/')
        
        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/pdf'
    
    def test_export_pdf_content_disposition_header(self, authenticated_client, db):
        """PDF export has correct Content-Disposition header."""
        app = ApplicationFactory()
        
        response = authenticated_client.get(f'/api/applications/{app.id}/export-pdf/')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'Content-Disposition' in response
        
        # Check filename format
        content_disposition = response['Content-Disposition']
        assert 'ASP-' in content_disposition
        assert '.pdf' in content_disposition
    
    def test_export_pdf_creates_audit_log(self, authenticated_client, admin_user, db):
        """PDF export creates audit log entry."""
        app = ApplicationFactory()
        
        response = authenticated_client.get(f'/api/applications/{app.id}/export-pdf/')
        
        assert response.status_code == status.HTTP_200_OK
        
        # Check audit log
        audit_log = AuditLog.objects.filter(
            application=app,
            action='pdf_exported'
        ).first()
        
        assert audit_log is not None
        assert audit_log.user == admin_user.username
    
    def test_export_pdf_invalid_application_id(self, authenticated_client):
        """PDF export with invalid app ID returns 404."""
        response = authenticated_client.get('/api/applications/99999/export-pdf/')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


# ============ AUTHENTICATION TESTS ============

class TestAuthentication:
    """Test authentication and authorization."""
    
    def test_missing_token_returns_401(self, api_client, db):
        """Missing auth token returns 401 on protected endpoints."""
        app = ApplicationFactory()
        
        response = api_client.get(f'/api/applications/{app.id}/export-pdf/')
        
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN
        ]
    
    def test_invalid_token_returns_401(self, api_client, db):
        """Invalid token returns 401."""
        api_client.credentials(HTTP_AUTHORIZATION='Token invalid-token-123')
        app = ApplicationFactory()
        
        response = api_client.get(f'/api/applications/{app.id}/export-pdf/')
        
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN
        ]


# ============ EDGE CASE TESTS ============

class TestEdgeCases:
    """Test edge cases and error conditions."""
    
    def test_malformed_json_returns_400(self, api_client):
        """Malformed JSON returns 400."""
        response = api_client.post(
            '/api/applications/',
            'not-valid-json',
            content_type='application/json'
        )
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_very_long_string_in_field(self, api_client, valid_application_data):
        """Very long string in field handled gracefully."""
        valid_application_data['full_name'] = 'A' * 1000
        
        response = api_client.post('/api/applications/', valid_application_data)
        
        # Should either reject or truncate, not crash
        assert response.status_code in [
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST
        ]
    
    def test_null_in_required_field_returns_400(self, api_client):
        """Null in required field returns 400."""
        data = {
            'plan': 'plan_5',
            'full_name': None,  # Required field
            'email': 'test@example.com',
        }
        
        response = api_client.post('/api/applications/', data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_invalid_enum_choice_returns_400(self, api_client, valid_application_data):
        """Invalid enum choice returns 400."""
        valid_application_data['plan'] = 'invalid_plan'
        
        response = api_client.post('/api/applications/', valid_application_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
