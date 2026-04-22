/**
 * Premium Calculator - Calculates insurance premium based on selected options
 * Implements complex premium calculation with multiple adjustment factors
 */

function calculatePremium() {
    const state = window.formState || {};
    
    // Base premium by plan
    const basePremiums = {
        'plan_5': 360,
        'plan_6': 480,
        'plan_7': 720
    };
    
    let plan = state.plan || 'plan_6';
    let premium = basePremiums[plan] || 480;
    
    // Display base premium
    const baseDisplay = document.getElementById('base_premium');
    if (baseDisplay) {
        baseDisplay.textContent = basePremiums[plan] || 480;
    }
    
    // Calculate adjustments based on applicant type
    if (state.applicant_type === 'worker') {
        premium = calculateWorkerPremium(premium, state);
    } else if (state.applicant_type === 'student') {
        premium = calculateStudentPremium(premium, state);
    }
    
    // Add add-ons cost
    if (state.addons && Array.isArray(state.addons)) {
        const addonCosts = {
            'employment_protection': 50,
            'occupational_injury': 35,
            'professional_liability': 40,
            'family_coverage': 80,
            'study_interruption': 50,
            'education_protection': 40,
            'family_emergency': 35,
            'scholarship_protection': 60
        };
        
        state.addons.forEach(addon => {
            if (addonCosts[addon]) {
                premium += addonCosts[addon];
            }
        });
    }
    
    // Store premium in state
    state.premium = Math.round(premium * 100) / 100; // Round to 2 decimal places
    
    // Update display
    updatePremiumDisplay(premium);
}

function calculateWorkerPremium(basePremium, state) {
    let premium = basePremium;
    
    // Worker category multiplier
    const categoryMultipliers = {
        'category_1': 1.0,    // High-skilled = base rate
        'category_2': 1.15,   // Skilled = +15%
        'category_3': 1.35    // General = +35%
    };
    
    const categoryMultiplier = categoryMultipliers[state.worker_category] || 1.0;
    premium *= categoryMultiplier;
    
    // Industry adjustment
    const industryAdjustments = {
        'technology': 0.95,
        'finance': 0.95,
        'healthcare': 1.05,
        'construction': 1.25,
        'manufacturing': 1.15,
        'hospitality': 1.10,
        'retail': 1.05,
        'education': 0.95,
        'other': 1.0
    };
    
    const industryMultiplier = industryAdjustments[state.industry] || 1.0;
    premium *= industryMultiplier;
    
    // Employment type adjustment
    const employmentAdjustments = {
        'permanent': 1.0,
        'contract': 1.05,
        'freelance': 1.20,
        'temporary': 1.15
    };
    
    const employmentMultiplier = employmentAdjustments[state.employment_type] || 1.0;
    premium *= employmentMultiplier;
    
    // Monthly salary adjustment
    const salary = parseFloat(state.monthly_salary) || 0;
    if (salary > 10000) {
        premium *= 1.10;  // Higher income = higher coverage
    } else if (salary < 2000) {
        premium *= 0.90;  // Lower income = lower premium
    }
    
    // Professional license discount
    if (state.professional_license_number && state.professional_license_number.trim()) {
        premium *= 0.95;  // 5% discount for professionals
    }
    
    // Update breakdown display
    updateWorkerPremiumBreakdown(basePremium, categoryMultiplier, industryMultiplier, state);
    
    return premium;
}

