/**
 * Field Visibility Logic - Shows/hides fields based on category and selections
 * Implements progressive disclosure pattern
 */

function updateFieldVisibility() {
    const state = window.formState || {};
    const applicantType = state.applicant_type;
    const workerCategory = state.worker_category;
    const studySponsorType = state.study_sponsor_type;
    
    // Step 2: Show correct category selection section
    const workerCategorySection = document.getElementById('worker-category-section');
    const studentSponsorSection = document.getElementById('student-sponsor-section');
    
    if (workerCategorySection) {
        workerCategorySection.classList.toggle('hidden', applicantType !== 'worker');
    }
    if (studentSponsorSection) {
        studentSponsorSection.classList.toggle('hidden', applicantType !== 'student');
    }
    
    // Step 5: Show correct category details
    const workerDetailsSection = document.getElementById('worker-details-section');
    const studentDetailsSection = document.getElementById('student-details-section');
    
    if (workerDetailsSection) {
        workerDetailsSection.classList.toggle('hidden', applicantType !== 'worker');
    }
    if (studentDetailsSection) {
        studentDetailsSection.classList.toggle('hidden', applicantType !== 'student');
    }
    
    // Worker-specific field visibility
    if (applicantType === 'worker') {
        updateWorkerFieldVisibility(workerCategory);
    }
    
    // Student-specific field visibility
    if (applicantType === 'student') {
        updateStudentFieldVisibility(studySponsorType);
    }
    
    // Step 6: Show correct add-ons
    const workerAddons = document.getElementById('worker-addons');
    const studentAddons = document.getElementById('student-addons');
    
    if (workerAddons) {
        workerAddons.classList.toggle('hidden', applicantType !== 'worker');
    }
    if (studentAddons) {
        studentAddons.classList.toggle('hidden', applicantType !== 'student');
    }
    
    // Show scholarship protection add-on only for scholarship students
    const scholarshipAddon = document.getElementById('addon-scholarship-protection');
    if (scholarshipAddon) {
        scholarshipAddon.classList.toggle('hidden', studySponsorType !== 'scholarship');
    }
    
    // Show professional liability add-on only for Category 1 workers
    const profLiabilityAddon = document.getElementById('addon-professional-liability');
    if (profLiabilityAddon) {
        profLiabilityAddon.classList.toggle('hidden', workerCategory !== 'category_1');
    }
}

function updateWorkerFieldVisibility(workerCategory) {
    // Category 1 fields
    const category1Section = document.getElementById('category1-section');
    if (category1Section) {
        category1Section.classList.toggle('hidden', workerCategory !== 'category_1');
    }
    
    // Category 3 warning
    const category3Warning = document.getElementById('category3-warning');
    if (category3Warning) {
        category3Warning.classList.toggle('hidden', workerCategory !== 'category_3');
    }
}

function updateStudentFieldVisibility(studySponsorType) {
    // This can be extended for sponsor-specific fields if needed
    // Currently, all student fields are shown regardless of sponsor type
}

// Helper function to show field with animation
function showField(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        const wrapper = field.closest('.hidden');
        if (wrapper) {
            wrapper.classList.remove('hidden');
            wrapper.classList.add('fade-in');
        }
    }
}

// Helper function to hide field
function hideField(fieldName) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
        const wrapper = field.closest('[class*="hidden"]');
        if (wrapper) {
            wrapper.classList.add('fade-out');
            setTimeout(() => {
                wrapper.classList.add('hidden');
                wrapper.classList.remove('fade-out');
            }, 300);
        }
    }
}

// Helper function to show warning
function showWarning(warningId) {
    const warning = document.getElementById(warningId);
    if (warning) {
        warning.classList.remove('hidden');
        warning.classList.add('fade-in');
    }
}

// Helper function to hide warning
function hideWarning(warningId) {
    const warning = document.getElementById(warningId);
    if (warning) {
        warning.classList.add('fade-out');
        setTimeout(() => {
            warning.classList.add('hidden');
            warning.classList.remove('fade-out');
        }, 300);
    }
}

// Export functions for use in other modules
window.updateFieldVisibility = updateFieldVisibility;
window.showField = showField;
window.hideField = hideField;
window.showWarning = showWarning;
window.hideWarning = hideWarning;
