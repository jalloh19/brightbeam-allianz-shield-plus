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

// Handle Country change to update State/Province options
const STATE_DATA = {
    'Malaysia': [
        'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Malacca', 
        'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya', 
        'Sabah', 'Sarawak', 'Selangor', 'Terengganu'
    ],
    'Singapore': [
        'Central Singapore', 'North East Singapore', 'North West Singapore', 
        'South East Singapore', 'South West Singapore'
    ],
    'Thailand': [
        'Bangkok', 'Chiang Mai', 'Phuket', 'Chonburi', 'Samut Prakan', 'Other'
    ]
};

function handleCountryChange(select) {
    const country = select.value;
    updateStateOptions(country);
    
    // Clear state selection when country changes
    window.formState.country = country;
    window.formState.state_province = '';
    
    // Save to global state
    saveFormState();
}

function updateStateOptions(country, selectedState = '') {
    const stateSelect = document.getElementById('state-select');
    if (!stateSelect) return;
    
    // Clear current options except the first one
    stateSelect.innerHTML = '<option value="">Select State</option>';
    
    const states = STATE_DATA[country] || [];
    
    if (states.length > 0) {
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            if (state === selectedState) {
                option.selected = true;
            }
            stateSelect.appendChild(option);
        });
    } else {
        // If country not in list, provide a text-like experience or "Other"
        const option = document.createElement('option');
        option.value = 'Other';
        option.textContent = 'Other';
        stateSelect.appendChild(option);
    }
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

const FIELD_STEP_MAP = {
    applicant_type: 1,
    worker_category: 2,
    study_sponsor_type: 2,
    full_name: 3,
    date_of_birth: 3,
    nationality: 3,
    gender: 3,
    id_type: 3,
    id_number: 3,
    passport_photo_url: 3,
    email: 4,
    phone_country_code: 4,
    phone_number: 4,
    address_line_1: 4,
    address_line_2: 4,
    city: 4,
    state_province: 4,
    postcode: 4,
    country: 4,
    occupation: 5,
    industry: 5,
    employer_name: 5,
    monthly_salary: 5,
    employment_type: 5,
    work_permit_status: 5,
    university_name: 5,
    study_level: 5,
    field_of_study: 5,
    course_of_study: 5,
    expected_graduation: 5,
    plan: 6,
    accuracy_confirmation: 9,
    pdpa_consent: 9,
    terms_accepted: 9,
};

function normalizeApiFieldMessage(value) {
    if (!value) return "This field is invalid.";
    if (Array.isArray(value)) return value[0] || "This field is invalid.";
    return String(value);
}

function focusFirstApiError(apiErrors) {
    if (!apiErrors || typeof apiErrors !== 'object') return;
    const keys = Object.keys(apiErrors);
    const firstField = keys.find(k => k && k !== 'detail' && k !== 'non_field_errors') || keys[0];
    const step = FIELD_STEP_MAP[firstField];
    if (step) {
        goToStep(step);
        window.setTimeout(() => {
            const form = document.getElementById('asp-form');
            const input = form ? form.querySelector(`[name="${firstField}"]`) : null;
            if (input && typeof input.focus === 'function') input.focus();
        }, 50);
    }
}

function applyApiValidationErrors(apiErrors) {
    if (!apiErrors || typeof apiErrors !== 'object') return;

    // Clear any previous inline errors we can find (best-effort)
    try {
        const existing = document.querySelectorAll('[id^="error_"]');
        existing.forEach(el => el.remove());
        const fields = document.querySelectorAll('#asp-form .border-red-500');
        fields.forEach(el => el.classList.remove('border-red-500'));
    } catch (_e) {}

    let bannerMsg = '';
    Object.entries(apiErrors).forEach(([field, value]) => {
        if (!field) return;
        if (field === 'detail') {
            bannerMsg = normalizeApiFieldMessage(value);
            return;
        }
        if (field === 'non_field_errors') {
            bannerMsg = normalizeApiFieldMessage(value);
            return;
        }
        if (typeof window.showFieldError === 'function') {
            window.showFieldError(field, normalizeApiFieldMessage(value));
        }
    });

    // Duplicate email special-case (unique validator)
    if (apiErrors.email) {
        const msg = normalizeApiFieldMessage(apiErrors.email);
        if (/already exists|unique/i.test(msg)) {
            if (typeof window.showAppBanner === 'function') {
                window.showAppBanner(
                    'This email has already been used for an application. Please use a different email address, or contact support if you believe this is a mistake.',
                    'warning'
                );
            }
            notifyForm('Duplicate email detected. Please use a different email.', 'warning');
            focusFirstApiError({ email: apiErrors.email });
            return;
        }
    }

    if (bannerMsg && typeof window.showAppBanner === 'function') {
        window.showAppBanner(bannerMsg, 'error');
    } else if (typeof window.showAppBanner === 'function') {
        window.showAppBanner('Please review the highlighted fields and try again.', 'error');
    }

    notifyForm('Please fix the highlighted fields and resubmit.', 'error');
    focusFirstApiError(apiErrors);
}

