import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createWasteReport } from '../../firebase/firestore';
import { uploadReportPhoto } from '../../firebase/storage';
import { WASTE_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function ReportWastePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Photo
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Location
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);

  // Classification
  const [wasteType, setWasteType] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) return toast.error('File too large. Maximum 25MB.');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handlePhotoDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please drop an image file.');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation is not supported by your browser.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        // Try reverse geocoding
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          if (apiKey) {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${apiKey}`
            );
            const data = await response.json();
            if (data.results?.[0]) {
              setAddress(data.results[0].formatted_address);
            }
          }
        } catch (err) {
          console.error('Geocoding error:', err);
        }
        setLocating(false);
        toast.success('Location detected!');
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get your location. Please enter it manually.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    if (!photoFile) return toast.error('Please upload a photo.');
    if (!latitude || !longitude) return toast.error('Please provide a location.');
    if (!wasteType) return toast.error('Please select a waste type.');

    setLoading(true);
    try {
      // Generate a temporary report ID for storage path
      const tempId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

      // Upload photo
      const { photoUrl, photoPath } = await uploadReportPhoto(
        currentUser.uid, tempId, photoFile,
        (progress) => setUploadProgress(progress)
      );

      // Create report
      const reportId = await createWasteReport({
        userId: currentUser.uid,
        userName: currentUser.displayName || '',
        userEmail: currentUser.email || '',
        photoUrl,
        photoPath,
        latitude,
        longitude,
        address: address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        wasteType,
        priority,
        description,
      });

      toast.success('Report submitted successfully!');
      navigate(`/report/${reportId}`);
    } catch (error) {
      console.error('Report submission error:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin py-space-lg">
      {/* Page Header */}
      <div className="mb-space-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high text-primary mb-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Incident Report Portal</span>
        </div>
        <h1 className="text-headline-lg text-on-surface">Report Uncollected Waste</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Submit a geo-tagged waste incident for municipal triage and fleet dispatch.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-space-sm mb-space-xl">
        {[
          { num: 1, label: 'Visual Verification' },
          { num: 2, label: 'Spatial Verification' },
          { num: 3, label: 'Classification' },
        ].map((s) => (
          <button key={s.num} onClick={() => setStep(s.num)}
            className={`flex-1 flex items-center gap-2 px-space-sm py-space-sm rounded-xl transition-all ${
              step === s.num ? 'bg-primary-container text-on-primary-container shadow-sm' : step > s.num ? 'bg-surface-container-low text-primary' : 'bg-surface-container text-on-surface-variant'
            }`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-label-md font-bold ${
              step === s.num ? 'bg-primary text-on-primary' : step > s.num ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {step > s.num ? <span className="material-symbols-outlined text-[16px]">check</span> : s.num}
            </span>
            <span className="text-label-md hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step 1: Photo */}
      {step === 1 && (
        <div className="bg-surface-container-lowest rounded-2xl shadow-surface-1 border border-outline-variant/20 p-space-lg">
          <div className="flex items-center gap-space-sm mb-space-md">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-primary">photo_camera</span>
            </div>
            <div>
              <h2 className="text-headline-sm text-on-surface">Visual Verification</h2>
              <p className="text-body-sm text-on-surface-variant">Upload a clear photograph of the waste incident</p>
            </div>
          </div>

          {!photoPreview ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handlePhotoDrop}
              className="border-2 border-dashed border-outline-variant rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary-fixed/5 transition-all"
              onClick={() => document.getElementById('photo-input').click()}
            >
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-2">cloud_upload</span>
              <p className="text-body-md text-on-surface mb-1">Drag & drop or click to upload</p>
              <p className="text-body-sm text-on-surface-variant">PNG, JPG, WebP • Max 25MB</p>
              <input id="photo-input" type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden">
              <img src={photoPreview} alt="Preview" className="w-full max-h-80 object-cover rounded-xl" />
              <button onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-on-surface/60 text-surface flex items-center justify-center hover:bg-on-surface/80 transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          <div className="flex justify-end mt-space-md">
            <button onClick={() => { if (photoFile) setStep(2); else toast.error('Upload a photo first.'); }}
              className="inline-flex items-center gap-2 h-11 px-space-lg rounded-lg bg-primary text-on-primary text-label-lg hover:opacity-90 transition-all">
              Next: Location <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="bg-surface-container-lowest rounded-2xl shadow-surface-1 border border-outline-variant/20 p-space-lg">
          <div className="flex items-center gap-space-sm mb-space-md">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-secondary">location_on</span>
            </div>
            <div>
              <h2 className="text-headline-sm text-on-surface">Spatial Verification</h2>
              <p className="text-body-sm text-on-surface-variant">Pin the exact location of the waste incident</p>
            </div>
          </div>

          <button onClick={getCurrentLocation} disabled={locating}
            className="w-full h-12 rounded-xl bg-surface-container border border-outline-variant/50 text-label-lg text-on-surface flex items-center justify-center gap-2 hover:bg-surface-container-high transition-all mb-space-md disabled:opacity-50">
            {locating ? (
              <><div className="w-5 h-5 border-2 border-on-surface-variant/30 border-t-primary rounded-full animate-spin" /> Detecting Location...</>
            ) : (
              <><span className="material-symbols-outlined text-[20px] text-primary">my_location</span> Use My Current Location</>
            )}
          </button>

          {latitude && longitude && (
            <div className="p-space-md rounded-xl bg-status-success-bg border border-status-success-border mb-space-md">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[18px] text-status-success">check_circle</span>
                <span className="text-label-md text-status-success">Location Detected</span>
              </div>
              <p className="text-body-sm text-on-surface">{address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`}</p>
              <p className="text-code-sm text-on-surface-variant mt-1">Lat: {latitude.toFixed(6)} • Lng: {longitude.toFixed(6)}</p>
            </div>
          )}

          <div>
            <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5">Or Enter Address Manually</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street, City, State"
              className="w-full h-11 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all" />
          </div>

          <div className="flex justify-between mt-space-md">
            <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 h-11 px-space-md rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
            </button>
            <button onClick={() => { if (latitude && longitude) setStep(3); else toast.error('Please provide a location.'); }}
              className="inline-flex items-center gap-2 h-11 px-space-lg rounded-lg bg-primary text-on-primary text-label-lg hover:opacity-90 transition-all">
              Next: Classify <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Classification */}
      {step === 3 && (
        <div className="bg-surface-container-lowest rounded-2xl shadow-surface-1 border border-outline-variant/20 p-space-lg">
          <div className="flex items-center gap-space-sm mb-space-md">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-tertiary">category</span>
            </div>
            <div>
              <h2 className="text-headline-sm text-on-surface">Waste Classification & Notes</h2>
              <p className="text-body-sm text-on-surface-variant">Select the type of waste and add any additional details</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm mb-space-lg">
            {WASTE_TYPES.map((type) => (
              <button key={type.id} onClick={() => setWasteType(type.id)}
                className={`p-space-sm rounded-xl border-2 text-left transition-all ${
                  wasteType === type.id
                    ? 'border-primary bg-primary-fixed/20 shadow-sm'
                    : 'border-outline-variant/30 bg-surface-container-lowest hover:border-outline-variant hover:bg-surface-container-low'
                }`}>
                <span className={`material-symbols-outlined text-[24px] mb-1 ${wasteType === type.id ? 'text-primary' : 'text-on-surface-variant'}`}>{type.icon}</span>
                <p className={`text-label-md ${wasteType === type.id ? 'text-primary' : 'text-on-surface'}`}>{type.label}</p>
                <p className="text-code-sm text-on-surface-variant">{type.sublabel}</p>
              </button>
            ))}
          </div>

          {/* Priority */}
          <div className="mb-space-md">
            <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-2">Priority Level</label>
            <div className="flex gap-space-sm flex-wrap">
              {[
                { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                { value: 'medium', label: 'Standard', color: 'bg-status-info-bg text-sky-700 border-status-info-border' },
                { value: 'high', label: 'Urgent', color: 'bg-status-warning-bg text-amber-700 border-status-warning-border' },
                { value: 'critical', label: 'Critical', color: 'bg-status-danger-bg text-rose-700 border-status-danger-border' },
              ].map((p) => (
                <button key={p.value} onClick={() => setPriority(p.value)}
                  className={`px-4 py-2 rounded-lg border text-label-md transition-all ${
                    priority === p.value ? `${p.color} border-2 shadow-sm` : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-space-md">
            <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5">Field Notes (Optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the waste situation, any hazards, access issues..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest border border-outline-variant/50 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none" />
          </div>

          {/* Upload progress */}
          {loading && uploadProgress > 0 && (
            <div className="mb-space-md">
              <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
                <span>Uploading photo...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-container">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-space-md">
            <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 h-11 px-space-md rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="inline-flex items-center gap-2 h-12 px-space-xl rounded-lg bg-primary text-on-primary text-label-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> : (
                <><span className="material-symbols-outlined text-[20px]">send</span> Submit Report</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
