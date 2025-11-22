// js/loan-registration.js
// Note: This file depends on utils.js - ensure utils.js is loaded first

// Initialize EmailJS
(function () {
  emailjs.init('OrBsI926QI2_xBh1f'); // Replace with actual User ID
})();

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function () {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

// Form data
const formData = {
  contractImage: 'public/documents/contract.pdf',
  disbursementImage: 'public/documents/disbursement.pdf',
  fallbackImage: 'https://via.placeholder.com/720x1018?text=Hinh+Anh+Mac+Dinh',
  fallbackProfileImage: 'https://via.placeholder.com/150x150?text=Anh+Ho+So'
};

// User data
let userData = { qrData: {}, currentStep: 1 };

// Load user data from localStorage
function loadUserData() {
  const savedData = localStorage.getItem('userData');
  if (savedData) {
    userData = JSON.parse(savedData);
  }
}

// Save to localStorage
function saveToLocalStorage() {
  localStorage.setItem('userData', JSON.stringify(userData));
}

// Utility functions are now imported from utils.js:
// - formatNumber, formatNumberInput, unformatNumber
// - generateContractId, generateRandomCode, generateLoanCode
// - getCurrentDate, getDateComponents
// - calculateInterestRate, calculateMonthlyPayment

// Check if image is captured or uploaded
function checkImageInput(frontInputId, backInputId) {
  const frontFile = document.getElementById(frontInputId)?.files[0];
  const backFile = document.getElementById(backInputId)?.files[0];
  return frontFile || backFile;
}

// Render canvas for contract and disbursement (Optimized)
function renderCanvas(canvasId, imageUrl, userData) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Clean up previous canvas state to prevent memory leaks
  const ctx = canvas.getContext('2d', { 
    willReadFrequently: false,  // Optimize for infrequent reads
    alpha: false                 // Disable alpha for performance
  });
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.classList.add('loading');

  const img = new Image();
  img.crossOrigin = 'Anonymous';

  // Store cleanup function for potential cancellation
  const cleanup = () => {
    img.onload = null;
    img.onerror = null;
    img.src = '';
  };

  img.onload = function () {
    try {
      const scale = window.devicePixelRatio || 1;
      const contractScale = canvasId === 'contractCanvas' ? 0.33 : 0.25;

      // Set canvas dimensions
      canvas.width = 2480 * scale * contractScale;
      canvas.height = 3508 * scale * contractScale;

      // Reset context and apply scaling
      ctx.save();
      ctx.scale(scale * contractScale, scale * contractScale);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, 2480, 3508);

      // Batch all text rendering operations
      ctx.font = 'bold 18px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';

      const checkmark = '✔';
      const qrFrontData = userData.qrData?.idFrontImage || {};
      const qrBackData = userData.qrData?.idBackImage || {};

      if (canvasId === 'contractCanvas') {
        const { day, month, year } = getDateComponents(userData.registrationDate);
                
        // Use a single batch for text rendering
        const textOperations = [
          { text: day, x: 413, y: 313 },
          { text: month, x: 541, y: 311 },
          { text: year, x: 681, y: 311 },
          { text: qrFrontData.fullName || userData.fullName || '', x: 401, y: 359 },
          { text: qrFrontData.idNumber || userData.idNumber || '', x: 393, y: 415 },
          { text: userData.phoneNumber || '', x: 403, y: 513 },
          { text: userData.email || '', x: 405, y: 567 },
          { text: userData.loanAmount ? `${formatNumber(userData.loanAmount)} VND` : '', x: 409, y: 689 }
        ];
                
        // Render all text in one batch
        textOperations.forEach(({ text, x, y }) => {
          if (text) ctx.fillText(text, x, y);
        });

        const purpose = userData.loanPurpose || '';
        if (purpose === 'Sửa chữa nhà') {
          ctx.fillText(checkmark, 145, 835);
        } else if (purpose === 'Mua xe') {
          ctx.fillText(checkmark, 385, 833);
        } else if (purpose === 'Học tập') {
          ctx.fillText(checkmark, 145, 833);
        } else if (purpose) {
          ctx.fillText(purpose, 505, 895);
        }

        const term = userData.loanTerm || '';
        if (term === '12') {
          ctx.fillText(checkmark, 429, 1069);
        } else if (term === '24') {
          ctx.fillText(checkmark, 541, 1067);
        } else if (term === '36') {
          ctx.fillText(checkmark, 645, 1069);
        }

        const moreTextOperations = [
          { text: userData.interestRate ? `${userData.interestRate}%` : '', x: 453, y: 1125 },
          { text: userData.accountNumber || '', x: 273, y: 1493 },
          { text: userData.loanCode || '', x: 1207, y: 413 },
          { text: userData.registrationDate || '', x: 1467, y: 411 },
          { text: userData.sellerCode || '', x: 1271, y: 451 },
          { text: userData.storeCode || '', x: 1517, y: 445 },
          { text: userData.staffName || '', x: 961, y: 1599 },
          { text: userData.branchName || '', x: 967, y: 1655 },
          { text: userData.staffCode || '', x: 1127, y: 1719 },
          { text: checkmark, x: 1569, y: 1807 },
          { text: checkmark, x: 1571, y: 1877 },
          { text: checkmark, x: 1569, y: 1917 },
          { text: checkmark, x: 1569, y: 1953 },
          { text: userData.loanAmount ? `${formatNumber(userData.loanAmount)} VND` : '', x: 1217, y: 2109 },
          { text: day, x: 1231, y: 2161 },
          { text: month, x: 1349, y: 2161 },
          { text: year, x: 1477, y: 2163 }
        ];
                
        moreTextOperations.forEach(({ text, x, y }) => {
          if (text) ctx.fillText(text, x, y);
        });

        // Generate data URL and clean up immediately
        const dataUrl = canvas.toDataURL('image/png', 0.9);  // Added quality parameter
        userData.contractImageUrl = dataUrl;
        saveToLocalStorage();
      } else if (canvasId === 'disbursementCanvas') {
        const textOperations = [
          { text: userData.accountNumber || '', x: 931, y: 725 },
          { text: qrFrontData.fullName || userData.fullName || '', x: 953, y: 821 },
          { text: userData.bankName || '', x: 961, y: 889 },
          { text: qrFrontData.idNumber || userData.idNumber || '', x: 993, y: 1121 },
          { text: qrBackData.idIssueDate || userData.idIssueDate || '', x: 1661, y: 1121 },
          { text: qrBackData.idIssuePlace || userData.idIssuePlace || '', x: 2233, y: 1121 }
        ];
                
        textOperations.forEach(({ text, x, y }) => {
          if (text) ctx.fillText(text, x, y);
        });

        // Generate data URL and clean up immediately
        const dataUrl = canvas.toDataURL('image/png', 0.9);  // Added quality parameter
        userData.disbursementImageUrl = dataUrl;
        saveToLocalStorage();
      }

      // Restore context state
      ctx.restore();
      canvas.classList.remove('loading');

    } catch (error) {
      // Canvas rendering error occurred
      canvas.classList.remove('loading');
    } finally {
      // Clean up image object
      cleanup();
    }
  };

  img.onerror = function () {
    try {
      img.src = formData.fallbackImage;
    } catch (error) {
      // Image loading error occurred
      canvas.classList.remove('loading');
      cleanup();
    }
  };

  img.src = imageUrl;
}

// Download as PDF
function downloadAsPDF(canvas, filename) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [2480, 3508]
  });
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, 2480, 3508);
  pdf.save(filename);
}