// Initialize form on page load
function initializeForm() {
    loadFormState();
    
    // Load state options based on current country
    if (window.formState && window.formState.country) {
        updateStateOptions(window.formState.country, window.formState.state_province);
    } else {
        updateStateOptions('Malaysia');
    }
    
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
    
    // Prepare review content if on step 10
    if (currentStep === totalSteps) {
        prepareReview();
    }
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
    const isStudent = state.applicant_type === 'student';

    const safe = (v) => {
        if (v === null || v === undefined) return '-';
        const s = String(v).trim();
        return s ? s : '-';
    };

    const yesNo = (v) => (v ? 'Yes' : 'No');

    const maskId = (idNumber) => {
        const raw = (idNumber || '').toString();
        if (!raw) return '-';
        if (raw.length <= 4) return `****${raw}`;
        return `****${raw.slice(-4)}`;
    };

    const renderRow = (label, value) => `
        <div class="py-2">
            <p class="text-gray-600 text-xs uppercase tracking-wide">${label}</p>
            <p class="font-semibold text-gray-800 break-words">${safe(value)}</p>
        </div>
    `;

    const hasValue = (v) => {
        if (v === null || v === undefined) return false;
        if (typeof v === 'boolean') return true;
        const s = String(v).trim();
        return s.length > 0;
    };

    const renderRowIfSet = (label, value) => (hasValue(value) ? renderRow(label, value) : '');

    const renderSection = (title, rowsHtml) => `
        <section class="border-t pt-4">
            <h3 class="font-semibold text-gray-800 mb-3">${title}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                ${rowsHtml}
            </div>
        </section>
    `;

    const planLabel = (plan) => {
        if (plan === 'plan_5') return 'Plan 5 (RM360,000)';
        if (plan === 'plan_6') return 'Plan 6 (RM600,000)';
        if (plan === 'plan_7') return 'Plan 7 (RM900,000)';
        return safe(plan).toUpperCase();
    };

    const applicantTypeLabel = (t) => {
        if (t === 'worker') return 'Foreign Worker';
        if (t === 'student') return 'Foreign Student';
        return safe(t);
    };
    
    let html = '';
    
    // Step 1 & 2: Category
    let categoryRows = '';
    categoryRows += renderRow('Applicant Type', applicantTypeLabel(state.applicant_type));
    if (isWorker) {
        categoryRows += renderRow('Worker Category', state.worker_category ? state.worker_category.replace('_', ' ').toUpperCase() : '-');
    }
    if (isStudent) {
        categoryRows += renderRow('Sponsorship Type', state.study_sponsor_type ? state.study_sponsor_type.replace('_', ' ').toUpperCase() : '-');
    }
    html += renderSection('Application Category', categoryRows);

    // Step 3: Personal Information
    let personalRows = '';
    personalRows += renderRow('Full Name', state.full_name);
    personalRows += renderRowIfSet('Preferred Name', state.preferred_name);
    personalRows += renderRow('Date of Birth', state.date_of_birth);
    personalRows += renderRow('Gender', state.gender === 'M' ? 'Male' : state.gender === 'F' ? 'Female' : state.gender || '-');
    personalRows += renderRowIfSet('Marital Status', state.marital_status ? state.marital_status.charAt(0).toUpperCase() + state.marital_status.slice(1) : '');
    personalRows += renderRow('Nationality', state.nationality);
    personalRows += renderRow('ID Type', state.id_type ? state.id_type.replace('_', ' ').toUpperCase() : '-');
    personalRows += renderRow('ID Number', maskId(state.id_number));
    html += renderSection('Personal & Identification', personalRows);

    // Step 4: Contact & Address
    let contactRows = '';
    contactRows += renderRow('Email Address', state.email);
    contactRows += renderRow('Phone Number', `${state.phone_country_code}${state.phone_number}`);
    contactRows += renderRow('Address', `${state.address_line_1}${state.address_line_2 ? ', ' + state.address_line_2 : ''}`);
    contactRows += renderRow('Location', `${state.city}, ${state.state_province} ${state.postcode}`);
    contactRows += renderRow('Country', state.country);
    html += renderSection('Contact & Address', contactRows);

    // Step 5: Professional / Educational Details
    if (isWorker) {
        let workerRows = '';
        workerRows += renderRow('Occupation', state.occupation);
        workerRows += renderRow('Industry', state.industry ? state.industry.charAt(0).toUpperCase() + state.industry.slice(1) : '-');
        workerRows += renderRow('Employer', state.employer_name);
        workerRows += renderRow('Monthly Salary', state.monthly_salary ? `RM ${state.monthly_salary}` : '-');
        workerRows += renderRow('Employment Type', state.employment_type ? state.employment_type.charAt(0).toUpperCase() + state.employment_type.slice(1) : '-');
        workerRows += renderRowIfSet('Experience', state.years_of_experience ? `${state.years_of_experience} years` : '');
        workerRows += renderRowIfSet('License #', state.professional_license_number);
        workerRows += renderRow('Permit Status', state.work_permit_status ? state.work_permit_status.charAt(0).toUpperCase() + state.work_permit_status.slice(1) : '-');
        workerRows += renderRowIfSet('Permit Expiry', state.work_permit_expiry_date);
        html += renderSection('Employment Details', workerRows);
    } else if (isStudent) {
        let studentRows = '';
        studentRows += renderRow('University', state.university_name);
        studentRows += renderRow('Study Level', state.study_level ? state.study_level.charAt(0).toUpperCase() + state.study_level.slice(1) : '-');
        studentRows += renderRow('Field of Study', state.field_of_study ? state.field_of_study.replace('_', ' ').toUpperCase() : '-');
        studentRows += renderRow('Course Name', state.course_of_study);
        studentRows += renderRow('Expected Graduation', state.expected_graduation);
        studentRows += renderRowIfSet('Stay Duration', state.intended_duration_months ? `${state.intended_duration_months} months` : '');
        studentRows += renderRow('Living Arrangement', state.on_campus_residential === 'true' ? 'On-Campus' : 'Off-Campus');
        html += renderSection('Education Details', studentRows);
    }

    // Step 6 & 7: Coverage
    let coverageRows = '';
    coverageRows += renderRow('Selected Plan', planLabel(state.plan));
    coverageRows += renderRow('Selected Add-ons', (state.addons && state.addons.length) ? state.addons.map(a => a.replace('_', ' ').charAt(0).toUpperCase() + a.replace('_', ' ').slice(1)).join(', ') : 'None');
    coverageRows += renderRow('Estimated Premium', `RM ${state.premium || '0.00'}/year`);
    html += renderSection('Coverage & Add-ons', coverageRows);

    // Step 8: Payment
    let paymentRows = '';
    paymentRows += renderRow('Preferred Method', state.preferred_payment_method ? state.preferred_payment_method.replace('_', ' ').toUpperCase() : 'Not Selected');
    html += renderSection('Payment Preference', paymentRows);

    // Step 9: Declarations
    let consentRows = '';
    consentRows += renderRow('Accuracy Confirmed', yesNo(state.accuracy_confirmation));
    consentRows += renderRow('PDPA Consent', yesNo(state.pdpa_consent));
    consentRows += renderRow('Terms Accepted', yesNo(state.terms_accepted));
    consentRows += renderRow('Marketing Updates', yesNo(state.marketing_opt_in));
    html += renderSection('Declarations & Consents', consentRows);

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

    // Prevent accidental double-submission
    if (window.__aspSubmissionInFlight) {
        notifyForm('Submission is already in progress. Please wait a moment.', 'info');
        return;
    }
    
    if (!validateStep(totalSteps)) {
        notifyForm('Please complete all required fields.', 'warning');
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';
    window.__aspSubmissionInFlight = true;
    
    // Prepare form data using centralized state manager
    const data = getFormSubmissionData();
    
    // Ensure numeric fields are correctly typed (send null if empty to avoid 400 error)
    data.monthly_salary = (data.monthly_salary && data.monthly_salary !== '') ? parseFloat(data.monthly_salary) : null;
    data.intended_duration_months = (data.intended_duration_months && data.intended_duration_months !== '') ? parseInt(data.intended_duration_months) : null;
    data.years_of_experience = (data.years_of_experience && data.years_of_experience !== '') ? parseInt(data.years_of_experience) : null;
    data.scholarship_award_amount = (data.scholarship_award_amount && data.scholarship_award_amount !== '') ? parseFloat(data.scholarship_award_amount) : null;
    
    // Final check for student flag (must match backend expectation)
    data.is_student = (data.applicant_type === 'student');
    
    // Submit via AJAX
    fetch('/api/applications/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(data),
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
                            <li>✓ Confirmation email sent to ${data.email || data.contact_email || 'your registered email address'}</li>
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
        // If DRF returned field errors, render them inline.
        if (error && typeof error === 'object' && !Array.isArray(error)) {
            applyApiValidationErrors(error);
            return;
        }

        // Otherwise show a friendly generic message
        const errorMsg = (error && (error.detail || error.message)) || 'We could not submit your application right now. Please try again in a moment.';
        if (typeof window.showAppBanner === 'function') {
            window.showAppBanner(errorMsg, 'error');
        }
        notifyForm(errorMsg, 'error');
    })
    .finally(() => {
        window.__aspSubmissionInFlight = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
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
