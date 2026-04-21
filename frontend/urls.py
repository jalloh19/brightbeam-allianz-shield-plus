"""
URL configuration for frontend views.
Serves the main application form and pages.
"""

from django.urls import path
from . import views

app_name = 'frontend'

urlpatterns = [
    path('', views.index, name='index'),
    path('form/', views.form_view, name='form'),
]
