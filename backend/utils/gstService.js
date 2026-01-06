const axios = require('axios');

/**
 * GST API Service for fetching company information by GST number
 * Uses multiple GST API providers for better reliability
 */

// GST API Configuration
const GST_API_CONFIG = {
    // Primary API - GST API (Free tier available)
    primary: {
        baseURL: 'https://sheet.gstapi.in/v1/gst',
        headers: {
            'Content-Type': 'application/json'
        }
    },
    
    // Backup API - Alternative GST service
    backup: {
        baseURL: 'https://api.gstapi.in/v1/gst',
        headers: {
            'Content-Type': 'application/json'
        }
    }
};

/**
 * Validate GST number format
 * @param {string} gstNumber - GST number to validate
 * @returns {boolean} - True if valid format
 */
const validateGSTFormat = (gstNumber) => {
    if (!gstNumber || typeof gstNumber !== 'string') {
        return false;
    }
    
    // Remove spaces and convert to uppercase
    const cleanGST = gstNumber.replace(/\s/g, '').toUpperCase();
    
    // GST format: 2 digits + 5 letters + 4 digits + 1 letter + 1 digit/letter + 1 letter + 1 digit/letter
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    return gstRegex.test(cleanGST);
};

/**
 * Extract state code from GST number
 * @param {string} gstNumber - GST number
 * @returns {string} - State code
 */
const getStateFromGST = (gstNumber) => {
    const stateCodeMap = {
        '01': 'Jammu and Kashmir',
        '02': 'Himachal Pradesh',
        '03': 'Punjab',
        '04': 'Chandigarh',
        '05': 'Uttarakhand',
        '06': 'Haryana',
        '07': 'Delhi',
        '08': 'Rajasthan',
        '09': 'Uttar Pradesh',
        '10': 'Bihar',
        '11': 'Sikkim',
        '12': 'Arunachal Pradesh',
        '13': 'Nagaland',
        '14': 'Manipur',
        '15': 'Mizoram',
        '16': 'Tripura',
        '17': 'Meghalaya',
        '18': 'Assam',
        '19': 'West Bengal',
        '20': 'Jharkhand',
        '21': 'Odisha',
        '22': 'Chhattisgarh',
        '23': 'Madhya Pradesh',
        '24': 'Gujarat',
        '25': 'Daman and Diu',
        '26': 'Dadra and Nagar Haveli',
        '27': 'Maharashtra',
        '28': 'Andhra Pradesh',
        '29': 'Karnataka',
        '30': 'Goa',
        '31': 'Lakshadweep',
        '32': 'Kerala',
        '33': 'Tamil Nadu',
        '34': 'Puducherry',
        '35': 'Andaman and Nicobar Islands',
        '36': 'Telangana',
        '37': 'Andhra Pradesh',
        '38': 'Ladakh'
    };
    
    const stateCode = gstNumber.substring(0, 2);
    return stateCodeMap[stateCode] || '';
};

/**
 * Fetch company information from GST API
 * @param {string} gstNumber - GST number to lookup
 * @returns {Promise<Object>} - Company information
 */
const fetchGSTInfo = async (gstNumber) => {
    try {
        // Validate GST format first
        if (!validateGSTFormat(gstNumber)) {
            throw new Error('Invalid GST number format');
        }
        
        const cleanGST = gstNumber.replace(/\s/g, '').toUpperCase();
        
        // Try primary API first
        try {
            const response = await axios.get(`${GST_API_CONFIG.primary.baseURL}/${cleanGST}`, {
                headers: GST_API_CONFIG.primary.headers,
                timeout: 10000 // 10 second timeout
            });
            
            if (response.data && response.data.status === 'Active') {
                return parseGSTResponse(response.data, cleanGST);
            }
        } catch (primaryError) {
            console.log('Primary GST API failed, trying backup...', primaryError.message);
            
            // Try backup API
            try {
                const backupResponse = await axios.get(`${GST_API_CONFIG.backup.baseURL}/${cleanGST}`, {
                    headers: GST_API_CONFIG.backup.headers,
                    timeout: 10000
                });
                
                if (backupResponse.data && backupResponse.data.status === 'Active') {
                    return parseGSTResponse(backupResponse.data, cleanGST);
                }
            } catch (backupError) {
                console.log('Backup GST API also failed:', backupError.message);
            }
        }
        
        // If APIs fail, return basic info extracted from GST number
        return getBasicInfoFromGST(cleanGST);
        
    } catch (error) {
        console.error('GST API Error:', error.message);
        throw new Error('Unable to fetch GST information. Please verify the GST number and try again.');
    }
};

/**
 * Parse GST API response and extract relevant information
 * @param {Object} data - API response data
 * @param {string} gstNumber - GST number
 * @returns {Object} - Parsed company information
 */
