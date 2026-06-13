// E2EE Cryptography Helper using the browser's Web Crypto API

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== 'undefined' ? window.btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = typeof window !== 'undefined' ? window.atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate RSA-OAEP key pair (2048-bit modulus, SHA-256)
export async function generateE2EKeys() {
  if (typeof window === 'undefined') {
    throw new Error('Web Crypto is only available in the browser.');
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const exportedPublic = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const exportedPrivate = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  const publicKeyBase64 = arrayBufferToBase64(exportedPublic);
  const privateKeyBase64 = arrayBufferToBase64(exportedPrivate);

  return {
    publicKeyBase64,
    privateKeyBase64,
    privateKeyCrypto: keyPair.privateKey,
    publicKeyCrypto: keyPair.publicKey
  };
}

// Derive a 256-bit AES-GCM key from user's password and a salt using PBKDF2
export async function deriveAesKey(password: string, saltHexOrBase64: string): Promise<CryptoKey> {
  if (typeof window === 'undefined') {
    throw new Error('Web Crypto is only available in the browser.');
  }

  const enc = new TextEncoder();
  // Ensure the salt is converted to an ArrayBuffer
  let saltBuffer: ArrayBuffer | Uint8Array;
  try {
    saltBuffer = base64ToArrayBuffer(saltHexOrBase64);
  } catch {
    saltBuffer = enc.encode(saltHexOrBase64);
  }

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt the exported private key using the password-derived AES key
export async function encryptPrivateKey(privateKeyBase64: string, aesKey: CryptoKey) {
  if (typeof window === 'undefined') {
    throw new Error('Web Crypto is only available in the browser.');
  }

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    privateKeyBuffer
  );

  return {
    encryptedPrivateKeyBase64: arrayBufferToBase64(encrypted),
    ivBase64: arrayBufferToBase64(iv.buffer)
  };
}

// Decrypt the encrypted private key and import it back as a CryptoKey
export async function decryptPrivateKey(
  encryptedPrivateKeyBase64: string,
  aesKey: CryptoKey,
  ivBase64: string
): Promise<CryptoKey> {
  if (typeof window === 'undefined') {
    throw new Error('Web Crypto is only available in the browser.');
  }

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToArrayBuffer(ivBase64) },
    aesKey,
    base64ToArrayBuffer(encryptedPrivateKeyBase64)
  );

  return await window.crypto.subtle.importKey(
    'pkcs8',
    decryptedBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt']
  );
}

// Import public key from base64 SPKI
export async function importPublicKey(spkiBase64: string): Promise<CryptoKey> {
  if (typeof window === 'undefined') {
    throw new Error('Web Crypto is only available in the browser.');
  }

  const buffer = base64ToArrayBuffer(spkiBase64);
  return await window.crypto.subtle.importKey(
    'spki',
    buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
}

// Export CryptoKey to JWK string (for sessionStorage caching)
export async function exportKeyToJwk(key: CryptoKey): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Web Crypto is only available in the browser.');
  }
  const jwk = await window.crypto.subtle.exportKey('jwk', key);
  return JSON.stringify(jwk);
}

// Import CryptoKey from JWK string
export async function importKeyFromJwk(jwkString: string, type: 'public' | 'private'): Promise<CryptoKey> {
  if (typeof window === 'undefined') {
    throw new Error('Web Crypto is only available in the browser.');
  }
  const jwk = JSON.parse(jwkString);
  return await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    type === 'public' ? ['encrypt'] : ['decrypt']
  );
}

// Hybrid Encryption: Encrypt message with recipient's RSA public key
export async function encryptHybrid(plaintext: string, recipientPublicKey: CryptoKey): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Web Crypto is only available in the browser.');
  }

  // 1. Generate random 256-bit AES key for the message
  const messageAesKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  // 2. Export the message AES key as raw bytes
  const rawAesKey = await window.crypto.subtle.exportKey('raw', messageAesKey);

  // 3. Encrypt the raw AES key using the recipient's RSA public key
  const encryptedAesKey = await window.crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    recipientPublicKey,
    rawAesKey
  );

  // 4. Generate random 12-byte IV for the message encryption
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // 5. Encrypt the message text with the message AES key
  const enc = new TextEncoder();
  const encryptedMessage = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    messageAesKey,
    enc.encode(plaintext)
  );

  // 6. Return self-contained E2EE packet JSON
  return JSON.stringify({
    ek: arrayBufferToBase64(encryptedAesKey),
    iv: arrayBufferToBase64(iv.buffer),
    ct: arrayBufferToBase64(encryptedMessage)
  });
}

// Hybrid Decryption: Decrypt message with user's RSA private key
export async function decryptHybrid(e2eePacketJson: string, myPrivateKey: CryptoKey): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Web Crypto is only available in the browser.');
  }

  const { ek, iv, ct } = JSON.parse(e2eePacketJson);

  // 1. Decrypt raw AES key using user's private RSA key
  const rawAesKey = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    myPrivateKey,
    base64ToArrayBuffer(ek)
  );

  // 2. Import the decrypted AES key
  const messageAesKey = await window.crypto.subtle.importKey(
    'raw',
    rawAesKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  // 3. Decrypt ciphertext using the AES key and IV
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToArrayBuffer(iv) },
    messageAesKey,
    base64ToArrayBuffer(ct)
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}
