/**
 * Google Sheets API Client
 * Handles spreadsheet access for booking records
 */

export class GoogleSheetsAPI {
  constructor(auth, tokenCache = new Map()) {
    this.auth = auth;
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    this.tokenCache = tokenCache;
    this.scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  }

  async getAccessToken() {
    const cacheKey = 'sheets_token';
    const cached = this.tokenCache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.token;
    }

    const token = await this.auth.getAccessToken(this.scopes);
    this.tokenCache.set(cacheKey, {
      token,
      expiry: Date.now() + 50 * 60 * 1000,
    });

    return token;
  }

  /**
   * Get spreadsheet metadata
   */
  async getSpreadsheet(spreadsheetId, accessToken = null) {
    const token = accessToken || (await this.getAccessToken());
    const response = await fetch(`${this.baseUrl}/${spreadsheetId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Could not access spreadsheet metadata');
    }

    return response.json();
  }

  /**
   * Ensure a sheet exists, create if not
   */
  async ensureSheet(spreadsheetId, sheetTitle, accessToken = null) {
    const token = accessToken || (await this.getAccessToken());
    const spreadsheet = await this.getSpreadsheet(spreadsheetId, token);

    const exists = spreadsheet.sheets?.some(sheet => sheet.properties.title === sheetTitle);
    if (exists) return;

    const response = await fetch(`${this.baseUrl}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          addSheet: {
            properties: {
              title: sheetTitle,
              gridProperties: {
                rowCount: 1000,
                columnCount: 10,
              },
            },
          },
        }],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create spreadsheet sheet');
    }
  }

  /**
   * Append rows to spreadsheet
   */
  async appendRow(spreadsheetId, range, values) {
    const accessToken = await this.getAccessToken();
    const sheetName = range.split('!')[0];
    await this.ensureSheet(spreadsheetId, sheetName, accessToken);

    const response = await fetch(
      `${this.baseUrl}/${spreadsheetId}/values/${encodeURIComponent(range)}:append`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Append row failed: ${errorBody.error?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get range values from spreadsheet
   */
  async getRange(spreadsheetId, range) {
    const accessToken = await this.getAccessToken();
    const response = await fetch(
      `${this.baseUrl}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Could not read spreadsheet range');
    }

    return response.json();
  }
}
