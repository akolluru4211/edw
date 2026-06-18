'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { signInWithPopup, signInWithRedirect, getRedirectResult, browserPopupRedirectResolver } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import {
  generateE2EKeys, deriveAesKey, encryptPrivateKey, decryptPrivateKey,
  exportKeyToJwk, importKeyFromJwk
} from '@/lib/crypto';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
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
    headline?: string;
    interests: string;
    goals: string;
    readinessScore: number;
    bio?: string;
    avatarUrl?: string;
    portfolioUrl?: string;
    dob?: string;
    latitude?: number;
    longitude?: number;
    isOnboarded?: boolean;
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

function generateSalt(): string {
  const saltBuffer = window.crypto.getRandomValues(new Uint8Array(16));
  let binary = '';
  for (let i = 0; i < saltBuffer.byteLength; i++) binary += String.fromCharCode(saltBuffer[i]);
  return window.btoa(binary);
}

async function setupE2EEKeys(
  passphrase: string,
  apiFn: (data: any) => Promise<any>,
  loggedUser: any
) {
  const saltBase64 = generateSalt();
  const aesKey = await deriveAesKey(passphrase, saltBase64);
  const keys = await generateE2EKeys();
  const encrypted = await encryptPrivateKey(keys.privateKeyBase64, aesKey);

  await apiFn({
    publicKey: keys.publicKeyBase64,
    encryptedPrivateKey: encrypted.encryptedPrivateKeyBase64,
    keySalt: saltBase64,
    keyIv: encrypted.ivBase64
  });

  const jwkStr = await exportKeyToJwk(keys.privateKeyCrypto);
  sessionStorage.setItem('edworld_private_key', jwkStr);

  loggedUser.publicKey = keys.publicKeyBase64;
  loggedUser.encryptedPrivateKey = encrypted.encryptedPrivateKeyBase64;
  loggedUser.keySalt = saltBase64;
  loggedUser.keyIv = encrypted.ivBase64;

  return keys.privateKeyCrypto;
}

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
    // Handle redirect result from OAuth (fallback for popup blocked)
    getRedirectResult(auth).then(async (result) => {
      if (result) {
        try {
          const idToken = await result.user.getIdToken();
          const response = await api.post('/auth/firebase-login', { idToken });
          const { token, user: loggedUser } = response.data;
          localStorage.setItem('edworld_token', token);

          if (loggedUser.encryptedPrivateKey && loggedUser.keySalt && loggedUser.keyIv) {
            const aesKey = await deriveAesKey(loggedUser.id, loggedUser.keySalt);
            const privateKey = await decryptPrivateKey(loggedUser.encryptedPrivateKey, aesKey, loggedUser.keyIv);
            const jwkStr = await exportKeyToJwk(privateKey);
            sessionStorage.setItem('edworld_private_key', jwkStr);
            setDecryptedPrivateKey(privateKey);
          } else {
            const privateKey = await setupE2EEKeys(
              loggedUser.id,
              (data) => api.post('/auth/save-keys', data, { headers: { Authorization: `Bearer ${token}` } }),
              loggedUser
            );
            setDecryptedPrivateKey(privateKey);
          }

          setUser(loggedUser);
          router.push('/');
        } catch (error: any) {
          console.error('Redirect OAuth login failed:', error);
        }
      }
    }).catch(() => {});

    refreshUser();
  }, []);

  const login = async (email: string, password: any) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: loggedUser } = response.data;
      localStorage.setItem('edworld_token', token);

      if (loggedUser.encryptedPrivateKey && loggedUser.keySalt && loggedUser.keyIv) {
        const aesKey = await deriveAesKey(password, loggedUser.keySalt);
        const privateKey = await decryptPrivateKey(loggedUser.encryptedPrivateKey, aesKey, loggedUser.keyIv);
        const jwkStr = await exportKeyToJwk(privateKey);
        sessionStorage.setItem('edworld_private_key', jwkStr);
        setDecryptedPrivateKey(privateKey);
      } else {
        const privateKey = await setupE2EEKeys(
          password,
          (data) => api.post('/auth/save-keys', data, { headers: { Authorization: `Bearer ${token}` } }),
          loggedUser
        );
        setDecryptedPrivateKey(privateKey);
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
      const saltBase64 = generateSalt();
      const keys = await generateE2EKeys();
      const aesKey = await deriveAesKey(formData.password, saltBase64);
      const encrypted = await encryptPrivateKey(keys.privateKeyBase64, aesKey);

      const response = await api.post('/auth/register', {
        ...formData,
        publicKey: keys.publicKeyBase64,
        encryptedPrivateKey: encrypted.encryptedPrivateKeyBase64,
        keySalt: saltBase64,
        keyIv: encrypted.ivBase64
      });
      const { token, user: registeredUser } = response.data;
      localStorage.setItem('edworld_token', token);

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

      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        // If popup is blocked or closed, fall back to redirect
        if (['auth/popup-blocked', 'auth/cancelled-popup-request', 'auth/popup-closed-by-user'].includes(popupError.code)) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupError;
      }

      const idToken = await result.user.getIdToken();
      const response = await api.post('/auth/firebase-login', { idToken });
      const { token, user: loggedUser } = response.data;
      localStorage.setItem('edworld_token', token);

      if (loggedUser.encryptedPrivateKey && loggedUser.keySalt && loggedUser.keyIv) {
        const aesKey = await deriveAesKey(loggedUser.id, loggedUser.keySalt);
        const privateKey = await decryptPrivateKey(loggedUser.encryptedPrivateKey, aesKey, loggedUser.keyIv);
        const jwkStr = await exportKeyToJwk(privateKey);
        sessionStorage.setItem('edworld_private_key', jwkStr);
        setDecryptedPrivateKey(privateKey);
      } else {
        const privateKey = await setupE2EEKeys(
          loggedUser.id,
          (data) => api.post('/auth/save-keys', data, { headers: { Authorization: `Bearer ${token}` } }),
          loggedUser
        );
        setDecryptedPrivateKey(privateKey);
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