function calculateStudentPremium(basePremium, state) {
    let premium = basePremium;
    
    // Study sponsor discount
    const sponsorDiscounts = {
        'self_sponsored': 1.0,      // Base rate
        'scholarship': 0.90,        // 10% discount
        'employer_sponsored': 0.95  // 5% discount
    };
    
    const sponsorMultiplier = sponsorDiscounts[state.study_sponsor_type] || 1.0;
    premium *= sponsorMultiplier;
    
    // Study level multiplier
    const levelMultipliers = {
        'diploma': 1.0,
        'bachelor': 1.0,
        'master': 1.20,
        'phd': 1.30,
        'certificate': 0.80
    };
    
    const levelMultiplier = levelMultipliers[state.study_level] || 1.0;
    premium *= levelMultiplier;
    
    // Duration adjustment
    const durationMonths = parseInt(state.intended_duration_months) || 48;
    if (durationMonths > 48) {
        premium *= 1.08;  // Longer programs = slight increase
    } else if (durationMonths < 12) {
        premium *= 0.90;  // Shorter programs = discount
    } else if (durationMonths >= 24 && durationMonths <= 48) {
        premium *= 1.05;  // Standard 2-4 year programs
    }
    
    // Residential status adjustment
    const residentialStatus = state.on_campus_residential;
    if (residentialStatus === 'true' || residentialStatus === true) {
        premium *= 0.95;  // On-campus = slightly lower risk
    } else if (residentialStatus === 'false' || residentialStatus === false) {
        premium *= 1.05;  // Off-campus = slightly higher risk
    }
    
    // Update breakdown display
    updateStudentPremiumBreakdown(basePremium, sponsorMultiplier, levelMultiplier, state);
    
    return premium;
}

function updateWorkerPremiumBreakdown(basePremium, categoryMultiplier, industryMultiplier, state) {
    const categoryAdjText = document.getElementById('category_adj_text');
    const industryAdjText = document.getElementById('industry_adj_text');
    
    if (categoryAdjText) {
        let adjLabel = '';
        if (state.worker_category === 'category_1') {
            adjLabel = 'High-skilled professional (1.0x)';
        } else if (state.worker_category === 'category_2') {
            adjLabel = 'Skilled technician (+15%)';
        } else if (state.worker_category === 'category_3') {
            adjLabel = 'General worker (+35%)';
        }
        categoryAdjText.textContent = adjLabel;
    }
    
    if (industryAdjText) {
        let industryName = state.industry || 'General';
        let adjPercent = ((industryMultiplier - 1) * 100).toFixed(0);
        if (adjPercent > 0) {
            industryAdjText.textContent = `${industryName} (+${adjPercent}%)`;
        } else if (adjPercent < 0) {
            industryAdjText.textContent = `${industryName} (${adjPercent}%)`;
        } else {
            industryAdjText.textContent = `${industryName} (no change)`;
        }
    }
}

function updateStudentPremiumBreakdown(basePremium, sponsorMultiplier, levelMultiplier, state) {
    const categoryAdjText = document.getElementById('category_adj_text');
    const industryAdjText = document.getElementById('industry_adj_text');
    
    if (categoryAdjText) {
        let sponsorLabel = '';
        if (state.study_sponsor_type === 'self_sponsored') {
            sponsorLabel = 'Self-sponsored (base rate)';
        } else if (state.study_sponsor_type === 'scholarship') {
            sponsorLabel = 'Scholarship-funded (-10%)';
        } else if (state.study_sponsor_type === 'employer_sponsored') {
            sponsorLabel = 'Employer-sponsored (-5%)';
        }
        categoryAdjText.textContent = sponsorLabel;
    }
    
    if (industryAdjText) {
        let levelName = state.study_level || 'General';
        let adjPercent = ((levelMultiplier - 1) * 100).toFixed(0);
        if (adjPercent > 0) {
            industryAdjText.textContent = `${levelName} level (+${adjPercent}%)`;
        } else if (adjPercent < 0) {
            industryAdjText.textContent = `${levelName} level (${adjPercent}%)`;
        } else {
            industryAdjText.textContent = `${levelName} level (no change)`;
        }
    }
}

function updatePremiumDisplay(premium) {
    const annualPremiumEl = document.getElementById('annual_premium');
    const monthlyPremiumEl = document.getElementById('monthly_premium');
    
    const annualAmount = Math.round(premium * 100) / 100;
    const monthlyAmount = Math.round((premium / 12) * 100) / 100;
    
    if (annualPremiumEl) {
        annualPremiumEl.textContent = annualAmount.toFixed(0);
    }
    
    if (monthlyPremiumEl) {
        monthlyPremiumEl.textContent = monthlyAmount.toFixed(2);
    }
}

// Export functions
window.calculatePremium = calculatePremium;
window.calculateWorkerPremium = calculateWorkerPremium;
window.calculateStudentPremium = calculateStudentPremium;
