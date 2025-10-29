# Migration Banner - Optional Site-Wide Notice

## Overview

In addition to the migration notice on the login page, I've created an **optional site-wide banner** that you can display across all pages to notify users before they even try to log in.

This is **completely optional** - the login page already has the migration notice built in.

---

## 📍 When to Use This

**Use the site-wide banner if:**
- ✅ You want maximum visibility for the migration
- ✅ You want to notify users before they try to login
- ✅ You want a consistent message across all pages
- ✅ You're okay with a sticky banner at the top

**Skip the site-wide banner if:**
- ❌ You prefer the login page notice only
- ❌ You don't want to alter your homepage design
- ❌ You want a more subtle approach

**My Recommendation:** Try just the login page notice first. It's less intrusive and still very effective. Add the site-wide banner only if you need extra visibility.

---

## 🚀 How to Add It

### **Option 1: Add to All Pages (Recommended)**

Add to your main layout file:

**File: `app/layout.tsx`**

```typescript
import MigrationBanner from '@/components/migration-banner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {/* Add the migration banner here */}
          <MigrationBanner 
            showBanner={process.env.NEXT_PUBLIC_SHOW_MIGRATION_NOTICE === 'true'}
            launchDate="2025-11-15"  // Your launch date
            autoHideAfterDays={21}    // Hide after 3 weeks
          />
          
          {/* Your existing header, content, etc. */}
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

### **Option 2: Add to Specific Pages Only**

Add to individual pages (e.g., homepage, shop page):

**File: `app/page.tsx` (or any page)**

```typescript
import MigrationBanner from '@/components/migration-banner';

export default function HomePage() {
  return (
    <>
      <MigrationBanner 
        showBanner={true}
        customMessage="We've upgraded our login system! Use social login or reset your password next time you sign in."
      />
      
      {/* Your page content */}
    </>
  );
}
```

---

## ⚙️ Configuration Options

### **Basic Usage (All Defaults)**

```typescript
<MigrationBanner />
```

Shows the banner with default message, always visible.

### **Control with Environment Variable**

```typescript
<MigrationBanner 
  showBanner={process.env.NEXT_PUBLIC_SHOW_MIGRATION_NOTICE === 'true'}
/>
```

Then in `.env.local`:
```bash
NEXT_PUBLIC_SHOW_MIGRATION_NOTICE=true  # or false
```

### **Auto-Hide After Launch Period**

```typescript
<MigrationBanner 
  showBanner={true}
  launchDate="2025-11-15"    // Your launch date (YYYY-MM-DD)
  autoHideAfterDays={21}      // Hide after 21 days
/>
```

Banner will only show:
- ✅ From launch date onwards
- ✅ For 21 days after launch
- ✅ Until user dismisses it

### **Custom Message**

```typescript
<MigrationBanner 
  customMessage="Quick update: We've upgraded to a more secure login. Click here to learn more!"
/>
```

### **Full Configuration**

```typescript
<MigrationBanner 
  showBanner={process.env.NEXT_PUBLIC_SHOW_MIGRATION_NOTICE === 'true'}
  launchDate="2025-11-15"
  autoHideAfterDays={21}
  customMessage="Your custom message here"
/>
```

---

## 🎨 What It Looks Like

### **Desktop View:**

```
╔══════════════════════════════════════════════════════════╗
║ 🎉 New & Improved Login! We've upgraded to a more       [×] ║
║ secure system. Next time you log in, use social         ║
║ login or reset your password. Learn More →              ║
╚══════════════════════════════════════════════════════════╝
```

### **Mobile View:**

```
╔════════════════════════════════╗
║ 🎉 New & Improved Login!  [×] ║
║ We've upgraded... Learn More → ║
╚════════════════════════════════╝
```

**Features:**
- 🎨 Purple gradient background (matches login notice)
- 📌 Sticky at top of page (stays visible while scrolling)
- ❌ Dismissible (user can close it)
- 💾 Remembers dismissal (uses localStorage)
- 📱 Fully responsive
- 🔗 Links to login page

---

## 🎯 Behavior

### **User Dismisses Banner:**
- Closes immediately
- Saved in browser's localStorage
- Won't show again (even after refresh)
- User can clear localStorage to see it again

### **Auto-Hide Logic:**

```
Launch Date: Nov 15, 2025
Auto-Hide: 21 days

