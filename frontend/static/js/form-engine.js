// Handle Nationality change
function handleNationalityChange(select) {
    const otherInput = document.getElementById('nationality-other-input');
    if (select.value === 'Other') {
        otherInput.classList.remove('hidden');
        window.formState.nationality = '';
    } else {
        otherInput.classList.add('hidden');
        window.formState.nationality = select.value;
    }
    saveFormState();
}

function handleNationalityOtherInput(input) {
    window.formState.nationality = input.value;
    saveFormState();
}
/**
 * Main Form Engine - Handles step navigation, form state, and submission
 * Brightbeam Allianz Shield Plus Application
 */

let currentStep = 1;
const totalSteps = 10;

function notifyForm(message, type = "error") {
    if (typeof window.showAppNotice === "function") {
        window.showAppNotice(message, type);
        return;
    }
    // Fallback if showAppNotice not yet initialized
    console[type === "error" ? "error" : type === "warning" ? "warn" : "log"](message);
}

// Initialize form on page load
function initializeForm() {
    loadFormState();
    updateStepDisplay();
    attachEventListeners();
}

// Attach event listeners to form inputs
function attachEventListeners() {
    const form = document.getElementById('asp-form');
    if (form) {
        form.addEventListener('change', () => {
            saveFormState();
            updateFieldVisibility();
            calculatePremium();
        });
        
        form.addEventListener('input', () => {
            saveFormState();
        });
    }
}

