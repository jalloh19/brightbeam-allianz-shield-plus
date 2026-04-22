/**
 * Passport Photo Validator
 * Validates photo format, size, and EXIF date for Allianz Shield Plus
 * Supports: JPEG, PNG only
 * Max size: 10MB
 * Date requirement: Photo must be ≤ 6 months old (from EXIF date)
 */

// EXIF date parser - simple implementation
async function extractEXIFDate(file) {
    /**
     * Extract EXIF date from image file
     * Returns: Date object or null if no EXIF data found
     */
    return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                
                // Look for EXIF marker (FFE1)
                for (let i = 0; i < data.length - 1; i++) {
                    if (data[i] === 0xFF && data[i + 1] === 0xE1) {
                        // Found EXIF marker
                        // Try to parse DateTime tag (0x0132)
                        // Look for pattern: YYYY:MM:DD HH:MM:SS
                        const exifStr = String.fromCharCode.apply(null, data.slice(i, i + 500));
                        const dateMatch = exifStr.match(/\d{4}:\d{2}:\d{2}\s\d{2}:\d{2}:\d{2}/);
                        
                        if (dateMatch) {
                            const dateStr = dateMatch[0].replace(/:/g, '-').replace(' ', 'T');
                            const exifDate = new Date(dateStr);
                            if (!isNaN(exifDate.getTime())) {
                                resolve(exifDate);
                                return;
                            }
                        }
                    }
                }
                
                // No EXIF date found, return null
                resolve(null);
            } catch (err) {
                console.warn('Error parsing EXIF data:', err);
                resolve(null);
            }
        };
        
        reader.readAsArrayBuffer(file.slice(0, 65536)); // Read first 64KB for EXIF
    });
}

function validatePhotoFormat(file) {
    /**
     * Validate photo file format
     * Allowed: JPEG, PNG
     * 
     * Returns: {valid: boolean, message: string}
     */
    const allowedTypes = ['image/jpeg', 'image/png'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];
    
    // Check MIME type
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            message: 'Invalid file format. Please upload JPEG or PNG only.'
        };
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
        return {
            valid: false,
            message: 'Invalid file extension. Please upload JPEG or PNG only.'
        };
    }
    
    return {
        valid: true,
        message: ''
    };
}

function validatePhotoSize(file) {
    /**
     * Validate photo file size
     * Maximum: 10MB
     * 
     * Returns: {valid: boolean, message: string}
     */
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    const maxSizeMB = 10;
    
    if (file.size > maxSizeBytes) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        return {
            valid: false,
            message: `File size ${sizeMB}MB exceeds maximum of ${maxSizeMB}MB.`
        };
    }
    
    return {
        valid: true,
        message: ''
    };
}

async function validatePhotoDate(file) {
    /**
     * Validate photo date from EXIF metadata
     * Requirement: Photo must be ≤ 6 months old
     * Falls back to file upload date if EXIF unavailable
     * 
     * Returns: {valid: boolean, message: string, exifDate: Date|null}
     */
    const maxAgeMonths = 6;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - maxAgeMonths);
    
    let photoDate = null;
    let dateSource = 'file upload date';
    
    // Try to extract EXIF date
    try {
        photoDate = await extractEXIFDate(file);
        if (photoDate) {
            dateSource = 'photo metadata';
        }
    } catch (err) {
        console.warn('EXIF extraction failed, using file date:', err);
    }
    
    // Fall back to file modification date if EXIF not available
    if (!photoDate && file.lastModified) {
        photoDate = new Date(file.lastModified);
    }
    
    // If still no date, allow it (photo might be from scanner or special source)
    if (!photoDate) {
        return {
            valid: true,
            message: 'Photo date could not be determined, but acceptance allowed.',
            exifDate: null
        };
    }
    
    // Check if photo is too old
    if (photoDate < sixMonthsAgo) {
        const monthsOld = Math.floor((new Date() - photoDate) / (1000 * 60 * 60 * 24 * 30));
        return {
            valid: false,
            message: `Photo is ${monthsOld} months old (from ${dateSource}). Photos must be ≤ 6 months old.`,
            exifDate: photoDate
        };
    }
    
    return {
        valid: true,
        message: `Photo date verified: ${photoDate.toLocaleDateString()} (from ${dateSource})`,
        exifDate: photoDate
    };
}

async function validatePhotoComplete(file) {
    /**
     * Comprehensive photo validation
     * Checks: format, size, date
     * 
     * Returns: {valid: boolean, message: string, exifDate: Date|null, errors: string[]}
     */
    const errors = [];
    let exifDate = null;
    
    // Format check
    const formatCheck = validatePhotoFormat(file);
    if (!formatCheck.valid) {
        errors.push(formatCheck.message);
    }
    
    // Size check
    const sizeCheck = validatePhotoSize(file);
    if (!sizeCheck.valid) {
        errors.push(sizeCheck.message);
    }
    
    // Date check
    const dateCheck = await validatePhotoDate(file);
    if (!dateCheck.valid) {
        errors.push(dateCheck.message);
    }
    if (dateCheck.exifDate) {
        exifDate = dateCheck.exifDate;
    }
    
    return {
        valid: errors.length === 0,
        message: errors.length === 0 ? 'Photo validation passed ✓' : errors.join('\n'),
        exifDate: exifDate,
        errors: errors
    };
}

function showPhotoError(fieldName, message) {
    /**
     * Display photo validation error in UI
     */
    const container = document.getElementById(`${fieldName}-container`);
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (!errorElement) {
        const newError = document.createElement('div');
        newError.id = `${fieldName}-error`;
        newError.className = 'text-red-600 text-sm mt-2 flex items-center gap-1';
        newError.innerHTML = `<span>✗</span> <span>${message}</span>`;
        
        if (container) {
            container.appendChild(newError);
        }
    } else {
        errorElement.innerHTML = `<span>✗</span> <span>${message}</span>`;
        errorElement.style.display = 'block';
    }
    
    // Add error state to input
    const input = document.getElementById(fieldName);
    if (input) {
        input.classList.add('border-red-500', 'ring-red-500');
    }
}

function clearPhotoError(fieldName) {
    /**
     * Clear photo validation error from UI
     */
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    // Remove error state from input
    const input = document.getElementById(fieldName);
    if (input) {
        input.classList.remove('border-red-500', 'ring-red-500');
    }
}

function showPhotoSuccess(fieldName) {
    /**
     * Display photo validation success in UI
     */
    const successElement = document.getElementById(`${fieldName}-success`);
    
    if (!successElement) {
        const container = document.getElementById(`${fieldName}-container`);
        const newSuccess = document.createElement('div');
        newSuccess.id = `${fieldName}-success`;
        newSuccess.className = 'text-green-600 text-sm mt-2 flex items-center gap-1';
        newSuccess.innerHTML = '<span>✓</span> <span>Photo validated successfully</span>';
        
        if (container) {
            container.appendChild(newSuccess);
        }
    } else {
        successElement.style.display = 'block';
    }
    
    // Remove error state from input
    const input = document.getElementById(fieldName);
    if (input) {
        input.classList.remove('border-red-500', 'ring-red-500');
        input.classList.add('border-green-500', 'ring-green-500');
    }
}

/**
 * Export functions for use in other modules
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validatePhotoFormat,
        validatePhotoSize,
        validatePhotoDate,
        validatePhotoComplete,
        showPhotoError,
        clearPhotoError,
        showPhotoSuccess,
        extractEXIFDate
    };
}
