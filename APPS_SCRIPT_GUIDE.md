# Google Apps Script Setup Guide

To use the Google Apps Script method for uploading images, follow these steps exactly:

## 1. Create the Script

1. Go to [script.google.com](https://script.google.com/) and sign in with your Google account.
2. Click **New project**.
3. Name the project `SIC Image Uploader` (or anything you like).
4. Replace the default `function myFunction() {}` with the code below:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'delete') {
      const fileId = data.fileId;
      try {
        const file = DriveApp.getFileById(fileId);
        file.setTrashed(true);
      } catch (err) {
        // Ignore if file doesn't exist
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'upload') {
      const folderId = data.folderId;
      const filename = data.filename;
      const mimeType = data.mimeType;
      const base64Data = data.base64Data;

      // Ensure the folder exists
      const folder = DriveApp.getFolderById(folderId);
      
      // Decode and create the file
      const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, filename);
      const file = folder.createFile(blob);
      
      // Make it publicly viewable so the app can load it
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        id: file.getId(), 
        url: file.getDownloadUrl() 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    throw new Error('Invalid action');

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 2. Deploy as Web App

1. Click the **Deploy** button (top right) -> **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
3. Under **Description**, type `v1`.
4. Under **Execute as**, select **Me (your email)**. *(Important: this gives the script permission to upload to your drive)*.
5. Under **Who has access**, select **Anyone**. *(Important: this allows your Next.js app to send data to it)*.
6. Click **Deploy**.
7. It will ask for "Authorize access" -> click **Review Permissions** -> choose your account -> click **Advanced** -> click **Go to SIC Image Uploader (unsafe)** -> click **Allow**.
8. Copy the **Web app URL**. It will look like `https://script.google.com/macros/s/AKfycb.../exec`.

## 3. Update Environment Variables

In your Next.js project, edit the `.env.local` file:

```env
# Delete the old Service Account keys, and use this instead:
GOOGLE_APPS_SCRIPT_URL="https://script.google.com/macros/s/YOUR_WEB_APP_ID/exec"
GOOGLE_DRIVE_FOLDER_ID="YOUR_SHARED_FOLDER_ID"
```

*Note: Restart your Next.js server (`npm run dev`) after changing the `.env.local` file!*
