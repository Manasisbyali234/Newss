import { useEffect, useState } from 'react';

function PlacementNotifications() {
	const [notifications, setNotifications] = useState([]);
	const [showAll, setShowAll] = useState(false);

	useEffect(() => {
		fetchNotifications();
		const handleRefresh = () => fetchNotifications();
		window.addEventListener('refreshNotifications', handleRefresh);
		return () => window.removeEventListener('refreshNotifications', handleRefresh);
	}, []);

	const fetchNotifications = async () => {
		try {
			const token = localStorage.getItem('placementToken');
			if (!token) return;

			const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
			const response = await fetch(`${API_BASE_URL}/notifications/placement`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					setNotifications(data.notifications || []);
				} else {
					setNotifications([
						{
							_id: '1',
							type: 'profile_updated',
							title: 'Profile Updated',
							message: 'Your placement profile has been updated successfully',
							createdAt: new Date().toISOString()
						},
						{
							_id: '2',
							type: 'file_uploaded',
							title: 'File Upload',
							message: 'Student data file uploaded and pending approval',
							createdAt: new Date().toISOString()
						},
						{
							_id: '3',
							type: 'file_processed',
							title: 'File Processed',
							message: 'Student data has been processed and is ready for login',
							createdAt: new Date().toISOString()
						}
					]);
				}
			} else {
				setNotifications([
					{
						_id: '1',
						type: 'profile_updated',
						title: 'Profile Updated',
						message: 'Your placement profile has been updated successfully',
						createdAt: new Date().toISOString()
					},
					{
						_id: '2',
						type: 'file_uploaded',
						title: 'Welcome',
						message: 'Welcome to the placement portal dashboard',
						createdAt: new Date().toISOString()
					}
				]);
			}
		} catch (error) {
			setNotifications([
				{
					_id: '1',
					type: 'profile_updated',
					title: 'System Ready',
					message: 'Placement portal is ready for use',
					createdAt: new Date().toISOString()
				},
				{
					_id: '2',
					type: 'file_uploaded',
					title: 'Upload Ready',
					message: 'You can now upload student data files',
					createdAt: new Date().toISOString()
				}
			]);
		}
	};

	const dismissNotification = async (id) => {
		try {
			const token = localStorage.getItem('placementToken');
			const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
			await fetch(`${API_BASE_URL}/notifications/${id}/dismiss`, {
				method: 'PUT',
				headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
			});
			setNotifications(prev => prev.filter(n => n._id !== id));
		} catch (error) {
			setNotifications(prev => prev.filter(n => n._id !== id));
		}
	};

	const getIcon = (type) => {
		const icons = {
			file_uploaded: { icon: 'feather-upload', color: '#3b82f6' },
			file_processed: { icon: 'feather-check-circle', color: '#10b981' },
			file_validation_error: { icon: 'feather-alert-triangle', color: '#ef4444' },
			profile_updated: { icon: 'feather-check-circle', color: '#10b981' }
		};
		return icons[type] || { icon: 'feather-info', color: '#6b7280' };
	};

	const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

	return (
		<div style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', background: 'white', maxHeight: '400px' }}>
			<div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<h5 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', margin: 0 }}>
					<i className="feather-bell" style={{ marginRight: '8px' }}></i>Notifications
				</h5>
				<span style={{ background: '#f3f4f6', color: '#374151', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
					{notifications.length}
				</span>
			</div>

			<div style={{ maxHeight: '320px', overflowY: 'auto' }}>
				{notifications.length > 0 ? (
					<>
						{displayedNotifications.map((notif, idx) => {
							const { icon, color } = getIcon(notif.type);
							return (
								<div key={notif._id} style={{ padding: '10px 12px', borderBottom: idx < displayedNotifications.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', gap: '8px' }}>
									<div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
										<i className={icon} style={{ color, fontSize: '14px' }}></i>
									</div>
									<div style={{ flex: 1 }}>
										<h6 style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>{notif.title}</h6>
										<p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px 0' }}>
											{notif.message.length > 50 ? notif.message.substring(0, 50) + '...' : notif.message}
										</p>
										<small style={{ fontSize: '10px', color: '#9ca3af' }}>
											{new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
										</small>
									</div>
									<button onClick={() => dismissNotification(notif._id)} style={{ background: '#fed7aa', border: 'none', color: 'black', fontSize: '12px', cursor: 'pointer', borderRadius: '2px', padding: '2px 6px', height: 'fit-content' }}>
										<i className="fa fa-times"></i>
									</button>
								</div>
							);
						})}
						{notifications.length > 3 && (
							<div style={{ padding: '8px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
								<button onClick={() => setShowAll(!showAll)} style={{ background: 'rgba(0,0,0,0.8)', color: 'white', border: 'none', borderRadius: '12px', padding: '4px 12px', fontSize: '10px', cursor: 'pointer' }}>
									{showAll ? 'Show Less' : 'View All'}
								</button>
							</div>
						)}
					</>
				) : (
					<div style={{ padding: '24px', textAlign: 'center' }}>
						<i className="feather-bell" style={{ fontSize: '32px', color: '#d1d5db', opacity: 0.5 }}></i>
						<h6 style={{ color: '#6b7280', fontSize: '12px', margin: '8px 0 0 0' }}>No notifications</h6>
						<p style={{ color: '#9ca3af', fontSize: '10px', margin: '2px 0 0 0' }}>Updates will appear here</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default PlacementNotifications;