const parseGSTResponse = (data, gstNumber) => {
    const companyInfo = {
        gstNumber: gstNumber,
        companyName: data.legalName || data.tradeName || '',
        tradeName: data.tradeName || '',
        legalName: data.legalName || '',
        status: data.status || '',
        registrationDate: data.registrationDate || '',
        constitutionOfBusiness: data.constitutionOfBusiness || '',
        taxpayerType: data.taxpayerType || '',
        gstin: gstNumber,
        state: getStateFromGST(gstNumber),
        stateCode: gstNumber.substring(0, 2),
        panNumber: gstNumber.substring(2, 12), // Extract PAN from GST
        
        // Address information
        address: {
            buildingName: data.pradr?.bno || '',
            buildingNumber: data.pradr?.bnm || '',
            floorNumber: data.pradr?.flno || '',
            street: data.pradr?.st || '',
            location: data.pradr?.loc || '',
            district: data.pradr?.dst || '',
            state: data.pradr?.stcd || getStateFromGST(gstNumber),
            pincode: data.pradr?.pncd || '',
            latitude: data.pradr?.lt || '',
            longitude: data.pradr?.lg || ''
        },
        
        // Business information
        businessNature: data.nba || [],
        filingStatus: data.filingStatus || [],
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        
        // Additional fields that can be mapped to employer profile
        website: '', // Not available in GST API
        email: '', // Not available in GST API
        phone: '', // Not available in GST API
        
        // Derived information
        fullAddress: buildFullAddress(data.pradr || {}),
        isActive: data.status === 'Active'
    };
    
    return companyInfo;
};

/**
 * Get basic information from GST number when API fails
 * @param {string} gstNumber - GST number
 * @returns {Object} - Basic company information
 */
const getBasicInfoFromGST = (gstNumber) => {
    return {
        gstNumber: gstNumber,
        gstin: gstNumber,
        panNumber: gstNumber.substring(2, 12),
        state: getStateFromGST(gstNumber),
        stateCode: gstNumber.substring(0, 2),
        companyName: '',
        status: 'Unknown',
        isActive: null,
        message: 'GST number is valid but detailed information could not be retrieved. Please fill other details manually.'
    };
};

/**
 * Build full address from GST API address components
 * @param {Object} addressData - Address data from API
 * @returns {string} - Formatted full address
 */
const buildFullAddress = (addressData) => {
    const components = [];
    
    if (addressData.bnm) components.push(addressData.bnm);
    if (addressData.bno) components.push(addressData.bno);
    if (addressData.flno) components.push(`Floor ${addressData.flno}`);
    if (addressData.st) components.push(addressData.st);
    if (addressData.loc) components.push(addressData.loc);
    if (addressData.dst) components.push(addressData.dst);
    if (addressData.stcd) components.push(addressData.stcd);
    if (addressData.pncd) components.push(addressData.pncd);
    
    return components.filter(Boolean).join(', ');
};

/**
 * Map GST information to employer profile fields
 * @param {Object} gstInfo - GST information
 * @returns {Object} - Mapped profile fields
 */
const mapGSTToProfile = (gstInfo) => {
    const profileData = {
        // Basic company information
        companyName: gstInfo.legalName || gstInfo.companyName || '',
        gstNumber: gstInfo.gstNumber,
        panNumber: gstInfo.panNumber,
        state: gstInfo.state,
        
        // Address information
        corporateAddress: gstInfo.fullAddress || '',
        pincode: gstInfo.address?.pincode || '',
        city: gstInfo.address?.district || '',
        
        // Business type mapping
        companyType: mapConstitutionToCompanyType(gstInfo.constitutionOfBusiness),
        
        // Status information
        gstStatus: gstInfo.status,
        gstRegistrationDate: gstInfo.registrationDate,
        
        // Additional information that can be suggested
        suggestions: {
            tradeName: gstInfo.tradeName,
            taxpayerType: gstInfo.taxpayerType,
            businessNature: gstInfo.businessNature,
            isGSTActive: gstInfo.isActive
        }
    };
    
    return profileData;
};

/**
 * Map GST constitution of business to company type
 * @param {string} constitution - Constitution from GST
 * @returns {string} - Mapped company type
 */
const mapConstitutionToCompanyType = (constitution) => {
    if (!constitution) return '';
    
    const constitutionMap = {
        'Private Limited Company': 'Private Limited',
        'Limited Liability Partnership': 'LLP',
        'Proprietorship': 'Proprietorship',
        'Partnership': 'Partnership',
        'Public Limited Company': 'Public Limited',
        'Government': 'Government',
        'Trust': 'NGO',
        'Society': 'NGO',
        'Association of Persons': 'Others',
        'Body of Individuals': 'Others',
        'Hindu Undivided Family': 'Others',
        'Artificial Juridical Person': 'Others'
    };
    
    return constitutionMap[constitution] || 'Others';
};

module.exports = {
    validateGSTFormat,
    fetchGSTInfo,
    mapGSTToProfile,
    getStateFromGST
};