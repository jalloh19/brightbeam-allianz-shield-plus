"""
PDF Generator Service for Allianz Shield Plus
Generates professional PDF exports of insurance applications for admin review
"""

from io import BytesIO
from datetime import datetime, timedelta
from django.utils import timezone
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT


class ApplicationPDFGenerator:
    """
    Generates professional PDF documents for insurance applications.
    Includes applicant summary, all form data, and approval status.
    """
    
    # Allianz brand colors
    ALLIANZ_BLUE = HexColor('#0051BA')
    ALLIANZ_DARK_BLUE = HexColor('#003DA5')
    ALLIANZ_ACCENT = HexColor('#F59E0B')
    LIGHT_GRAY = HexColor('#F3F4F6')
    MEDIUM_GRAY = HexColor('#D1D5DB')
    DARK_TEXT = HexColor('#1F2937')
    
    # Page setup
    PAGE_SIZE = A4
    PAGE_WIDTH, PAGE_HEIGHT = PAGE_SIZE
    MARGIN = 0.5 * inch
    
    def __init__(self, application):
        """
        Initialize PDF generator with application instance
        
        Args:
            application: Application model instance
        """
        self.application = application
        self.buffer = BytesIO()
        self.styles = self._get_styles()
        self.elements = []
        
    def generate_pdf(self):
        """
        Generate PDF and return bytes
        
        Returns:
            BytesIO: PDF content as bytes
        """
        self._build_document()
        return self.buffer
    
    def _get_styles(self):
        """Create custom paragraph styles for PDF"""
        styles = getSampleStyleSheet()
        
        # Custom title style
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=self.ALLIANZ_BLUE,
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Section heading style
        styles.add(ParagraphStyle(
            name='SectionHeading',
            parent=styles['Heading2'],
            fontSize=13,
            textColor=white,
            backColor=self.ALLIANZ_BLUE,
            spaceAfter=10,
            spaceBefore=10,
            leftIndent=10,
            rightIndent=10,
            fontName='Helvetica-Bold'
        ))
        
        # Normal text style
        styles.add(ParagraphStyle(
            name='CustomBody',
            parent=styles['Normal'],
            fontSize=9,
            textColor=self.DARK_TEXT,
            alignment=TA_LEFT
        ))
        
        return styles
    
    def _build_document(self):
        """Build complete PDF document structure"""
        # Header
        self._add_header()
        self.elements.append(Spacer(1, 0.3 * inch))
        
        # Application Summary
        self._add_summary_section()
        self.elements.append(Spacer(1, 0.2 * inch))
        
        # Personal Information
        self._add_personal_section()
        self.elements.append(Spacer(1, 0.2 * inch))
        
        # Contact Information
        self._add_contact_section()
        self.elements.append(Spacer(1, 0.2 * inch))
        
        # Category-Specific Section
        if self.application.applicant_type == 'worker':
            self._add_worker_section()
        elif self.application.applicant_type == 'student':
            self._add_student_section()
        
        self.elements.append(Spacer(1, 0.2 * inch))
        
        # Coverage & Insurance
        self._add_coverage_section()
        self.elements.append(Spacer(1, 0.2 * inch))
        
        # Approval Status
        self._add_approval_section()
        self.elements.append(Spacer(1, 0.3 * inch))
        
        # Footer
        self._add_footer()
        
        # Build PDF
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=self.PAGE_SIZE,
            rightMargin=self.MARGIN,
            leftMargin=self.MARGIN,
            topMargin=self.MARGIN,
            bottomMargin=self.MARGIN
        )
        doc.build(self.elements)
        self.buffer.seek(0)
    
    def _add_header(self):
        """Add document header with Allianz branding"""
        # Title
        title = Paragraph(
            "ALLIANZ SHIELD PLUS",
            self.styles['CustomTitle']
        )
        self.elements.append(title)
        
        # Application Reference
        app_ref = Paragraph(
            f"<b>Application Reference:</b> {self.application.application_number}",
            self.styles['CustomBody']
        )
        self.elements.append(app_ref)
        
        # Generated Date
        gen_date = Paragraph(
            f"<b>Generated:</b> {timezone.now().strftime('%B %d, %Y at %H:%M:%S')}",
            self.styles['CustomBody']
        )
        self.elements.append(gen_date)
    
    def _add_summary_section(self):
        """Add applicant summary section"""
        # Section heading
        self.elements.append(Paragraph("APPLICATION SUMMARY", self.styles['SectionHeading']))
        
        # Summary data
        summary_data = [
            ['Applicant Name', self.application.full_name],
            ['Application Type', self.application.get_applicant_type_display()],
            ['Insurance Plan', self.application.get_plan_display()],
            ['Annual Premium', f"RM {self.application.total_annual_premium:,.2f}"],
            ['Application Status', self.application.get_status_display()],
            ['Submission Date', self.application.submitted_at.strftime('%B %d, %Y') if self.application.submitted_at else 'Not submitted'],
        ]
        
        # Create table
        summary_table = Table(summary_data, colWidths=[2.5*inch, 3.5*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), self.LIGHT_GRAY),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.DARK_TEXT),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, self.MEDIUM_GRAY),
        ]))
        
        self.elements.append(summary_table)
    
    def _add_personal_section(self):
        """Add personal information section"""
        self.elements.append(Paragraph("PERSONAL INFORMATION", self.styles['SectionHeading']))
        
        personal_data = [
            ['Full Name', self.application.full_name],
            ['Preferred Name', self.application.preferred_name or 'N/A'],
            ['Email', self.application.email],
            ['Phone', f"{self.application.phone_country_code} {self.application.phone_number}"],
            ['Date of Birth', self.application.date_of_birth.strftime('%B %d, %Y')],
            ['Gender', self.application.get_gender_display()],
            ['Nationality', self.application.nationality],
            ['Marital Status', self.application.get_marital_status_display() if self.application.marital_status else 'N/A'],
            ['ID Type', self.application.get_id_type_display()],
            ['ID Number', f"****{self.application.id_number[-4:]}"],  # Masked for security
        ]
        
        personal_table = Table(personal_data, colWidths=[2.5*inch, 3.5*inch])
        personal_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), self.LIGHT_GRAY),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.DARK_TEXT),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, self.MEDIUM_GRAY),
        ]))
        
        self.elements.append(personal_table)
    
    def _add_contact_section(self):
        """Add contact and address section"""
        self.elements.append(Paragraph("CONTACT & ADDRESS", self.styles['SectionHeading']))
        
        contact_data = [
            ['Street Address', f"{self.application.address_line_1}{', ' + self.application.address_line_2 if self.application.address_line_2 else ''}"],
            ['City', self.application.city],
            ['State/Province', self.application.state_province or 'N/A'],
            ['Postal Code', self.application.postcode],
            ['Country', self.application.country],
            ['Contact Preference', self.application.get_contact_preference_display()],
        ]
        
        contact_table = Table(contact_data, colWidths=[2.5*inch, 3.5*inch])
        contact_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), self.LIGHT_GRAY),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.DARK_TEXT),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, self.MEDIUM_GRAY),
        ]))
        
        self.elements.append(contact_table)
    
    def _add_worker_section(self):
        """Add employment details for worker applicants"""
        self.elements.append(Paragraph("EMPLOYMENT DETAILS", self.styles['SectionHeading']))
        
        worker_data = [
            ['Worker Category', self.application.get_worker_category_display() if self.application.worker_category else 'N/A'],
            ['Occupation', self.application.occupation],
            ['Industry', self.application.get_industry_display() if self.application.industry else 'N/A'],
            ['Employer Name', self.application.employer_name],
            ['Monthly Salary (MYR)', f"RM {self.application.monthly_salary:,.2f}" if self.application.monthly_salary else 'N/A'],
            ['Employment Type', self.application.get_employment_type_display() if self.application.employment_type else 'N/A'],
            ['Work Permit Status', self.application.get_work_permit_status_display() if self.application.work_permit_status else 'N/A'],
            ['Years of Experience', str(self.application.years_of_experience) if self.application.years_of_experience else 'N/A'],
        ]
        
        worker_table = Table(worker_data, colWidths=[2.5*inch, 3.5*inch])
        worker_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), self.LIGHT_GRAY),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.DARK_TEXT),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, self.MEDIUM_GRAY),
        ]))
        
        self.elements.append(worker_table)
    
    def _add_student_section(self):
        """Add education details for student applicants"""
        self.elements.append(Paragraph("EDUCATION DETAILS", self.styles['SectionHeading']))
        
        student_data = [
            ['University', self.application.university_name or 'N/A'],
            ['Study Level', self.application.get_study_level_display() if self.application.study_level else 'N/A'],
            ['Field of Study', self.application.field_of_study or 'N/A'],
            ['Course', self.application.course_of_study or 'N/A'],
            ['Sponsor Type', self.application.get_study_sponsor_type_display() if self.application.study_sponsor_type else 'N/A'],
            ['Expected Graduation', self.application.expected_graduation.strftime('%B %d, %Y') if self.application.expected_graduation else 'N/A'],
            ['Study Duration (months)', str(self.application.intended_duration_months) if self.application.intended_duration_months else 'N/A'],
            ['Residential Status', 'On-Campus' if self.application.on_campus_residential else 'Off-Campus'],
        ]
        
        student_table = Table(student_data, colWidths=[2.5*inch, 3.5*inch])
        student_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), self.LIGHT_GRAY),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.DARK_TEXT),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, self.MEDIUM_GRAY),
        ]))
        
        self.elements.append(student_table)
    
    def _add_coverage_section(self):
        """Add insurance coverage details"""
        self.elements.append(Paragraph("INSURANCE COVERAGE", self.styles['SectionHeading']))
        
        # Add-ons list
        addons_list = "None"
        if self.application.coverage_addons:
            try:
                addons = self.application.coverage_addons
                if isinstance(addons, str):
                    import json
                    addons = json.loads(addons)
                if isinstance(addons, list) and len(addons) > 0:
                    addons_list = ", ".join(addons)
            except:
                addons_list = "N/A"
        
        coverage_data = [
            ['Plan Selected', self.application.get_plan_display()],
            ['Coverage Amount', self._get_plan_coverage()],
            ['Add-ons', addons_list],
            ['Base Annual Premium (MYR)', f"RM {self._get_base_premium():,.2f}"],
            ['Total Annual Premium (MYR)', f"RM {self.application.total_annual_premium:,.2f}"],
            ['Monthly Payment (MYR)', f"RM {self.application.total_annual_premium / 12:,.2f}"],
        ]
        
        coverage_table = Table(coverage_data, colWidths=[2.5*inch, 3.5*inch])
        coverage_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), self.LIGHT_GRAY),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.DARK_TEXT),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, self.MEDIUM_GRAY),
        ]))
        
        self.elements.append(coverage_table)
    
    def _add_approval_section(self):
        """Add approval status section"""
        self.elements.append(Paragraph("APPROVAL STATUS", self.styles['SectionHeading']))
        
        approval_status = "Pending Review"
        approval_date = "N/A"
        approval_notes = "Application is awaiting admin review"
        
        if self.application.status == 'approved':
            approval_status = "APPROVED ✓"
            approval_date = self.application.updated_at.strftime('%B %d, %Y')
            approval_notes = "Application has been approved. Confirmation email sent to applicant."
        elif self.application.status == 'rejected':
            approval_status = "REJECTED"
            approval_date = self.application.updated_at.strftime('%B %d, %Y')
            approval_notes = self.application.review_notes or "Application was rejected. See admin notes for details."
        elif self.application.status == 'under_review':
            approval_status = "Under Review"
            approval_date = self.application.submitted_at.strftime('%B %d, %Y') if self.application.submitted_at else 'N/A'
            approval_notes = self.application.review_notes or "Application is currently under review by admin team."
        
        approval_data = [
            ['Status', approval_status],
            ['Status Date', approval_date],
            ['Notes', approval_notes],
        ]
        
        approval_table = Table(approval_data, colWidths=[2.5*inch, 3.5*inch])
        approval_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), self.LIGHT_GRAY),
            ('TEXTCOLOR', (0, 0), (-1, -1), self.DARK_TEXT),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, self.MEDIUM_GRAY),
        ]))
        
        self.elements.append(approval_table)
    
    def _add_footer(self):
        """Add document footer with compliance notice"""
        footer_text = (
            "<font size=7><b>Confidentiality Notice:</b> This document contains confidential and personal "
            "information about an insurance applicant. It is intended for authorized Allianz personnel only. "
            "Unauthorized distribution, copying, or use of this document is prohibited.</font>"
        )
        footer = Paragraph(footer_text, self.styles['CustomBody'])
        self.elements.append(footer)
    
    def _get_plan_coverage(self):
        """Get coverage amount for selected plan"""
        plan_coverage = {
            'plan_5': 'RM 360,000',
            'plan_6': 'RM 600,000',
            'plan_7': 'RM 900,000',
        }
        return plan_coverage.get(self.application.plan, 'N/A')
    
    def _get_base_premium(self):
        """Get base premium for selected plan"""
        plan_premium = {
            'plan_5': 360,
            'plan_6': 480,
            'plan_7': 720,
        }
        return plan_premium.get(self.application.plan, 0)
