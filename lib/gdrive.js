import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Service Account auth helper for Google Drive
 * Requires the following env variables:
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL
 * - GOOGLE_PRIVATE_KEY
 * - GOOGLE_DRIVE_FOLDER_ID
 */

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Upload a stream or buffer to Google Drive
 * @param {Buffer|ReadableStream} content 
 * @param {string} fileName 
 * @param {string} mimeType 
 */
export async function uploadToDrive(content, fileName, mimeType) {
  const drive = await getDriveClient();
  
  const fileMetadata = {
    name: fileName,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
  };

  // Convert Buffer to Readable Stream for googleapis
  const media = {
    mimeType: mimeType,
    body: Readable.from(content),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, webViewLink',
    supportsAllDrives: true, // Required for shared folders/drives
  });

  return response.data;
}

/**
 * Delete a file from Google Drive
 * @param {string} fileId 
 */
export async function deleteFromDrive(fileId) {
  if (!fileId) return;
  const drive = await getDriveClient();
  
  try {
    await drive.files.delete({ 
      fileId,
      supportsAllDrives: true 
    });
    return true;
  } catch (error) {
    // If file already deleted or not found, consider it success
    if (error.code === 404) return true;
    throw error;
  }
}
