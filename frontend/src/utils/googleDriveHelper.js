const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

/**
 * Uploads a file (Blob or DataURL) to Google Drive
 */
export const uploadToDrive = async (content, fileName, format) => {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (response) => {
        if (response.error !== undefined) {
          reject(response);
          return;
        }

        const accessToken = response.access_token;
        
        // Convert content to Blob if it's a DataURL (PNG) or JSON string
        let fileContent = content;
        let mimeType = 'application/json';

        if (format === 'png') {
          const res = await fetch(content);
          fileContent = await res.blob();
          mimeType = 'image/png';
        } else if (format === 'json') {
          fileContent = new Blob([content], { type: 'application/json' });
        } else if (format === 'pdf') {
          mimeType = 'application/pdf';
        }

        const metadata = {
          name: `${fileName}.${format}`,
          mimeType: mimeType,
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', fileContent);

        try {
          const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
            body: form,
          });
          const data = await res.json();
          resolve(data);
        } catch (err) {
          reject(err);
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};