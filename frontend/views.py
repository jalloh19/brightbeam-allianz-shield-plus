"""
Frontend views for serving HTML templates.
"""

from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    """Home page - redirect to form."""
    return render(request, 'index.html')


def form_view(request):
    """Main 7-step form view."""
    return render(request, 'form.html')
