import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, BedDouble, Bath, Square, Share2, Heart, Send, Check, Store, Ruler, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { formatPrice, cn } from '../lib/utils';
import { Property } from '../types';
import { MOCK_PROPERTIES } from '../constants';

export const PropertyDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
        } else {
          // Fallback to mock if not found in Firebase (might be a mock ID)
          const mock = MOCK_PROPERTIES.find(p => p.id === id);
          if (mock) setProperty(mock as any);
        }
      } catch (err) {
        console.error("Error fetching property", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleShare = () => {
    if (!property) return;
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
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
    } catch (err) {
      console.error("Failed to send inquiry", err);
      handleFirestoreError(err, OperationType.WRITE, 'inquiries');
    } finally {
      setSendingInquiry(false);
    }
  };

  if (loading) return <div className="p-8 text-center pt-20 font-bold text-primary">Loading property details...</div>;
  if (!property) return <div className="p-8 text-center pt-20 font-bold text-error">Property not found.</div>;

  return (
    <div className="pb-32 bg-surface">
      {/* Header Overlay */}
      <div className="fixed top-[56px] left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg pointer-events-auto active:scale-90 transition-transform"
        >
          <ArrowLeft size={24} className="text-on-surface" />
        </button>
        <div className="flex gap-2 pointer-events-auto">
          <button 
            onClick={handleShare}
            className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg active:scale-90 transition-transform"
          >
            <Share2 size={24} className="text-on-surface" />
          </button>
          <button className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg active:scale-90 transition-transform">
            <Heart size={24} className="text-on-surface" />
          </button>
        </div>
      </div>

      {/* Hero Image Slider */}
      <div className="h-[450px] w-full relative overflow-hidden bg-black">
        <div className="flex h-full transition-transform duration-500 ease-out" style={{ transform: `translateX(-${activeImageIdx * 100}%)` }}>
          {(property.images || [(property as any).image]).map((img, idx) => (
            <img key={idx} src={img} alt={`${property.title} ${idx}`} className="w-full h-full object-cover shrink-0" />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        
        {/* Indicators */}
        <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 z-20">
          {(property.images || [(property as any).image]).map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveImageIdx(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                activeImageIdx === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 -mt-12 relative z-10">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-outline-variant space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-widest">
                {property.type}
              </span>
              <span className="text-3xl font-display font-extrabold text-primary">
                {formatPrice(property.price)}
                <span className="text-sm font-bold text-on-surface-variant font-sans">/mo</span>
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-on-surface tracking-tight leading-tight">
              {property.title}
            </h1>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <MapPin size={18} className="shrink-0" />
              <span className="text-sm font-medium">{property.location}</span>
            </div>
          </div>

          <div className="flex justify-between py-6 border-y border-outline-variant">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
                <BedDouble size={24} className="text-primary" />
              </div>
              <span className="text-sm font-bold">{property.beds} Beds</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
                <Bath size={24} className="text-primary" />
              </div>
              <span className="text-sm font-bold">2 Baths</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
                <Square size={24} className="text-primary" />
              </div>
              <span className="text-sm font-bold">1,200 sqft</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-display font-bold">Description</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
              {(property as any).description || "Experience luxury living in this premium property. Located in the heart of the city, this unit offers breathtaking views, high-end finishing, and state-of-the-art facilities."}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {(property.amenities || ['Parking', 'Security', 'WiFi']).map(am => (
                <span key={am} className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs font-bold text-on-surface">
                  {am}
                </span>
              ))}
            </div>
          </div>

          {/* Inquiry Section */}
          <div className="pt-8 border-t border-outline-variant">
            <h3 className="text-xl font-display font-bold mb-4">Send an Inquiry</h3>
            {!user ? (
               <div className="p-6 bg-surface-container-low rounded-2xl text-center">
                 <p className="text-sm font-bold text-on-surface-variant">Please login to send an inquiry.</p>
                 <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold active:scale-95 transition-transform">Login</button>
               </div>
            ) : inquirySent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={24} className="text-white" />
                </div>
                <p className="text-sm font-bold text-green-700">Inquiry Sent Successfully!</p>
                <p className="text-xs text-green-600 mt-1">The landlord will get back to you soon.</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <textarea 
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-surface-container-low border border-outline-variant focus:border-primary outline-none text-sm font-medium resize-none"
                  rows={4}
                  placeholder="Ask about availability, viewing times, or rent negotiation..."
                />
                <button 
                  disabled={sendingInquiry || !inquiryMessage.trim()}
                  onClick={handleSendInquiry}
                  className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sendingInquiry ? 'Sending...' : (
                    <>
                      <Send size={18} />
                      Send Inquiry
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
