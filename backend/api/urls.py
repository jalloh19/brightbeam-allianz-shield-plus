"""
URL configuration for API endpoints.
"""

from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    # Data endpoints (dropdown data)
    path('data/occupations/', views.get_occupations, name='occupations'),
    path('data/countries/', views.get_countries, name='countries'),
    path('data/id-types/', views.get_id_types, name='id_types'),
    
    # Analytics endpoints (admin only)
    path('admin/dashboard-stats/', views.get_analytics, name='get_analytics'),
    path('admin/analytics/dropoff/', views.get_dropoff_analysis, name='dropoff_analysis'),
]
