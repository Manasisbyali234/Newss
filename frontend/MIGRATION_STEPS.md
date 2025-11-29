# 🚀 Quick Migration from Toastify to PopupNotification

## ⚠️ IMPORTANT: You have 337 Toastify usages in 32 files that need to be migrated!

The PopupNotification component is ready, but you need to replace all `showToast()` calls.

## 📋 Step-by-Step Migration (Choose ONE approach):

### Option 1: Keep Using showToast (Easiest - Recommended)

Instead of replacing 337 calls, update your `showToast` utility function to use PopupNotification:

1. **Find your showToast utility** (likely in `utils/` or `globals/`)
2. **Replace the implementation** to use PopupNotification instead of Toastify

**Example:**
```javascript
// OLD (Toastify):
export const showToast = (message, type = 'info', duration = 3000) => {
  toast[type](message, { autoClose: duration });
};

// NEW (PopupNotification):
import { createRoot } from 'react-dom/client';
import PopupNotification from '../components/PopupNotification';

export const showToast = (message, type = 'info') => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  const root = createRoot(container);
  root.render(
    <PopupNotification 
      message={message}
      type={type}
      onClose={() => {
        root.unmount();
        document.body.removeChild(container);
      }}
    />
  );
};
```

### Option 2: Manual Migration (Time-consuming)

Replace each file one by one:

**For each file:**

1. **Remove Toastify import:**
   ```javascript
   // Remove this:
   import { showToast } from '../../utils/toast';
   ```

2. **Add PopupNotification imports:**
   ```javascript
   import PopupNotification from '../components/PopupNotification';
   import { usePopupNotification } from '../hooks/usePopupNotification';
   ```

3. **Add hook in component:**
   ```javascript
   const { popup, showSuccess, showError, showWarning, showInfo, hidePopup } = usePopupNotification();
   ```

4. **Replace calls:**
   ```javascript
   // OLD:
   showToast('Success!', 'success');
   showToast('Error!', 'error');
   showToast('Warning!', 'warning');
   showToast('Info!', 'info');
   
   // NEW:
   showSuccess('Success!');
   showError('Error!');
   showWarning('Warning!');
   showInfo('Info!');
   ```

5. **Add popup JSX before closing div:**
   ```javascript
   {popup.show && (
     <PopupNotification 
       message={popup.message} 
       type={popup.type}
       onClose={hidePopup} 
     />
   )}
   ```

## 🎯 Recommended Approach: Option 1

**Option 1 is MUCH faster** because you only need to update ONE file instead of 32 files!

## 📁 Files That Need Migration (32 files):

1. admin-candidates.jsx (4 usages)
2. admin-emp-manage.jsx (6 usages)
3. admin-individual-credit.jsx (5 usages)
4. admin-jobs-skills.jsx (1 usage)
5. admin-placement-manage-tabs.jsx (7 usages)
6. admin-placement-manage.jsx (6 usages)
7. admin-sub-admin.jsx (6 usages)
8. admin-support-tickets.jsx (17 usages)
9. placement-details.jsx (26 usages)
10. application-status.jsx (2 usages)
11. interview-response-modal.jsx (4 usages)
12. section-can-basic-info.jsx (1 usage)
13. section-can-attachment.jsx (11 usages)
14. section-can-education.jsx (24 usages)
15. section-can-employment.jsx (6 usages)
16. section-can-keyskills.jsx (4 usages)
17. section-can-personal.jsx (4 usages)
18. section-can-profile-summary.jsx (13 usages)
19. section-can-resume-headline.jsx (4 usages)
20. CreateassessmentModal.jsx (9 usages)
21. emp-candidate-review.jsx (15 usages)
22. emp-company-profile.jsx (42 usages)
23. InterviewProcessManager.jsx (7 usages)
24. emp-post-job.jsx (23 usages)
25. emp-posted-jobs.jsx (6 usages)
26. AssessmentDashboard.jsx (5 usages)
27. placement-dashboard.jsx (31 usages)
28. emp-detail1.jsx (3 usages)
29. index16.jsx (13 usages)
30. job-detail1.jsx (6 usages)
31. ToastContainer.jsx (1 usage)
32. errorHandler.js (1 usage)

## ⏱️ Time Estimate:

- **Option 1:** 15-30 minutes (update 1 utility file)
- **Option 2:** 4-6 hours (update 32 files manually)

## 🚀 Start Here:

1. Find your `showToast` utility function
2. Update it to use PopupNotification
3. Test in one component
4. Done! All 337 usages will work automatically

## 💡 Need Help?

Check these files for reference:
- `PopupNotificationExample.jsx` - Working example
- `POPUP_QUICK_REFERENCE.md` - Quick reference
- `HOW_TO_USE_POPUP.txt` - Simple guide
