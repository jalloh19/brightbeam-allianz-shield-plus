"""
Django REST Framework viewsets and views for applications API.
"""

import logging

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q
from .models import Application, AuditLog, PaymentRecord, Beneficiary, NotificationLog
from .serializers import ApplicationSerializer, ApplicationListSerializer, AuditLogSerializer
from backend.utils.email_service import get_email_service

logger = logging.getLogger(__name__)


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
        Authentication is intentionally disabled for this deployment.
        """
        permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        """
        Handle form submission (POST /api/applications/).
        Records submission timestamp and IP address.
        Sends confirmation email to applicant.
        """
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError:
            # Railway edge logs often omit response bodies; log validation details server-side.
            payload = getattr(request, "data", None)
            if isinstance(payload, dict):
                payload_summary = {"type": "dict", "keys": sorted(payload.keys())}
            elif isinstance(payload, list):
                payload_summary = {"type": "list", "length": len(payload)}
            else:
                payload_summary = {"type": type(payload).__name__}

            logger.warning(
                "Application submission rejected (400). ip=%s payload=%s errors=%s",
                self.get_client_ip(request),
                payload_summary,
                serializer.errors,
            )
            raise
        
        application = serializer.save(
            ip_address=self.get_client_ip(request),
            submitted_at=timezone.now(),
        )
        
        # Create audit log entry
        AuditLog.objects.create(
            application=application,
            action='created',
            user=self._get_actor_name(request),
            ip_address=self.get_client_ip(request),
        )
        
        # Send confirmation email
        self._send_email_notification(
            application=application,
            notification_type='confirmation',
            subject='Your Application Has Been Received',
            send_callable=lambda service: service.send_confirmation_email(
                recipient=application.email,
                full_name=application.full_name,
                application_number=application.application_number,
            ),
            success_message='Confirmation email sent successfully',
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Allow admin updates with partial payloads via PUT for dashboard flows."""
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
    
    def list(self, request, *args, **kwargs):
        """
        List all applications.
        Supports filtering, searching, and safe ordering.
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
                Q(full_name__icontains=search) |
                Q(email__icontains=search)
            )

        # Filter by plan/applicant type (used by admin UI)
        plan = request.query_params.get('plan')
        if plan:
            queryset = queryset.filter(plan=plan)

        applicant_type = request.query_params.get('applicant_type')
        if applicant_type:
            queryset = queryset.filter(applicant_type=applicant_type)

        # Filter by created date range if provided (YYYY-MM-DD)
        date_from = request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        # Safe ordering whitelist to prevent FieldError from bad query params
        allowed_ordering = {
            'submitted_at', '-submitted_at',
            'created_at', '-created_at',
            'full_name', '-full_name',
            'status', '-status',
            'calculated_premium', '-calculated_premium',
        }
        ordering = request.query_params.get('ordering')
        if ordering in allowed_ordering:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-submitted_at', '-created_at')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def approve(self, request, id=None):
        """
        Approve an application (admin only).
        Updates status, logs the action, and sends approval email.
        """
        application = self.get_object()
        if application.status == 'approved':
            return Response(
                {'detail': 'This application is already approved.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if application.status == 'rejected':
            return Response(
                {'detail': 'Rejected applications cannot be approved without reopening.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        application.status = 'approved'
        application.save()
        
        # Log approval
        AuditLog.objects.create(
            application=application,
            action='approved',
            user=self._get_actor_name(request),
            ip_address=self.get_client_ip(request),
        )
        
        # Send approval email
        self._send_email_notification(
            application=application,
            notification_type='approved',
            subject='Your Application Has Been Approved',
            send_callable=lambda service: service.send_approval_email(
                recipient=application.email,
                full_name=application.full_name,
                application_number=application.application_number,
                premium=float(application.calculated_premium or 0),
            ),
            success_message='Approval email sent successfully',
        )
        
        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def reject(self, request, id=None):
        """
        Reject an application (admin only).
        Requires rejection reason in request body.
        Sends rejection notification email.
        """
        application = self.get_object()
        if application.status == 'rejected':
            return Response(
                {'detail': 'This application is already rejected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if application.status == 'approved':
            return Response(
                {'detail': 'Approved applications cannot be rejected without reopening.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = (request.data.get('reason') or '').strip()
        if not reason:
            return Response(
                {'reason': 'Please provide a rejection reason so the applicant understands what to fix.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        application.status = 'rejected'
        application.save()
        
        # Log rejection
        AuditLog.objects.create(
            application=application,
            action='rejected',
            field_name='reason',
            new_value=reason,
            user=self._get_actor_name(request),
            ip_address=self.get_client_ip(request),
        )
        
        # Send rejection email
        self._send_email_notification(
            application=application,
            notification_type='rejected',
            subject='Your Application Status',
            send_callable=lambda service: service.send_rejection_email(
                recipient=application.email,
                full_name=application.full_name,
                application_number=application.application_number,
                reason=reason,
            ),
            success_message=reason,
        )
        
        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def audit_trail(self, request, id=None):
        """
        Get complete audit trail for an application (admin only).
        """
        application = self.get_object()
        audit_logs = application.audit_logs.all()
        serializer = AuditLogSerializer(audit_logs, many=True)
        return Response(serializer.data)
    
    @action(
        detail=True,
        methods=['get'],
        permission_classes=[permissions.AllowAny],
        url_path='export-pdf',
        url_name='export-pdf',
    )
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

    def _get_actor_name(self, request):
        if getattr(request, 'user', None) and request.user.is_authenticated:
            return request.user.get_username() or 'authenticated-user'
        return 'anonymous'

    def _send_email_notification(self, application, notification_type, subject, send_callable, success_message):
        """Best-effort email send with normalized notification logging."""
        try:
            email_service = get_email_service()
            result = send_callable(email_service) or {}
            success = bool(result.get('success'))
            NotificationLog.objects.create(
                application=application,
                type=notification_type,
                recipient=application.email,
                channel='email',
                subject=subject,
                status='sent' if success else 'failed',
                message=success_message if success else result.get('error', 'Notification service returned an error'),
                error_message='' if success else result.get('error', 'Notification service returned an error'),
            )
        except Exception as exc:
            logger.exception(
                "Failed to send %s email for application %s",
                notification_type,
                application.id,
            )
            NotificationLog.objects.create(
                application=application,
                type=notification_type,
                recipient=application.email,
                channel='email',
                subject=subject,
                status='failed',
                error_message=str(exc),
            )

