# Ebook Download System Setup Guide

This guide will walk you through setting up the ebook download system using Strapi Media Library.

## Overview

The ebook download system allows customers to:
1. Receive an email with a direct download link after purchasing the ebook
2. Download the ebook from their order history page
3. Access the ebook securely (purchase verification required)

## Prerequisites

- ✅ Product already exists in Strapi with slug: `peony-masterclass-ebook`
- ✅ Product already exists in Stripe with corresponding IDs
- ✅ Strapi API token configured in environment variables

## Step 1: Upload Ebook File to Strapi Media Library

1. **Log into your Strapi Admin Panel**
   - Navigate to: `https://content.thepipedpeony.com/admin` (or your Strapi URL)

2. **Go to Media Library**
   - Click on "Media Library" in the left sidebar

3. **Upload the Ebook File**
   - Click "Add new assets" or drag and drop your PDF file
   - Select your `peony-masterclass-ebook.pdf` file (29 pages)
   - Wait for upload to complete
   - **Important**: Note the filename - it should contain "peony-masterclass-ebook" or "ebook" for automatic detection

4. **Get the File ID (Optional but Recommended)**
   - Click on the uploaded file in Media Library
   - Look at the URL in your browser - it will show something like: `/admin/plugins/upload/1`
   - The number at the end (e.g., `1`) is the file ID
   - Or check the file details - the ID will be shown there
   - Add this to your `.env` file as: `STRAPI_EBOOK_FILE_ID=1` (replace 1 with your actual ID)

## Step 2: Configure Environment Variable (Optional)

If you have the file ID, add it to your `.env` file for faster access:

```env
STRAPI_EBOOK_FILE_ID=your_file_id_here
```

**Note**: If you don't set this, the system will automatically search for files containing "peony-masterclass-ebook" or "ebook" in the filename.

## Step 3: Verify Strapi API Configuration

Ensure your environment variables are set correctly:

```env
NEXT_PUBLIC_STRAPI_URL=https://content.thepipedpeony.com
STRAPI_API_TOKEN=your_strapi_api_token_here
```

**To get your Strapi API Token:**
1. Go to Strapi Admin → Settings → API Tokens
2. Create a new token or use existing one
3. Make sure it has "Read" permissions for Products

## Step 4: Test the System

### Test 1: Verify API Route
1. Make a test purchase of the ebook (or use Stripe test mode)
2. After purchase, try accessing: `https://yourdomain.com/api/download-ebook`
3. You should be prompted to download the PDF (if logged in and purchased)

### Test 2: Check Email
1. After purchase, check the customer's email
2. Look for the ebook download section with a download button
3. Click the download link - it should work

### Test 3: Check Order History
1. Log in as the customer
2. Go to `/my-account`
3. Expand the order containing the ebook
4. You should see a "Download Ebook" button
5. Click it - the PDF should download

## Step 5: Verify Stripe Product Configuration

Make sure your Stripe product is configured correctly:

1. **Product Name** should contain: "Peony Masterclass eBook" or "Masterclass eBook"
2. **Product Metadata** (optional but recommended):
   - Add metadata key: `slug` with value: `peony-masterclass-ebook`
   - This helps with more reliable detection

**To add metadata in Stripe:**
1. Go to Stripe Dashboard → Products
2. Click on your ebook product
3. Scroll to "Metadata" section
4. Add key: `slug`, value: `peony-masterclass-ebook`
5. Save

## How It Works

### Purchase Flow:
1. Customer purchases ebook through Stripe Checkout
2. Webhook receives `checkout.session.completed` event
3. System detects ebook purchase by checking product name/metadata
4. Email is sent with download link
5. Order is saved with ebook item

### Download Flow:
1. Customer clicks download link (from email or order history)
2. Request goes to `/api/download-ebook`
3. System verifies:
   - User is authenticated
   - User has purchased the ebook (checks Stripe orders)
4. System fetches ebook file URL from Strapi
5. File is streamed to user with proper headers

## Troubleshooting

### Issue: "Ebook file not found in Strapi Media Library"
**Solution:** 
- Make sure you've uploaded the PDF to Strapi Media Library (not to a product field)
- Verify the filename contains "peony-masterclass-ebook" or "ebook" for automatic detection
- Or set `STRAPI_EBOOK_FILE_ID` environment variable with the file ID

### Issue: "You must purchase the ebook to download it"
**Solution:** 
- Verify the user has completed a purchase
- Check that Stripe customer ID is linked in Clerk metadata
- Verify product name matches detection criteria

### Issue: Download link doesn't work in email
**Solution:**
- Make sure `NEXT_PUBLIC_SITE_URL` is set correctly
- Verify the API route is accessible
- Check browser console for errors

### Issue: File not downloading
**Solution:**
- Check Strapi file URL is accessible
- Verify file permissions in Strapi
- Check browser download settings

## Security Features

✅ **Purchase Verification**: Only users who purchased the ebook can download it
✅ **Authentication Required**: Must be logged in to download
✅ **Secure File Serving**: Files are served through API route, not direct links
✅ **No Public Access**: Ebook files are not publicly accessible

## File Size Considerations

- Your 29-page PDF should work fine
- For larger files (>50MB), consider:
  - Using a CDN
  - Implementing chunked downloads
  - Using cloud storage (S3, Cloudinary)

## Next Steps

1. ✅ Upload your test PDF to Strapi
2. ✅ Test a purchase in Stripe test mode
3. ✅ Verify email contains download link
4. ✅ Test download from order history
5. ✅ Test download from email link

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check server logs for API errors
3. Verify all environment variables are set
4. Ensure Strapi product is published

---

**Note:** The system automatically detects ebook purchases by checking if the product name contains "peony masterclass ebook", "masterclass ebook", or "ebook". Make sure your Stripe product name matches one of these patterns.

