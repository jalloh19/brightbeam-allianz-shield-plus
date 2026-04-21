"""
Django app configuration for Applications (form submissions).
"""

from django.apps import AppConfig


class ApplicationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend.applications'
    verbose_name = 'Applications'
