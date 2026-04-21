"""
API views for data endpoints and analytics.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework import status
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from backend.applications.models import Application


# Dropdown data endpoints (available to all)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_occupations(request):
    """
    Return list of common occupations for the occupation dropdown.
    """
    occupations = [
        'Engineer',
        'Doctor',
        'Lawyer',
        'Teacher',
        'Accountant',
        'Manager',
        'Developer',
        'Designer',
        'Analyst',
        'Consultant',
        'Administrative Staff',
        'Sales Representative',
        'Technician',
        'Other',
    ]
    return Response({'occupations': occupations}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_countries(request):
    """
    Return list of countries for the nationality/address dropdown.
    """
    countries = [
        'Malaysia',
        'Singapore',
        'Thailand',
        'Indonesia',
        'Philippines',
        'Vietnam',
        'Myanmar',
        'Brunei',
        'Cambodia',
        'Laos',
        'China',
        'India',
        'Japan',
        'South Korea',
        'United States',
        'United Kingdom',
        'Canada',
        'Australia',
        'Germany',
        'France',
        'Other',
    ]
    return Response({'countries': countries}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_id_types(request):
    """
    Return list of acceptable ID types for foreign applicants.
    """
    id_types = [
        {'value': 'passport', 'label': 'Passport'},
        {'value': 'visa', 'label': 'Visa'},
        {'value': 'employment_pass', 'label': 'Employment Pass'},
        {'value': 'national_id', 'label': 'National ID'},
    ]
    return Response({'id_types': id_types}, status=status.HTTP_200_OK)


# Admin analytics endpoints

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_analytics(request):
    """
    Return KPI metrics and statistics for admin dashboard.
    """
    total_apps = Application.objects.count()
    
    # Applications this week
    week_ago = timezone.now() - timedelta(days=7)
    week_apps = Application.objects.filter(created_at__gte=week_ago).count()
    
    # Status breakdown
    status_breakdown = Application.objects.values('status').annotate(count=Count('id'))
    
    # Average premium by plan
    plan_stats = Application.objects.values('plan').annotate(
        count=Count('id'),
        avg_premium=Count('calculated_premium'),
    )
    
    # Conversion rate (approved vs total)
    approved_count = Application.objects.filter(status='approved').count()
    conversion_rate = (approved_count / total_apps * 100) if total_apps > 0 else 0
    
    analytics_data = {
        'total_applications': total_apps,
        'applications_this_week': week_apps,
        'approved_applications': approved_count,
        'conversion_rate': round(conversion_rate, 2),
        'status_breakdown': list(status_breakdown),
        'plan_distribution': list(plan_stats),
    }
    
    return Response(analytics_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_dropoff_analysis(request):
    """
    Analyze form submission dropoff by step.
    Returns completion rates for each step to identify where users abandon the form.
    """
    # This endpoint tracks which step users drop off at
    # In a full implementation, you'd track step completion in the database
    # For now, returning a template structure
    
    dropoff_data = {
        'step_completion': [
            {'step': 1, 'name': 'Plan Selection', 'completed': 100, 'abandoned': 0},
            {'step': 2, 'name': 'Personal Info', 'completed': 95, 'abandoned': 5},
            {'step': 3, 'name': 'Contact & Address', 'completed': 90, 'abandoned': 5},
            {'step': 4, 'name': 'Coverage Add-ons', 'completed': 85, 'abandoned': 5},
            {'step': 5, 'name': 'Beneficiary', 'completed': 82, 'abandoned': 3},
            {'step': 6, 'name': 'Payment & Declaration', 'completed': 78, 'abandoned': 4},
            {'step': 7, 'name': 'Review & Submit', 'completed': 75, 'abandoned': 3},
        ],
        'total_dropoff_rate': 25,  # 25% don't complete
        'most_critical_step': 4,  # Coverage selection
    }
    
    return Response(dropoff_data, status=status.HTTP_200_OK)
