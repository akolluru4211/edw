'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import {
  generateE2EKeys,
  deriveAesKey,
  encryptPrivateKey,
  decryptPrivateKey,
  exportKeyToJwk,
  importKeyFromJwk
} from '@/lib/crypto';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'ALUMNI' | 'MENTOR' | 'ADMIN';
  memberId?: string;
  publicKey?: string;
  encryptedPrivateKey?: string;
  keySalt?: string;
  keyIv?: string;
  edPoints?: number;
  plan?: 'FREE' | 'PRO' | 'PREMIUM';
  subscriptionExpiresAt?: string;
  profile?: {
    id: string;
    collegeName: string;
    degree: string;
    branch: string;
    graduationYear: number;
    interests: string; // JSON string in SQLite
    goals: string; // JSON string in SQLite
    readinessScore: number;
    bio?: string;
    avatarUrl?: string;
    portfolioUrl?: string;
    dob?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: any) => Promise<void>;
  loginWithOAuth: (providerName: 'google' | 'github') => Promise<void>;
  registerUser: (formData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  decryptedPrivateKey: CryptoKey | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('edworld_token');
      if (!token) {
        setUser(null);
        setDecryptedPrivateKey(null);
        setLoading(false);
        return;
      }
      const response = await api.get('/auth/me');
      setUser(response.data);

      // Restore decrypted private key from sessionStorage if available
      const cachedJwk = sessionStorage.getItem('edworld_private_key');
      if (cachedJwk) {
        try {
          const privateKey = await importKeyFromJwk(cachedJwk, 'private');
          setDecryptedPrivateKey(privateKey);
        } catch (err) {
          console.error('Failed to restore cached private key:', err);
        }
      }
    } catch (error: any) {
      console.error('Failed to restore session:', error);
      // Only clear credentials if we got an explicit 401 or 403 response status.
      // Do not clear the token on network connection errors or server 5xx errors.
      const isSessionExpired = error?.response && (error.response.status === 401 || error.response.status === 403);
      if (isSessionExpired) {
        localStorage.removeItem('edworld_token');
        sessionStorage.removeItem('edworld_private_key');
        setUser(null);
        setDecryptedPrivateKey(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: loggedUser } = response.data;
      localStorage.setItem('edworld_token', token);

      // Decrypt or generate E2EE keys
      if (loggedUser.encryptedPrivateKey && loggedUser.keySalt && loggedUser.keyIv) {
        // Derive key from login password
        const aesKey = await deriveAesKey(password, loggedUser.keySalt);
        // Decrypt the private key
        const privateKey = await decryptPrivateKey(
          loggedUser.encryptedPrivateKey,
          aesKey,
          loggedUser.keyIv
        );
        
        // Cache in sessionStorage
        const jwkStr = await exportKeyToJwk(privateKey);
        sessionStorage.setItem('edworld_private_key', jwkStr);
        setDecryptedPrivateKey(privateKey);
      } else {
        // Legacy user check - generate new E2E keys for them
        const keys = await generateE2EKeys();
        const saltBuffer = window.crypto.getRandomValues(new Uint8Array(16));
        let saltBinary = '';
        for (let i = 0; i < saltBuffer.byteLength; i++) {
          saltBinary += String.fromCharCode(saltBuffer[i]);
        }
        const saltBase64 = window.btoa(saltBinary);
        
        const aesKey = await deriveAesKey(password, saltBase64);
        const encrypted = await encryptPrivateKey(keys.privateKeyBase64, aesKey);
        
        // Save keys on server
        await api.post('/auth/save-keys', {
          publicKey: keys.publicKeyBase64,
          encryptedPrivateKey: encrypted.encryptedPrivateKeyBase64,
          keySalt: saltBase64,
          keyIv: encrypted.ivBase64
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Cache in sessionStorage
        const jwkStr = await exportKeyToJwk(keys.privateKeyCrypto);
        sessionStorage.setItem('edworld_private_key', jwkStr);
        setDecryptedPrivateKey(keys.privateKeyCrypto);

        // Update fields in loggedUser for immediate state alignment
        loggedUser.publicKey = keys.publicKeyBase64;
        loggedUser.encryptedPrivateKey = encrypted.encryptedPrivateKeyBase64;
        loggedUser.keySalt = saltBase64;
        loggedUser.keyIv = encrypted.ivBase64;
      }

      setUser(loggedUser);
      router.push('/');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (formData: any) => {
    setLoading(true);
    try {
      // 1. Generate E2E keys
      const keys = await generateE2EKeys();
      // Generate a random salt for password derivation (base64)
      const saltBuffer = window.crypto.getRandomValues(new Uint8Array(16));
      let saltBinary = '';
      for (let i = 0; i < saltBuffer.byteLength; i++) {
        saltBinary += String.fromCharCode(saltBuffer[i]);
      }
      const saltBase64 = window.btoa(saltBinary);

      // 2. Derive AES key from password
      const aesKey = await deriveAesKey(formData.password, saltBase64);

      // 3. Encrypt the private key
      const encrypted = await encryptPrivateKey(keys.privateKeyBase64, aesKey);

      // 4. Attach keys to the registration data
      const extendedFormData = {
        ...formData,
        publicKey: keys.publicKeyBase64,
        encryptedPrivateKey: encrypted.encryptedPrivateKeyBase64,
        keySalt: saltBase64,
        keyIv: encrypted.ivBase64
      };

      const response = await api.post('/auth/register', extendedFormData);
      const { token, user: registeredUser } = response.data;
      localStorage.setItem('edworld_token', token);
      
      // Cache the private key in sessionStorage for reloads
      const jwkStr = await exportKeyToJwk(keys.privateKeyCrypto);
      sessionStorage.setItem('edworld_private_key', jwkStr);
      setDecryptedPrivateKey(keys.privateKeyCrypto);

      setUser(registeredUser);
      router.push('/');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('edworld_token');
    sessionStorage.removeItem('edworld_private_key');
    setDecryptedPrivateKey(null);
    setUser(null);
    router.push('/login');
  };

  const loginWithOAuth = async (providerName: 'google' | 'github') => {
    setLoading(true);
    try {
      const provider = providerName === 'google' ? googleProvider : githubProvider;
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const response = await api.post('/auth/firebase-login', { idToken });
      const { token, user: loggedUser } = response.data;
      localStorage.setItem('edworld_token', token);
      
      // E2EE Keys Setup for OAuth using user UID as passphrase
      if (loggedUser.encryptedPrivateKey && loggedUser.keySalt && loggedUser.keyIv) {
        const aesKey = await deriveAesKey(loggedUser.id, loggedUser.keySalt);
        const privateKey = await decryptPrivateKey(
          loggedUser.encryptedPrivateKey,
          aesKey,
          loggedUser.keyIv
        );
        const jwkStr = await exportKeyToJwk(privateKey);
        sessionStorage.setItem('edworld_private_key', jwkStr);
        setDecryptedPrivateKey(privateKey);
      } else {
        const keys = await generateE2EKeys();
        const saltBuffer = window.crypto.getRandomValues(new Uint8Array(16));
        let saltBinary = '';
        for (let i = 0; i < saltBuffer.byteLength; i++) {
          saltBinary += String.fromCharCode(saltBuffer[i]);
        }
        const saltBase64 = window.btoa(saltBinary);
        
        const aesKey = await deriveAesKey(loggedUser.id, saltBase64);
        const encrypted = await encryptPrivateKey(keys.privateKeyBase64, aesKey);
        
        await api.post('/auth/save-keys', {
          publicKey: keys.publicKeyBase64,
          encryptedPrivateKey: encrypted.encryptedPrivateKeyBase64,
          keySalt: saltBase64,
          keyIv: encrypted.ivBase64
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const jwkStr = await exportKeyToJwk(keys.privateKeyCrypto);
        sessionStorage.setItem('edworld_private_key', jwkStr);
        setDecryptedPrivateKey(keys.privateKeyCrypto);

        loggedUser.publicKey = keys.publicKeyBase64;
        loggedUser.encryptedPrivateKey = encrypted.encryptedPrivateKeyBase64;
        loggedUser.keySalt = saltBase64;
        loggedUser.keyIv = encrypted.ivBase64;
      }

      setUser(loggedUser);
      router.push('/');
    } catch (error: any) {
      console.error(`${providerName} login failed:`, error);
      throw new Error(error.response?.data?.error || error.message || 'OAuth login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithOAuth, registerUser, logout, refreshUser, decryptedPrivateKey }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

