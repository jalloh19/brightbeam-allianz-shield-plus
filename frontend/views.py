"""
Frontend views for serving HTML templates.
"""

from django.shortcuts import render
from django.conf import settings
from django.utils import timezone
import json
from backend.applications.models import Application
from django.db.models import Q, Count
from datetime import timedelta


def index(request):
    """Home page - redirect to form."""
    return render(request, 'index.html')


def form_view(request):
    """Main 10-step form view."""
    context = {
        'UPLOADCARE_PUBLIC_KEY': settings.UPLOADCARE_PUBLIC_KEY,
    }
    return render(request, 'form.html', context)


import json
from backend.applications.models import Application
from django.db.models import Q, Count

def admin_dashboard_view(request):
    """Public admin dashboard (no login required by business request)."""
    # 1. KPI Counts
    total_apps = Application.objects.count()
    approved_count = Application.objects.filter(status__iexact='approved').count()
    rejected_count = Application.objects.filter(status__iexact='rejected').count()
    pending_count = Application.objects.filter(
        Q(status__iexact='submitted') | Q(status__iexact='under_review')
    ).count()

    # 2. Chart Data (Status Breakdown)
    status_rows = list(Application.objects.values('status').annotate(count=Count('id')))
    status_map = {str(row['status']).lower(): row['count'] for row in status_rows}

    # 3. Chart Data (Plan Distribution)
    plan_rows = list(Application.objects.values('plan').annotate(count=Count('id')))
    plan_map = {str(row['plan']).upper(): row['count'] for row in plan_rows}

    # 4. Chart Data (Applicant Type)
    app_type_rows = list(Application.objects.values('applicant_type').annotate(count=Count('id')))
    app_type_map = {str(row['applicant_type']).title(): row['count'] for row in app_type_rows}

    # 5. Trend Data (Last 30 days)
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=29)
    trend_rows = Application.objects.filter(
        created_at__date__gte=start_date
    ).values('created_at__date').annotate(count=Count('id')).order_by('created_at__date')
    
    trend_map = {str(row['created_at__date']): row['count'] for row in trend_rows}
    
    chart_data = {
        'total_applications': total_apps,
        'status_breakdown': status_map,
        'plan_distribution': plan_map,
        'applicant_distribution': app_type_map,
        'trend_data': trend_map,
    }

    context = {
        'total_apps': total_apps,
        'approved_count': approved_count,
        'rejected_count': rejected_count,
        'pending_count': pending_count,
        'chart_data_json': json.dumps(chart_data),
    }
    return render(request, 'dashboard.html', context)


def admin_applications_view(request):
    """Public applications listing page for operations team."""
    return render(request, 'admin/applications_list.html')


def admin_application_detail_view(request, application_id):
    """Public application detail page for operations team."""
    context = {
        'application_number': str(application_id),
    }
    return render(request, 'admin/application_detail.html', context)
