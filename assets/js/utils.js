// Common utility functions for Shinhan Finance application

/**
 * Format a number with Vietnamese locale formatting
 * @param {number|string} number - The number to format
 * @returns {string} Formatted number string or empty string if invalid
 */
function formatNumber(number) {
  if (!number || isNaN(number)) return '';
  return parseInt(number).toLocaleString('vi-VN');
}

/**
 * Format number input value (removes non-digits and formats)
 * @param {string} value - The input value to format
 * @returns {string} Formatted number string
 */
function formatNumberInput(value) {
  if (!value) return '';
  value = value.replace(/[^0-9]/g, '');
  return parseInt(value).toLocaleString('vi-VN');
}

/**
 * Remove formatting from a number string and return numeric value
 * @param {string} value - Formatted number string
 * @returns {number} Numeric value
 */
function unformatNumber(value) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
  return isNaN(numericValue) ? 0 : numericValue;
}

/**
 * Generate a unique contract ID
 * @returns {string} Contract ID in format SHB-YYYYMMDD-XXXXXX
 */
function generateContractId() {
  const date = new Date();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `SHB-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${randomNum}`;
}

/**
 * Generate a 6-digit random code
 * @returns {string} Random 6-digit code
 */
function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Get current date in DD/MM/YYYY format
 * @returns {string} Current date formatted as DD/MM/YYYY
 */
function getCurrentDate() {
  const date = new Date();
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

/**
 * Parse a date string and return its components
 * @param {string} dateStr - Date string in DD/MM/YYYY format
 * @returns {Object} Object with day, month, and year properties
 */
function getDateComponents(dateStr) {
  if (!dateStr) return { day: '', month: '', year: '' };
  const [day, month, year] = dateStr.split('/');
  return { day: day || '', month: month || '', year: year || '' };
}

/**
 * Calculate interest rate based on loan amount
 * @param {number|string} loanAmount - The loan amount
 * @returns {number|string} Interest rate percentage or empty string
 */
function calculateInterestRate(loanAmount) {
  if (!loanAmount) return '';
  loanAmount = parseInt(loanAmount);
  if (loanAmount >= 300000000) return 10;
  if (loanAmount >= 100000000) return 11;
  if (loanAmount >= 50000000) return 11.5;
  return 12;
}

/**
 * Calculate monthly payment for a loan
 * @param {number|string} loanAmount - Principal loan amount
 * @param {number|string} loanTerm - Loan term in months
 * @param {number} annualInterestRate - Annual interest rate percentage (default 11)
 * @returns {string} Formatted monthly payment or empty string
 */
function calculateMonthlyPayment(loanAmount, loanTerm, annualInterestRate = 11) {
  if (!loanAmount || !loanTerm) return '';

  // Convert annual interest rate to monthly rate
  const monthlyInterestRate = annualInterestRate / 100 / 12;

  // Calculate monthly payment using the standard loan payment formula
  // PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
  const principal = parseInt(loanAmount);
  const numPayments = parseInt(loanTerm);

  if (monthlyInterestRate === 0) {
    // Handle case where interest rate is 0
    return Math.round(principal / numPayments).toLocaleString('vi-VN');
  }

  const monthlyPayment = principal *
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numPayments)) /
        (Math.pow(1 + monthlyInterestRate, numPayments) - 1);

  return Math.round(monthlyPayment).toLocaleString('vi-VN');
}

/**
 * Generate a unique loan code
 * @returns {string} Loan code in format SHB-YYYYMMDD-XXXXXX
 */
function generateLoanCode() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(100000 + Math.random() * 900000);
  return `SHB-${year}${month}${day}-${random}`;
}

// Export functions if using modules, otherwise they're available globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatNumber,
    formatNumberInput,
    unformatNumber,
    generateContractId,
    generateRandomCode,
    getCurrentDate,
    getDateComponents,
    calculateInterestRate,
    calculateMonthlyPayment,
    generateLoanCode
  };
}
