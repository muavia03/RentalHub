import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  currentRole: 'Landlord' | 'Tenant' | null;
  loading: boolean;
  switchRole: (role: 'Landlord' | 'Tenant') => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  currentRole: null,
  loading: true,
  switchRole: () => {} 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentRole, setCurrentRole] = useState<'Landlord' | 'Tenant' | null>(null);
  const [loading, setLoading] = useState(true);

  const switchRole = (role: 'Landlord' | 'Tenant') => {
    setCurrentRole(role);
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (user) {
        const docRef = doc(db, 'users', user.uid);
        unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);
            if (!currentRole) {
              setCurrentRole(data.role);
            }
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile sync error", error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setCurrentRole(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, [currentRole]);

  return (
    <AuthContext.Provider value={{ user, profile, currentRole, loading, switchRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
