import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    ActivityIndicator, 
    Alert,
    StyleSheet,
    Dimensions,
    Share,
    TextInput
} from 'react-native';
import { 
    ArrowLeft, MapPin, BedDouble, Bath, Square, Share2, Heart, Send, Check 
} from 'lucide-react-native';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Property } from '../types';

const { width } = Dimensions.get('window');

const PropertyDetailScreen = ({ navigation, route }: any) => {
  const { id } = route?.params || {};
  const { user, profile } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProperty({ id: docSnap.id, ...docSnap.data() } as Property);
        }
      } catch (err) {
        console.error("Error fetching property", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleShare = async () => {
    if (!property) return;
    try {
      await Share.share({
        message: `Check out this property: ${property.title} in ${property.location}. PKR ${property.price}/month`,
        title: property.title
      });
    } catch (error) {
      Alert.alert("Error", "Could not share property");
    }
  };

  const handleSendInquiry = async () => {
    if (!user || !property || !inquiryMessage.trim()) return;
    setSendingInquiry(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        listingId: property.id,
        listingTitle: property.title,
        tenantId: user.uid,
        tenantName: profile?.fullName || user.email,
        landlordId: (property as any).ownerId || 'system',
        message: inquiryMessage,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });
      setInquirySent(true);
      setInquiryMessage('');
      Alert.alert("Success", "Inquiry sent successfully!");
    } catch (err) {
      console.error("Failed to send inquiry", err);
      handleFirestoreError(err, OperationType.WRITE, 'inquiries');
    } finally {
      setSendingInquiry(false);
    }
  };

  if (loading) return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0061A4" />
      </View>
  );

  if (!property) return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Property not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ color: '#0061A4', marginTop: 12 }}>Go Back</Text>
          </TouchableOpacity>
      </View>
  );

  const images = property.images && property.images.length > 0 ? property.images : [(property as any).image];

  return (
    <View style={styles.container}>
      {/* Header Overlay */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={24} color="#1B1B1F" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
                <Share2 size={24} color="#1B1B1F" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
                <Heart size={24} color="#1B1B1F" />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Slider */}
        <View style={styles.heroContainer}>
            <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    setActiveImageIdx(Math.round(x / width));
                }}
                scrollEventThrottle={16}
            >
                {images.map((img, idx) => (
                    <Image key={idx} source={{ uri: img }} style={styles.heroImage} />
                ))}
            </ScrollView>
            
            {/* Indicators */}
            <View style={styles.indicatorContainer}>
                {images.map((_, idx) => (
                    <View 
                        key={idx} 
                        style={[
                            styles.indicator, 
                            activeImageIdx === idx ? styles.indicatorActive : styles.indicatorInactive
                        ]} 
                    />
                ))}
            </View>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
            <View style={styles.badgeRow}>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{property.type}</Text>
                </View>
                <Text style={styles.priceText}>
                    PKR {property.price.toLocaleString()}
                    <Text style={styles.perMonth}>/mo</Text>
                </Text>
            </View>

            <Text style={styles.title}>{property.title}</Text>
            
            <View style={styles.locationRow}>
                <MapPin size={16} color="#74777F" />
                <Text style={styles.locationText}>{property.location}</Text>
            </View>

            <View style={styles.featuresRow}>
                <Feature icon={<BedDouble size={20} color="#0061A4" />} label={`${property.beds} Beds`} />
                <Feature icon={<Bath size={20} color="#0061A4" />} label="2 Baths" />
                <Feature icon={<Square size={20} color="#0061A4" />} label="1,200 sqft" />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                    {(property as any).description || "Experience luxury living in this premium property. Located in the heart of the city, this unit offers breathtaking views, high-end finishing, and state-of-the-art facilities."}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Amenities</Text>
                <View style={styles.amenitiesList}>
                    {(property.amenities || ['Parking', 'Security', 'WiFi']).map(am => (
                        <View key={am} style={styles.amenityChip}>
                            <Text style={styles.amenityText}>{am}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Inquiry */}
            <View style={styles.inquirySection}>
                <Text style={styles.sectionTitle}>Send an Inquiry</Text>
                {!user ? (
                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Login')}
                        style={styles.loginBtn}
                    >
                        <Text style={styles.loginBtnText}>Login to send inquiry</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.inquiryForm}>
                        <TextInput 
                            value={inquiryMessage}
                            onChangeText={setInquiryMessage}
                            placeholder="Ask about availability, viewing times..."
                            multiline
                            numberOfLines={4}
                            style={styles.inquiryText}
                        />
                        <TouchableOpacity 
                            onPress={handleSendInquiry}
                            disabled={sendingInquiry || !inquiryMessage.trim()}
                            style={[styles.sendBtn, (sendingInquiry || !inquiryMessage.trim()) && { opacity: 0.6 }]}
                        >
                            {sendingInquiry ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Send size={18} color="white" />
                                    <Text style={styles.sendBtnText}>Send Inquiry</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
      </ScrollView>
    </View>
  );
};

const Feature = ({ icon, label }: any) => (
    <View style={styles.featureItem}>
        <View style={styles.featureIcon}>{icon}</View>
        <Text style={styles.featureLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 100,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    headerBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    heroContainer: {
        height: 400,
        width: width,
        position: 'relative'
    },
    heroImage: {
        width: width,
        height: 400,
        resizeMode: 'cover'
    },
    indicatorContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6
    },
    indicator: {
        height: 6,
        borderRadius: 3
    },
    indicatorActive: {
        width: 24,
        backgroundColor: 'white'
    },
    indicatorInactive: {
        width: 6,
        backgroundColor: 'rgba(255,255,255,0.5)'
    },
    contentCard: {
        backgroundColor: 'white',
        marginTop: -30,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    typeBadge: {
        backgroundColor: '#E6F1FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    typeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0061A4',
        textTransform: 'uppercase'
    },
    priceText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#0061A4'
    },
    perMonth: {
        fontSize: 14,
        color: '#74777F',
        fontWeight: 'bold'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1B1B1F',
        marginBottom: 8
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 24
    },
    locationText: {
        fontSize: 14,
        color: '#74777F',
        fontWeight: '500'
    },
    featuresRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F1F3F9',
        marginBottom: 24
    },
    featureItem: {
        alignItems: 'center',
        gap: 8
    },
    featureIcon: {
        width: 48,
        height: 48,
        backgroundColor: '#F1F3F9',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    featureLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1B1B1F'
    },
    section: {
        marginBottom: 24
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1B1B1F',
        marginBottom: 12
    },
    descriptionText: {
        fontSize: 14,
        color: '#44474E',
        lineHeight: 22,
        fontWeight: '500'
    },
    amenitiesList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    amenityChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F1F3F9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E1E3E9'
    },
    amenityText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#44474E'
    },
    inquirySection: {
        marginTop: 12,
        paddingTop: 24,
        borderTopWidth: 1,
        borderColor: '#F1F3F9'
    },
    loginBtn: {
        padding: 20,
        backgroundColor: '#F1F3F9',
        borderRadius: 16,
        alignItems: 'center'
    },
    loginBtnText: {
        color: '#0061A4',
        fontWeight: 'bold'
    },
    inquiryForm: {
        gap: 12
    },
    inquiryText: {
        backgroundColor: '#F1F3F9',
        borderRadius: 16,
        padding: 16,
        height: 120,
        textAlignVertical: 'top',
        fontSize: 14,
        fontWeight: '500'
    },
    sendBtn: {
        height: 56,
        backgroundColor: '#0061A4',
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8
    },
    sendBtnText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default PropertyDetailScreen;
