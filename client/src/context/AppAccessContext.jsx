import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { browserSupportsWebAuthn, startAuthentication, startRegistration } from '@simplewebauthn/browser';
import api, { getApiError } from '../services/api';

const AppAccessContext = createContext(null);

export function AppAccessProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [passkeyConfigured, setPasskeyConfigured] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get('/access/status'),
      api.get('/access/passkey/status'),
    ])
      .then(([accessResponse, passkeyResponse]) => {
        if (!active) return;
        setUnlocked(Boolean(accessResponse.data.data.unlocked));
        setPasskeyConfigured(Boolean(passkeyResponse.data.data.configured));
      })
      .catch(() => {
        if (active) setUnlocked(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const supportsPlatformAuthenticator = typeof window !== 'undefined'
      && browserSupportsWebAuthn()
      && typeof window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
    if (supportsPlatformAuthenticator) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => active && setBiometricSupported(available))
        .catch(() => active && setBiometricSupported(false));
    }

    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    loading,
    unlocked,
    passkeyConfigured,
    biometricSupported,
    async unlockWithPassword(password) {
      await api.post('/access/unlock', { password });
      setUnlocked(true);
    },
    async unlockWithBiometric() {
      const { data } = await api.post('/access/passkey/authenticate/options');
      const response = await startAuthentication({ optionsJSON: data.data.options });
      await api.post('/access/passkey/authenticate/verify', response);
      setUnlocked(true);
    },
    async registerBiometric() {
      const { data } = await api.post('/access/passkey/register/options');
      const response = await startRegistration({ optionsJSON: data.data.options });
      await api.post('/access/passkey/register/verify', response);
      setPasskeyConfigured(true);
      setUnlocked(true);
    },
    async lockApp() {
      await api.post('/access/lock');
      setUnlocked(false);
    },
    getApiError,
  }), [biometricSupported, loading, passkeyConfigured, unlocked]);

  return <AppAccessContext.Provider value={value}>{children}</AppAccessContext.Provider>;
}

export function useAppAccess() {
  const context = useContext(AppAccessContext);
  if (!context) throw new Error('useAppAccess must be used within AppAccessProvider.');
  return context;
}
