// Pincode service to fetch location data from pincode
export const fetchLocationFromPincode = async (pincode) => {
  try {
    // Validate pincode format
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      throw new Error('Invalid pincode format');
    }

    // Use Indian Postal API
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (data && data.length > 0 && data[0].Status === 'Success') {
      const postOffice = data[0].PostOffice[0];
      return {
        success: true,
        location: postOffice.Name,
        district: postOffice.District,
        state: postOffice.State,
        stateCode: getStateCode(postOffice.State),
        country: postOffice.Country
      };
    } else {
      return {
        success: false,
        message: 'Invalid pincode or location not found'
      };
    }
  } catch (error) {
    console.error('Error fetching location from pincode:', error);
    return {
      success: false,
      message: 'Failed to fetch location data'
    };
  }
};

// Helper function to get state code from state name
const getStateCode = (stateName) => {
  const stateCodeMap = {
    'Andhra Pradesh': 'AP',
    'Arunachal Pradesh': 'AR',
    'Assam': 'AS',
    'Bihar': 'BR',
    'Chhattisgarh': 'CG',
    'Goa': 'GA',
    'Gujarat': 'GJ',
    'Haryana': 'HR',
    'Himachal Pradesh': 'HP',
    'Jharkhand': 'JH',
    'Karnataka': 'KA',
    'Kerala': 'KL',
    'Madhya Pradesh': 'MP',
    'Maharashtra': 'MH',
    'Manipur': 'MN',
    'Meghalaya': 'ML',
    'Mizoram': 'MZ',
    'Nagaland': 'NL',
    'Odisha': 'OD',
    'Punjab': 'PB',
    'Rajasthan': 'RJ',
    'Sikkim': 'SK',
    'Tamil Nadu': 'TN',
    'Telangana': 'TS',
    'Tripura': 'TR',
    'Uttar Pradesh': 'UP',
    'Uttarakhand': 'UK',
    'West Bengal': 'WB',
    'Andaman and Nicobar Islands': 'AN',
    'Chandigarh': 'CH',
    'Dadra and Nagar Haveli and Daman and Diu': 'DH',
    'Delhi': 'DL',
    'Jammu and Kashmir': 'JK',
    'Ladakh': 'LA',
    'Lakshadweep': 'LD',
    'Puducherry': 'PY'
  };

  return stateCodeMap[stateName] || '';
};