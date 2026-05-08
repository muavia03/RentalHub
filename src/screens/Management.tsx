import React from 'react';
import { motion } from 'motion/react';
import { Plus, Eye, Edit3, Share2, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROPERTIES } from '../constants';
import { cn } from '../lib/utils';

import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Property } from '../types';

const ManagementScreen = () => {
  const navigate = useNavigate();
  const { user, currentRole, switchRole } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'listings' | 'inquiries'>('listings');
  const [listings, setListings] = React.useState<Property[]>([]);
  const [inquiriesList, setInquiriesList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user || currentRole === 'Tenant') return;

    // Fetch user listings
    const listingsQ = query(collection(db, 'listings'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribeListings = onSnapshot(listingsQ, (snapshot) => {
      setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Property[]);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'listings');
    });

    // Fetch inquiries (for landlord)
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
    } catch (err) {
      console.error("Failed to update inquiry", err);
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
    }
  };

  const handleEditListing = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const handleShareListing = (id: string, title: string) => {
    const url = `${window.location.origin}/property/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert(`Link copied to clipboard: ${title}`);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleDeleteListing = async (id: string, e: React.MouseEvent) => {
     e.stopPropagation();
     if(window.confirm('Are you sure you want to delete this listing?')) {
       try {
         await deleteDoc(doc(db, 'listings', id));
       } catch (err) {
         console.error("Failed to delete listing", err);
         handleFirestoreError(err, OperationType.DELETE, `listings/${id}`);
       }
     }
  };

  if (!user) return <div className="p-8 text-center pt-20"><p className="font-bold text-primary">Please login to manage your listings.</p></div>;

  if (currentRole === 'Tenant') {
    return (
      <div className="flex flex-col items-center justify-center pt-20 px-6 text-center space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Edit3 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold">Seller Dashboard</h2>
          <p className="text-on-surface-variant font-medium">You are currently in Buyer mode. Switch to Seller mode to post and manage property listings.</p>
        </div>
        <button 
          onClick={() => switchRole('Landlord')}
          className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all"
        >
          Switch to Seller Mode
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <header className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-display font-bold text-on-surface">My Dashboard</h2>
      </header>

      {/* Tabs */}
      <div className="flex bg-surface-container-low border border-outline-variant p-1 rounded-2xl mb-8">
        <button 
          onClick={() => setActiveTab('listings')}
          className={cn(
            "flex-1 py-3 rounded-xl font-bold text-center transition-all",
            activeTab === 'listings' ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container-highest"
          )}
        >
          My Listings
        </button>
        <button 
          onClick={() => setActiveTab('inquiries')}
          className={cn(
            "flex-1 py-3 rounded-xl font-bold text-center transition-all",
            activeTab === 'inquiries' ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container-highest"
          )}
        >
          Recent Inquiries
        </button>
      </div>

      {activeTab === 'listings' ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-on-surface">Active Listings</h3>
            <button 
              onClick={() => navigate('/create')}
              className="flex items-center gap-1 text-primary font-bold hover:underline active:scale-95 transition-transform"
            >
              <Plus size={20} />
              <span className="text-sm">New</span>
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-sm py-10">Loading your listings...</p>
            ) : listings.length === 0 ? (
              <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-2xl p-12 text-center">
                <p className="text-sm text-on-surface-variant font-medium">You haven't posted any listings yet.</p>
                <button 
                  onClick={() => navigate('/create')}
                  className="mt-4 px-6 py-2 bg-primary text-white font-bold rounded-xl active:scale-95 transition-all"
                >
                  Post Now
                </button>
              </div>
            ) : (
              listings.map(listing => (
                <motion.div 
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-outline-variant rounded-2xl p-4 flex gap-4 shadow-sm"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={listing.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6099aae359?w=800&q=80'} alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div onClick={() => navigate(`/property/${listing.id}`)} className="cursor-pointer">
                        <h4 className="font-bold text-on-surface leading-tight line-clamp-1">{listing.title}</h4>
                        <p className="text-xs text-on-surface-variant mt-1">{listing.location}</p>
                      </div>
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {listing.status || 'Active'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold">New</span>
                      </div>
                      <div className="flex gap-3 text-on-surface-variant">
                        <Edit3 
                          onClick={() => handleEditListing(listing.id as string)}
                          size={18} className="hover:text-primary transition-colors cursor-pointer" 
                        />
                        <Share2 
                          onClick={() => handleShareListing(listing.id as string, listing.title)}
                          size={18} className="hover:text-primary transition-colors cursor-pointer" 
                        />
                        <Trash2 
                          onClick={(e) => handleDeleteListing(listing.id as string, e)}
                          size={18} className="hover:text-error transition-colors cursor-pointer" 
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <h3 className="text-xl font-display font-bold text-on-surface">Recent Inquiries</h3>
          <div className="space-y-4">
            {inquiriesList.length === 0 ? (
              <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-2xl p-12 text-center">
                <p className="text-sm text-on-surface-variant font-medium">No inquiries received yet.</p>
              </div>
            ) : (
              inquiriesList.map(inquiry => (
                <motion.div 
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-outline-variant rounded-2xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold bg-secondary-container text-on-secondary-container")}>
                        {inquiry.tenantName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface leading-none">{inquiry.tenantName}</h4>
                        <p className="text-[10px] font-medium text-on-surface-variant mt-1">For {inquiry.listingTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                        {inquiry.status || 'Pending'}
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant italic leading-relaxed line-clamp-2">
                    "{inquiry.message}"
                  </p>
                  {inquiry.status === 'Pending' && (
                    <div className="flex gap-4 pt-2">
                    <button 
                      onClick={() => handleAction(inquiry.id, 'Accepted')}
                      className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleAction(inquiry.id, 'Rejected')}
                      className="flex-1 py-3 border border-outline text-on-surface-variant rounded-xl text-xs font-bold hover:bg-surface-container active:scale-[0.98] transition-all"
                    >
                      Reject
                    </button>
                  </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default ManagementScreen;