// Move to next step
function nextStep() {
    // Validate current step
    if (!validateStep(currentStep)) {
        notifyForm('Please fill in all required fields correctly before proceeding.', 'warning');
        return;
    }
    
    if (currentStep < totalSteps) {
        currentStep++;
        updateStepDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Move to previous step
function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Go to specific step
function goToStep(step) {
    if (step >= 1 && step <= totalSteps) {
        currentStep = step;
        updateStepDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Update step display (show/hide step content)
function updateStepDisplay() {
    // Hide all steps
    for (let i = 1; i <= totalSteps; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        if (stepEl) {
            stepEl.classList.add('hidden');
        }
    }
    
    // Show current step
    const currentStepEl = document.getElementById(`step-${currentStep}`);
    if (currentStepEl) {
        currentStepEl.classList.remove('hidden');
    }
    
    // Update progress bar
    const progress = (currentStep / totalSteps) * 100;
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    
    // Update step number and percent
    document.getElementById('current-step-num').textContent = currentStep;
    document.getElementById('progress-percent').textContent = Math.round(progress);
    
    // Update step indicators
    updateStepIndicators();
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    if (prevBtn) {
        prevBtn.style.display = currentStep > 1 ? 'block' : 'none';
    }
    
    if (nextBtn && submitBtn) {
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }
    }
    
    // Update field visibility based on category selections
    updateFieldVisibility();
    calculatePremium();
}

// Update step indicators styling
function updateStepIndicators() {
    for (let i = 1; i <= totalSteps; i++) {
        const indicator = document.querySelector(`.step-indicator[data-step="${i}"]`);
        if (indicator) {
            indicator.classList.remove('active', 'completed');
            
            if (i === currentStep) {
                indicator.classList.add('active');
            } else if (i < currentStep) {
                indicator.classList.add('completed');
            }
        }
    }
}

// Handle category selection (Worker or Student)
function selectCategory(type) {
    const form = document.getElementById('asp-form');
    const radios = form.querySelectorAll('input[name="applicant_type"]');
    radios.forEach(r => r.value === type && (r.checked = true));
    
    window.formState.applicant_type = type;
    saveFormState();
    updateFieldVisibility();
    
    // Move to next step
    setTimeout(() => nextStep(), 300);
}

// Handle worker category selection
function selectWorkerCategory(category) {
    const form = document.getElementById('asp-form');
    const radios = form.querySelectorAll('input[name="worker_category"]');
    radios.forEach(r => r.value === category && (r.checked = true));
    
    window.formState.worker_category = category;
    saveFormState();
    updateFieldVisibility();
    calculatePremium();
    
    // Move to next step
    setTimeout(() => nextStep(), 300);
}

// Handle student sponsor type selection
function selectStudentSponsor(sponsorType) {
    const form = document.getElementById('asp-form');
    const radios = form.querySelectorAll('input[name="study_sponsor_type"]');
    radios.forEach(r => r.value === sponsorType && (r.checked = true));
    
    window.formState.study_sponsor_type = sponsorType;
    saveFormState();
    updateFieldVisibility();
    calculatePremium();
    
    // Move to next step
    setTimeout(() => nextStep(), 300);
}

// Handle plan selection
function selectPlan(plan) {
    const form = document.getElementById('asp-form');
    const radios = form.querySelectorAll('input[name="plan"]');
    radios.forEach(r => r.value === plan && (r.checked = true));
    
    window.formState.plan = plan;
    saveFormState();
    calculatePremium();
}

// Toggle addon selection
function toggleAddon(addonName) {
    const addons = window.formState.addons || [];
    const index = addons.indexOf(addonName);
    
    if (index > -1) {
        addons.splice(index, 1);
    } else {
        addons.push(addonName);
    }
    
    window.formState.addons = addons;
    saveFormState();
    calculatePremium();
}

// Calculate age from date of birth
function calculateAge() {
    const dobInput = document.querySelector('input[name="date_of_birth"]');
    const ageDisplay = document.getElementById('calculated_age');
    
    if (dobInput && dobInput.value) {
        const dob = new Date(dobInput.value);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        
        if (ageDisplay) {
            ageDisplay.textContent = age >= 18 ? age : 'Invalid (must be 18+)';
        }
    }
}

// Calculate study duration
function calculateStudyDuration() {
    const graduationInput = document.querySelector('input[name="expected_graduation"]');
    const durationInput = document.querySelector('input[name="intended_duration_months"]');
    
    if (graduationInput && graduationInput.value && durationInput) {
        const today = new Date();
        const graduation = new Date(graduationInput.value);
        
        const diffTime = graduation - today;
        const diffMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30));
        
        durationInput.value = Math.max(1, diffMonths);
        window.formState.intended_duration_months = diffMonths;
        saveFormState();
        calculatePremium();
    }
}

// Prepare review page
function prepareReview() {
    if (currentStep !== 10) return;
    
    const reviewContent = document.getElementById('review-content');
    if (!reviewContent) return;
    
    const state = window.formState;
    const isWorker = state.applicant_type === 'worker';
    
    let html = `
        <div class="space-y-6">
            <!-- Personal Information -->
            <section class="border-t pt-4">
                <h3 class="font-semibold text-gray-800 mb-3">Personal Information</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-600">Full Name</p>
                        <p class="font-semibold text-gray-800">${state.full_name}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Age</p>
                        <p class="font-semibold text-gray-800">${calculateAgeFromDOB(state.date_of_birth)} years</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Email</p>
                        <p class="font-semibold text-gray-800">${state.email}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Phone</p>
                        <p class="font-semibold text-gray-800">${state.phone_country_code}${state.phone_number}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Nationality</p>
                        <p class="font-semibold text-gray-800">${state.nationality}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">ID Type</p>
                        <p class="font-semibold text-gray-800">${state.id_type} (****${state.id_number.slice(-4)})</p>
                    </div>
                </div>
            </section>
    `;
    
    if (isWorker) {
        html += `
            <!-- Employment Information -->
            <section class="border-t pt-4">
                <h3 class="font-semibold text-gray-800 mb-3">Employment Information</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-600">Category</p>
                        <p class="font-semibold text-gray-800">Category ${state.worker_category.split('_')[1].toUpperCase()}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Occupation</p>
                        <p class="font-semibold text-gray-800">${state.occupation}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Industry</p>
                        <p class="font-semibold text-gray-800">${state.industry}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Employer</p>
                        <p class="font-semibold text-gray-800">${state.employer_name}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Monthly Salary</p>
                        <p class="font-semibold text-gray-800">RM${state.monthly_salary}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Employment Type</p>
                        <p class="font-semibold text-gray-800">${state.employment_type}</p>
                    </div>
                </div>
            </section>
        `;
    } else {
        html += `
            <!-- Education Information -->
            <section class="border-t pt-4">
                <h3 class="font-semibold text-gray-800 mb-3">Education Information</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-600">University</p>
                        <p class="font-semibold text-gray-800">${state.university_name}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Sponsor Type</p>
                        <p class="font-semibold text-gray-800">${state.study_sponsor_type}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Level of Study</p>
                        <p class="font-semibold text-gray-800">${state.study_level}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Field</p>
                        <p class="font-semibold text-gray-800">${state.field_of_study}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Course</p>
                        <p class="font-semibold text-gray-800">${state.course_of_study}</p>
                    </div>
                    <div>
                        <p class="text-gray-600">Graduation Date</p>
                        <p class="font-semibold text-gray-800">${state.expected_graduation}</p>
                    </div>
                </div>
            </section>
        `;
    }
    
    html += `
        <!-- Coverage Selection -->
        <section class="border-t pt-4">
            <h3 class="font-semibold text-gray-800 mb-3">Coverage Selected</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p class="text-gray-600">Plan</p>
                    <p class="font-semibold text-gray-800">${state.plan.toUpperCase()}</p>
                </div>
                <div>
                    <p class="text-gray-600">Annual Premium</p>
                    <p class="font-bold text-lg text-blue-600">RM${state.premium || 'calculating'}/year</p>
                </div>
            </div>
            ${state.addons && state.addons.length > 0 ? `
                <div class="mt-4">
                    <p class="text-gray-600 mb-2">Add-ons Selected:</p>
                    <ul class="space-y-1">
                        ${state.addons.map(addon => `<li class="text-sm font-semibold text-gray-800">✓ ${addon}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </section>
        
        <!-- Address Information -->
        <section class="border-t pt-4">
            <h3 class="font-semibold text-gray-800 mb-3">Address</h3>
            <p class="text-sm text-gray-700">${state.address_line_1}</p>
            ${state.address_line_2 ? `<p class="text-sm text-gray-700">${state.address_line_2}</p>` : ''}
            <p class="text-sm text-gray-700">${state.postcode} ${state.city}, ${state.state_province}</p>
            <p class="text-sm text-gray-700">${state.country}</p>
        </section>

        <!-- Payment Method -->
        <section class="border-t pt-4">
            <h3 class="font-semibold text-gray-800 mb-3">Payment Method</h3>
            <p class="text-sm font-semibold text-gray-800 uppercase">${(state.preferred_payment_method || 'not_selected').replace('_', ' ')}</p>
        </section>
        </div>
    `;
    
    reviewContent.innerHTML = html;
}

// Calculate age helper
function calculateAgeFromDOB(dob) {
    if (!dob) return '-';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Submit form
function submitForm(event) {
    event.preventDefault();
    
    if (!validateStep(totalSteps)) {
        notifyForm('Please complete all required fields.', 'warning');
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';
    
    const state = { ...window.formState };
    if (state.addons && Array.isArray(state.addons)) {
        state.coverage_addons = {};
        const costs = { 'employment_protection': 50, 'occupational_injury': 35, 'professional_liability': 40, 'family_coverage': 80, 'study_interruption': 50, 'education_protection': 40, 'family_emergency': 35, 'scholarship_protection': 60 };
        state.addons.forEach(a => { if (costs[a]) state.coverage_addons[a] = costs[a]; });
    }
    
    // Submit via AJAX
    fetch('/api/applications/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(state),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        // Success
        localStorage.removeItem('asp_form_state');
        window.formState = {};
        
        // Show success page
        currentStep = 10;
        updateStepDisplay();
        
        // Populate success page
        const successMsg = document.querySelector('#step-10');
        if (successMsg) {
            successMsg.innerHTML = `
                <div class="text-center py-12">
                    <div class="mb-6">
                        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                    </div>
                    
                    <h2 class="text-3xl font-bold text-gray-800 mb-4">Application Submitted!</h2>
                    
                    <p class="text-xl text-gray-600 mb-8">Thank you for choosing Allianz Shield Plus</p>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-8 inline-block shadow-inner">
                        <p class="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">Application Reference</p>
                        <p class="text-4xl font-black text-blue-800">${data.application_number || 'ASP-2024-XXXXX'}</p>
                    </div>
                    
                    <div class="bg-gray-50 p-6 rounded-lg text-left mb-8 max-w-md mx-auto">
                        <h3 class="font-semibold text-gray-800 mb-4">What happens next:</h3>
                        <ol class="space-y-3 text-sm text-gray-700">
                            <li>✓ Confirmation email sent to ${state.email}</li>
                            <li>✓ Document verification (3-5 business days)</li>
                            <li>✓ Premium confirmation</li>
                            <li>✓ Policy activation</li>
                        </ol>
                    </div>
                    
                    <p class="text-gray-600 mb-8">Questions? Contact us at <strong>+603-1234-5678</strong> or <strong>support@allianzshieldplus.my</strong></p>
                    
                    <a href="/" class="btn-primary inline-block">Return to Home</a>
                </div>
            `;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        const errorMsg = error.detail || error.message || 'Error submitting application. Please try again.';
        showAppNotice(errorMsg, 'error');
    });
}

// ============ PASSPORT PHOTO UPLOAD ============

async function handlePhotoUpload(fileInput) {
    /**
     * Handle passport photo upload with validation
     * For prototype: generates data URL for local preview
     * Production: would upload to Uploadcare CDN
     */
    const file = fileInput.files[0];
    if (!file) return;
    
    const container = document.getElementById('passport-photo-container');
    const previewContainer = document.getElementById('photo-preview-container');
    const preview = document.getElementById('photo-preview');
    const urlInput = document.getElementById('passport_photo_url');
    
    try {
        // Validate photo
        const validation = await validatePhotoComplete(file);
        
        if (!validation.valid) {
            showAppNotice(validation.errors.join(', '), 'error');
            fileInput.value = '';
            previewContainer.classList.add('hidden');
            urlInput.value = '';
            return;
        }
        
        // Get public key from DOM
        const publicKey = urlInput.getAttribute('data-public-key');
        
        // Show loading state
        showAppNotice('Uploading to Allianz secure servers...', 'info');
        
        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('UPLOADCARE_PUB_KEY', publicKey || 'demopublickey');
        formData.append('UPLOADCARE_STORE', '1');
        
        // Upload to Uploadcare
        const response = await fetch('https://upload.uploadcare.com/base/', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        const photoUrl = result.file ? `https://ucarecdn.com/${result.file}/` : null;
        
        if (!photoUrl) {
            throw new Error('No photo URL returned from upload');
        }
        
        // Update form state
        window.formState.passport_photo_url = photoUrl;
        if (validation.exifDate) {
            window.formState.passport_photo_exif_date = validation.exifDate.toISOString().split('T')[0];
        }
        urlInput.value = photoUrl;
        
        // Show preview
        preview.src = photoUrl;
        previewContainer.classList.remove('hidden');
        
        // Show success message
        clearPhotoError('passport_photo_url');
        showAppNotice('Photo uploaded successfully!', 'success');
        
        // Save form state
        saveFormState();
        
    } catch (error) {
        console.error('Photo upload error:', error);
        showAppNotice(`Upload failed: ${error.message}`, 'error');
        fileInput.value = '';
        previewContainer.classList.add('hidden');
        urlInput.value = '';
    }
}

// ============ APP NOTIFICATIONS (CENTERED) ============

function showAppNotice(message, type = 'info') {
    /**
     * Show centered notification popup
     * Types: 'error', 'success', 'warning', 'info'
     */
    // Remove existing notice if any
    const existing = document.getElementById('app-notice');
    if (existing) {
        existing.remove();
    }
    
    const notice = document.createElement('div');
    notice.id = 'app-notice';
    notice.className = `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-6 rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
        type === 'error' ? 'bg-red-50 border border-red-300' :
        type === 'success' ? 'bg-green-50 border border-green-300' :
        type === 'warning' ? 'bg-yellow-50 border border-yellow-300' :
        'bg-blue-50 border border-blue-300'
    }`;
    
    const icon = type === 'error' ? '✗' :
                 type === 'success' ? '✓' :
                 type === 'warning' ? '⚠' :
                 'ℹ';
    
    const textColor = type === 'error' ? 'text-red-800' :
                      type === 'success' ? 'text-green-800' :
                      type === 'warning' ? 'text-yellow-800' :
                      'text-blue-800';
    
    notice.innerHTML = `
        <div class="flex items-start gap-3">
            <span class="text-2xl">${icon}</span>
            <div class="flex-1">
                <p class="font-semibold ${textColor}">${message}</p>
            </div>
            <button onclick="document.getElementById('app-notice')?.remove()" class="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
    `;
    
    document.body.appendChild(notice);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notice.style.opacity = '0';
        notice.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => notice.remove(), 300);
    }, 4000);
}

window.showAppNotice = showAppNotice;

// Helper function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    
    // Set current step for review
    if (currentStep === totalSteps - 1) {
        prepareReview();
    }
});
