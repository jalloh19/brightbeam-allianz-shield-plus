"""
Frontend views for serving HTML templates.
"""

from django.shortcuts import render
from django.conf import settings


def index(request):
    """Home page - redirect to form."""
    return render(request, 'index.html')


def form_view(request):
    """Main 10-step form view."""
    context = {
        'UPLOADCARE_PUBLIC_KEY': settings.UPLOADCARE_PUBLIC_KEY,
    }
    return render(request, 'form.html', context)


def admin_dashboard_view(request):
    """Public admin dashboard (no login required by business request)."""
    return render(request, 'dashboard.html')


def admin_applications_view(request):
    """Public applications listing page for operations team."""
    return render(request, 'admin/applications_list.html')


def admin_application_detail_view(request, application_id):
    """Public application detail page for operations team."""
    context = {
        'application_number': str(application_id),
    }
    return render(request, 'admin/application_detail.html', context)
