let showPopupFunction = null;

export const initPopupNotification = (showPopupFn) => {
  showPopupFunction = showPopupFn;
};

export const showPopup = (message, type = 'info') => {
  if (showPopupFunction) {
    showPopupFunction(message, type);
  }
};

export const showSuccess = (message) => showPopup(message, 'success');
export const showError = (message) => showPopup(message, 'error');
export const showWarning = (message) => showPopup(message, 'warning');
export const showInfo = (message) => showPopup(message, 'info');
