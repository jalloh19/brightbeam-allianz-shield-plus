"""
Email notification service using Resend API.
Handles sending emails for application submissions, approvals, and rejections.
"""

import os
import logging
from typing import List, Dict, Optional
import resend
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


class ResendEmailService:
    """
    Service for sending emails using Resend API.
    Handles all notification types: confirmation, approval, rejection.
    """
    
    def __init__(self):
        """Initialize Resend client with API key from environment."""
        api_key = os.getenv('RESEND_API_KEY')
        if not api_key:
            logger.warning("RESEND_API_KEY not found in environment variables")
        resend.api_key = api_key
        self.from_email = os.getenv('RESEND_FROM_EMAIL', 'noreply@allianzshield.com')
        self.reply_to = os.getenv('RESEND_REPLY_TO', 'support@allianzshield.com')
    
    def send_confirmation_email(self, recipient: str, full_name: str, application_number: str) -> Dict:
        """
        Send application confirmation email after successful submission.
        
        Args:
            recipient: Applicant's email address
            full_name: Applicant's full name
            application_number: Generated application reference number
            
        Returns:
            Dict with send result and message ID
        """
        try:
            subject = "Your Application Has Been Received"
            
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #414141;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <img src="https://www.allianz.com/en.html" alt="Allianz Shield Plus" style="max-width: 200px; margin-bottom: 20px;">
                        
                        <h2 style="color: #003781;">Application Received</h2>
                        
                        <p>Dear {full_name},</p>
                        
                        <p>Thank you for submitting your application for Allianz Shield Plus insurance. We have successfully received your submission.</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Application Number:</strong> <span style="color: #003781; font-size: 18px;">{application_number}</span></p>
                            <p><strong>Status:</strong> Under Review</p>
                            <p><strong>Received Date:</strong> {self._get_current_date()}</p>
                        </div>
                        
                        <h3 style="color: #003781;">What Happens Next?</h3>
                        <ol>
                            <li>Our team will review your application (3-5 business days)</li>
                            <li>We'll verify your documents and information</li>
                            <li>You'll receive a confirmation email with your premium details</li>
                            <li>Your policy will be activated upon payment</li>
                        </ol>
                        
                        <p style="margin-top: 30px; color: #767676; font-size: 14px;">
                            If you have any questions, please contact our support team at {self.reply_to}
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #d9d9d9; margin: 30px 0;">
                        <p style="font-size: 12px; color: #999;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            response = resend.Emails.send({
                "from": self.from_email,
                "to": recipient,
                "subject": subject,
                "html": html_content,
                "reply_to": self.reply_to,
            })
            
            result = {
                'success': response.get('id') is not None,
                'message_id': response.get('id'),
                'error': response.get('message') if not response.get('id') else None
            }
            
            logger.info(f"Confirmation email sent to {recipient} - Message ID: {result['message_id']}")
            return result
            
        except Exception as e:
            logger.error(f"Failed to send confirmation email to {recipient}: {str(e)}")
            return {'success': False, 'error': str(e), 'message_id': None}
    
    def send_approval_email(self, recipient: str, full_name: str, application_number: str, premium: float) -> Dict:
        """
        Send approval notification email when application is approved.
        
        Args:
            recipient: Applicant's email address
            full_name: Applicant's full name
            application_number: Application reference number
            premium: Calculated insurance premium amount
            
        Returns:
            Dict with send result and message ID
        """
        try:
            subject = "Your Application Has Been Approved ✓"
            
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #414141;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <img src="https://www.allianz.com/en.html" alt="Allianz Shield Plus" style="max-width: 200px; margin-bottom: 20px;">
                        
                        <div style="background-color: #1e8927; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
                            <h2 style="margin: 0;">✓ Application Approved</h2>
                        </div>
                        
                        <p>Dear {full_name},</p>
                        
                        <p>Congratulations! Your application for Allianz Shield Plus insurance has been <strong>approved</strong>.</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Application Number:</strong> {application_number}</p>
                            <p><strong>Status:</strong> <span style="color: #1e8927; font-weight: bold;">APPROVED</span></p>
                            <p><strong>Annual Premium:</strong> <span style="font-size: 18px; color: #003781; font-weight: bold;">RM {premium:,.2f}</span></p>
                        </div>
                        
                        <h3 style="color: #003781;">Next Steps to Activate Your Policy</h3>
                        <ol>
                            <li>Review your policy details carefully</li>
                            <li>Complete the payment of <strong>RM {premium:,.2f}</strong></li>
                            <li>Your policy will be activated immediately upon payment</li>
                            <li>You'll receive your policy document via email</li>
                        </ol>
                        
                        <div style="background-color: #fffbea; border-left: 4px solid #efbe25; padding: 15px; margin: 20px 0;">
                            <p><strong>⚠️ Important:</strong> Your policy will remain inactive until payment is received. To avoid coverage gaps, please process your payment within 7 days.</p>
                        </div>
                        
                        <p style="margin-top: 30px; color: #767676; font-size: 14px;">
                            If you have any questions, please contact our support team at {self.reply_to}
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #d9d9d9; margin: 30px 0;">
                        <p style="font-size: 12px; color: #999;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            response = resend.Emails.send({
                "from": self.from_email,
                "to": recipient,
                "subject": subject,
                "html": html_content,
                "reply_to": self.reply_to,
            })
            
            result = {
                'success': response.get('id') is not None,
                'message_id': response.get('id'),
                'error': response.get('message') if not response.get('id') else None
            }
            
            logger.info(f"Approval email sent to {recipient} - Message ID: {result['message_id']}")
            return result
            
        except Exception as e:
            logger.error(f"Failed to send approval email to {recipient}: {str(e)}")
            return {'success': False, 'error': str(e), 'message_id': None}
    
    def send_rejection_email(self, recipient: str, full_name: str, application_number: str, reason: str) -> Dict:
        """
        Send rejection notification email when application is rejected.
        
        Args:
            recipient: Applicant's email address
            full_name: Applicant's full name
            application_number: Application reference number
            reason: Reason for rejection
            
        Returns:
            Dict with send result and message ID
        """
        try:
            subject = "Your Application Status - Review Required"
            
            html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #414141;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                        <img src="https://www.allianz.com/en.html" alt="Allianz Shield Plus" style="max-width: 200px; margin-bottom: 20px;">
                        
                        <div style="background-color: #dc3149; color: white; padding: 20px; border-radius: 5px; text-align: center; margin-bottom: 20px;">
                            <h2 style="margin: 0;">Application Status Update</h2>
                        </div>
                        
                        <p>Dear {full_name},</p>
                        
                        <p>Thank you for submitting your application to Allianz Shield Plus. After careful review, we regret to inform you that your application could not be approved at this time.</p>
                        
                        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Application Number:</strong> {application_number}</p>
                            <p><strong>Status:</strong> <span style="color: #dc3149; font-weight: bold;">NOT APPROVED</span></p>
                        </div>
                        
                        <h3 style="color: #003781;">Reason for Decision</h3>
                        <div style="background-color: #ffe6e6; border-left: 4px solid #dc3149; padding: 15px; margin: 20px 0;">
                            <p>{reason}</p>
                        </div>
                        
                        <h3 style="color: #003781;">What You Can Do</h3>
                        <ul>
                            <li>Contact our support team to discuss your application in detail</li>
                            <li>Provide additional information or documentation if applicable</li>
                            <li>Reapply after addressing the concerns mentioned above</li>
                        </ul>
                        
                        <p style="margin-top: 30px; color: #767676; font-size: 14px;">
                            We appreciate your interest in Allianz Shield Plus. If you'd like to discuss this decision or have questions, please reach out to our support team at {self.reply_to}
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #d9d9d9; margin: 30px 0;">
                        <p style="font-size: 12px; color: #999;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                </body>
            </html>
            """
            
            response = resend.Emails.send({
                "from": self.from_email,
                "to": recipient,
                "subject": subject,
                "html": html_content,
                "reply_to": self.reply_to,
            })
            
            result = {
                'success': response.get('id') is not None,
                'message_id': response.get('id'),
                'error': response.get('message') if not response.get('id') else None
            }
            
            logger.info(f"Rejection email sent to {recipient} - Message ID: {result['message_id']}")
            return result
            
        except Exception as e:
            logger.error(f"Failed to send rejection email to {recipient}: {str(e)}")
            return {'success': False, 'error': str(e), 'message_id': None}
    
    @staticmethod
    def _get_current_date() -> str:
        """Get current date in readable format."""
        from datetime import datetime
        return datetime.now().strftime("%B %d, %Y")


# Singleton instance
_email_service = None


def get_email_service() -> ResendEmailService:
    """Get or create the email service instance."""
    global _email_service
    if _email_service is None:
        _email_service = ResendEmailService()
    return _email_service
