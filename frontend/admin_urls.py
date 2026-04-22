"""
URL configuration for public admin dashboard pages.
"""

from django.urls import path
from django.views.generic import RedirectView
from . import views

app_name = 'ops'

urlpatterns = [
    path('', views.admin_dashboard_view, name='dashboard'),
    path('applications/', views.admin_applications_view, name='applications'),
    path('applications/<uuid:application_id>/', views.admin_application_detail_view, name='application_detail'),
    path('login/', RedirectView.as_view(pattern_name='ops:dashboard', permanent=False), name='login'),
]
