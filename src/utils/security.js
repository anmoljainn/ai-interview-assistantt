// Input sanitization to prevent XSS attacks
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const isValidPhone = (phone) => {
  // Basic phone validation - allows international formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Validate file type and size
export const validateFile = (file) => {
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload a PDF or DOCX file.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit.' };
  }
  
  return { valid: true };
};

// Rate limiting helper
export const rateLimit = (func, limit) => {
  let inProgress = false;
  
  return async (...args) => {
    if (inProgress) return;
    
    inProgress = true;
    try {
      await func(...args);
    } finally {
      setTimeout(() => {
        inProgress = false;
      }, limit);
    }
  };
};