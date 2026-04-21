"""
Django admin configuration for applications.
Registers models for the admin interface.
"""

from django.contrib import admin
from .models import Application, Beneficiary, AuditLog, PaymentRecord, NotificationLog


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'plan', 'status', 'calculated_premium', 'created_at')
    list_filter = ('plan', 'status', 'created_at')
    search_fields = ('full_name', 'email', 'phone_number')
    readonly_fields = ('id', 'created_at', 'updated_at', 'submitted_at')
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('full_name', 'email', 'phone_country_code', 'phone_number', 'id_type', 'id_number')
        }),
        ('Demographics', {
            'fields': ('date_of_birth', 'gender', 'nationality')
        }),
        ('Address', {
            'fields': ('address_line_1', 'address_line_2', 'city', 'postcode', 'country')
        }),
        ('Employment', {
            'fields': ('occupation', 'employer_name')
        }),
        ('Insurance', {
            'fields': ('plan', 'coverage_addons', 'calculated_premium')
        }),
        ('Beneficiary', {
            'fields': ('beneficiary_name', 'beneficiary_relationship', 'beneficiary_phone')
        }),
        ('Status & Compliance', {
            'fields': ('status', 'pdpa_consent', 'terms_accepted', 'data_retention_expiry')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at', 'submitted_at', 'ip_address'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Beneficiary)
class BeneficiaryAdmin(admin.ModelAdmin):
    list_display = ('name', 'relationship', 'application', 'is_primary')
    list_filter = ('is_primary', 'created_at')
    search_fields = ('name', 'application__full_name')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('application', 'action', 'field_name', 'user', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('application__full_name', 'user')
    readonly_fields = ('application', 'action', 'field_name', 'old_value', 'new_value', 'user', 'timestamp')


@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display = ('application', 'amount', 'currency', 'method', 'status', 'created_at')
    list_filter = ('status', 'method', 'created_at')
    search_fields = ('application__full_name', 'transaction_id')
    readonly_fields = ('application', 'created_at')


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('type', 'recipient', 'channel', 'status', 'sent_at')
    list_filter = ('type', 'status', 'channel', 'created_at')
    search_fields = ('recipient', 'application__full_name')
    readonly_fields = ('application', 'created_at')
