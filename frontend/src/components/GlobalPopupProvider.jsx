import React, { useEffect } from 'react';
import { usePopupNotification } from '../hooks/usePopupNotification';
import PopupNotification from './PopupNotification';
import { initPopupNotification } from '../utils/popupNotification';

const GlobalPopupProvider = ({ children }) => {
  const { popup, showPopup, hidePopup } = usePopupNotification();

  useEffect(() => {
    initPopupNotification(showPopup);
  }, [showPopup]);

  return (
    <>
      {children}
      {popup.show && (
        <PopupNotification
          message={popup.message}
          type={popup.type}
          onClose={hidePopup}
        />
      )}
    </>
  );
};

export default GlobalPopupProvider;
