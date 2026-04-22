/**
 * Admin Actions - Handles admin dashboard and application detail page interactions
 * Including PDF download, approvals, rejections, and notifications
 */

// ============ PDF DOWNLOAD HANDLER ============

async function downloadPDF(applicationId) {
    /**
     * Download application as PDF
     * Shows loading state during download
     */
    try {
        showPDFLoadingState();
        
        const response = await fetch(`/api/applications/${applicationId}/export-pdf/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${getAuthToken()}`,
            }
        });
        
        if (!response.ok) {
            throw new Error(`Download failed with status ${response.status}`);
        }
        
        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `application-${applicationId}.pdf`;
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        }
        
        // Convert response to blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        showPDFSuccess(`PDF downloaded: ${filename}`);
        
    } catch (error) {
        console.error('PDF download error:', error);
        showPDFError(`Failed to download PDF: ${error.message}`);
    }
}

function showPDFLoadingState() {
    /**
     * Show loading state for PDF download button
     */
    const button = document.getElementById('download-pdf-btn');
    if (!button) return;
    
    button.disabled = true;
    button.innerHTML = '<span class="spinner-small"></span> Generating PDF...';
    button.classList.add('loading');
}

function showPDFSuccess(message) {
    /**
     * Show success message for PDF download
     */
    const button = document.getElementById('download-pdf-btn');
    if (!button) return;
    
    button.disabled = false;
    button.innerHTML = '📥 Download PDF';
    button.classList.remove('loading');
    
    // Show toast notification
    window.showAppNotice(message, 'success', 3000);
}

function showPDFError(message) {
    /**
     * Show error message for PDF download failure
     */
    const button = document.getElementById('download-pdf-btn');
    if (!button) return;
    
    button.disabled = false;
    button.innerHTML = '📥 Download PDF';
    button.classList.remove('loading');
    
    // Show toast notification
    window.showAppNotice(message, 'error', 5000);
}

// ============ UTILITIES ============

function getAuthToken() {
    /**
     * Get authentication token from localStorage or cookies
     * For Django REST Framework Token Authentication
     */
    // Check localStorage first
    let token = localStorage.getItem('auth_token');
    if (token) return token;
    
    // Check cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'auth_token') {
            return value;
        }
    }
    
    return '';
}

// ============ EXPORT FUNCTIONS ============

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        downloadPDF,
        getAuthToken
    };
}
