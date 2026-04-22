/**
 * Validation Script - Validates form fields with helpful error messages
 * Implements step-by-step validation
 */

// Validation rules by step
const validationRules = {
    1: {
        fields: ['applicant_type'],
        messages: {
            applicant_type: 'Please select whether you are a worker or student'
        }
    },
    2: {
        fields: ['worker_category', 'study_sponsor_type'],
        messages: {
            worker_category: 'Please select your job category',
            study_sponsor_type: 'Please select your sponsorship type'
        }
    },
    3: {
        fields: ['full_name', 'date_of_birth', 'nationality', 'gender', 'id_type', 'id_number', 'passport_photo_url'],
        messages: {
            full_name: 'Please enter your full name',
            date_of_birth: 'Please enter a valid date of birth (must be 18+)',
            nationality: 'Please select your nationality',
            gender: 'Please select your gender',
            id_type: 'Please select your ID type',
            id_number: 'Please enter your ID number',
            passport_photo_url: 'Please upload a valid passport photo'
        },
        validators: {
            date_of_birth: validateAge,
            id_number: validateIDNumber,
            passport_photo_url: validatePassportPhotoField
        }
    },
    4: {
        fields: ['email', 'phone_number', 'address_line_1', 'city', 'state_province', 'postcode', 'country'],
        messages: {
            email: 'Please enter a valid email address',
            phone_number: 'Please enter a valid phone number',
            address_line_1: 'Please enter your address',
            city: 'Please enter your city',
            state_province: 'Please select your state/province',
            postcode: 'Please enter a valid postcode',
            country: 'Please select your country'
        },
        validators: {
            email: validateEmail,
            phone_number: validatePhoneNumber,
            postcode: validatePostcode
        }
    },
    5: {
        fields: [],
        messages: {},
        conditionalValidators: {
            worker: ['occupation', 'industry', 'employer_name', 'monthly_salary', 'employment_type', 'work_permit_status'],
            student: ['university_name', 'study_level', 'field_of_study', 'course_of_study', 'expected_graduation']
        }
    },
    6: {
        fields: ['plan'],
        messages: {
            plan: 'Please select a coverage plan'
        }
    },
    7: {
        fields: [],
        messages: {}
    },
    8: {
        fields: ['accuracy_confirmation', 'pdpa_consent', 'terms_accepted'],
        messages: {
            accuracy_confirmation: 'You must confirm the information is accurate',
            pdpa_consent: 'You must consent to data processing (PDPA)',
            terms_accepted: 'You must accept the Terms and Conditions'
        },
        validators: {
            accuracy_confirmation: validateCheckbox,
            pdpa_consent: validateCheckbox,
            terms_accepted: validateCheckbox
        }
    }
};

// Validate entire step
function validateStep(step) {
    const rules = validationRules[step];
    if (!rules) return true;
    
    // Check basic fields
    for (const fieldName of rules.fields) {
        if (step === 5) {
            // Skip step 5 basic validation - it's conditional
            continue;
        }
        
        if (!validateField(fieldName, rules.validators ? rules.validators[fieldName] : null)) {
            return false;
        }
    }
    
    // Check conditional validators for step 5
    if (step === 5) {
        const state = window.formState || {};
        const fieldsToValidate = state.applicant_type === 'worker' 
            ? rules.conditionalValidators.worker 
            : rules.conditionalValidators.student;
        
        for (const fieldName of fieldsToValidate) {
            if (!validateField(fieldName)) {
                return false;
            }
        }
    }
    
    return true;
}

// Validate individual field
function validateField(fieldName, customValidator = null) {
    const form = document.getElementById('asp-form');
    const input = form ? form.querySelector(`[name="${fieldName}"]`) : null;
    
    if (!input) {
        return true; // Field not on current step
    }
    
    // Check if field is visible (not in a hidden section)
    let parent = input.parentElement;
    while (parent && !parent.classList.contains('form-step')) {
        if (parent.classList.contains('hidden') || parent.style.display === 'none') {
            return true; // Field is hidden, skip validation
        }
        parent = parent.parentElement;
    }
    
    // Get value
    let value = input.value.trim();
    
    // Handle checkboxes
    if (input.type === 'checkbox') {
        value = input.checked;
    }
    
    // Check required
    if (input.hasAttribute('required') && !value) {
        showFieldError(fieldName, `${fieldName.replace(/_/g, ' ')} is required`);
        return false;
    }
    
    // Check custom validator
    if (customValidator && value) {
        const validation = customValidator(value, fieldName);
        if (!validation.valid) {
            showFieldError(fieldName, validation.message);
            return false;
        }
    }
    
    clearFieldError(fieldName);
    return true;
}

