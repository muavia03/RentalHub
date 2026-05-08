import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    Image, 
    ActivityIndicator, 
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { 
    Mail, Lock, Eye, EyeOff, Building2, UserCircle, LogOut, ChevronRight, 
    Bell, Shield, Info, HelpCircle, FileText, CheckCircle, Smartphone, 
    Clock, MapPin, X, Camera, Save
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Home');
    } catch (err: any) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#FBFCFF' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, alignItems: 'center', paddingTop: 80 }}>
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Building2 size={48} color="#001C38" />
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#001C38', marginTop: 8 }}>RentalHub</Text>
            <Text style={{ color: '#44474E', fontSize: 14 }}>Find your perfect rental space</Text>
        </View>

        <View style={{ width: '100%', maxWidth: 400 }}>
            <Text style={{ fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 }}>Welcome back</Text>
            
            <View style={{ marginBottom: 16 }}>
                <View style={{ position: 'absolute', left: 16, top: 18, zIndex: 1 }}>
                    <Mail size={20} color="#74777F" />
                </View>
                <TextInput 
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={{ marginBottom: 24 }}>
                <View style={{ position: 'absolute', left: 16, top: 18, zIndex: 1 }}>
                    <Lock size={20} color="#74777F" />
                </View>
                <TextInput 
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                />
                <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 16, top: 18, zIndex: 1 }}
                >
                    {showPassword ? <EyeOff size={20} color="#74777F" /> : <Eye size={20} color="#74777F" />}
                </TouchableOpacity>
            </View>

            <TouchableOpacity 
                onPress={handleLogin}
                disabled={loading}
                style={[styles.button, loading && { opacity: 0.7 }]}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
                <Text style={{ color: '#44474E' }}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                    <Text style={{ color: '#0061A4', fontWeight: 'bold' }}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const ProfileScreen = () => {
    const { profile, user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        fullName: '',
        phone: '',
        avatar: ''
    });

    useEffect(() => {
        if (profile) {
            setEditForm({
                fullName: profile.fullName || '',
                phone: profile.phone || '',
                avatar: profile.avatar || ''
            });
        }
    }, [profile]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need permission to access your gallery.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setEditForm({ 
                ...editForm, 
                avatar: `data:image/jpeg;base64,${result.assets[0].base64}` 
            });
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                fullName: editForm.fullName,
                phone: editForm.phone,
                avatar: editForm.avatar
            });
            setIsEditing(false);
            Alert.alert("Success", "Profile updated successfully");
        } catch (err: any) {
            console.error(err);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (!profile) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0061A4" />
        </View>
    );

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#FBFCFF' }} contentContainerStyle={{ padding: 20 }}>
            <View style={{ alignItems: 'center', marginVertical: 32 }}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                    <Image 
                        source={{ uri: editForm.avatar || `https://i.pravatar.cc/150?u=${profile.uid}` }} 
                        style={styles.profileAvatar}
                    />
                    <View style={styles.cameraIcon}>
                        <Camera size={20} color="white" />
                    </View>
                </TouchableOpacity>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>{profile.fullName}</Text>
                <Text style={{ color: '#44474E', fontWeight: '500' }}>{profile.role} • Verified</Text>
                
                {!isEditing ? (
                    <TouchableOpacity 
                        onPress={() => setIsEditing(true)}
                        style={styles.editButton}
                    >
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: '100%', marginTop: 24 }}>
                        <TextInput 
                            placeholder="Full Name"
                            value={editForm.fullName}
                            onChangeText={(text) => setEditForm({...editForm, fullName: text})}
                            style={styles.editInput}
                        />
                        <TextInput 
                            placeholder="Phone Number"
                            value={editForm.phone}
                            onChangeText={(text) => setEditForm({...editForm, phone: text})}
                            style={styles.editInput}
                            keyboardType="phone-pad"
                        />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity 
                                onPress={() => setIsEditing(false)}
                                style={[styles.saveButton, { backgroundColor: '#74777F', flex: 1 }]}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleSaveProfile}
                                disabled={saving}
                                style={[styles.saveButton, { flex: 2 }]}
                            >
                                {saving ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save Changes</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account Information</Text>
                <View style={styles.infoCard}>
                    <InfoRow label="Email" value={profile.email} icon={<Mail size={20} color="#74777F" />} />
                    <InfoRow label="Phone" value={profile.phone || 'Not set'} icon={<Smartphone size={20} color="#74777F" />} />
                    <InfoRow label="Location" value="Multan, PK" icon={<MapPin size={20} color="#74777F" />} />
                </View>
            </View>

            <TouchableOpacity 
                onPress={() => signOut(auth)}
                style={styles.logoutButton}
            >
                <LogOut size={20} color="white" />
                <Text style={[styles.buttonText, { marginLeft: 12 }]}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const InfoRow = ({ label, value, icon }: any) => (
    <View style={styles.infoRow}>
        <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
        {icon}
    </View>
);

const styles = StyleSheet.create({
    input: {
        width: '100%',
        height: 56,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#C4C6CF',
        borderRadius: 12,
        paddingLeft: 48,
        paddingRight: 16,
        fontSize: 16
    },
    button: {
        width: '100%',
        height: 56,
        backgroundColor: '#0061A4',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    avatarContainer: {
        position: 'relative',
    },
    profileAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: 'rgba(0,97,164,0.1)'
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#0061A4',
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white'
    },
    editButton: {
        marginTop: 20,
        paddingHorizontal: 32,
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: '#0061A4',
        borderRadius: 12
    },
    editButtonText: {
        color: '#0061A4',
        fontWeight: 'bold'
    },
    editInput: {
        height: 54,
        backgroundColor: '#F1F3F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        fontSize: 16,
        fontWeight: '600'
    },
    saveButton: {
        height: 54,
        backgroundColor: '#0061A4',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    section: {
        marginTop: 24
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        paddingHorizontal: 4
    },
    infoCard: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#C4C6CF',
        borderRadius: 16,
        overflow: 'hidden'
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#C4C6CF'
    },
    infoLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#44474E',
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    infoValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1B1B1F',
        marginTop: 2
    },
    logoutButton: {
        width: '100%',
        height: 56,
        backgroundColor: '#BA1A1A',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40
    }
});
