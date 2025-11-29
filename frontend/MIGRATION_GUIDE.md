# Migration Guide: Toastify to PopupNotification

## Step 1: Remove Toastify Dependencies

```bash
npm uninstall react-toastify
```

## Step 2: Remove Toastify Imports

Find and remove these imports from all files:
```jsx
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
```

## Step 3: Replace Toastify Calls

### Find and Replace Pattern:

**Before:**
```jsx
toast.success('Message');
toast.error('Message');
toast.warning('Message');
toast.info('Message');
```

**After:**
```jsx
showSuccess('Message');
showError('Message');
showWarning('Message');
showInfo('Message');
```

## Step 4: Add PopupNotification to Components

### Add to the top of your component:
```jsx
import PopupNotification from '../components/PopupNotification';
import { usePopupNotification } from '../hooks/usePopupNotification';
```

### Add to your component function:
```jsx
const { popup, showSuccess, showError, showWarning, showInfo, hidePopup } = usePopupNotification();
```

### Add to your JSX (before closing div):
```jsx
{popup.show && (
  <PopupNotification 
    message={popup.message} 
    type={popup.type}
    onClose={hidePopup} 
  />
)}
```

## Step 5: Remove ToastContainer

Remove `<ToastContainer />` from your App.js or root component.

## Complete Example

### Before (Toastify):
```jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const handleLogin = async () => {
    try {
      await login();
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Login failed!');
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};
```

### After (PopupNotification):
```jsx
import React, { useState } from 'react';
import PopupNotification from '../components/PopupNotification';
import { usePopupNotification } from '../hooks/usePopupNotification';

const LoginPage = () => {
  const { popup, showSuccess, showError, hidePopup } = usePopupNotification();

  const handleLogin = async () => {
    try {
      await login();
      showSuccess('Login successful!');
    } catch (error) {
      showError('Login failed!');
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      
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
```

## Search Commands

Use these commands to find all Toastify usages:

### Windows (PowerShell):
```powershell
# Find all files with toast imports
Get-ChildItem -Recurse -Include *.jsx,*.js | Select-String "toast" -List

# Find all files with ToastContainer
Get-ChildItem -Recurse -Include *.jsx,*.js | Select-String "ToastContainer" -List
```

### Linux/Mac:
```bash
# Find all files with toast imports
grep -r "toast" --include="*.jsx" --include="*.js" src/

# Find all files with ToastContainer
grep -r "ToastContainer" --include="*.jsx" --include="*.js" src/
```

## Common Patterns to Replace

| Toastify | PopupNotification |
|----------|-------------------|
| `toast.success(msg)` | `showSuccess(msg)` |
| `toast.error(msg)` | `showError(msg)` |
| `toast.warning(msg)` | `showWarning(msg)` |
| `toast.info(msg)` | `showInfo(msg)` |
| `toast(msg)` | `showInfo(msg)` |

## Testing

After migration, test:
1. ✅ Success notifications appear correctly
2. ✅ Error notifications appear correctly
3. ✅ Clicking OK closes the popup
4. ✅ Clicking outside closes the popup
5. ✅ Mobile responsiveness works
6. ✅ Multiple notifications don't overlap

## Troubleshooting

**Issue:** Popup doesn't appear
- **Solution:** Make sure you added the popup JSX to your component

**Issue:** Multiple popups appear at once
- **Solution:** Each component has its own popup state. This is by design.

**Issue:** Popup doesn't close
- **Solution:** Verify `onClose={hidePopup}` is correctly set

## Need Help?

Check `PopupNotificationExample.jsx` for a working example.
