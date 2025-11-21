/**
 * Validation Utilities for Shinhan Finance Platform
 * Centralized validation functions for forms
 */

/**
 * Validate email address with simplified regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateEmail(email) {
    // Simplified email regex - more maintainable
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate Vietnamese phone number
 * Accepts formats: 0XXX XXX XXX, 0XXXXXXXXX, +84XXX XXX XXX
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateVietnamesePhone(phone) {
    // Remove spaces and special characters for validation
    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    
    // Vietnamese phone patterns:
    // - Mobile: starts with 03, 05, 07, 08, 09 (10 digits total)
    // - Landline: starts with 02 (10 digits total)
    // - International: +84 followed by 9 digits
    const phoneRegex = /^(?:\+84|0)(?:3|5|7|8|9|2)\d{8}$/;
    
    return phoneRegex.test(cleanPhone);
}

/**
 * Validate Vietnamese ID card number (CMND/CCCD)
 * @param {string} idNumber - ID card number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
function validateVietnameseID(idNumber) {
    // CMND: 9 or 12 digits
    // CCCD: 12 digits
    const cleanId = idNumber.replace(/\s/g, '');
    const idRegex = /^\d{9}$|^\d{12}$/;
    
    return idRegex.test(cleanId);
}

/**
 * Validate loan amount
 * @param {number} amount - Loan amount to validate
 * @param {number} min - Minimum allowed amount (default: 5000000 VND)
 * @param {number} max - Maximum allowed amount (default: 900000000 VND)
 * @returns {object} - {valid: boolean, message: string}
 */
function validateLoanAmount(amount, min = 5000000, max = 900000000) {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount)) {
        return { valid: false, message: 'Vui lòng nhập số tiền hợp lệ' };
    }
    
    if (numAmount < min) {
        return { 
            valid: false, 
            message: `Số tiền vay tối thiểu là ${formatCurrency(min)}` 
        };
    }
    
    if (numAmount > max) {
        return { 
            valid: false, 
            message: `Số tiền vay tối đa là ${formatCurrency(max)}` 
        };
    }
    
    return { valid: true, message: '' };
}

/**
 * Validate loan term in months
 * @param {number} months - Number of months
 * @param {number} min - Minimum months (default: 6)
 * @param {number} max - Maximum months (default: 60)
 * @returns {object} - {valid: boolean, message: string}
 */
function validateLoanTerm(months, min = 6, max = 60) {
    const numMonths = parseInt(months);
    
    if (isNaN(numMonths)) {
        return { valid: false, message: 'Vui lòng nhập số tháng hợp lệ' };
    }
    
    if (numMonths < min || numMonths > max) {
        return { 
            valid: false, 
            message: `Thời hạn vay từ ${min} đến ${max} tháng` 
        };
    }
    
    return { valid: true, message: '' };
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return input;
    }
    
    // Create a temporary div to use browser's built-in HTML encoding
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Format currency in Vietnamese Dong
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Validate date of birth (must be 18+ years old)
 * @param {string} dateString - Date string in format YYYY-MM-DD
 * @returns {object} - {valid: boolean, message: string}
 */
function validateDateOfBirth(dateString) {
    const birthDate = new Date(dateString);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
        return { valid: false, message: 'Ngày sinh không hợp lệ' };
    }
    
    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 18) {
        return { valid: false, message: 'Bạn phải từ 18 tuổi trở lên' };
    }
    
    if (age > 100) {
        return { valid: false, message: 'Ngày sinh không hợp lệ' };
    }
    
    return { valid: true, message: '' };
}

/**
 * Display validation error on a field
 * @param {string} fieldId - ID of the input field
 * @param {string} message - Error message to display
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Remove existing error
    removeFieldError(fieldId);
    
    // Add error class
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error field-error';
    errorDiv.id = `${fieldId}-error`;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.textContent = message;
    
    // Insert error after field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
    
    // Associate error with field for screen readers
    field.setAttribute('aria-describedby', `${fieldId}-error`);
}

/**
 * Remove validation error from a field
 * @param {string} fieldId - ID of the input field
 */
function removeFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    // Remove error class
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    
    // Remove error message
    const errorDiv = document.getElementById(`${fieldId}-error`);
    if (errorDiv) {
        errorDiv.remove();
    }
}

/**
 * Validate form field in real-time
 * @param {string} fieldId - ID of the field
 * @param {string} validationType - Type of validation (email, phone, idNumber, etc.)
 */
function validateFieldRealtime(fieldId, validationType) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.addEventListener('blur', function() {
        const value = this.value.trim();
        
        if (!value) {
            removeFieldError(fieldId);
            return;
        }
        
        let isValid = false;
        let message = '';
        
        switch(validationType) {
            case 'email':
                isValid = validateEmail(value);
                message = 'Địa chỉ email không hợp lệ';
                break;
            case 'phone':
                isValid = validateVietnamesePhone(value);
                message = 'Số điện thoại không hợp lệ';
                break;
            case 'idNumber':
                isValid = validateVietnameseID(value);
                message = 'Số CMND/CCCD không hợp lệ';
                break;
            default:
                isValid = true;
        }
        
        if (!isValid) {
            showFieldError(fieldId, message);
        } else {
            removeFieldError(fieldId);
        }
    });
}

// Export functions if using modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        validateVietnamesePhone,
        validateVietnameseID,
        validateLoanAmount,
        validateLoanTerm,
        sanitizeInput,
        formatCurrency,
        validateDateOfBirth,
        showFieldError,
        removeFieldError,
        validateFieldRealtime
    };
}
