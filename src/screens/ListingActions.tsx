import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Plus, Check, Info, Trash2, Image as ImageIcon, Zap, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { PAKISTAN_CITIES } from '../constants';

import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export const PostListingScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (images.length + newFiles.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    newFiles.forEach((file: File) => {
      // Reduced limit to ensure total document stays under 1MB Firestore limit
      if (file.size > 150 * 1024) { 
        alert('Image too large. To ensure fast updates, please use images under 150KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  useEffect(() => {
    if (currentRole === 'Tenant') {
      alert('Only Sellers can post listings. Switching to Buyer mode.');
      navigate('/home');
    }
  }, [currentRole, navigate]);

  // Load existing data for Edit Mode
  useEffect(() => {
    if (isEditMode && user) {
      const fetchListing = async () => {
        try {
          const docRef = doc(db, 'listings', id!);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.ownerId !== user.uid) {
              alert('Unauthorized');
              navigate('/management');
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
  }, [id, isEditMode, user, navigate]);
  
  const [amenities, setAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleAmenity = (am: string) => {
    setAmenities(prev => prev.includes(am) ? prev.filter(a => a !== am) : [...prev, am]);
  };

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in.');
      navigate('/');
      return;
    }
    if (images.length === 0) {
      setError('Please add at least one property image URL.');
      return;
    }
    setLoading(true);
    setSuccess(false);
    setError('');

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
      // Brief delay to show success state before navigation
      setTimeout(() => {
        setLoading(false);
        navigate('/management');
      }, 2000);
    } catch (err: any) {
      console.error("Failed to post/update listing", err);
      // Check for size errors
      if (err.code === 'resource-exhausted' || err.message?.includes('size')) {
        setError('Images are too large. Please use smaller image files (under 100KB each).');
      } else {
        handleFirestoreError(err, isEditMode ? OperationType.UPDATE : OperationType.WRITE, isEditMode ? `listings/${id}` : 'listings');
      }
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-32 pt-2">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container rounded-full active:scale-90 transition-all">
            <ArrowLeft size={24} className="text-primary" />
          </button>
          <h2 className="text-2xl font-display font-bold text-primary">{isEditMode ? 'Edit Listing' : 'Post Listing'}</h2>
        </div>
      </header>

      <AnimatePresence>
        {loading && !success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
            <h3 className="text-2xl font-display font-bold text-primary mb-2">
              {isEditMode ? 'Updating Listing...' : 'Posting Listing...'}
            </h3>
            <p className="text-on-surface-variant font-medium">Please wait while we save your property details and images.</p>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-8 shadow-xl shadow-green-500/30">
               <Check size={48} />
            </div>
            <h3 className="text-3xl font-display font-bold text-on-surface mb-2">
               {isEditMode ? 'Listing Updated!' : 'Success!'}
            </h3>
            <p className="text-lg text-on-surface-variant font-medium mb-12">
               Your property listing has been saved successfully.
            </p>
            <div className="w-full max-w-xs space-y-4">
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.8 }}
                    className="h-full bg-green-500"
                 />
              </div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Redirecting to Dashboard...</p>
            </div>
          </motion.div>
        )}
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-error text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg mb-6"
          >
            <Info size={20} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Images Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Property Images ({images.length}/10)</label>
            {images.length > 0 && (
               <button 
                type="button" 
                onClick={() => setImages([])}
                className="text-[9px] font-bold text-error uppercase tracking-widest"
               >
                 Clear All
               </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
             {images.map((url, idx) => (
               <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant group shadow-sm">
                 <img src={url} alt={`Listing ${idx}`} className="w-full h-full object-cover" />
                 <button 
                   type="button"
                   onClick={() => removeImage(idx)}
                   className="absolute inset-0 bg-error/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                   <Trash2 size={24} className="text-white" />
                 </button>
               </div>
             ))}
             {images.length < 10 && (
               <label htmlFor="image-upload" className="aspect-square rounded-2xl bg-surface-container border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-outline transition-all hover:border-primary/50 cursor-pointer active:scale-95">
                  <ImageIcon size={32} />
                  <span className="text-[10px] font-bold mt-2">Add Photo</span>
                  <input 
                    type="file" 
                    id="image-upload" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
               </label>
             )}
          </div>
          
          {images.length === 0 && (
            <div className="bg-surface-container-low p-4 rounded-2xl flex items-center gap-3 border border-outline-variant/30">
               <Info size={18} className="text-primary shrink-0" />
               <p className="text-[10px] text-on-surface-variant leading-relaxed">Please upload at least one image from your device. You can add up to 10 photos of your property.</p>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-2">Property Title</label>
          <input 
            required 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full h-12 px-4 rounded-xl bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-sm outline-none font-medium" 
            placeholder="e.g. Modern 2BHK Apartment" 
            type="text" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-2">Property Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full h-12 px-4 rounded-xl bg-white border border-outline-variant text-sm font-medium appearance-none"
            >
              <option>Apartment</option>
              <option>House</option>
              <option>Villa</option>
              <option>Shop</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-2">Price (PKR/month)</label>
            <input 
              required 
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full h-12 px-4 rounded-xl bg-white border border-outline-variant text-sm font-medium" 
              placeholder="50,000" 
              type="number" 
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-2">Description</label>
          <textarea 
            required 
            rows={4} 
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-4 rounded-xl bg-white border border-outline-variant focus:border-primary text-sm font-medium resize-none" 
            placeholder="Describe your property details..." 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-2">Location/Address</label>
            <input 
              required 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full h-12 px-4 rounded-xl bg-white border border-outline-variant focus:border-primary text-sm font-medium" 
              placeholder="e.g. Model Town, Block A" 
              type="text" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-2">City</label>
            <select 
              required
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full h-12 px-4 rounded-xl bg-white border border-outline-variant text-sm font-medium appearance-none"
            >
              <option value="">Select City</option>
              {PAKISTAN_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-display font-bold">Amenities</h3>
          <div className="grid grid-cols-2 gap-4">
            {['Parking', 'WiFi', 'Security', '24/7 Power', 'Backup Generator'].map(am => (
                <label key={am} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="hidden peer" 
                      checked={amenities.includes(am)}
                      onChange={() => toggleAmenity(am)}
                    />
                    <div className="w-5 h-5 rounded border-2 border-outline-variant group-hover:border-primary flex items-center justify-center transition-colors peer-checked:bg-primary peer-checked:border-primary">
                        <Check size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-on-surface-variant">{am}</span>
                </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6">
          <button 
            disabled={loading}
            className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50" 
            type="submit"
          >
            {loading ? (isEditMode ? 'Updating...' : 'Posting...') : (isEditMode ? 'Update Listing' : 'Post Listing')}
          </button>

          <button className="w-full h-14 border-2 border-primary text-primary font-bold rounded-xl active:scale-[0.98] transition-all" type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export const ContactModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-outline-variant"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant">
                <Plus size={24} className="rotate-45" />
            </button>

            <div className="p-6 pt-10">
                <h3 className="text-2xl font-display font-bold text-on-surface mb-1">Reveal Contact info</h3>
                <p className="text-sm text-on-surface-variant font-medium">Choose a plan to see phone</p>
            </div>

            <div className="px-6 space-y-4 mb-8">
                {/* Plans */}
                <div className="p-4 border border-outline-variant rounded-2xl bg-surface-container-low flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-on-surface">Light Plan</span>
                        <span className="text-2xl font-extrabold text-primary">PKR 1,500</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                        <Zap size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">10 Contacts</span>
                    </div>
                    <button className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-sm hover:brightness-110 transition-all">Buy Light Plan</button>
                </div>

                <div className="p-4 border-2 border-primary rounded-2xl bg-primary-container/[0.03] flex flex-col gap-3 relative">
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-white rounded-full text-[10px] font-bold flex items-center gap-1 uppercase tracking-widest shadow-md">
                        <Zap size={10} className="fill-current" />
                        Popular
                    </div>
                    <div className="flex justify-between items-start mt-2">
                        <span className="font-bold text-on-surface">Premium Plan</span>
                        <span className="text-2xl font-extrabold text-primary">PKR 4,000</span>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                            <Zap size={16} />
                             <span className="text-xs font-bold uppercase tracking-wider">100 Contacts</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant">
                            <ShieldCheck size={16} />
                             <span className="text-xs font-bold uppercase tracking-wider">Priority Support</span>
                        </div>
                    </div>
                    <button className="w-full h-12 bg-secondary text-white font-bold rounded-xl shadow-sm hover:brightness-110 transition-all">Buy Premium Plan</button>
                </div>
            </div>

            <div className="px-6 pb-6">
                <button onClick={onClose} className="w-full h-12 border border-outline text-on-surface-variant font-bold rounded-xl hover:bg-surface-container transition-colors">
                    Cancel
                </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
