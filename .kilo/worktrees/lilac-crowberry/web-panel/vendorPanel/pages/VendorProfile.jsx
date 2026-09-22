// // pages/VendorProfile.jsx
// import { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   User,
//   Building2,
//   MapPin,
//   Phone,
//   Mail,
//   LoaderCircle,
//   AlertCircle,
//   Edit2,
//   Save,
//   X,
//   Power,
//   PowerOff,
//   Navigation,
//   Camera,
//   Store,
//   Briefcase,
//   Tag,
//   FileText,
//   CheckCircle,
//   Upload,
//   Utensils,
// } from "lucide-react";
// import {
//   getVendorProfileApi,
//   updateVendorProfileApi,
//   updateVendorBusinessApi,
//   updateVendorOnlineStatusApi,
//   reverseGeocodeVendorApi,
//   updateVendorAddressApi,
//   updateVendorProfileImage,
// } from "../../src/api/vendorApi";

// // ─── Helper: Build full image URL ──────────────────────────
// const buildImageUrl = (imagePath) => {
//   if (!imagePath) return null;
//   if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
//     return imagePath;
//   const baseUrl = import.meta.env?.VITE_STATIC_BASE || "http://localhost:9000";
//   const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
//   return `${baseUrl}${path}`;
// };

// // ─── Helper: Convert address object to string without duplication ──
// const formatAddressToString = (address) => {
//   if (!address) return "";
//   if (typeof address === "string") return address;

//   const { addressLine, landmark, city, state, pincode } = address;

//   // If addressLine already contains a 6‑digit pincode, it's likely complete
//   if (addressLine && /\b\d{6}\b/.test(addressLine)) {
//     return addressLine;
//   }

//   // Otherwise, build from parts
//   const parts = [addressLine, landmark, city, state, pincode].filter(Boolean);
//   return parts.join(", ");
// };

// // ─── Toast System ──────────────────────────────────────────
// const ToastContainer = ({ toasts, removeToast }) => (
//   <div className="fixed z-50 flex flex-col w-full max-w-sm gap-2 pointer-events-none top-4 right-4">
//     <AnimatePresence>
//       {toasts.map((toast) => (
//         <motion.div
//           key={toast.id}
//           initial={{ opacity: 0, x: 50, scale: 0.9 }}
//           animate={{ opacity: 1, x: 0, scale: 1 }}
//           exit={{ opacity: 0, x: 50, scale: 0.9 }}
//           transition={{ duration: 0.3 }}
//           className={`pointer-events-auto rounded-xl p-4 shadow-lg border ${
//             toast.type === "success"
//               ? "bg-green-50 border-green-200 text-green-800"
//               : "bg-red-50 border-red-200 text-red-800"
//           }`}
//         >
//           <div className="flex items-start gap-3">
//             {toast.type === "success" ? (
//               <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
//             ) : (
//               <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
//             )}
//             <span className="flex-1 text-sm font-medium">{toast.message}</span>
//             <button
//               onClick={() => removeToast(toast.id)}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//         </motion.div>
//       ))}
//     </AnimatePresence>
//   </div>
// );

// // ─── Options ──────────────────────────────────────────────
// const BUSINESS_TYPES = [
//   { value: "restaurant", label: "Restaurant" },
//   { value: "dhaba", label: "Dhaba" },
//   { value: "bakery", label: "Bakery" },
//   { value: "cafe", label: "Cafe" },
//   { value: "tiffin_center", label: "Tiffin Center" },
//   { value: "sweet_shop", label: "Sweet Shop" },
//   { value: "cloud_kitchen", label: "Cloud Kitchen" },
//   { value: "fast_food", label: "Fast Food" },
//   { value: "juice_center", label: "Juice Center" },
//   { value: "other", label: "Other" },
// ];

// const FOOD_TYPES = [
//   { value: "pure_veg", label: "Pure Veg" },
//   { value: "non_veg", label: "Non-Veg" },
//   { value: "veg_non_veg", label: "Both" },
// ];

// // ─── Main Component ──────────────────────────────────────
// export default function VendorProfile() {
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [profile, setProfile] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [toasts, setToasts] = useState([]);
//   const [formData, setFormData] = useState({
//     ownerFirstName: "",
//     ownerLastName: "",
//     email: "",
//     phone: "",
//     businessName: "",
//     businessType: "",
//     foodType: "veg_non_veg",
//     address: "",
//     gstNumber: "",
//     panNumber: "",
//     description: "",
//     isOnline: false,
//     latitude: null,
//     longitude: null,
//     profileImage: null,
//   });
//   const [addressLoading, setAddressLoading] = useState(false);
//   const [onlineToggling, setOnlineToggling] = useState(false);
//   const [imageUploading, setImageUploading] = useState(false);
//   const fileInputRef = useRef(null);
//   const [isDragging, setIsDragging] = useState(false);

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   // ─── Toast helpers ──────────────────────────────────────
//   const showToast = (message, type = "success") => {
//     const id = Date.now() + Math.random();
//     setToasts((prev) => [...prev, { id, message, type }]);
//     setTimeout(
//       () => setToasts((prev) => prev.filter((t) => t.id !== id)),
//       4000,
//     );
//   };
//   const removeToast = (id) =>
//     setToasts((prev) => prev.filter((t) => t.id !== id));

