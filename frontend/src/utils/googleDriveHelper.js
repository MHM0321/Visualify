const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

function ensureConfigured() {
  if (!CLIENT_ID) throw new Error('Missing VITE_GOOGLE_CLIENT_ID');
  if (!API_KEY) throw new Error('Missing VITE_GOOGLE_API_KEY');
  if (!window.google?.accounts?.oauth2) throw new Error('Google Identity Services not loaded');
  if (!window.gapi) throw new Error('Google API (gapi) not loaded');
}

/**
 * Uploads a file (Blob or DataURL) to Google Drive
 */
export const uploadToDrive = async (content, fileName, format) => {
  return new Promise((resolve, reject) => {
    try { ensureConfigured(); } catch (e) { reject(e); return; }

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
          mimeType = 'application/json';
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

const loadPicker = () => {
  return new Promise((resolve) => {
    window.gapi.load('picker', { callback: resolve });
  });
};

export const openDrivePicker = async () => {
  return new Promise((resolve, reject) => {
    try { ensureConfigured(); } catch (e) { reject(e); return; }

    let finished = false;
    const timeout = setTimeout(() => {
      if (finished) return;
      finished = true;
      reject('Google auth timed out (popup closed or blocked).');
    }, 12000);

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (response) => {
        if (finished) return;
        clearTimeout(timeout);
        finished = true;
        if (response?.error) return reject(response);

        const accessToken = response.access_token;
        await loadPicker();

        const jsonView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
          .setIncludeFolders(false)
          .setSelectFolderEnabled(false)
          .setMimeTypes('application/json');

        const picker = new window.google.picker.PickerBuilder()
          .addView(jsonView)
          .setOAuthToken(accessToken)
          .setDeveloperKey(API_KEY)
          .setCallback(async (data) => {
            if (data.action === window.google.picker.Action.PICKED) {
              const fileId = data.docs[0].id;
              
              // Fetch file content using the fileId
              try {
                const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                  headers: { Authorization: `Bearer ${accessToken}` }
                });
                const contentType = res.headers.get('content-type') || '';
                const text = await res.text();

                // Drive sometimes returns JSON with odd content-types; be tolerant.
                if (contentType.includes('application/json')) {
                  resolve(JSON.parse(text));
                  return;
                }
                try {
                  resolve(JSON.parse(text));
                } catch {
                  reject('Selected file is not valid JSON');
                }
              } catch (err) {
                reject("Failed to fetch file content");
              }
            } else if (data.action === window.google.picker.Action.CANCEL) {
              reject("Picker cancelled");
            }
          })
          .build();

        picker.setVisible(true);
      },
    });

    // Interactive prompt avoids silent failures where callback never fires.
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

// Optional helper (not exported) for callers that want a force-consent retry.
export const openDrivePickerWithConsentFallback = async () => {
  // Kept for API compatibility with existing callers.
  // `openDrivePicker` now always uses an interactive consent prompt + timeout.
  return openDrivePicker();
};