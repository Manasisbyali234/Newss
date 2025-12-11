import { useState, useEffect } from 'react';
import { api } from '../../../../../utils/api';
import { showPopup, showSuccess, showError, showWarning, showInfo } from '../../../../../utils/popupNotification';
import SearchableSelect from '../../../../../components/SearchableSelect';

function SectionCanWorkLocation({ profile, onUpdate }) {
    const [workLocationData, setWorkLocationData] = useState({
        preferredLocations: []
    });
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const indianCities = [
        { value: 'Mumbai', label: 'Mumbai' },
        { value: 'Delhi', label: 'Delhi' },
        { value: 'Bangalore', label: 'Bangalore' },
        { value: 'Hyderabad', label: 'Hyderabad' },
        { value: 'Chennai', label: 'Chennai' },
        { value: 'Kolkata', label: 'Kolkata' },
        { value: 'Pune', label: 'Pune' },
        { value: 'Ahmedabad', label: 'Ahmedabad' },
        { value: 'Jaipur', label: 'Jaipur' },
        { value: 'Surat', label: 'Surat' },
        { value: 'Lucknow', label: 'Lucknow' },
        { value: 'Kanpur', label: 'Kanpur' },
        { value: 'Nagpur', label: 'Nagpur' },
        { value: 'Indore', label: 'Indore' },
        { value: 'Thane', label: 'Thane' },
        { value: 'Bhopal', label: 'Bhopal' },
        { value: 'Visakhapatnam', label: 'Visakhapatnam' },
        { value: 'Pimpri-Chinchwad', label: 'Pimpri-Chinchwad' },
        { value: 'Patna', label: 'Patna' },
        { value: 'Vadodara', label: 'Vadodara' },
        { value: 'Ghaziabad', label: 'Ghaziabad' },
        { value: 'Ludhiana', label: 'Ludhiana' },
        { value: 'Agra', label: 'Agra' },
        { value: 'Nashik', label: 'Nashik' },
        { value: 'Faridabad', label: 'Faridabad' },
        { value: 'Meerut', label: 'Meerut' },
        { value: 'Rajkot', label: 'Rajkot' },
        { value: 'Kalyan-Dombivali', label: 'Kalyan-Dombivali' },
        { value: 'Vasai-Virar', label: 'Vasai-Virar' },
        { value: 'Varanasi', label: 'Varanasi' },
        { value: 'Srinagar', label: 'Srinagar' },
        { value: 'Aurangabad', label: 'Aurangabad' },
        { value: 'Dhanbad', label: 'Dhanbad' },
        { value: 'Amritsar', label: 'Amritsar' },
        { value: 'Navi Mumbai', label: 'Navi Mumbai' },
        { value: 'Allahabad', label: 'Allahabad' },
        { value: 'Ranchi', label: 'Ranchi' },
        { value: 'Howrah', label: 'Howrah' },
        { value: 'Coimbatore', label: 'Coimbatore' },
        { value: 'Jabalpur', label: 'Jabalpur' },
        { value: 'Gwalior', label: 'Gwalior' },
        { value: 'Vijayawada', label: 'Vijayawada' },
        { value: 'Jodhpur', label: 'Jodhpur' },
        { value: 'Madurai', label: 'Madurai' },
        { value: 'Raipur', label: 'Raipur' },
        { value: 'Kota', label: 'Kota' },
        { value: 'Guwahati', label: 'Guwahati' },
        { value: 'Chandigarh', label: 'Chandigarh' },
        { value: 'Solapur', label: 'Solapur' },
        { value: 'Hubli-Dharwad', label: 'Hubli-Dharwad' },
        { value: 'Bareilly', label: 'Bareilly' },
        { value: 'Moradabad', label: 'Moradabad' },
        { value: 'Mysore', label: 'Mysore' },
        { value: 'Gurgaon', label: 'Gurgaon' },
        { value: 'Aligarh', label: 'Aligarh' },
        { value: 'Jalandhar', label: 'Jalandhar' },
        { value: 'Tiruchirappalli', label: 'Tiruchirappalli' },
        { value: 'Bhubaneswar', label: 'Bhubaneswar' },
        { value: 'Salem', label: 'Salem' },
        { value: 'Mira-Bhayandar', label: 'Mira-Bhayandar' },
        { value: 'Warangal', label: 'Warangal' },
        { value: 'Thiruvananthapuram', label: 'Thiruvananthapuram' },
        { value: 'Guntur', label: 'Guntur' },
        { value: 'Bhiwandi', label: 'Bhiwandi' },
        { value: 'Saharanpur', label: 'Saharanpur' },
        { value: 'Gorakhpur', label: 'Gorakhpur' },
        { value: 'Bikaner', label: 'Bikaner' },
        { value: 'Amravati', label: 'Amravati' },
        { value: 'Noida', label: 'Noida' },
        { value: 'Jamshedpur', label: 'Jamshedpur' },
        { value: 'Bhilai', label: 'Bhilai' },
        { value: 'Cuttack', label: 'Cuttack' },
        { value: 'Firozabad', label: 'Firozabad' },
        { value: 'Kochi', label: 'Kochi' },
        { value: 'Nellore', label: 'Nellore' },
        { value: 'Bhavnagar', label: 'Bhavnagar' },
        { value: 'Dehradun', label: 'Dehradun' },
        { value: 'Durgapur', label: 'Durgapur' },
        { value: 'Asansol', label: 'Asansol' },
        { value: 'Rourkela', label: 'Rourkela' },
        { value: 'Nanded', label: 'Nanded' },
        { value: 'Kolhapur', label: 'Kolhapur' },
        { value: 'Ajmer', label: 'Ajmer' },
        { value: 'Akola', label: 'Akola' },
        { value: 'Gulbarga', label: 'Gulbarga' },
        { value: 'Jamnagar', label: 'Jamnagar' },
        { value: 'Ujjain', label: 'Ujjain' },
        { value: 'Loni', label: 'Loni' },
        { value: 'Siliguri', label: 'Siliguri' },
        { value: 'Jhansi', label: 'Jhansi' },
        { value: 'Ulhasnagar', label: 'Ulhasnagar' },
        { value: 'Jammu', label: 'Jammu' },
        { value: 'Sangli-Miraj & Kupwad', label: 'Sangli-Miraj & Kupwad' },
        { value: 'Mangalore', label: 'Mangalore' },
        { value: 'Erode', label: 'Erode' },
        { value: 'Belgaum', label: 'Belgaum' },
        { value: 'Ambattur', label: 'Ambattur' },
        { value: 'Tirunelveli', label: 'Tirunelveli' },
        { value: 'Malegaon', label: 'Malegaon' },
        { value: 'Gaya', label: 'Gaya' },
        { value: 'Jalgaon', label: 'Jalgaon' },
        { value: 'Udaipur', label: 'Udaipur' },
        { value: 'Maheshtala', label: 'Maheshtala' }
    ];



    useEffect(() => {
        if (profile) {
            setWorkLocationData({
                preferredLocations: profile.jobPreferences?.preferredLocations || []
            });
        }
    }, [profile]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setWorkLocationData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (value === 'true')
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleLocationChange = (selectedLocations) => {
        setWorkLocationData(prev => ({
            ...prev,
            preferredLocations: selectedLocations
        }));
        
        if (errors.preferredLocations) {
            setErrors(prev => ({ ...prev, preferredLocations: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!Array.isArray(workLocationData.preferredLocations) || workLocationData.preferredLocations.length === 0) {
            newErrors.preferredLocations = 'At least one preferred location is required';
            isValid = false;
        }



        setErrors(newErrors);
        return isValid;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            const errorMessages = Object.values(errors).filter(e => e);
            showError(errorMessages.join(', '));
            return;
        }

        try {
            setLoading(true);

            const response = await api.updateWorkLocationPreferences({
                preferredLocations: workLocationData.preferredLocations
            });

            if (response.success) {
                setEditMode(false);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
                showSuccess('Work location preferences saved successfully!');
                if (onUpdate) onUpdate();
            } else {
                showError(response.message || 'Failed to save work location preferences');
            }
        } catch (error) {
            console.error('Save error:', error);
            showError('Failed to save work location preferences: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset to original data
        if (profile) {
            setWorkLocationData({
                preferredLocations: profile.jobPreferences?.preferredLocations || []
            });
        }
        setEditMode(false);
        setErrors({});
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20">
                <h4 className="panel-tittle m-a0">Desired Work Location</h4>
            </div>
            <div className="panel-body wt-panel-body p-a20">
                <div className="twm-panel-inner">
                    {editMode ? (
                        <div className="row g-3">
                            {/* Preferred Locations */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Preferred Work Locations *</label>
                                <SearchableSelect
                                    options={indianCities}
                                    value={workLocationData.preferredLocations}
                                    onChange={handleLocationChange}
                                    placeholder="Select preferred locations"
                                    isMulti={true}
                                    className={`form-select ${errors.preferredLocations ? 'is-invalid' : ''}`}
                                />
                                {errors.preferredLocations && <div className="invalid-feedback d-block">{errors.preferredLocations}</div>}
                                <small className="text-muted">You can select multiple locations</small>
                            </div>







                            {/* Action Buttons */}
                            <div className="col-12 mt-4">
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="site-button"
                                        onClick={handleSave}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <i className="fa fa-spinner fa-spin me-1"></i>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa fa-save me-1"></i>
                                                Save
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        <i className="fa fa-times me-1"></i>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="twm-panel-inner">
                            {Array.isArray(workLocationData.preferredLocations) && workLocationData.preferredLocations.length > 0 ? (
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <strong>Preferred Locations:</strong>
                                            <div className="mt-1">
                                                {Array.isArray(workLocationData.preferredLocations) && workLocationData.preferredLocations.map((location, index) => (
                                                    <span key={index} className="badge bg-primary me-1 mb-1">
                                                        {location}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fa fa-map-marker fa-3x text-muted mb-3"></i>
                                    <h5 className="text-muted">No work location preferences added</h5>
                                    <p className="text-muted">Add your preferred work locations and job preferences to help employers find you better.</p>
                                </div>
                            )}
                            
                            <div className="text-center mt-3">
                                <button
                                    type="button"
                                    className="site-button btn-sm"
                                    onClick={() => setEditMode(true)}
                                >
                                    <i className="fa fa-edit me-1"></i>
                                    {Array.isArray(workLocationData.preferredLocations) && workLocationData.preferredLocations.length > 0 ? 'Edit' : 'Add'} Work Preferences
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default SectionCanWorkLocation;