Timeline:
├── Nov 1-14: Banner hidden (before launch)
├── Nov 15 - Dec 6: Banner visible (launch period)
└── Dec 7+: Banner hidden (period ended)
```

Users can still dismiss it anytime during the visible period.

---

## 🔧 Customization

### **Change Colors**

In `app/globals.css`, find `.migration-site-banner`:

```css
.migration-site-banner {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  /* Change to your brand colors */
  /* Example: */
  /* background: linear-gradient(90deg, #your-color1 0%, #your-color2 100%); */
}
```

### **Change Position**

Change `position: sticky` to `position: fixed`:

```css
.migration-site-banner {
  position: fixed;  /* Always at top, even when scrolling */
  /* or */
  position: relative;  /* Scrolls with page */
}
```

### **Change Z-Index**

If banner appears behind other elements:

```css
.migration-site-banner {
  z-index: 9999;  /* Increase if needed */
}
```

---

## 📊 Tracking

The banner saves dismissal state in localStorage:

```javascript
// Check if user dismissed banner
const dismissed = localStorage.getItem('migration-banner-dismissed');
console.log(dismissed); // 'true' if dismissed
```

You could track this in analytics if needed:

```typescript
// In migration-banner.tsx, add to handleDismiss:
const handleDismiss = () => {
  setIsVisible(false);
  localStorage.setItem('migration-banner-dismissed', 'true');
  
  // Optional: Track in analytics
  // analytics.track('Migration Banner Dismissed');
};
```

---

## 🆚 Comparison: Login Notice vs Site-Wide Banner

| Feature | Login Page Notice | Site-Wide Banner |
|---------|------------------|------------------|
| **Visibility** | Only on login page | All pages |
| **Intrusiveness** | Low | Medium |
| **Effectiveness** | High (at right time) | High (always visible) |
| **User Impact** | Minimal | More noticeable |
| **Design Impact** | None (isolated) | Adds to all pages |
| **Recommended For** | Most migrations | High-stakes migrations |

---

## 💡 My Recommendation

### **Start With:**
✅ Just the login page notice (already implemented)

### **Add Site-Wide Banner If:**
- You need maximum visibility
- You have a large, active user base
- You want to minimize support tickets
- You're doing a hard cutover (old system stops working)

### **Skip Site-Wide Banner If:**
- You prefer subtle approach
- Login page notice is enough
- You want to preserve homepage design
- Users are already aware of changes

---

## 🎬 Example Implementations

### **Conservative Approach (Recommended)**
```typescript
// app/layout.tsx
// No site-wide banner - just use login page notice
```

Users see notice when they try to login. Clean, non-intrusive.

### **Moderate Approach**
```typescript
// app/layout.tsx
<MigrationBanner 
  showBanner={process.env.NEXT_PUBLIC_SHOW_MIGRATION_NOTICE === 'true'}
  launchDate="2025-11-15"
  autoHideAfterDays={14}  // Shorter period
/>
```

Banner shows for 2 weeks, controlled by env variable.

### **Aggressive Approach**
```typescript
// app/layout.tsx
<MigrationBanner 
  showBanner={true}
  customMessage="IMPORTANT: You must reset your password by [DATE] to continue accessing your account. Reset now!"
/>
```

Maximum visibility, urgent tone. Only use for hard deadlines.

---

## 🧪 Testing

### **Test Dismissal:**
1. Visit any page with banner
2. Click the X button
3. Refresh page → banner should stay hidden
4. Clear localStorage → banner appears again

### **Test Auto-Hide:**
1. Set launch date to yesterday
2. Set autoHideAfterDays to 1
3. Banner should be visible today
4. Change date to 2 days ago → banner hides

### **Test Mobile:**
1. Open browser dev tools
2. Toggle device emulation
3. Verify text wraps properly
4. Check close button is accessible

---

## 📝 Summary

**What I've Created:**
- ✅ Optional site-wide banner component
- ✅ Full configuration options
- ✅ Auto-hide functionality
- ✅ Dismissible with memory
- ✅ Responsive design
- ✅ Matching styling

**What You Should Do:**
1. Start with just the login page notice (already done)
2. Monitor user response
3. Add site-wide banner only if needed
4. Use for 2-3 weeks max
5. Remove after migration settles

**Files Created:**
- `components/migration-banner.tsx` - Banner component
- `app/globals.css` - Banner styling (already added)
- This guide - Usage instructions

---

## 🎉 You're All Set!

The login page notice is your primary tool. The site-wide banner is there if you need it.

**Questions?** Check the main `MIGRATION_SUMMARY.md` or other guides!

**Ready to launch?** Follow `MIGRATION_QUICK_START.md` checklist!

