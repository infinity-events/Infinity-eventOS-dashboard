/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { auth } from "../firebase";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { apiRequest } from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();

    return signInWithPopup(
      auth,
      provider,
    );
  }

  function logout() {
    setProfile(null);
    setProfileError(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        setProfileError(null);

        if (!currentUser) {
          setProfile(null);
          setLoading(false);
          return;
        }

        setLoading(true);

        try {
          const backendProfile =
            await apiRequest("/users/profile");

          setProfile(backendProfile);
        } catch (error) {
          console.error(
            "Errore caricamento profilo:",
            error,
          );
          setProfile(null);
          setProfileError(
            "Non riesco a collegarmi al server. Controlla la connessione e riprova.",
          );
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Errore inizializzazione autenticazione:", error);
        setUser(null);
        setProfile(null);
        setProfileError(
          "Non riesco a inizializzare l'autenticazione. Riavvia l'app e riprova.",
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        profileError,
        role: profile?.role ?? null,
        loading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}