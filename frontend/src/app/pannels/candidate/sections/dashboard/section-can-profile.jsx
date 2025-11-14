import { useEffect, useState } from 'react';
import { api } from '../../../../../utils/api';
import { calculateProfileCompletion } from '../../../../../utils/profileCompletion';

function CompleteProfileCard() {
	const [profileCompletion, setProfileCompletion] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchProfileCompletion();
		
		// Listen for profile updates
		const handleProfileUpdate = () => {
			fetchProfileCompletion();
			// Trigger notification refresh
			window.dispatchEvent(new CustomEvent('refreshNotifications'));
		};
		
		window.addEventListener('profileUpdated', handleProfileUpdate);
		
		return () => {
			window.removeEventListener('profileUpdated', handleProfileUpdate);
		};
	}, []);

	const fetchProfileCompletion = async () => {
		try {
			const response = await api.getCandidateProfile();
			if (response.success && response.profile) {
				const completion = calculateProfileCompletion(response.profile);
				setProfileCompletion(completion);
				// Trigger notification refresh when completion changes
				window.dispatchEvent(new CustomEvent('refreshNotifications'));
			}
		} catch (error) {
			
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="bg-white p-4 rounded shadow-sm mb-4">
				<div className="text-center">Loading profile...</div>
			</div>
		);
	}
	return (
		<div className="bg-white p-4 rounded shadow-sm mb-4">
			<h4 className="text-primary mb-2">Complete Your Resume</h4>
			<p className="text-muted mb-3" style={{ fontSize: "14px" }}>
				A complete profile increases your chances of getting hired
			</p>

			{/* Profile Completion Label */}
			<div className="d-flex justify-content-between align-items-center mb-1">
				<span className="fw-semibold">Profile Completion</span>
				<span className="text-primary fw-semibold">{profileCompletion}%</span>
			</div>

			{/* Progress Bar */}
			<div
				className="progress"
				style={{ height: "10px", borderRadius: "10px" }}
			>
				<div
					className="progress-bar progress-animated"
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={profileCompletion}
					style={{
						width: `${profileCompletion}%`,
						backgroundColor: "#2563eb",
						borderRadius: "10px",
					}}
				/>
			</div>

			{/* Action Buttons */}
			<div className="mt-3 d-flex flex-wrap gap-2">
				<button
					className="btn btn-primary btn-sm"
					style={{
						backgroundColor: '#007bff',
						borderColor: '#007bff',
						color: 'white !important'
					}}
					onMouseEnter={(e) => {
						e.target.style.backgroundColor = '#007bff';
						e.target.style.borderColor = '#007bff';
						e.target.style.color = 'white';
						e.target.style.setProperty('color', 'white', 'important');
					}}
					onMouseLeave={(e) => {
						e.target.style.backgroundColor = '#007bff';
						e.target.style.borderColor = '#007bff';
						e.target.style.color = 'white';
						e.target.style.setProperty('color', 'white', 'important');
					}}
					onClick={() => (window.location.href = "/candidate/my-resume")}
				>
					Complete Resume
				</button>
			</div>
		</div>
	);
}

export default CompleteProfileCard;

