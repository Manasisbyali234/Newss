let showPopupFunction = null;

export const initPopupNotification = (showPopupFn) => {
  showPopupFunction = showPopupFn;
};

export const showPopup = (message, type = 'info', duration = 5000) => {
  if (showPopupFunction) {
    showPopupFunction(message, type, duration);
  }
};

export const showSuccess = (message, duration) => showPopup(message, 'success', duration);
export const showError = (message, duration) => showPopup(message, 'error', duration);
export const showWarning = (message, duration) => showPopup(message, 'warning', duration);
export const showInfo = (message, duration) => showPopup(message, 'info', duration);
