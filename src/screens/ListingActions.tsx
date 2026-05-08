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
    ArrowLeft, Camera, Plus, Check, Info, Trash2, Image as ImageIcon, Zap, ShieldCheck,
    ChevronDown
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { PAKISTAN_CITIES } from '../constants';

export const PostListingScreen = ({ navigation, route }: any) => {
  const id = route?.params?.id;
  const isEditMode = !!id;
  const { user, profile, currentRole } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'Apartment',
    price: '',
    description: '',
    location: 'Gulberg, Lahore',
    city: 'Lahore',
    beds: 2,
  });

  const [images, setImages] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (currentRole === 'Tenant') {
      Alert.alert('Restricted', 'Only Sellers can post listings.');
      navigation.goBack();
    }
  }, [currentRole]);

  useEffect(() => {
    if (isEditMode && user) {
      const fetchListing = async () => {
        try {
          const docRef = doc(db, 'listings', id!);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.ownerId !== user.uid) {
              Alert.alert('Unauthorized', 'You do not own this listing.');
              navigation.goBack();
              return;
            }
            setFormData({
              title: data.title,
              type: data.type,
              price: data.price.toString(),
              description: data.description,
              location: data.location,
              city: data.city,
              beds: data.beds,
            });
            setImages(data.images || []);
            setAmenities(data.amenities || []);
          }
        } catch (err) {
          console.error("Error fetching listing:", err);
        }
      };
      fetchListing();
    }
  }, [id, user]);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10 - images.length,
      quality: 0.4,
      base64: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => `data:image/jpeg;base64,${asset.base64}`);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleAmenity = (am: string) => {
    setAmenities(prev => prev.includes(am) ? prev.filter(a => a !== am) : [...prev, am]);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (images.length === 0) {
      Alert.alert("Error", "Please add at least one image.");
      return;
    }
    if (!formData.title || !formData.price || !formData.description) {
        Alert.alert("Error", "Please fill in all required fields.");
        return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        amenities,
        images,
        updatedAt: serverTimestamp(),
      };

      if (isEditMode) {
        await updateDoc(doc(db, 'listings', id!), payload);
      } else {
        await addDoc(collection(db, 'listings'), {
          ...payload,
          ownerId: user.uid,
          ownerName: profile?.fullName || 'User',
          ownerAvatar: profile?.avatar || `https://i.pravatar.cc/150?u=${user.uid}`,
          createdAt: serverTimestamp(),
          status: 'Active',
        });
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      handleFirestoreError(err, isEditMode ? OperationType.UPDATE : OperationType.WRITE, isEditMode ? `listings/${id}` : 'listings');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
      return (
          <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                  <Check size={48} color="white" />
              </View>
              <Text style={styles.successTitle}>{isEditMode ? 'Updated!' : 'Posted!'}</Text>
              <Text style={styles.successSubtitle}>Your listing is now live.</Text>
          </View>
      );
  }

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: '#FBFCFF' }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <ArrowLeft size={24} color="#001C38" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Listing' : 'Post Listing'}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Image Section */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.label}>Property Photos ({images.length}/10)</Text>
                {images.length > 0 && (
                    <TouchableOpacity onPress={() => setImages([])}>
                        <Text style={styles.clearText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {images.map((uri, idx) => (
                    <View key={idx} style={styles.imageWrapper}>
                        <Image source={{ uri }} style={styles.listingImage} />
                        <TouchableOpacity 
                            onPress={() => removeImage(idx)}
                            style={styles.removeImageBtn}
                        >
                            <Trash2 size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                ))}
                {images.length < 10 && (
                    <TouchableOpacity onPress={pickImages} style={styles.addImageBtn}>
                        <ImageIcon size={32} color="#74777F" />
                        <Text style={styles.addImageText}>Add Photo</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>

        {/* Basic Info */}
        <View style={styles.inputGroup}>
            <Text style={styles.label}>Property Title</Text>
            <TextInput 
                value={formData.title}
                onChangeText={(text) => setFormData({...formData, title: text})}
                placeholder="e.g. Modern Apartment in Bahria Town"
                style={styles.input}
            />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.pickerReplacement}>
                    <Text style={styles.pickerText}>{formData.type}</Text>
                    <ChevronDown size={16} color="#74777F" />
                </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Price (PKR/mo)</Text>
                <TextInput 
                    value={formData.price}
                    onChangeText={(text) => setFormData({...formData, price: text})}
                    placeholder="50,000"
                    keyboardType="numeric"
                    style={styles.input}
                />
            </View>
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput 
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="Details about building, view, neighbors..."
                multiline
                numberOfLines={4}
                style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 12 }]}
            />
        </View>

        <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <View style={styles.pickerReplacement}>
                <Text style={styles.pickerText}>{formData.city}</Text>
                <ChevronDown size={16} color="#74777F" />
            </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
            <Text style={styles.label}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
                {['Parking', 'WiFi', 'Security', '24/7 Power', 'Backup Generator'].map(am => (
                    <TouchableOpacity 
                        key={am} 
                        onPress={() => toggleAmenity(am)}
                        style={[
                            styles.amenityChip, 
                            amenities.includes(am) && styles.amenityChipSelected
                        ]}
                    >
                        {amenities.includes(am) && <Check size={14} color="white" style={{ marginRight: 4 }} />}
                        <Text style={[
                            styles.amenityText,
                            amenities.includes(am) && { color: 'white' }
                        ]}>{am}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        <TouchableOpacity 
            onPress={handleSubmit}
            disabled={saving}
            style={[styles.submitButton, saving && { opacity: 0.7 }]}
        >
            {saving ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>{isEditMode ? 'Update Listing' : 'Post Listing'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelButton}>
             <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F9'
    },
    backButton: {
        padding: 8,
        marginRight: 12,
        backgroundColor: '#F1F3F9',
        borderRadius: 20
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#001C38'
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#44474E',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8
    },
    clearText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#BA1A1A',
        textTransform: 'uppercase'
    },
    imageScroll: {
        flexDirection: 'row',
    },
    imageWrapper: {
        width: 120,
        height: 120,
        borderRadius: 16,
        marginRight: 12,
        position: 'relative'
    },
    listingImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16
    },
    removeImageBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(186, 26, 26, 0.8)',
        padding: 6,
        borderRadius: 12
    },
    addImageBtn: {
        width: 120,
        height: 120,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#C4C6CF',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F3F9'
    },
    addImageText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#74777F',
        marginTop: 4
    },
    inputGroup: {
        marginBottom: 16
    },
    input: {
        height: 56,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#C4C6CF',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '500'
    },
    pickerReplacement: {
        height: 56,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#C4C6CF',
        borderRadius: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    pickerText: {
        fontSize: 16,
        fontWeight: '500'
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    amenityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#C4C6CF',
        borderRadius: 20
    },
    amenityChipSelected: {
        backgroundColor: '#0061A4',
        borderColor: '#0061A4'
    },
    amenityText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#44474E'
    },
    submitButton: {
        height: 56,
        backgroundColor: '#0061A4',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#0061A4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    submitText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    cancelButton: {
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8
    },
    cancelText: {
        color: '#0061A4',
        fontWeight: 'bold'
    },
    successContainer: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
    },
    successIcon: {
        width: 80,
        height: 80,
        backgroundColor: '#4CAF50',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24
    },
    successTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1B1B1F',
        marginBottom: 8
    },
    successSubtitle: {
        fontSize: 16,
        color: '#44474E',
        textAlign: 'center'
    }
});
