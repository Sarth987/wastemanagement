import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, getUserProfile } from '../firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        const isEmailAdmin = user.email?.toLowerCase().startsWith('admin@') || user.email?.toLowerCase().includes('admin');
        const isEmailDriver = user.email?.toLowerCase().startsWith('driver@');
        const defaultRole = isEmailAdmin ? 'admin' : (isEmailDriver ? 'driver' : 'citizen');

        try {
          const profile = await getUserProfile(user.uid);
          let userRole = profile?.role || defaultRole;
          try {
            const tokenResult = await user.getIdTokenResult();
            if (tokenResult?.claims?.role) {
              userRole = tokenResult.claims.role;
            }
          } catch (tokenErr) {
            console.warn('Could not fetch custom claims:', tokenErr);
          }

          if (profile) {
            setUserProfile({
              ...profile,
              role: userRole,
            });
          } else {
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || user.email?.split('@')[0] || (isEmailAdmin ? 'Admin' : 'Citizen'),
              role: userRole,
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile({
            uid: user.uid,
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || (isEmailAdmin ? 'Admin' : 'Citizen'),
            role: defaultRole,
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const role = userProfile?.role || (currentUser?.email?.toLowerCase().startsWith('admin@') ? 'admin' : (currentUser ? 'citizen' : null));

  const value = {
    currentUser,
    userProfile,
    role,
    loading,
    isAuthenticated: !!currentUser,
    isCitizen: role === 'citizen',
    isAdmin: role === 'admin',
    isDriver: role === 'driver',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
