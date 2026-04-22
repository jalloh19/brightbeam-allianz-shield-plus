import pytest
from django.urls import reverse
from rest_framework import status
from tests.factories import ApplicationFactory

@pytest.mark.django_db
class TestAdminDashboard:
    def test_list_applications_admin_success(self, authenticated_client):
        ApplicationFactory.create_batch(5)
        url = reverse('application-list')
        
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 5

    def test_list_applications_unauthorized(self, api_client):
        url = reverse('application-list')
        
        response = api_client.get(url)
        
        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)

    def test_approve_application_success(self, authenticated_client):
        app = ApplicationFactory(status='submitted')
        url = reverse('application-approve', kwargs={'id': app.id})
        
        response = authenticated_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        app.refresh_from_db()
        assert app.status == 'approved'

    def test_reject_application_success(self, authenticated_client):
        app = ApplicationFactory(status='submitted')
        url = reverse('application-reject', kwargs={'id': app.id})
        data = {'reason': 'Invalid ID document'}
        
        response = authenticated_client.post(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        app.refresh_from_db()
        assert app.status == 'rejected'

    def test_get_analytics_admin_success(self, authenticated_client):
        ApplicationFactory.create_batch(3, status='approved')
        ApplicationFactory.create_batch(2, status='rejected')
        url = reverse('api:analytics')  # Added api: namespace
        
        response = authenticated_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['total_applications'] == 5
        assert response.data['approved_applications'] == 3
