import pytest
from django.urls import reverse
from rest_framework import status
from backend.applications.models import Application, AuditLog

@pytest.mark.django_db
class TestApplicationAPI:
    def test_create_application_success(self, api_client):
        url = reverse('application-list')  # Usually 'application-list' for ViewSet
        data = {
            "applicant_type": "worker",
            "plan": "plan_6",
            "full_name": "John Doe",
            "email": "john@example.com",
            "phone_number": "123456789",
            "date_of_birth": "1990-01-01",
            "gender": "M",
            "nationality": "Malaysian",
            "id_type": "passport",
            "id_number": "A1234567",
            "address_line_1": "123 Street",
            "city": "Kuala Lumpur",
            "postcode": "50000",
            "occupation": "Engineer",
            "worker_category": "category_2",
            "employment_type": "permanent",
            "work_permit_status": "valid",
            "pdpa_consent": True,
            "terms_accepted": True
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Application.objects.count() == 1
        assert Application.objects.first().email == "john@example.com"
        
        # Verify Audit Log
        assert AuditLog.objects.filter(application__email="john@example.com", action='created').exists()

    def test_create_application_invalid_email(self, api_client):
        url = reverse('application-list')
        data = {
            "email": "not-an-email",
            "full_name": "John Doe"
            # Missing other required fields
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_create_application_missing_pdpa(self, api_client):
        url = reverse('application-list')
        data = {
            "applicant_type": "worker",
            "plan": "plan_6",
            "full_name": "John Doe",
            "email": "john2@example.com",
            "phone_number": "123456789",
            "date_of_birth": "1990-01-01",
            "gender": "M",
            "nationality": "Malaysian",
            "id_type": "passport",
            "id_number": "A1234567",
            "address_line_1": "123 Street",
            "city": "Kuala Lumpur",
            "postcode": "50000",
            "occupation": "Engineer",
            "worker_category": "category_2",
            "employment_type": "permanent",
            "work_permit_status": "valid",
            "pdpa_consent": False,  # MUST BE TRUE
            "terms_accepted": True
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "pdpa_consent" in response.data
