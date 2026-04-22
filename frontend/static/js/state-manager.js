/**
 * State Manager - Manages form state with localStorage persistence
 * Auto-saves every 30 seconds and on every change
 */

// Initialize global form state object
window.formState = {
    // Basic fields
    applicant_type: '',
    
    // Category selection
    worker_category: '',
    study_sponsor_type: '',
    
    // Personal information
    full_name: '',
    preferred_name: '',
    date_of_birth: '',
    nationality: '',
    nationality_other: '',
    gender: '',
    marital_status: '',
    id_type: '',
    id_number: '',
    passport_photo_url: '',
    passport_photo_exif_date: '',
    
    // Contact information
    email: '',
    phone_country_code: '+60',
    phone_number: '',
    
    // Address information
    address_line_1: '',
    address_line_2: '',
    city: '',
    state_province: '',
    postcode: '',
    country: 'Malaysia',
    
    // Worker fields
    occupation: '',
    industry: '',
    employer_name: '',
    employer_registration_number: '',
    monthly_salary: '',
    employment_type: '',
    years_of_experience: '',
    professional_license_number: '',
    work_permit_status: '',
    work_permit_expiry_date: '',
    worker_category: '',
    
    // Student fields
    university_name: '',
    study_level: '',
    field_of_study: '',
    course_of_study: '',
    expected_graduation: '',
    intended_duration_months: '',
    on_campus_residential: '',
    study_sponsor_type: '',
    
    // Coverage
    plan: 'plan_6',
    addons: [],
    premium: 0,
    
    // Payment
    preferred_payment_method: '',
    
    // Declaration
    accuracy_confirmation: false,
    pdpa_consent: false,
    terms_accepted: false,
    marketing_opt_in: false
};

const STORAGE_KEY = 'asp_form_state';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds
let autoSaveTimer = null;

// Load form state from localStorage
function loadFormState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            window.formState = { ...window.formState, ...parsed };
            populateFormFields();
        }
    } catch (e) {
        console.error('Error loading form state:', e);
    }
}

// Save form state to localStorage
function saveFormState() {
    try {
        // Update state from form fields
        updateFormStateFromFields();
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.formState));
        
        // Reset auto-save timer
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            console.log('Auto-saved form state');
        }, AUTO_SAVE_INTERVAL);
    } catch (e) {
        console.error('Error saving form state:', e);
    }
}

// Update form state from form fields
function updateFormStateFromFields() {
    const form = document.getElementById('asp-form');
    if (!form) return;
    
    // Text inputs
    const textInputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input[type="date"]');
    textInputs.forEach(input => {
        if (input.name) {
            window.formState[input.name] = input.value;
        }
    });
    // Special handling for nationality
    const natSelect = form.querySelector('select[name="nationality"]');
    const natOther = form.querySelector('input[name="nationality_other"]');
    if (natSelect && natOther) {
        if (natSelect.value === 'Other') {
            window.formState.nationality = natOther.value;
        } else {
            window.formState.nationality = natSelect.value;
        }
    }
    
    // Selects
    const selects = form.querySelectorAll('select');
    selects.forEach(select => {
        if (select.name) {
            // Handle multi-select if needed
            if (select.hasAttribute('multiple')) {
                window.formState[select.name] = Array.from(select.selectedOptions).map(o => o.value);
            } else {
                window.formState[select.name] = select.value;
            }
        }
    });
    
    // Radio buttons
    const radios = form.querySelectorAll('input[type="radio"]:checked');
    radios.forEach(radio => {
        if (radio.name) {
            window.formState[radio.name] = radio.value;
        }
    });
    
    // Checkboxes (for add-ons)
    const addonCheckboxes = form.querySelectorAll('input[name="addons"]:checked');
    window.formState.addons = Array.from(addonCheckboxes).map(cb => cb.value);
    
    // Declaration checkboxes
    const declarationCheckboxes = form.querySelectorAll('input[type="checkbox"]');
    declarationCheckboxes.forEach(checkbox => {
        if (checkbox.name && checkbox.name.includes('_') && !checkbox.name.includes('addons')) {
            window.formState[checkbox.name] = checkbox.checked;
        }
    });
}

