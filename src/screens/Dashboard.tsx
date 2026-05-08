import React from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator,
    Image,
    Dimensions
} from 'react-native';
import { 
    Sparkles, Heart, Clock, Bell, Map as MapIcon, 
    MessageSquare, SlidersHorizontal, MapPin 
} from 'lucide-react-native';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Property } from '../types';

const { width } = Dimensions.get('window');

const Dashboard = ({ navigation }: any) => {
  const { profile, currentRole } = useAuth();
  const [listings, setListings] = React.useState<Property[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Property[];
      setListings(data);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Brand Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroCard}>
          <View style={styles.cityBadge}>
            <MapPin size={14} color="#0061A4" />
            <Text style={styles.cityBadgeText}>Viewing Estates in Multan</Text>
          </View>
          <Text style={styles.heroTitle}>Find Your Perfect{"\n"}<Text style={{ fontStyle: 'italic', color: '#0061A4' }}>Rental Space</Text> in Pakistan.</Text>
          <Text style={styles.heroSubtitle}>
            The premium real estate platform for authentic listings, direct owner contact, and verified documentation.
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Browse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Features */}
      <View style={styles.padding}>
        <Text style={styles.sectionTitle}>Core Features</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
           <FeatureCard title="Verified" icon={<MapIcon size={24} color="#0061A4" />} />
           <FeatureCard title="Direct Chat" icon={<MessageSquare size={24} color="#0061A4" />} />
           <FeatureCard title="Smart Filters" icon={<SlidersHorizontal size={24} color="#0061A4" />} />
        </ScrollView>
      </View>

      {/* Recent Listings */}
      <View style={styles.padding}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={styles.sectionTitle}>Recently Added</Text>
            <TouchableOpacity><Text style={{ color: '#0061A4', fontWeight: 'bold' }}>See All</Text></TouchableOpacity>
        </View>
        
        {loading ? (
            <ActivityIndicator size="large" color="#0061A4" />
        ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={width * 0.7 + 16}>
                {listings.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.propertyCard}>
                        <Image source={{ uri: item.images[0] }} style={styles.propertyImage} />
                        <View style={{ padding: 12 }}>
                            <Text style={styles.propertyPrice}>PKR {item.price.toLocaleString()}</Text>
                            <Text style={styles.propertyTitle}>{item.title}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};

const FeatureCard = ({ title, icon }: any) => (
    <View style={styles.featureCard}>
        {icon}
        <Text style={{ marginTop: 8, fontWeight: 'bold' }}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FBFCFF' },
    heroSection: { padding: 20 },
    heroCard: {
        backgroundColor: '#F1F3F9',
        borderRadius: 32,
        padding: 24,
    },
    cityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: 'rgba(0,97,164,0.1)',
        borderRadius: 20,
        marginBottom: 16,
        alignSelf: 'flex-start'
    },
    cityBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#0061A4', marginLeft: 4, textTransform: 'uppercase' },
    heroTitle: { fontSize: 32, fontWeight: 'bold', lineHeight: 36, color: '#1B1B1F', marginBottom: 16 },
    heroSubtitle: { color: '#44474E', fontSize: 15, lineHeight: 22, marginBottom: 24 },
    primaryButton: { backgroundColor: '#0061A4', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
    primaryButtonText: { color: 'white', fontWeight: 'bold' },
    secondaryButton: { backgroundColor: 'white', borderWidth: 1, borderColor: '#C4C6CF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
    secondaryButtonText: { color: '#1B1B1F', fontWeight: 'bold' },
    padding: { paddingHorizontal: 20, marginTop: 32 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    featureCard: {
        width: 120,
        padding: 16,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#C4C6CF',
        borderRadius: 20,
        alignItems: 'center',
        marginRight: 12
    },
    propertyCard: {
        width: width * 0.7,
        backgroundColor: 'white',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#C4C6CF',
        marginRight: 16,
        overflow: 'hidden'
    },
    propertyImage: { width: '100%', height: 160 },
    propertyPrice: { fontSize: 18, fontWeight: 'bold', color: '#0061A4' },
    propertyTitle: { fontSize: 14, color: '#44474E', marginTop: 4 }
});

export default Dashboard;
