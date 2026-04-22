"""
Main URL configuration for Brightbeam project.
Routes all API endpoints and admin interface.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Public admin dashboard routes (no login).
    path('admin/', include('frontend.admin_urls')),
    # Keep Django admin available under a separate path.
    path('django-admin/', admin.site.urls),
    
    # API routes
    path('api/', include('backend.api.urls')),
    path('api/admin/applications/', include('backend.applications.urls')),
    path('api/applications/', include('backend.applications.urls')),
    
    # Frontend views
    path('', include('frontend.urls')),
]

# Serve static and media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
