/**
 * Google Sheets API Client
 * Handles spreadsheet operations using Service Account authentication
 * - Append booking records to spreadsheet
 * - Read existing bookings
 * - Create/manage sheets
 */

export class GoogleSheetsAPI {
  constructor(auth, tokenCache = new Map()) {
    this.auth = auth;
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    this.tokenCache = tokenCache;
    this.scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  }

  /**
   * Get or retrieve cached access token
   */
  async getAccessToken() {
    const cacheKey = 'sheets_token';
    const cached = this.tokenCache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return cached.token;
    }

    const token = await this.auth.getAccessToken(this.scopes);
    // Cache for 50 minutes (tokens valid for 1 hour)
    this.tokenCache.set(cacheKey, {
      token,
      expiry: Date.now() + 50 * 60 * 1000,
    });

    return token;
  }

  /**
   * Append rows to a spreadsheet
   * Creates the sheet if it doesn't exist
   * 
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} range - Range in A1 notation (e.g., 'Boekingen!A:I')
   * @param {Array<Array>} values - Array of rows to append
   */
  async appendRow(spreadsheetId, range, values) {
    try {
      const accessToken = await this.getAccessToken();

      // First, ensure the sheet exists
      const sheetName = range.split('!')[0];
      await this.ensureSheet(spreadsheetId, sheetName, accessToken);

      const response = await fetch(
        `${this.baseUrl}/${spreadsheetId}/values/${encodeURIComponent(range)}:append`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
        const error = await response.json();
        throw new Error(`Append row error: ${error.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error appending to spreadsheet:', error);
      throw new Error(`Failed to append booking to spreadsheet: ${error.message}`);
    }
  }

  /**
   * Get values from a range
   * 
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} range - Range in A1 notation
   */
  async getRange(spreadsheetId, range) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.baseUrl}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Get range error: ${error.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching range:', error);
      throw new Error(`Failed to read spreadsheet: ${error.message}`);
    }
  }

  /**
   * Get spreadsheet metadata
   */
  async getSpreadsheet(spreadsheetId, accessToken = null) {
    try {
      const token = accessToken || await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/${spreadsheetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Get spreadsheet error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching spreadsheet:', error);
      throw new Error(`Failed to get spreadsheet metadata: ${error.message}`);
    }
  }

  /**
   * Ensure a sheet exists in the spreadsheet
   * Creates it if it doesn't exist
   * 
   * @param {string} spreadsheetId - Spreadsheet ID
   * @param {string} sheetTitle - Title of the sheet
   * @param {string} accessToken - Cached access token
   */
  async ensureSheet(spreadsheetId, sheetTitle, accessToken = null) {
    try {
      const token = accessToken || await this.getAccessToken();
      const spreadsheet = await this.getSpreadsheet(spreadsheetId, token);

      // Check if sheet already exists
      const sheetExists = spreadsheet.sheets?.some(
        (sheet) => sheet.properties.title === sheetTitle
      );

      if (sheetExists) {
        return; // Sheet already exists
      }

      // Create new sheet
      const response = await fetch(`${this.baseUrl}/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetTitle,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 10,
                  },
                },
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Create sheet error: ${response.statusText}`);
      }

      console.log(`Sheet '${sheetTitle}' created successfully`);
    } catch (error) {
      console.error('Error ensuring sheet exists:', error);
      throw new Error(`Failed to ensure sheet exists: ${error.message}`);
    }
  }

  /**
   * Add header row to a sheet (for new bookings sheet)
   */
  async addHeaders(spreadsheetId, sheetName) {
    try {
      const headers = [
        ['Timestamp', 'Naam', 'Email', 'Telefoon', 'Service', 'Datum', 'Tijd', 'Beschrijving', 'Calendar Link'],
      ];

      const range = `${sheetName}!A1:I1`;
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.baseUrl}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: headers,
            majorDimension: 'ROWS',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Add headers error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding headers:', error);
      throw new Error(`Failed to add headers: ${error.message}`);
    }
  }

  /**
   * Update cell values
   */
  async updateCell(spreadsheetId, range, values) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.baseUrl}/${spreadsheetId}/values/${encodeURIComponent(range)}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values,
            majorDimension: 'ROWS',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Update cell error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating cells:', error);
      throw new Error(`Failed to update cells: ${error.message}`);
    }
  }
}
