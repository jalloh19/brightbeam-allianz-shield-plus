"""
WSGI config for Brightbeam Allianz Shield Plus project.
Exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.config.settings')

application = get_wsgi_application()
