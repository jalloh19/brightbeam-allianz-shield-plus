"""
Django app configuration for API (data endpoints and analytics).
"""

from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.api'
    verbose_name = 'API'
