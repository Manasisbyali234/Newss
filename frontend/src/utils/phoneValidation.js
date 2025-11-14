// Phone number validation utility with +91 support

export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return { isValid: false, message: 'Phone number is required' };
  
  // Remove all spaces and special characters except +
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Check if it starts with +91
  if (cleanNumber.startsWith('+91')) {
    const numberPart = cleanNumber.substring(3);
    // Indian mobile numbers should be 10 digits starting with 6-9
    if (!/^[6-9]\d{9}$/.test(numberPart)) {
      return { 
        isValid: false, 
        message: 'Please enter a valid Indian mobile number (10 digits starting with 6-9)' 
      };
    }
    return { isValid: true, message: '' };
  }
  
  // If doesn't start with +91, check if it's a 10-digit Indian number
  if (/^[6-9]\d{9}$/.test(cleanNumber)) {
    return { isValid: true, message: '' };
  }
  
  return { 
    isValid: false, 
    message: 'Please enter a valid phone number with +91 country code or 10-digit Indian mobile number' 
  };
};

export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '+91 ';
  
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // If it already starts with +91, return as is
  if (cleanNumber.startsWith('+91')) {
    return phoneNumber;
  }
  
  // If it's a 10-digit number starting with 6-9, add +91
  if (/^[6-9]\d{9}$/.test(cleanNumber)) {
    return `+91 ${cleanNumber}`;
  }
  
  // If it's empty or invalid, return default
  if (!cleanNumber) {
    return '+91 ';
  }
  
  return phoneNumber;
};

export const ensureCountryCode = (phoneNumber) => {
  if (!phoneNumber || phoneNumber.trim() === '') return '+91 ';
  
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  if (cleanNumber.startsWith('+91')) {
    return phoneNumber;
  }
  
  if (/^[6-9]\d{0,9}$/.test(cleanNumber)) {
    return `+91 ${cleanNumber}`;
  }
  
  return phoneNumber;
};
