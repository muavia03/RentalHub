import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Building2, UserCircle, LogOut, ChevronRight, Bell, Shield, Info, HelpCircle, FileText, CheckCircle, Smartphone, Clock, MapPin, X, Camera, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is disabled. Please enable it in the Firebase Console under Authentication > Sign-in method, or use Google Login.');
      } else {
        setError(err.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if profile exists, if not create it
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          fullName: user.displayName || 'Google User',
          email: user.email,
          phone: '',
          role: 'Tenant',
          avatar: user.photoURL || '',
          notificationsEnabled: true,
          privacyEnabled: true,
          createdAt: new Date().toISOString()
        });
      }
      navigate('/home');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col p-6 items-center pt-20">
      <header className="mb-12 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
            <Building2 size={40} className="text-primary-container" />
            <h1 className="text-3xl font-display font-extrabold text-primary-container tracking-tight">RentalHub</h1>
        </div>
        <p className="text-on-surface-variant text-sm font-medium">Find your perfect rental space</p>
      </header>

      <div className="w-full max-sm:max-w-sm max-w-sm space-y-8">
        <h2 className="text-4xl font-display font-bold text-center">Welcome back</h2>
        
        <form className="space-y-4" onSubmit={handleLogin}>
          {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg leading-tight">{error}</p>}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-14 pl-12 pr-12 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-outline"
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="flex justify-center">
            <button type="button" className="text-sm font-bold text-primary hover:underline">Forgot Password?</button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-surface px-2 text-on-surface-variant font-bold">Or continue with</span></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-14 bg-white border border-outline-variant text-on-surface font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-surface-container-low transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Sign in with Google
          </button>
        </form>

        <div className="text-center pt-4">
            <p className="text-on-surface-variant text-sm">
                Don't have an account? 
                <button 
                  onClick={() => navigate('/signup')}
                  className="ml-2 font-bold text-primary hover:underline"
                >
                  Sign Up
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export const SignupScreen = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Landlord' | 'Tenant'>('Tenant');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName,
        email,
        phone,
        role,
        notificationsEnabled: true,
        privacyEnabled: true,
        createdAt: new Date().toISOString()
      });

      navigate('/home');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is disabled. Please enable it in the Firebase Console under Authentication > Sign-in method, or use Google Login.');
      } else {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          fullName: user.displayName || 'Google User',
          email: user.email,
          phone: '',
          role: role, // Use the selected role
          avatar: user.photoURL || '',
          notificationsEnabled: true,
          privacyEnabled: true,
          createdAt: new Date().toISOString()
        });
      }
      navigate('/home');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser?.uid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col p-6 items-center pt-10">
      <header className="mb-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
            <Building2 size={40} className="text-primary-container" />
            <h1 className="text-3xl font-display font-extrabold text-primary-container tracking-tight">RentalHub</h1>
        </div>
        <p className="text-on-surface-variant text-sm font-medium">Join the premium rental community</p>
      </header>

      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-3xl font-display font-bold text-center">Create Account</h2>
        
        <form className="space-y-4" onSubmit={handleSignup}>
          {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg">{error}</p>}
          
          <div className="flex gap-2 p-1 bg-surface-container rounded-xl">
            <button 
              type="button" 
              onClick={() => setRole('Tenant')}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                role === 'Tenant' ? "bg-white shadow-sm text-primary" : "text-on-surface-variant"
              )}
            >
              I want to Rent
            </button>
            <button 
              type="button" 
              onClick={() => setRole('Landlord')}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                role === 'Landlord' ? "bg-white shadow-sm text-primary" : "text-on-surface-variant"
              )}
            >
              I want to List
            </button>
          </div>

          <div className="relative">
            <UserCircle size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
            <input 
              type="text" 
              placeholder="Full Name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input 
              type="tel" 
              placeholder="Phone Number" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input 
              type="password" 
              placeholder="Create Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex items-start gap-3 px-2">
            <div className="mt-1 w-5 h-5 rounded border-2 border-outline-variant flex items-center justify-center">
              <CheckCircle size={14} className="text-primary" />
            </div>
            <p className="text-xs text-on-surface-variant font-medium leading-tight">
              I agree to the <button type="button" className="text-primary font-bold">Terms of Service</button> and <button type="button" className="text-primary font-bold">Privacy Policy</button>.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-surface px-2 text-on-surface-variant font-bold">Or continue with</span></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-14 bg-white border border-outline-variant text-on-surface font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-surface-container-low transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
        </form>

        <div className="text-center pt-2">
            <p className="text-on-surface-variant text-sm">
                Already have an account? 
                <button 
                  onClick={() => navigate('/')}
                  className="ml-2 font-bold text-primary hover:underline"
                >
                  Log In
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export const ProfileScreen = () => {
    const navigate = useNavigate();
    const { profile, user } = useAuth();
    const [notifications, setNotifications] = React.useState(profile?.notificationsEnabled ?? true);
    const [privacy, setPrivacy] = React.useState(profile?.privacyEnabled ?? true);
    
    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: profile?.fullName || '',
        phone: profile?.phone || '',
        avatar: profile?.avatar || ''
    });
    const [saving, setSaving] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const PRESET_AVATARS = [
        'https://i.pravatar.cc/150?u=1',
        'https://i.pravatar.cc/150?u=2',
        'https://i.pravatar.cc/150?u=3',
        'https://i.pravatar.cc/150?u=4',
        'https://i.pravatar.cc/150?u=5',
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500000) { // 500kb limit
                alert("Image is too large. Please select an image under 500KB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm({ ...editForm, avatar: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (profile) {
            setEditForm({
                fullName: profile.fullName,
                phone: profile.phone || '',
                avatar: profile.avatar || ''
            });
        }
    }, [profile]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const toggleSetting = async (key: string, currentValue: boolean) => {
        if (!user) return;
        const newValue = !currentValue;
        if (key === 'notifications') setNotifications(newValue);
        if (key === 'privacy') setPrivacy(newValue);

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                [key === 'notifications' ? 'notificationsEnabled' : 'privacyEnabled']: newValue
            });
        } catch (err) {
            console.error("Failed to update setting", err);
            handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                fullName: editForm.fullName,
                phone: editForm.phone,
                avatar: editForm.avatar
            });
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update profile", err);
            handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        } finally {
            setSaving(false);
        }
    };

    if (!profile) return <div className="flex items-center justify-center h-screen"><p className="font-bold">Loading profile...</p></div>;

    return (
        <div className="space-y-8 pb-32">
            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl overflow-hidden relative"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-display font-bold">Edit Profile</h3>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 hover:bg-surface-container rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <div className="flex flex-col items-center mb-6">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative group cursor-pointer"
                                    >
                                        <img 
                                            src={editForm.avatar || `https://i.pravatar.cc/150?u=${profile.uid}`} 
                                            alt="Preview" 
                                            className="w-28 h-28 rounded-full border-4 border-primary/20 object-cover shadow-xl group-hover:brightness-75 transition-all"
                                        />
                                        <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={28} className="text-white" />
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileChange} 
                                            accept="image/*" 
                                            className="hidden" 
                                        />
                                    </div>
                                    <p className="mt-4 text-[10px] font-bold text-primary uppercase tracking-widest cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
                                        Click image to upload
                                    </p>
                                    
                                    <div className="flex gap-2 mt-6 overflow-x-auto w-full justify-center py-2 px-4 hide-scrollbar">
                                        {PRESET_AVATARS.map((url, i) => (
                                            <button 
                                                key={i} 
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, avatar: url })}
                                                className={cn(
                                                    "w-10 h-10 rounded-full border-2 transition-all p-0.5",
                                                    editForm.avatar === url ? "border-primary scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"
                                                )}
                                            >
                                                <img src={url} className="w-full h-full rounded-full object-cover" alt="Preset" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-2">Full Name</label>
                                        <input 
                                            required
                                            value={editForm.fullName}
                                            onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                                            className="w-full h-14 px-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:border-primary transition-all outline-none font-bold"
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-2">Phone Number</label>
                                        <input 
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                            className="w-full h-14 px-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:border-primary transition-all outline-none font-bold"
                                            placeholder="03xx xxxxxxx"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-2">Avatar URL (Optional)</label>
                                        <input 
                                            value={editForm.avatar}
                                            onChange={(e) => setEditForm({...editForm, avatar: e.target.value})}
                                            className="w-full h-14 px-4 bg-surface-container-low border border-outline-variant rounded-2xl focus:border-primary transition-all outline-none font-medium"
                                            placeholder="https://image-url.com/avatar.jpg"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="w-full h-14 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                    {saving ? 'Saving Changes...' : 'Save Profile'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex flex-col items-center text-center pt-4">
                <div className="relative mb-4">
                    <img 
                        src={profile.avatar || `https://i.pravatar.cc/150?u=${profile.uid}`} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full border-2 border-outline-variant p-1 object-cover"
                    />
                    <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border-2 border-white">
                        <CheckCircle size={16} className="fill-current" />
                    </div>
                </div>
                <h2 className="text-2xl font-display font-bold">{profile.fullName}</h2>
                <p className="text-sm text-on-surface-variant font-medium">{profile.role} • Verified</p>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="mt-4 px-8 py-2 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 active:scale-95 transition-all shadow-sm"
                >
                    Edit Profile
                </button>
            </header>

            <section className="space-y-3">
                <h3 className="text-lg font-bold px-1">Account Information</h3>
                <div className="bg-white border border-outline-variant rounded-2xl divide-y divide-outline-variant overflow-hidden">
                    {[
                        { label: 'Email', value: profile.email, icon: Mail },
                        { label: 'Phone', value: profile.phone || 'Not set', icon: Smartphone },
                        { label: 'Location', value: 'Multan, PK', icon: MapPin }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 px-5">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{item.label}</p>
                                <p className="text-sm font-bold text-on-surface">{item.value}</p>
                            </div>
                            <item.icon size={20} className="text-outline" />
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-bold">Subscriptions</h3>
                    <Clock size={20} className="text-primary" />
                </div>
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="font-bold text-primary">Premium Plan</p>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Active until Dec 20, 2026</p>
                        </div>
                        <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Pro</span>
                    </div>
                    <div className="bg-white border border-outline-variant rounded-xl p-4 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                            <UserCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-on-surface">8 Contacts Remaining</p>
                            <p className="text-[10px] text-on-surface-variant font-medium">of 50 monthly leads</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-3">
                <h3 className="text-lg font-bold px-1">Settings</h3>
                <div className="bg-white border border-outline-variant rounded-2xl divide-y divide-outline-variant overflow-hidden">
                    <div className="flex items-center justify-between p-4 px-5">
                        <div className="flex items-center gap-3">
                            <Bell size={20} className="text-on-surface-variant" />
                            <span className="text-sm font-medium">Notifications</span>
                        </div>
                        <button 
                            onClick={() => toggleSetting('notifications', notifications)}
                            className={cn("w-12 h-6 rounded-full relative transition-colors", notifications ? "bg-primary" : "bg-outline-variant")}
                        >
                            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all", notifications ? "right-1" : "left-1")} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 px-5">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-on-surface-variant" />
                            <span className="text-sm font-medium">Privacy & Security</span>
                        </div>
                        <button 
                            onClick={() => toggleSetting('privacy', privacy)}
                            className={cn("w-12 h-6 rounded-full relative transition-colors", privacy ? "bg-primary" : "bg-outline-variant")}
                        >
                            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all", privacy ? "right-1" : "left-1")} />
                        </button>
                    </div>
                </div>

                <div className="pt-2 space-y-3 px-1">
                    {[
                        { label: 'About RentalHub', icon: Info, action: () => alert('RentalHub v1.0.0 - Premium Real Estate Platform.') },
                        { label: 'Help & Support', icon: HelpCircle, action: () => alert('Contact support at support@rentalhub.pk') },
                        { label: 'Terms of Service', icon: FileText, action: () => alert('Standard platform terms apply.') }
                    ].map((item, i) => (
                        <button 
                            key={i} 
                            onClick={item.action}
                            className="w-full flex items-center justify-between p-4 px-5 bg-surface-container-low hover:bg-surface-container rounded-2xl transition-all group"
                        >
                           <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                   <item.icon size={20} />
                               </div>
                               <span className="text-sm font-bold text-on-surface">{item.label}</span>
                           </div>
                           <ChevronRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                        </button>
                    ))}
                </div>
            </section>

            <button 
                onClick={handleLogout}
                className="w-full h-14 bg-error text-white font-bold rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-error/20 active:scale-[0.98] transition-all"
            >
                <LogOut size={20} />
                Logout
            </button>
        </div>
    );
};