//   // ─── Fetch profile ──────────────────────────────────────
//   const fetchProfile = async () => {
//     try {
//       setLoading(true);
//       const res = await getVendorProfileApi();
//       const vendor = res?.data?.vendor || res?.vendor || res?.data || res;
//       if (!vendor || typeof vendor !== "object")
//         throw new Error("Invalid profile data");
//       setProfile(vendor);
//       setFormData({
//         ownerFirstName: vendor.ownerFirstName || "",
//         ownerLastName: vendor.ownerLastName || "",
//         email: vendor.email || "",
//         phone: vendor.phone || "",
//         businessName: vendor.businessName || "",
//         businessType: vendor.businessType || "",
//         foodType: vendor.foodType || "veg_non_veg",
//         address: formatAddressToString(vendor.address) || "",
//         gstNumber: vendor.gstNumber || "",
//         panNumber: vendor.panNumber || "",
//         description: vendor.description || "",
//         isOnline: vendor.isOnline || false,
//         latitude: vendor.address?.location?.coordinates?.[1] || null,
//         longitude: vendor.address?.location?.coordinates?.[0] || null,
//         profileImage: vendor.profileImage || null,
//       });
//     } catch (error) {
//       console.error(error);
//       showToast(
//         error.response?.data?.message || "Failed to load profile",
//         "error",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSelectChange = (name, value) => {
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleToggleOnline = async () => {
//     try {
//       setOnlineToggling(true);
//       const newStatus = !formData.isOnline;
//       await updateVendorOnlineStatusApi(newStatus);
//       setFormData((prev) => ({ ...prev, isOnline: newStatus }));
//       showToast(`You are now ${newStatus ? "online" : "offline"}`);
//     } catch (error) {
//       showToast("Failed to update online status", "error");
//     } finally {
//       setOnlineToggling(false);
//     }
//   };

//   const handleSaveProfile = async () => {
//     try {
//       setSaving(true);
//       await updateVendorProfileApi({
//         ownerFirstName: formData.ownerFirstName,
//         ownerLastName: formData.ownerLastName,
//         phone: formData.phone,
//       });
//       await updateVendorBusinessApi({
//         businessName: formData.businessName,
//         businessType: formData.businessType,
//         foodType: formData.foodType,
//         description: formData.description,
//         gstNumber: formData.gstNumber,
//         panNumber: formData.panNumber,
//       });
//       await fetchProfile();
//       setIsEditing(false);
//       showToast("Profile updated successfully");
//     } catch (error) {
//       showToast(
//         error.response?.data?.message || "Failed to update profile",
//         "error",
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleImageUpload = async (file) => {
//     if (!file) {
//       showToast("No file selected", "error");
//       return;
//     }
//     const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
//     if (!allowedTypes.includes(file.type)) {
//       showToast("Only JPG, PNG, and WEBP images are allowed", "error");
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       showToast("Image size must be less than 5MB", "error");
//       return;
//     }

//     try {
//       setImageUploading(true);
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setFormData((prev) => ({ ...prev, profileImage: e.target.result }));
//       };
//       reader.readAsDataURL(file);

//       const formDataToSend = new FormData();
//       formDataToSend.append("profileImage", file);
//       const response = await updateVendorProfileImage(formDataToSend);
//       if (response.success) {
//         await fetchProfile();
//         showToast("Profile image updated successfully");
//       } else {
//         throw new Error(response.message || "Upload failed");
//       }
//     } catch (error) {
//       console.error(error);
//       showToast(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to upload image",
//         "error",
//       );
//       if (profile?.profileImage) {
//         setFormData((prev) => ({
//           ...prev,
//           profileImage: profile.profileImage,
//         }));
//       }
//     } finally {
//       setImageUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   const handleFileInput = (e) => handleImageUpload(e.target.files[0]);
//   const handleDrop = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const file = e.dataTransfer.files[0];
//     if (file && file.type.startsWith("image/")) {
//       handleImageUpload(file);
//     } else {
//       showToast("Please drop an image file", "error");
//     }
//   };
//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };
//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     setIsDragging(false);
//   };

//   // ─── Get Current Location ──────────────────────────────
//   const handleGetCurrentLocation = () => {
//     if (!navigator.geolocation) {
//       showToast("Geolocation not supported", "error");
//       return;
//     }
//     setAddressLoading(true);
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         try {
//           const res = await reverseGeocodeVendorApi(latitude, longitude);
//           // res.data.address is the address object from backend
//           const addressObj = res.data?.address || res.address || {};

//           // Format display string (no duplication)
//           const addressString = formatAddressToString(addressObj);

//           // Update local form state
//           setFormData((prev) => ({
//             ...prev,
//             address: addressString,
//             latitude,
//             longitude,
//           }));

//           // Update backend with full structured address
//           await updateVendorAddressApi({
//             addressLine: addressObj.addressLine || addressString,
//             landmark: addressObj.landmark || "",
//             city: addressObj.city || "",
//             state: addressObj.state || "",
//             pincode: addressObj.pincode || "",
//             latitude,
//             longitude,
//           });

//           showToast("Location updated successfully");
//         } catch (error) {
//           console.error(error);
//           showToast("Failed to get address", "error");
//         } finally {
//           setAddressLoading(false);
//         }
//       },
//       () => {
//         showToast("Unable to get location. Please allow access.", "error");
//         setAddressLoading(false);
//       },
//     );
//   };

//   const handleUpdateAddress = async () => {
//     if (!formData.address?.trim()) {
//       showToast("Address cannot be empty", "error");
//       return;
//     }
//     try {
//       setSaving(true);
//       await updateVendorAddressApi({
//         addressLine: formData.address.trim(),
//         latitude: formData.latitude,
//         longitude: formData.longitude,
//       });
//       showToast("Address updated");
//       await fetchProfile(); // refresh to get updated coords
//     } catch (error) {
//       showToast(
//         error.response?.data?.message || "Failed to update address",
//         "error",
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const getImageUrl = () => {
//     if (formData.profileImage) {
//       if (formData.profileImage.startsWith("data:image"))
//         return formData.profileImage;
//       return buildImageUrl(formData.profileImage);
//     }
//     return null;
//   };

//   const imageUrl = getImageUrl();

//   // ─── Loading Skeleton ──────────────────────────────────
//   if (loading) {
//     return (
//       <div className="max-w-6xl px-4 py-8 mx-auto space-y-8">
//         <div className="h-40 rounded-3xl bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse" />
//         <div className="p-8 space-y-8 bg-white border border-gray-200 rounded-2xl">
//           <div className="flex flex-col items-center gap-6 sm:flex-row">
//             <div className="bg-gray-200 rounded-full w-28 h-28 animate-pulse" />
//             <div className="flex-1 space-y-3">
//               <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
//               <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
//               <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
//             </div>
//           </div>
//           {[1, 2, 3].map((i) => (
//             <div key={i} className="space-y-4">
//               <div className="w-40 h-6 bg-gray-200 rounded animate-pulse" />
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                 {[1, 2].map((j) => (
//                   <div
//                     key={j}
//                     className="h-12 bg-gray-200 rounded-xl animate-pulse"
//                   />
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (!profile) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[60vh]">
//         <AlertCircle className="w-16 h-16 text-gray-300" />
//         <p className="mt-4 text-lg text-gray-500">No profile data available.</p>
//         <button
//           onClick={fetchProfile}
//           className="px-6 py-2 mt-4 text-sm font-bold text-white transition-colors bg-orange-500 rounded-xl hover:bg-orange-600"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl px-4 py-8 mx-auto space-y-8">
//       <ToastContainer toasts={toasts} removeToast={removeToast} />

//       {/* ─── Header ──────────────────────────────────────── */}
//       <div className="relative overflow-hidden shadow-xl rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">
//         <div className="absolute inset-0 bg-black/10" />
//         <div className="relative flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-10">
//           <div className="space-y-1">
//             <motion.h1
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-3xl font-black text-white sm:text-4xl"
//             >
//               Vendor Profile
//             </motion.h1>
//             <p className="text-sm text-white/80">
//               Manage your account and business details
//             </p>
//           </div>
//           <div className="flex items-center gap-3">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={handleToggleOnline}
//               disabled={onlineToggling}
//               className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-xl shadow-lg ${
//                 formData.isOnline
//                   ? "bg-green-500 text-white hover:bg-green-600"
//                   : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
//               } disabled:opacity-50`}
//             >
//               {onlineToggling ? (
//                 <LoaderCircle className="w-4 h-4 animate-spin" />
//               ) : formData.isOnline ? (
//                 <>
//                   <Power className="w-4 h-4" /> Online
//                 </>
//               ) : (
//                 <>
//                   <PowerOff className="w-4 h-4" /> Offline
//                 </>
//               )}
//             </motion.button>
//             {!isEditing ? (
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setIsEditing(true)}
//                 className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-orange-600 transition-all bg-white shadow-lg rounded-xl hover:bg-orange-50 hover:shadow-xl"
//               >
//                 <Edit2 className="w-4 h-4" /> Edit Profile
//               </motion.button>
//             ) : (
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => {
//                     setIsEditing(false);
//                     if (profile) {
//                       setFormData({
//                         ownerFirstName: profile.ownerFirstName || "",
//                         ownerLastName: profile.ownerLastName || "",
//                         email: profile.email || "",
//                         phone: profile.phone || "",
//                         businessName: profile.businessName || "",
//                         businessType: profile.businessType || "",
//                         foodType: profile.foodType || "veg_non_veg",
//                         address: formatAddressToString(profile.address) || "",
//                         gstNumber: profile.gstNumber || "",
//                         panNumber: profile.panNumber || "",
//                         description: profile.description || "",
//                         isOnline: profile.isOnline || false,
//                         latitude:
//                           profile.address?.location?.coordinates?.[1] || null,
//                         longitude:
//                           profile.address?.location?.coordinates?.[0] || null,
//                         profileImage: profile.profileImage || null,
//                       });
//                     }
//                   }}
//                   className="px-4 py-2 text-sm font-bold text-gray-700 transition-colors bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={handleSaveProfile}
//                   disabled={saving}
//                   className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white transition-all bg-orange-500 shadow-lg rounded-xl hover:bg-orange-600 disabled:opacity-50"
//                 >
//                   {saving ? (
//                     <LoaderCircle className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <Save className="w-4 h-4" />
//                   )}
//                   Save
//                 </motion.button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ─── Main Card ────────────────────────────────────── */}
//       <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-3xl">
//         <div className="p-6 space-y-10 sm:p-10">
//           {/* Profile Image & Basic Info */}
//           <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
//             <div
//               className={`relative group ${isDragging ? "ring-4 ring-orange-400" : ""}`}
//               onDrop={handleDrop}
//               onDragOver={handleDragOver}
//               onDragLeave={handleDragLeave}
//             >
//               <div className="w-32 h-32 overflow-hidden border-4 border-orange-100 rounded-full shadow-xl">
//                 {imageUrl ? (
//                   <img
//                     src={imageUrl}
//                     alt="Profile"
//                     className="object-cover w-full h-full"
//                   />
//                 ) : (
//                   <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-orange-200 to-orange-400">
//                     <User className="text-white w-14 h-14" />
//                   </div>
//                 )}
//               </div>
//               {isEditing && (
//                 <>
//                   <button
//                     onClick={() => fileInputRef.current?.click()}
//                     disabled={imageUploading}
//                     className="absolute bottom-0 right-0 p-2.5 text-white transition-all bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 disabled:opacity-50"
//                   >
//                     {imageUploading ? (
//                       <LoaderCircle className="w-4 h-4 animate-spin" />
//                     ) : (
//                       <Camera className="w-4 h-4" />
//                     )}
//                   </button>
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     accept="image/*"
//                     onChange={handleFileInput}
//                     className="hidden"
//                   />
//                 </>
//               )}
//               {isDragging && (
//                 <div className="absolute inset-0 flex items-center justify-center rounded-full bg-orange-500/70 backdrop-blur-sm">
//                   <Upload className="w-8 h-8 text-white" />
//                 </div>
//               )}
//             </div>
//             <div className="flex-1 text-center sm:text-left">
//               <h2 className="text-3xl font-bold text-gray-900">
//                 {`${formData.ownerFirstName || ""} ${formData.ownerLastName || ""}`.trim() ||
//                   "Vendor Name"}
//               </h2>
//               <p className="text-gray-500">{formData.email}</p>
//               <div className="flex items-center justify-center gap-4 mt-2 sm:justify-start">
//                 <span
//                   className={`inline-flex items-center gap-1.5 text-sm font-medium ${formData.isOnline ? "text-green-600" : "text-gray-500"}`}
//                 >
//                   <span
//                     className={`inline-block w-2 h-2 rounded-full ${formData.isOnline ? "bg-green-500" : "bg-gray-400"}`}
//                   />
//                   {formData.isOnline ? "Online" : "Offline"}
//                 </span>
//                 <span className="text-sm text-gray-400">•</span>
//                 <span className="text-sm text-gray-500">
//                   {formData.businessType || "Business"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* ─── Personal Information ────────────────────── */}
//           <Section icon={User} title="Personal Information">
//             <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
//               <Field
//                 label="First Name"
//                 name="ownerFirstName"
//                 value={formData.ownerFirstName}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 icon={User}
//               />
//               <Field
//                 label="Last Name"
//                 name="ownerLastName"
//                 value={formData.ownerLastName}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 icon={User}
//               />
//               <Field
//                 label="Email"
//                 name="email"
//                 value={formData.email}
//                 disabled
//                 icon={Mail}
//                 note="Contact admin to change email"
//               />
//               <Field
//                 label="Phone"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 icon={Phone}
//               />
//             </div>
//           </Section>

//           {/* ─── Business Information ────────────────────── */}
//           <Section icon={Building2} title="Business Information">
//             <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
//               <Field
//                 label="Business Name"
//                 name="businessName"
//                 value={formData.businessName}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 icon={Store}
//               />
//               <SelectField
//                 label="Business Type"
//                 name="businessType"
//                 value={formData.businessType}
//                 options={BUSINESS_TYPES}
//                 onChange={handleSelectChange}
//                 disabled={!isEditing}
//                 icon={Briefcase}
//               />
//               <SelectField
//                 label="Food Type"
//                 name="foodType"
//                 value={formData.foodType}
//                 options={FOOD_TYPES}
//                 onChange={handleSelectChange}
//                 disabled={!isEditing}
//                 icon={Utensils}
//               />
//               <Field
//                 label="GST Number"
//                 name="gstNumber"
//                 value={formData.gstNumber}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 icon={Tag}
//               />
//               <Field
//                 label="PAN Number"
//                 name="panNumber"
//                 value={formData.panNumber}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 icon={FileText}
//               />
//             </div>
//             <div className="mt-5">
//               <Field
//                 label="Description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 disabled={!isEditing}
//                 multiline
//                 rows={3}
//                 placeholder="Tell customers about your business..."
//                 icon={FileText}
//               />
//             </div>
//           </Section>

//           {/* ─── Location & Address ───────────────────────── */}
//           <Section icon={MapPin} title="Location & Address">
//             <div className="space-y-4">
//               <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
//                 <div className="flex-1">
//                   <Field
//                     label="Address"
//                     name="address"
//                     value={formData.address}
//                     onChange={handleChange}
//                     disabled={!isEditing}
//                     multiline
//                     rows={2}
//                     placeholder="Street, city, state, pincode"
//                     icon={MapPin}
//                   />
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={handleGetCurrentLocation}
//                     disabled={addressLoading}
//                     className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 transition-colors bg-blue-50 rounded-xl hover:bg-blue-100 disabled:opacity-50"
//                   >
//                     {addressLoading ? (
//                       <LoaderCircle className="w-4 h-4 animate-spin" />
//                     ) : (
//                       <Navigation className="w-4 h-4" />
//                     )}
//                     Get Location
//                   </button>
//                   {isEditing && (
//                     <button
//                       onClick={handleUpdateAddress}
//                       disabled={saving || !formData.address?.trim()}
//                       className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition-colors bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50"
//                     >
//                       {saving ? (
//                         <LoaderCircle className="w-4 h-4 animate-spin" />
//                       ) : (
//                         <Save className="w-4 h-4" />
//                       )}
//                       Update
//                     </button>
//                   )}
//                 </div>
//               </div>
//               {formData.latitude && formData.longitude ? (
//                 <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 rounded-xl">
//                   📍 {formData.latitude.toFixed(6)},{" "}
//                   {formData.longitude.toFixed(6)}
//                 </div>
//               ) : (
//                 <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50 rounded-xl">
//                   📍 No coordinates available
//                 </div>
//               )}
//             </div>
//           </Section>

//           {/* ─── Status & Stats ──────────────────────────── */}
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//             <div className="p-4 border border-green-100 rounded-xl bg-green-50">
//               <p className="text-sm font-medium text-green-700">
//                 Online Status
//               </p>
//               <p className="text-lg font-bold text-green-900">
//                 {formData.isOnline ? "🟢 Online" : "🔴 Offline"}
//               </p>
//             </div>
//             <div className="p-4 border border-blue-100 rounded-xl bg-blue-50">
//               <p className="text-sm font-medium text-blue-700">Rating</p>
//               <p className="text-lg font-bold text-blue-900">
//                 ⭐ {profile.rating || 0} / 5
//               </p>
//             </div>
//             <div className="p-4 border border-purple-100 rounded-xl bg-purple-50">
//               <p className="text-sm font-medium text-purple-700">
//                 Total Orders
//               </p>
//               <p className="text-lg font-bold text-purple-900">
//                 {profile.totalOrders || 0}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Section Component ────────────────────────────────────
// function Section({ icon: Icon, title, children }) {
//   return (
//     <div className="space-y-4">
//       <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
//         <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500">
//           <Icon className="w-4 h-4" />
//         </div>
//         <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase">
//           {title}
//         </h3>
//       </div>
//       {children}
//     </div>
//   );
// }

// // ─── Select Field ──────────────────────────────────────────
// function SelectField({
//   label,
//   name,
//   value,
//   options,
//   onChange,
//   disabled,
//   icon: Icon,
// }) {
//   return (
//     <div className="relative">
//       {Icon && (
//         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none top-6">
//           <Icon className="w-4 h-4 text-gray-400" />
//         </div>
//       )}
//       <label
//         htmlFor={name}
//         className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase"
//       >
//         {label}
//       </label>
//       <div className={Icon ? "pl-9" : ""}>
//         <select
//           id={name}
//           name={name}
//           value={value || ""}
//           onChange={(e) => onChange(name, e.target.value)}
//           disabled={disabled}
//           className={`w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 appearance-none ${
//             disabled
//               ? "bg-gray-50 text-gray-500 cursor-not-allowed"
//               : "bg-white"
//           }`}
//         >
//           <option value="">Select {label}</option>
//           {options.map((opt) => (
//             <option key={opt.value} value={opt.value}>
//               {opt.label}
//             </option>
//           ))}
//         </select>
//       </div>
//     </div>
//   );
// }

// // ─── Field Component ──────────────────────────────────────
// function Field({
//   label,
//   name,
//   value,
//   onChange,
//   disabled,
//   placeholder,
//   multiline = false,
//   rows = 1,
//   type = "text",
//   icon: Icon,
//   note,
// }) {
//   const commonProps = {
//     id: name,
//     name,
//     value: value || "",
//     onChange,
//     disabled,
//     placeholder,
//     className: `w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
//       disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"
//     }`,
//   };
//   return (
//     <div className="relative">
//       {Icon && (
//         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none top-6">
//           <Icon className="w-4 h-4 text-gray-400" />
//         </div>
//       )}
//       <label
//         htmlFor={name}
//         className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase"
//       >
//         {label}
//       </label>
//       <div className={Icon ? "pl-9" : ""}>
//         {multiline ? (
//           <textarea {...commonProps} rows={rows} />
//         ) : (
//           <input {...commonProps} type={type} />
//         )}
//       </div>
//       {note && <p className="mt-1 text-[10px] text-gray-400">{note}</p>}
//     </div>
//   );
// }
// pages/VendorProfile.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  LoaderCircle,
  AlertCircle,
  Edit2,
  Save,
  X,
  Power,
  PowerOff,
  Navigation,
  Camera,
  Store,
  Briefcase,
  Tag,
  FileText,
  CheckCircle,
  Upload,
  Utensils,
} from "lucide-react";
import {
  getVendorProfileApi,
  updateVendorProfileApi,
  updateVendorBusinessApi,
  updateVendorOnlineStatusApi,
  reverseGeocodeVendorApi,
  updateVendorAddressApi,
  updateVendorProfileImage,
} from "../../src/api/vendorApi";

// ─── Helper: Build full image URL ──────────────────────────
const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
    return imagePath;
  const baseUrl =
    import.meta.env?.VITE_STATIC_BASE ||
    "https://myfoodmitra-ecosystem.onrender.com";
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${path}`;
};

// ─── Helper: Convert address object to string (with fallbacks) ──
const formatAddressToString = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;

  // If the API returns a pre-formatted string, use it
  if (address.formatted_address) return address.formatted_address;
  if (address.display_name) return address.display_name;

  const { addressLine, landmark, city, state, pincode } = address;

  // If addressLine already contains a 6‑digit pincode, treat it as complete
  if (addressLine && /\b\d{6}\b/.test(addressLine)) {
    return addressLine;
  }

  // Otherwise, build from parts
  const parts = [addressLine, landmark, city, state, pincode].filter(Boolean);
  return parts.join(", ");
};

// ─── Toast System ──────────────────────────────────────────
const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed z-50 flex flex-col w-full max-w-sm gap-2 pointer-events-none top-4 right-4">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className={`pointer-events-auto rounded-xl p-4 shadow-lg border ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// ─── Options ──────────────────────────────────────────────
const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "dhaba", label: "Dhaba" },
  { value: "bakery", label: "Bakery" },
  { value: "cafe", label: "Cafe" },
  { value: "tiffin_center", label: "Tiffin Center" },
  { value: "sweet_shop", label: "Sweet Shop" },
  { value: "cloud_kitchen", label: "Cloud Kitchen" },
  { value: "fast_food", label: "Fast Food" },
  { value: "juice_center", label: "Juice Center" },
  { value: "other", label: "Other" },
];

const FOOD_TYPES = [
  { value: "pure_veg", label: "Pure Veg" },
  { value: "non_veg", label: "Non-Veg" },
  { value: "veg_non_veg", label: "Both" },
];

// ─── Main Component ──────────────────────────────────────
export default function VendorProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [formData, setFormData] = useState({
    ownerFirstName: "",
    ownerLastName: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    foodType: "veg_non_veg",
    address: "",
    gstNumber: "",
    panNumber: "",
    description: "",
    isOnline: false,
    latitude: null,
    longitude: null,
    profileImage: null,
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [onlineToggling, setOnlineToggling] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // ─── Toast helpers ──────────────────────────────────────
  const showToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };
  const removeToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ─── Fetch profile ──────────────────────────────────────
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getVendorProfileApi();
      const vendor = res?.data?.vendor || res?.vendor || res?.data || res;
      if (!vendor || typeof vendor !== "object")
        throw new Error("Invalid profile data");
      setProfile(vendor);
      setFormData({
        ownerFirstName: vendor.ownerFirstName || "",
        ownerLastName: vendor.ownerLastName || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        businessName: vendor.businessName || "",
        businessType: vendor.businessType || "",
        foodType: vendor.foodType || "veg_non_veg",
        address: formatAddressToString(vendor.address) || "",
        gstNumber: vendor.gstNumber || "",
        panNumber: vendor.panNumber || "",
        description: vendor.description || "",
        isOnline: vendor.isOnline || false,
        latitude: vendor.address?.location?.coordinates?.[1] || null,
        longitude: vendor.address?.location?.coordinates?.[0] || null,
        profileImage: vendor.profileImage || null,
      });
    } catch (error) {
      console.error(error);
      showToast(
        error.response?.data?.message || "Failed to load profile",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleOnline = async () => {
    try {
      setOnlineToggling(true);
      const newStatus = !formData.isOnline;
      await updateVendorOnlineStatusApi(newStatus);
      setFormData((prev) => ({ ...prev, isOnline: newStatus }));
      showToast(`You are now ${newStatus ? "online" : "offline"}`);
    } catch (error) {
      showToast("Failed to update online status", "error");
    } finally {
      setOnlineToggling(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateVendorProfileApi({
        ownerFirstName: formData.ownerFirstName,
        ownerLastName: formData.ownerLastName,
        phone: formData.phone,
      });
      await updateVendorBusinessApi({
        businessName: formData.businessName,
        businessType: formData.businessType,
        foodType: formData.foodType,
        description: formData.description,
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
      });
      await fetchProfile();
      setIsEditing(false);
      showToast("Profile updated successfully");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update profile",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) {
      showToast("No file selected", "error");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("Only JPG, PNG, and WEBP images are allowed", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be less than 5MB", "error");
      return;
    }

    try {
      setImageUploading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, profileImage: e.target.result }));
      };
      reader.readAsDataURL(file);

      const formDataToSend = new FormData();
      formDataToSend.append("profileImage", file);
      const response = await updateVendorProfileImage(formDataToSend);
      if (response.success) {
        await fetchProfile();
        showToast("Profile image updated successfully");
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      showToast(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload image",
        "error",
      );
      if (profile?.profileImage) {
        setFormData((prev) => ({
          ...prev,
          profileImage: profile.profileImage,
        }));
      }
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileInput = (e) => handleImageUpload(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    } else {
      showToast("Please drop an image file", "error");
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // ─── Get Current Location (UPDATED) ──────────────────────
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation not supported", "error");
      return;
    }
    setAddressLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await reverseGeocodeVendorApi(latitude, longitude);
          // Expecting either res.data.address or res.address to contain the address object
          const addressObj = res.data?.address || res.address || {};

          // Build a display string using the enhanced helper
          let addressString = formatAddressToString(addressObj);

          // If still empty, fallback to coordinates
          if (!addressString) {
            addressString = `📍 ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          }

          // Update local form state with the fetched address
          setFormData((prev) => ({
            ...prev,
            address: addressString,
            latitude,
            longitude,
          }));

          // Update backend with structured data (use fallback values if fields missing)
          await updateVendorAddressApi({
            addressLine: addressObj.addressLine || addressString,
            landmark: addressObj.landmark || "",
            city: addressObj.city || "",
            state: addressObj.state || "",
            pincode: addressObj.pincode || "",
            latitude,
            longitude,
          });

          showToast("Location updated successfully");
        } catch (error) {
          console.error(error);
          showToast("Failed to get address", "error");
        } finally {
          setAddressLoading(false);
        }
      },
      () => {
        showToast("Unable to get location. Please allow access.", "error");
        setAddressLoading(false);
      },
    );
  };

  const handleUpdateAddress = async () => {
    if (!formData.address?.trim()) {
      showToast("Address cannot be empty", "error");
      return;
    }
    try {
      setSaving(true);
      await updateVendorAddressApi({
        addressLine: formData.address.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
      });
      showToast("Address updated");
      await fetchProfile(); // refresh to get updated coords
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to update address",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const getImageUrl = () => {
    if (formData.profileImage) {
      if (formData.profileImage.startsWith("data:image"))
        return formData.profileImage;
      return buildImageUrl(formData.profileImage);
    }
    return null;
  };

  const imageUrl = getImageUrl();

  // ─── Loading Skeleton ──────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl px-4 py-8 mx-auto space-y-8">
        <div className="h-40 rounded-3xl bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse" />
        <div className="p-8 space-y-8 bg-white border border-gray-200 rounded-2xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="bg-gray-200 rounded-full w-28 h-28 animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="w-40 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className="h-12 bg-gray-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-16 h-16 text-gray-300" />
        <p className="mt-4 text-lg text-gray-500">No profile data available.</p>
        <button
          onClick={fetchProfile}
          className="px-6 py-2 mt-4 text-sm font-bold text-white transition-colors bg-orange-500 rounded-xl hover:bg-orange-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl px-4 py-8 mx-auto space-y-8">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ─── Header ──────────────────────────────────────── */}
      <div className="relative overflow-hidden shadow-xl rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-10">
          <div className="space-y-1">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-black text-white sm:text-4xl"
            >
              Vendor Profile
            </motion.h1>
            <p className="text-sm text-white/80">
              Manage your account and business details
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleOnline}
              disabled={onlineToggling}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-xl shadow-lg ${
                formData.isOnline
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              } disabled:opacity-50`}
            >
              {onlineToggling ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : formData.isOnline ? (
                <>
                  <Power className="w-4 h-4" /> Online
                </>
              ) : (
                <>
                  <PowerOff className="w-4 h-4" /> Offline
                </>
              )}
            </motion.button>
            {!isEditing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-orange-600 transition-all bg-white shadow-lg rounded-xl hover:bg-orange-50 hover:shadow-xl"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </motion.button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    if (profile) {
                      setFormData({
                        ownerFirstName: profile.ownerFirstName || "",
                        ownerLastName: profile.ownerLastName || "",
                        email: profile.email || "",
                        phone: profile.phone || "",
                        businessName: profile.businessName || "",
                        businessType: profile.businessType || "",
                        foodType: profile.foodType || "veg_non_veg",
                        address: formatAddressToString(profile.address) || "",
                        gstNumber: profile.gstNumber || "",
                        panNumber: profile.panNumber || "",
                        description: profile.description || "",
                        isOnline: profile.isOnline || false,
                        latitude:
                          profile.address?.location?.coordinates?.[1] || null,
                        longitude:
                          profile.address?.location?.coordinates?.[0] || null,
                        profileImage: profile.profileImage || null,
                      });
                    }
                  }}
                  className="px-4 py-2 text-sm font-bold text-gray-700 transition-colors bg-white border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white transition-all bg-orange-500 shadow-lg rounded-xl hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Main Card ────────────────────────────────────── */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-3xl">
        <div className="p-6 space-y-10 sm:p-10">
          {/* Profile Image & Basic Info */}
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            <div
              className={`relative group ${isDragging ? "ring-4 ring-orange-400" : ""}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="w-32 h-32 overflow-hidden border-4 border-orange-100 rounded-full shadow-xl">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-orange-200 to-orange-400">
                    <User className="text-white w-14 h-14" />
                  </div>
                )}
              </div>
              {isEditing && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUploading}
                    className="absolute bottom-0 right-0 p-2.5 text-white transition-all bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    {imageUploading ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </>
              )}
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-orange-500/70 backdrop-blur-sm">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-900">
                {`${formData.ownerFirstName || ""} ${formData.ownerLastName || ""}`.trim() ||
                  "Vendor Name"}
              </h2>
              <p className="text-gray-500">{formData.email}</p>
              <div className="flex items-center justify-center gap-4 mt-2 sm:justify-start">
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${formData.isOnline ? "text-green-600" : "text-gray-500"}`}
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${formData.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                  />
                  {formData.isOnline ? "Online" : "Offline"}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">
                  {formData.businessType || "Business"}
                </span>
              </div>
            </div>
          </div>

          {/* ─── Personal Information ────────────────────── */}
          <Section icon={User} title="Personal Information">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="First Name"
                name="ownerFirstName"
                value={formData.ownerFirstName}
                onChange={handleChange}
                disabled={!isEditing}
                icon={User}
              />
              <Field
                label="Last Name"
                name="ownerLastName"
                value={formData.ownerLastName}
                onChange={handleChange}
                disabled={!isEditing}
                icon={User}
              />
              <Field
                label="Email"
                name="email"
                value={formData.email}
                disabled
                icon={Mail}
                note="Contact admin to change email"
              />
              <Field
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                icon={Phone}
              />
            </div>
          </Section>

          {/* ─── Business Information ────────────────────── */}
          <Section icon={Building2} title="Business Information">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                disabled={!isEditing}
                icon={Store}
              />
              <SelectField
                label="Business Type"
                name="businessType"
                value={formData.businessType}
                options={BUSINESS_TYPES}
                onChange={handleSelectChange}
                disabled={!isEditing}
                icon={Briefcase}
              />
              <SelectField
                label="Food Type"
                name="foodType"
                value={formData.foodType}
                options={FOOD_TYPES}
                onChange={handleSelectChange}
                disabled={!isEditing}
                icon={Utensils}
              />
              <Field
                label="GST Number"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                disabled={!isEditing}
                icon={Tag}
              />
              <Field
                label="PAN Number"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                disabled={!isEditing}
                icon={FileText}
              />
            </div>
            <div className="mt-5">
              <Field
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isEditing}
                multiline
                rows={3}
                placeholder="Tell customers about your business..."
                icon={FileText}
              />
            </div>
          </Section>

          {/* ─── Location & Address ───────────────────────── */}
          <Section icon={MapPin} title="Location & Address">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Field
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    multiline
                    rows={2}
                    placeholder="Street, city, state, pincode"
                    icon={MapPin}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleGetCurrentLocation}
                    disabled={addressLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 transition-colors bg-blue-50 rounded-xl hover:bg-blue-100 disabled:opacity-50"
                  >
                    {addressLoading ? (
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                    Get Location
                  </button>
                  {isEditing && (
                    <button
                      onClick={handleUpdateAddress}
                      disabled={saving || !formData.address?.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition-colors bg-orange-500 rounded-xl hover:bg-orange-600 disabled:opacity-50"
                    >
                      {saving ? (
                        <LoaderCircle className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Update
                    </button>
                  )}
                </div>
              </div>
              {formData.latitude && formData.longitude ? (
                <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 rounded-xl">
                  📍 {formData.latitude.toFixed(6)},{" "}
                  {formData.longitude.toFixed(6)}
                </div>
              ) : (
                <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50 rounded-xl">
                  📍 No coordinates available
                </div>
              )}
            </div>
          </Section>

          {/* ─── Status & Stats ──────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="p-4 border border-green-100 rounded-xl bg-green-50">
              <p className="text-sm font-medium text-green-700">
                Online Status
              </p>
              <p className="text-lg font-bold text-green-900">
                {formData.isOnline ? "🟢 Online" : "🔴 Offline"}
              </p>
            </div>
            <div className="p-4 border border-blue-100 rounded-xl bg-blue-50">
              <p className="text-sm font-medium text-blue-700">Rating</p>
              <p className="text-lg font-bold text-blue-900">
                ⭐ {profile.rating || 0} / 5
              </p>
            </div>
            <div className="p-4 border border-purple-100 rounded-xl bg-purple-50">
              <p className="text-sm font-medium text-purple-700">
                Total Orders
              </p>
              <p className="text-lg font-bold text-purple-900">
                {profile.totalOrders || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section Component ────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ─── Select Field ──────────────────────────────────────────
function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  disabled,
  icon: Icon,
}) {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none top-6">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <label
        htmlFor={name}
        className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase"
      >
        {label}
      </label>
      <div className={Icon ? "pl-9" : ""}>
        <select
          id={name}
          name={name}
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          disabled={disabled}
          className={`w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 appearance-none ${
            disabled
              ? "bg-gray-50 text-gray-500 cursor-not-allowed"
              : "bg-white"
          }`}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ─── Field Component ──────────────────────────────────────
function Field({
  label,
  name,
  value,
  onChange,
  disabled,
  placeholder,
  multiline = false,
  rows = 1,
  type = "text",
  icon: Icon,
  note,
}) {
  const commonProps = {
    id: name,
    name,
    value: value || "",
    onChange,
    disabled,
    placeholder,
    className: `w-full rounded-xl border border-gray-200 py-2.5 px-4 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 ${
      disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"
    }`,
  };
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none top-6">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <label
        htmlFor={name}
        className="block mb-1 text-xs font-bold tracking-wider text-gray-400 uppercase"
      >
        {label}
      </label>
      <div className={Icon ? "pl-9" : ""}>
        {multiline ? (
          <textarea {...commonProps} rows={rows} />
        ) : (
          <input {...commonProps} type={type} />
        )}
      </div>
      {note && <p className="mt-1 text-[10px] text-gray-400">{note}</p>}
    </div>
  );
}
