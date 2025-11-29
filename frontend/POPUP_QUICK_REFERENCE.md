# PopupNotification Quick Reference

## 🚀 Quick Start (Copy & Paste)

### 1. Add imports:
```jsx
import PopupNotification from '../components/PopupNotification';
import { usePopupNotification } from '../hooks/usePopupNotification';
```

### 2. Add hook:
```jsx
const { popup, showSuccess, showError, showWarning, showInfo, hidePopup } = usePopupNotification();
```

### 3. Add JSX (before closing `</div>`):
```jsx
{popup.show && (
  <PopupNotification 
    message={popup.message} 
    type={popup.type}
    onClose={hidePopup} 
  />
)}
```

### 4. Use in your code:
```jsx
showSuccess('Success message!');
showError('Error message!');
showWarning('Warning message!');
showInfo('Info message!');
```

## 📋 Complete Template

```jsx
import React from 'react';
import PopupNotification from '../components/PopupNotification';
import { usePopupNotification } from '../hooks/usePopupNotification';

const MyComponent = () => {
  const { popup, showSuccess, showError, showWarning, showInfo, hidePopup } = usePopupNotification();

  const handleAction = async () => {
    try {
      // Your code here
      showSuccess('Action completed!');
    } catch (error) {
      showError('Action failed!');
    }
  };

  return (
    <div>
      {/* Your component content */}
      <button onClick={handleAction}>Click Me</button>
      
      {/* Add this at the end */}
      {popup.show && (
        <PopupNotification 
          message={popup.message} 
          type={popup.type}
          onClose={hidePopup} 
        />
      )}
    </div>
  );
};

export default MyComponent;
```

## 🎨 Notification Types

| Type | Function | Icon | Color |
|------|----------|------|-------|
| Success | `showSuccess('msg')` | ✓ | Green |
| Error | `showError('msg')` | ✕ | Red |
| Warning | `showWarning('msg')` | ⚠ | Yellow |
| Info | `showInfo('msg')` | ℹ | Blue |

## 💡 Common Use Cases

### Form Submission
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await submitForm(data);
    showSuccess('Form submitted successfully!');
  } catch (error) {
    showError('Failed to submit form. Please try again.');
  }
};
```

### API Call
```jsx
const fetchData = async () => {
  try {
    const response = await api.getData();
    showSuccess('Data loaded successfully!');
  } catch (error) {
    showError('Failed to load data.');
  }
};
```

### Delete Confirmation
```jsx
const handleDelete = async (id) => {
  try {
    await deleteItem(id);
    showSuccess('Item deleted successfully!');
  } catch (error) {
    showError('Failed to delete item.');
  }
};
```

### Validation
```jsx
const validateForm = () => {
  if (!email) {
    showWarning('Please enter your email address.');
    return false;
  }
  if (!password) {
    showWarning('Please enter your password.');
    return false;
  }
  return true;
};
```

## 🔧 Customization

Edit `PopupNotification.css` to change:
- Colors: `.popup-success`, `.popup-error`, etc.
- Size: `.popup-box { max-width: 400px; }`
- Animation: `@keyframes slideIn`
- Button: `.popup-button`

## ✅ Checklist

- [ ] Import PopupNotification component
- [ ] Import usePopupNotification hook
- [ ] Add hook to component
- [ ] Add popup JSX before closing div
- [ ] Replace all toast calls with show functions
- [ ] Test all notification types
- [ ] Remove Toastify imports
- [ ] Uninstall react-toastify

## 📱 Mobile Support

Automatically responsive! No extra code needed.

## 🎯 Pro Tips

1. **One popup per component** - Each component manages its own popup
2. **Close on success** - Popup auto-closes when user clicks OK or outside
3. **Keep messages short** - 1-2 sentences work best
4. **Use appropriate types** - Match the type to the message context
5. **Test on mobile** - Always check mobile responsiveness

---

**Need more help?** Check `PopupNotification.README.md` or `PopupNotificationExample.jsx`
