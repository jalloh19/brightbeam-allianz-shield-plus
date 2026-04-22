"""
Django REST Framework viewsets and views for applications API.
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Application, AuditLog, PaymentRecord, Beneficiary, NotificationLog
from .serializers import ApplicationSerializer, ApplicationListSerializer, AuditLogSerializer


class ApplicationPagination(PageNumberPagination):
    """Custom pagination for application listings."""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    API ViewSet for insurance applications.
    Provides CRUD operations and custom actions for form submissions.
    
    Endpoints:
    - POST /api/applications/          # Submit new application
    - GET /api/applications/           # List all (admin only, paginated)
    - GET /api/applications/{id}/      # Retrieve single application
    - PUT /api/applications/{id}/      # Update application (admin)
    - DELETE /api/applications/{id}/   # Delete application (admin only)
    - POST /api/applications/{id}/approve/   # Approve (admin only)
    - POST /api/applications/{id}/reject/    # Reject (admin only)
    """
    
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    pagination_class = ApplicationPagination
    lookup_field = 'id'
    
    def get_serializer_class(self):
        """Use simplified serializer for list views."""
        if self.action == 'list':
            return ApplicationListSerializer
        return ApplicationSerializer
    
    def get_permissions(self):
        """
        Override permissions based on action.
        - CREATE: Allow any (anonymous users can submit)
        - LIST, UPDATE, DELETE, APPROVE, REJECT: Admin only
        """
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        """
        Handle form submission (POST /api/applications/).
        Records submission timestamp and IP address.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        application = serializer.save(
            ip_address=self.get_client_ip(request),
            submitted_at=timezone.now(),
        )
        
        # Create audit log entry
        AuditLog.objects.create(
            application=application,
            action='created',
            user='anonymous' if request.user.is_anonymous else request.user.username,
            ip_address=self.get_client_ip(request),
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        """
        List all applications (admin only).
        Supports filtering and searching.
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Search by name or email if provided
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(full_name__icontains=search) | 
                models.Q(email__icontains=search)
            )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, id=None):
        """
        Approve an application (admin only).
        Updates status and logs the action.
        """
        application = self.get_object()
        application.status = 'approved'
        application.save()
        
        # Log approval
        AuditLog.objects.create(
            application=application,
            action='approved',
            user=request.user.username,
            ip_address=self.get_client_ip(request),
        )
        
        # Create approval notification
        NotificationLog.objects.create(
            application=application,
            type='approved',
            recipient=application.email,
            channel='email',
            subject='Your Application Has Been Approved',
            status='pending',
        )
        
        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, id=None):
        """
        Reject an application (admin only).
        Requires rejection reason in request body.
        """
        application = self.get_object()
        reason = request.data.get('reason', 'No reason provided')
        
        application.status = 'rejected'
        application.save()
        
        # Log rejection
        AuditLog.objects.create(
            application=application,
            action='rejected',
            field_name='reason',
            new_value=reason,
            user=request.user.username,
            ip_address=self.get_client_ip(request),
        )
        
        # Create rejection notification
        NotificationLog.objects.create(
            application=application,
            type='rejected',
            recipient=application.email,
            channel='email',
            subject='Your Application Status',
            message=f'Unfortunately, your application was not approved. Reason: {reason}',
            status='pending',
        )
        
        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def audit_trail(self, request, id=None):
        """
        Get complete audit trail for an application (admin only).
        """
        application = self.get_object()
        audit_logs = application.audit_logs.all()
        serializer = AuditLogSerializer(audit_logs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def export_pdf(self, request, id=None):
        """
        Export application as PDF document (admin only).
        Returns PDF file with all application details.
        """
        from django.http import FileResponse
        from backend.services import ApplicationPDFGenerator
        
        application = self.get_object()
        
        # Generate PDF
        pdf_generator = ApplicationPDFGenerator(application)
        pdf_bytes = pdf_generator.generate_pdf()
        
        # Log PDF export in audit trail
        AuditLog.objects.create(
            application=application,
            action='pdf_exported',
            user=request.user.username,
            ip_address=self.get_client_ip(request),
        )
        
        # Return PDF file
        filename = f"ASP-{application.application_number}-{timezone.now().strftime('%Y%m%d')}.pdf"
        
        response = FileResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
    
    def get_client_ip(self, request):
        """Extract client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# Import models for queries in list view
from django.db import models
