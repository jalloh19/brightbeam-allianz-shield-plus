"""
Frontend views for serving HTML templates.
"""

from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings


def index(request):
    """Home page - redirect to form."""
    return render(request, 'index.html')


def form_view(request):
    """Main 7-step form view."""
    context = {
        'UPLOADCARE_PUBLIC_KEY': settings.UPLOADCARE_PUBLIC_KEY,
    }
    return render(request, 'form.html', context)
