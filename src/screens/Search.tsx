import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    ActivityIndicator, 
    StyleSheet,
    Image,
    Dimensions
} from 'react-native';
import { Search as SearchIcon, MapPin, SlidersHorizontal, Star, Heart } from 'lucide-react-native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property } from '../types';
import { MOCK_PROPERTIES, PAKISTAN_CITIES } from '../constants';

const { width } = Dimensions.get('window');

const SearchScreen = ({ navigation }: any) => {
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    city: 'All Neighborhoods',
    type: 'All Types',
  });

  const fetchListings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Property[];
      
      const hasRealListings = data.length > 0;

      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        data = data.filter(l => 
          (l.title?.toLowerCase() || '').includes(queryLower) || 
          (l.location?.toLowerCase() || '').includes(queryLower) || 
          (l.city?.toLowerCase() || '').includes(queryLower)
        );
      }
      
      if (filters.city !== 'All Neighborhoods') {
        data = data.filter(l => l.city === filters.city);
      }
      if (filters.type !== 'All Types') {
        data = data.filter(l => l.type === filters.type);
      }
      
      setListings(data.length > 0 ? data : (hasRealListings ? [] : MOCK_PROPERTIES as any));
    } catch (err) {
      console.error("Search fetch error", err);
      setListings(MOCK_PROPERTIES as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Estates</Text>
        <View style={styles.searchBar}>
            <SearchIcon size={20} color="#74777F" style={styles.searchIcon} />
            <TextInput 
                placeholder="Search Multan, Bahria..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={fetchListings}
                style={styles.searchInput}
            />
            <TouchableOpacity style={styles.filterBtn}>
                <SlidersHorizontal size={20} color="#0061A4" />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading ? (
            <ActivityIndicator size="large" color="#0061A4" style={{ marginTop: 40 }} />
        ) : listings.length === 0 ? (
            <View style={styles.emptyContainer}>
                <SearchIcon size={48} color="#C4C6CF" />
                <Text style={styles.emptyText}>No properties found</Text>
                <TouchableOpacity onPress={() => {setSearchQuery(''); fetchListings();}}>
                    <Text style={styles.resetText}>Clear filters</Text>
                </TouchableOpacity>
            </View>
        ) : (
            <View style={styles.grid}>
                {listings.map((item) => (
                    <TouchableOpacity 
                        key={item.id} 
                        style={styles.card}
                        onPress={() => navigation.navigate('PropertyDetail', { id: item.id })}
                    >
                        <Image source={{ uri: item.images?.[0] || (item as any).image }} style={styles.cardCover} />
                        <View style={styles.cardInfo}>
                            <Text style={styles.cardPrice}>PKR {item.price.toLocaleString()}</Text>
                            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                            <View style={styles.cardLoc}>
                                <MapPin size={12} color="#74777F" />
                                <Text style={styles.cardLocText}>{item.location}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FBFCFF' },
    header: {
        backgroundColor: 'white',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F9'
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1B1B1F',
        marginBottom: 16
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F3F9',
        borderRadius: 16,
        paddingLeft: 12,
        height: 56
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#1B1B1F'
    },
    filterBtn: {
        padding: 12,
        margin: 4,
        backgroundColor: 'white',
        borderRadius: 12
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    card: {
        width: (width - 50) / 2,
        backgroundColor: 'white',
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F1F3F9'
    },
    cardCover: {
        width: '100%',
        height: 120,
        resizeMode: 'cover'
    },
    cardInfo: { padding: 12 },
    cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#0061A4' },
    cardTitle: { fontSize: 13, color: '#1B1B1F', marginTop: 4, fontWeight: '500' },
    cardLoc: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 2 },
    cardLocText: { fontSize: 11, color: '#74777F' },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        gap: 12
    },
    emptyText: {
        fontSize: 16,
        color: '#44474E',
        fontWeight: 'bold'
    },
    resetText: {
        color: '#0061A4',
        fontWeight: 'bold'
    }
});

export default SearchScreen;