// Populate form fields from state
function populateFormFields() {
    const form = document.getElementById('asp-form');
    if (!form) return;
    
    const state = window.formState;
    
    // Text inputs
    Object.keys(state).forEach(key => {
        // Nationality special handling
        if (key === 'nationality') {
            const natSelect = form.querySelector('select[name="nationality"]');
            const natOther = form.querySelector('input[name="nationality_other"]');
            if (natSelect && natOther) {
                const found = Array.from(natSelect.options).some(opt => opt.value === state.nationality);
                if (found) {
                    natSelect.value = state.nationality;
                    natOther.classList.add('hidden');
                    natOther.value = '';
                } else if (state.nationality) {
                    natSelect.value = 'Other';
                    natOther.classList.remove('hidden');
                    natOther.value = state.nationality;
                } else {
                    natSelect.value = '';
                    natOther.classList.add('hidden');
                    natOther.value = '';
                }
            }
            return;
        }
        const input = form.querySelector(`input[name="${key}"], select[name="${key}"], textarea[name="${key}"]`);
        if (input && typeof state[key] === 'string') {
            input.value = state[key];
        }
    });
    
    // Radio buttons
    Object.keys(state).forEach(key => {
        if (typeof state[key] === 'string') {
            const radio = form.querySelector(`input[name="${key}"][value="${state[key]}"]`);
            if (radio && radio.type === 'radio') {
                radio.checked = true;
            }
        }
    });
    
    // Checkboxes
    Object.keys(state).forEach(key => {
        if (typeof state[key] === 'boolean') {
            const checkbox = form.querySelector(`input[name="${key}"]`);
            if (checkbox && checkbox.type === 'checkbox') {
                checkbox.checked = state[key];
            }
        }
    });
    
    // Add-ons checkboxes
    if (state.addons && Array.isArray(state.addons)) {
        state.addons.forEach(addon => {
            const checkbox = form.querySelector(`input[name="addons"][value="${addon}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
}

// Clear form state
function clearFormState() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        window.formState = getDefaultFormState();
    } catch (e) {
        console.error('Error clearing form state:', e);
    }
}

// Get default form state
function getDefaultFormState() {
    return {
        applicant_type: '',
        worker_category: '',
        study_sponsor_type: '',
        full_name: '',
        preferred_name: '',
        date_of_birth: '',
        nationality: '',
        gender: '',
        marital_status: '',
        id_type: '',
        id_number: '',
        email: '',
        phone_country_code: '+60',
        phone_number: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state_province: '',
        postcode: '',
        country: 'Malaysia',
        occupation: '',
        industry: '',
        employer_name: '',
        employer_registration_number: '',
        monthly_salary: '',
        employment_type: '',
        years_of_experience: '',
        professional_license_number: '',
        work_permit_status: '',
        work_permit_expiry_date: '',
        university_name: '',
        study_level: '',
        field_of_study: '',
        course_of_study: '',
        expected_graduation: '',
        intended_duration_months: '',
        on_campus_residential: '',
        preferred_payment_method: '',
        plan: 'plan_6',
        addons: [],
        premium: 0,
        accuracy_confirmation: false,
        pdpa_consent: false,
        terms_accepted: false,
        marketing_opt_in: false
    };
}

// Get form state for submission
function getFormState() {
    updateFormStateFromFields();
    return window.formState;
}

// Get form submission data (clean format)
function getFormSubmissionData() {
    const state = getFormState();
    
    const data = {
        applicant_type: state.applicant_type,
        full_name: state.full_name,
        preferred_name: state.preferred_name,
        email: state.email,
        phone_country_code: state.phone_country_code,
        phone_number: state.phone_number,
        date_of_birth: state.date_of_birth,
        gender: state.gender,
        marital_status: state.marital_status,
        nationality: state.nationality,
        id_type: state.id_type,
        id_number: state.id_number,
        passport_photo_url: state.passport_photo_url,
        address_line_1: state.address_line_1,
        address_line_2: state.address_line_2,
        city: state.city,
        state_province: state.state_province,
        postcode: state.postcode,
        country: state.country,
        plan: state.plan,
        coverage_addons: {}, // Will populate below
        preferred_payment_method: state.preferred_payment_method || '',
        pdpa_consent: state.pdpa_consent,
        terms_accepted: state.terms_accepted,
        marketing_opt_in: state.marketing_opt_in
    };
    
    // Map addons array to coverage_addons dict with costs
    if (state.addons && Array.isArray(state.addons)) {
        const costs = {
            'employment_protection': 50, 'occupational_injury': 35,
            'professional_liability': 40, 'family_coverage': 80,
            'study_interruption': 50, 'education_protection': 40,
            'family_emergency': 35, 'scholarship_protection': 60
        };
        state.addons.forEach(addon => {
            if (costs[addon]) data.coverage_addons[addon] = costs[addon];
        });
    }
    
    // Add worker fields if applicable
    if (state.applicant_type === 'worker') {
        data.applicant_type = 'worker';
        data.worker_category = state.worker_category;
        data.occupation = state.occupation;
        data.industry = state.industry;
        data.employer_name = state.employer_name;
        data.monthly_salary = parseFloat(state.monthly_salary) || 0;
        data.employment_type = state.employment_type;
        data.years_of_experience = parseInt(state.years_of_experience) || 0;
        data.professional_license_number = state.professional_license_number;
        data.work_permit_status = state.work_permit_status;
        data.work_permit_expiry_date = state.work_permit_expiry_date;
    }
    
    // Add student fields if applicable
    if (state.applicant_type === 'student') {
        data.is_student = true;
        data.study_sponsor_type = state.study_sponsor_type;
        data.university_name = state.university_name;
        data.study_level = state.study_level;
        data.field_of_study = state.field_of_study;
        data.course_of_study = state.course_of_study;
        data.expected_graduation = state.expected_graduation;
        data.intended_duration_months = parseInt(state.intended_duration_months) || 0;
        data.on_campus_residential = state.on_campus_residential === 'true';
    }
    
    return data;
}

// Initialize auto-save on form change
function initializeAutoSave() {
    const form = document.getElementById('asp-form');
    if (!form) return;
    
    // Save on input/change
    form.addEventListener('change', saveFormState);
    form.addEventListener('input', saveFormState);
    
    // Also save on window unload
    window.addEventListener('beforeunload', saveFormState);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    loadFormState();
    initializeAutoSave();
    populateFormFields();
});

// Export functions
window.loadFormState = loadFormState;
window.saveFormState = saveFormState;
window.clearFormState = clearFormState;
window.getFormState = getFormState;
window.getFormSubmissionData = getFormSubmissionData;
window.updateFormStateFromFields = updateFormStateFromFields;
window.populateFormFields = populateFormFields;
