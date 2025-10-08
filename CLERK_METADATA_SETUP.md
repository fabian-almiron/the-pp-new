# 🎯 Clerk Metadata Setup - Visual Guide

## Step-by-Step: Adding Roles to Users

### **Part 1: Configure Session Token (One-Time Setup)**

1. **Navigate to Sessions Configuration**
   ```
   Clerk Dashboard → Configure (tab) → Sessions
   ```

2. **Find "Customize session token" section**
   - Scroll down to find the **Claims** editor
   - You'll see a JSON editor with `{}` 

3. **Add this JSON to Claims:**
   ```json
   {
     "metadata": "{{user.public_metadata}}"
   }
   ```

4. **Click Save**

   ✅ This makes metadata available in your session tokens!

---

### **Part 2: Set User Roles**

1. **Go to Users Tab**
   ```
   Clerk Dashboard → Users (top navigation)
   ```

2. **Select a User**
   - Click on any user from the list
   - Click on your own user to test first

3. **Find "User metadata" Section**
   - Scroll down on the user's profile page
   - Look for a section titled **"User metadata"**
   - You'll see three options:
     - 📘 **Public** ← Use this for roles
     - 🔒 **Private** ← For sensitive data
     - ⚠️ **Unsafe** ← User-editable

4. **Click "Edit" next to Public**
   - Click the pencil/edit icon next to "Public"
   - A JSON editor will appear

5. **Add Role JSON:**
   
   **For a Customer (free tier):**
   ```json
   {
     "role": "customer"
   }
   ```

   **For a Subscriber (premium tier):**
   ```json
   {
     "role": "subscriber"
   }
   ```

6. **Click Save**

---

### **Quick Test Checklist:**

✅ Session token configured with metadata  
✅ Your user has role set to "customer" or "subscriber"  
✅ Restart your dev server (`pnpm dev`)  
✅ Log in to your account  
✅ Navigate to `/my-account` - you should see your role badge!  

---

## 🎨 What the Metadata Section Looks Like:

```
╔══════════════════════════════════════╗
║         USER PROFILE PAGE            ║
╠══════════════════════════════════════╣
║  Name: John Doe                      ║
║  Email: john@example.com             ║
║  ...                                 ║
║                                      ║
║  ┌─ User metadata ─────────────┐    ║
║  │                              │    ║
║  │  📘 Public       [Edit]      │    ║
║  │  🔒 Private      [Edit]      │    ║
║  │  ⚠️  Unsafe       [Edit]      │    ║
║  │                              │    ║
║  └──────────────────────────────┘    ║
╚══════════════════════════════════════╝
```

---

## 🔍 Can't Find User Metadata?

**Make sure you're:**
1. ✅ On a **specific user's profile page** (not the users list)
2. ✅ Scrolling **down past the authentication methods**
3. ✅ Looking for the section labeled **"User metadata"**

**If still not visible:**
- Try refreshing the page
- Make sure you have admin access to the Clerk project
- Check you're on the correct Clerk instance

---

## 🧪 Testing Your Setup:

### Test 1: Check Session Token
```bash
# In your browser console (when logged in):
console.log(await window.Clerk?.session?.getToken())
```

Look for `metadata.role` in the decoded JWT!

### Test 2: Check in Your App
```typescript
// Add this to any component
import { useRole } from "@/hooks/use-role"

function TestRole() {
  const { role, roleDisplayName } = useRole()
  return <div>Your role: {roleDisplayName} ({role})</div>
}
```

---

## 📚 Reference

Official Clerk Guide: https://clerk.com/docs/guides/secure/basic-rbac

This is the exact guide we followed for the implementation!

---

## 🆘 Need Help?

1. **Session token not working?**
   - Double-check the JSON syntax in Sessions → Claims
   - Restart your dev server
   - Clear browser cookies and log in again

2. **Metadata not saving?**
   - Make sure you clicked "Save" (not just close)
   - Check for JSON syntax errors
   - Try refreshing the user profile page

3. **Role not showing in app?**
   - Verify session token is configured
   - Log out and log back in
   - Check browser console for errors
   - Verify `.env.local` has correct Clerk keys