// Show field error
function showFieldError(fieldName, message) {
    const form = document.getElementById('asp-form');
    const input = form ? form.querySelector(`[name="${fieldName}"]`) : null;
    
    if (!input) return;
    
    // Remove existing error
    clearFieldError(fieldName);
    
    // Add error state
    input.classList.add('border-red-500');
    
    // Create error message
    const errorDiv = document.createElement('p');
    errorDiv.className = 'form-error';
    errorDiv.innerHTML = `<span class="text-red-600 text-sm mt-1">✗ ${message}</span>`;
    errorDiv.id = `error_${fieldName}`;
    
    input.parentElement.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(fieldName) {
    const form = document.getElementById('asp-form');
    const input = form ? form.querySelector(`[name="${fieldName}"]`) : null;
    
    if (!input) return;
    
    // Remove error state
    input.classList.remove('border-red-500');
    
    // Remove error message
    const errorDiv = document.getElementById(`error_${fieldName}`);
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Validator functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Please enter a valid email address' };
    }
    return { valid: true };
}

function validatePhoneNumber(phone) {
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        return { valid: false, message: 'Please enter a valid phone number' };
    }
    return { valid: true };
}

function validatePostcode(postcode, fieldName) {
    const country = document.querySelector('input[name="country"]')?.value || 'Malaysia';
    
    if (country === 'Malaysia') {
        if (!/^\d{5}$/.test(postcode)) {
            return { valid: false, message: 'Malaysian postcode must be 5 digits (e.g., 50000)' };
        }
    }
    return { valid: true };
}

function validateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 18) {
        return { valid: false, message: 'You must be at least 18 years old' };
    }
    
    if (age > 100) {
        return { valid: false, message: 'Please enter a valid date of birth' };
    }
    
    return { valid: true };
}

function validateIDNumber(idNumber) {
    if (idNumber.length < 3) {
        return { valid: false, message: 'ID number is too short' };
    }
    if (idNumber.length > 50) {
        return { valid: false, message: 'ID number is too long' };
    }
    return { valid: true };
}

function validateCheckbox(checked) {
    if (!checked) {
        return { valid: false, message: 'This consent is required' };
    }
    return { valid: true };
}

function validatePassportPhotoField() {
    /**
     * Validate passport photo field
     * Checks if photo URL has been successfully uploaded
     */
    const photoUrl = document.getElementById('passport_photo_url');
    if (!photoUrl || !photoUrl.value) {
        return { valid: false, message: 'Please upload a passport photo' };
    }
    
    // Check if URL is from Uploadcare
    if (!photoUrl.value.includes('ucarecdn.com')) {
        return { valid: false, message: 'Photo must be uploaded through the system' };
    }
    
    return { valid: true };
}

// Attach real-time validation listeners
function attachValidationListeners() {
    const form = document.getElementById('asp-form');
    if (!form) return;
    
    form.addEventListener('blur', function(event) {
        if (event.target.name) {
            validateField(event.target.name);
        }
    }, true);
    
    // Validate on change for selects
    form.addEventListener('change', function(event) {
        if (event.target.tagName === 'SELECT') {
            validateField(event.target.name);
        }
    }, true);
}

// Initialize validation on document ready
document.addEventListener('DOMContentLoaded', function() {
    attachValidationListeners();
});

// Export functions
window.validateStep = validateStep;
window.validateField = validateField;
window.showFieldError = showFieldError;
window.clearFieldError = clearFieldError;
window.validateEmail = validateEmail;
window.validatePhoneNumber = validatePhoneNumber;
window.validatePostcode = validatePostcode;
window.validateAge = validateAge;
window.validateIDNumber = validateIDNumber;
window.validateCheckbox = validateCheckbox;
window.validatePassportPhotoField = validatePassportPhotoField;
