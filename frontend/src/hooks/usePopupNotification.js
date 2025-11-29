import { useState } from 'react';

export const usePopupNotification = () => {
  const [popup, setPopup] = useState({ show: false, message: '', type: 'info' });

  const showPopup = (message, type = 'info') => {
    setPopup({ show: true, message, type });
  };

  const hidePopup = () => {
    setPopup({ show: false, message: '', type: 'info' });
  };

  return {
    popup,
    showPopup,
    hidePopup,
    showSuccess: (message) => showPopup(message, 'success'),
    showError: (message) => showPopup(message, 'error'),
    showWarning: (message) => showPopup(message, 'warning'),
    showInfo: (message) => showPopup(message, 'info'),
  };
};
