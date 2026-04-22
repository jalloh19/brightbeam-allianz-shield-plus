"""
URL configuration for frontend views.
Serves the main application form and pages.
"""

from django.urls import path
from django.views.generic import RedirectView
from . import views

app_name = 'frontend'

urlpatterns = [
    path('', views.index, name='index'),
    path('form/', views.form_view, name='form'),
    path('forms/', RedirectView.as_view(pattern_name='frontend:form', permanent=False), name='forms'),
]
