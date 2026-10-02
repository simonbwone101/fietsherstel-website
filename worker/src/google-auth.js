/**
 * Google Service Account JWT Authentication
 * Generates JWT tokens for Google API calls without OAuth
 * Service Account only - no Client ID or Client Secret needed
 */

export class GoogleServiceAccountAuth {
  constructor(serviceAccountEmail, privateKey) {
    this.serviceAccountEmail = serviceAccountEmail;
    this.privateKey = this.normalizePrivateKey(privateKey);
  }

  normalizePrivateKey(key) {
    if (typeof key !== 'string') {
      throw new Error('Private key must be a string');
    }
    return key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
  }

  async createJWT(scopes) {
    const now = Math.floor(Date.now() / 1000);
    const expiryTime = now + 3600;

    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const scopeString = Array.isArray(scopes) ? scopes.join(' ') : scopes;
    const payload = {
      iss: this.serviceAccountEmail,
      scope: scopeString,
      aud: 'https://oauth2.googleapis.com/token',
      exp: expiryTime,
      iat: now,
    };

    const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${headerEncoded}.${payloadEncoded}`;

    const signature = await this.sign(signingInput);
    return `${signingInput}.${signature}`;
  }

  async getAccessToken(scopes) {
    const jwt = await this.createJWT(scopes);

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }).toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google OAuth token error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  base64UrlEncode(data) {
    let binary = '';
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);

    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    const encoded = btoa(binary);
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  async sign(data) {
    const keyData = this.extractKeyData(this.privateKey);
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      new TextEncoder().encode(data)
    );

    return this.base64UrlEncode(signature);
  }

  extractKeyData(pem) {
    const cleaned = pem
      .split('\n')
      .filter((line) => !line.includes('-----'))
      .join('')
      .replace(/\s+/g, '');

    const binaryString = atob(cleaned);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
