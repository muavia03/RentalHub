import React from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    StyleSheet, 
    Image, 
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import { Plus, Eye, Edit3, Share2, Trash2, CheckCircle2, Clock } from 'lucide-react-native';
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Property } from '../types';

const { width } = Dimensions.get('window');

const ManagementScreen = ({ navigation }: any) => {
  const { user, currentRole, switchRole } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'listings' | 'inquiries'>('listings');
  const [listings, setListings] = React.useState<Property[]>([]);
  const [inquiriesList, setInquiriesList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user || currentRole === 'Tenant') {
        setLoading(false);
        return;
    }

    const listingsQ = query(collection(db, 'listings'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribeListings = onSnapshot(listingsQ, (snapshot) => {
      setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Property[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'listings');
      setLoading(false);
    });

    const inquiriesQ = query(collection(db, 'inquiries'), where('landlordId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribeInquiries = onSnapshot(inquiriesQ, (snapshot) => {
      setInquiriesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'inquiries');
    });

    return () => {
      unsubscribeListings();
      unsubscribeInquiries();
    };
  }, [user, currentRole]);

  const handleAction = async (id: string, newStatus: 'Accepted' | 'Rejected') => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { status: newStatus });
      Alert.alert("Updated", `Inquiry ${newStatus}`);
    } catch (err) {
      console.error("Failed to update inquiry", err);
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
    }
  };

  const handleDeleteListing = async (id: string) => {
     Alert.alert(
         "Delete Listing",
         "Are you sure you want to delete this listing?",
         [
             { text: "Cancel", style: "cancel" },
             { 
                text: "Delete", 
                style: "destructive",
                onPress: async () => {
                   try {
                     await deleteDoc(doc(db, 'listings', id));
                   } catch (err) {
                     console.error("Failed to delete listing", err);
                     handleFirestoreError(err, OperationType.DELETE, `listings/${id}`);
                   }
                }
             }
         ]
     );
  };

  if (!user) return (
      <View style={styles.centerContainer}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Please login to manage listings.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: '#0061A4', marginTop: 12 }}>Login</Text>
          </TouchableOpacity>
      </View>
  );

  if (currentRole === 'Tenant') {
    return (
      <View style={styles.roleContainer}>
        <View style={styles.roleIcon}>
          <Edit3 size={40} color="#0061A4" />
        </View>
        <Text style={styles.roleTitle}>Seller Dashboard</Text>
        <Text style={styles.roleSubtitle}>You are currently in Buyer mode. Switch to Seller mode to post and manage properties.</Text>
        <TouchableOpacity 
          onPress={() => switchRole('Landlord')}
          style={styles.switchBtn}
        >
          <Text style={styles.switchText}>Switch to Seller Mode</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <header style={styles.header}>
        <Text style={styles.headerTitle}>My Dashboard</Text>
      </header>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          onPress={() => setActiveTab('listings')}
          style={[styles.tab, activeTab === 'listings' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'listings' && styles.tabTextActive]}>My Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('inquiries')}
          style={[styles.tab, activeTab === 'inquiries' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'inquiries' && styles.tabTextActive]}>Inquiries</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {activeTab === 'listings' ? (
          <View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active Listings</Text>
                <TouchableOpacity onPress={() => navigation.navigate('PostListing')} style={styles.addBtn}>
                    <Plus size={20} color="#0061A4" />
                    <Text style={styles.addBtnText}>New</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color="#0061A4" style={{ marginTop: 40 }} />
            ) : listings.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No listings yet.</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('PostListing')} style={styles.postNowBtn}>
                        <Text style={styles.postNowText}>Post Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                listings.map(listing => (
                    <View key={listing.id} style={styles.listingCard}>
                        <Image source={{ uri: listing.images?.[0] }} style={styles.listingThumb} />
                        <View style={styles.listingContent}>
                            <View style={styles.listingHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
                                    <Text style={styles.listingLoc}>{listing.location}</Text>
                                </View>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>{listing.status || 'Active'}</Text>
                                </View>
                            </View>
                            <View style={styles.listingActions}>
                                <TouchableOpacity onPress={() => navigation.navigate('PostListing', { id: listing.id })} style={styles.actionBtn}>
                                    <Edit3 size={18} color="#74777F" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Share2 size={18} color="#74777F" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDeleteListing(listing.id as string)} style={styles.actionBtn}>
                                    <Trash2 size={18} color="#BA1A1A" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Recent Inquiries</Text>
            {inquiriesList.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No inquiries received yet.</Text>
                </View>
            ) : (
                inquiriesList.map(inquiry => (
                    <View key={inquiry.id} style={styles.inquiryCard}>
                        <View style={styles.inquiryHeader}>
                            <View style={styles.tenantAvatar}>
                                <Text style={styles.tenantInitial}>{inquiry.tenantName?.charAt(0) || 'U'}</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.tenantName}>{inquiry.tenantName}</Text>
                                <Text style={styles.inquirySub}>For {inquiry.listingTitle}</Text>
                            </View>
                            <Text style={styles.inquiryStatus}>{inquiry.status}</Text>
                        </View>
                        <Text style={styles.inquiryMsg}>"{inquiry.message}"</Text>
                        {inquiry.status === 'Pending' && (
                            <View style={styles.inquiryActions}>
                                <TouchableOpacity 
                                    onPress={() => handleAction(inquiry.id, 'Accepted')}
                                    style={styles.acceptBtn}
                                >
                                    <Text style={styles.acceptText}>Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={() => handleAction(inquiry.id, 'Rejected')}
                                    style={styles.rejectBtn}
                                >
                                    <Text style={styles.rejectText}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FBFCFF' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    roleContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    roleIcon: { width: 80, height: 80, backgroundColor: '#E6F1FF', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    roleTitle: { fontSize: 24, fontWeight: 'bold', color: '#1B1B1F', marginBottom: 8 },
    roleSubtitle: { fontSize: 14, color: '#44474E', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
    switchBtn: { width: '100%', height: 56, backgroundColor: '#0061A4', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    switchText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1B1B1F' },
    tabBar: { flexDirection: 'row', backgroundColor: '#F1F3F9', marginHorizontal: 20, padding: 4, borderRadius: 16 },
    tab: { flex: 1, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
    tabActive: { backgroundColor: '#0061A4' },
    tabText: { fontSize: 14, fontWeight: 'bold', color: '#44474E' },
    tabTextActive: { color: 'white' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1B1B1F' },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    addBtnText: { color: '#0061A4', fontWeight: 'bold' },
    emptyCard: { padding: 40, backgroundColor: '#F1F3F9', borderRadius: 24, alignItems: 'center', marginTop: 20 },
    emptyText: { color: '#74777F', fontWeight: 'bold' },
    postNowBtn: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#0061A4', borderRadius: 12 },
    postNowText: { color: 'white', fontWeight: 'bold' },
    listingCard: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F3F9' },
    listingThumb: { width: 80, height: 80, borderRadius: 16 },
    listingContent: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
    listingHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    listingTitle: { fontSize: 16, fontWeight: 'bold', color: '#1B1B1F' },
    listingLoc: { fontSize: 12, color: '#74777F', marginTop: 2 },
    statusBadge: { backgroundColor: '#E6F1FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
    statusText: { fontSize: 10, fontWeight: 'bold', color: '#0061A4' },
    listingActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
    actionBtn: { padding: 4 },
    inquiryCard: { backgroundColor: 'white', padding: 20, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: '#F1F3F9' },
    inquiryHeader: { flexDirection: 'row', alignItems: 'center' },
    tenantAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0061A4', justifyContent: 'center', alignItems: 'center' },
    tenantInitial: { color: 'white', fontWeight: 'bold' },
    tenantName: { fontSize: 14, fontWeight: 'bold' },
    inquirySub: { fontSize: 10, color: '#74777F' },
    inquiryStatus: { fontSize: 10, fontWeight: 'bold', color: '#0061A4' },
    inquiryMsg: { fontSize: 14, color: '#44474E', fontStyle: 'italic', marginVertical: 12 },
    inquiryActions: { flexDirection: 'row', gap: 12 },
    acceptBtn: { flex: 1, height: 44, backgroundColor: '#0061A4', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    acceptText: { color: 'white', fontWeight: 'bold' },
    rejectBtn: { flex: 1, height: 44, borderWidth: 1, borderColor: '#C4C6CF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    rejectText: { color: '#44474E', fontWeight: 'bold' }
});

export default ManagementScreen;
