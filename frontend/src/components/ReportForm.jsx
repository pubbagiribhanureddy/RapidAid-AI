import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Upload, 
  MapPin, 
  Navigation, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Loader2, 
  ArrowRight,
  ShieldAlert,
  Phone,
  User,
  Globe
} from 'lucide-react';
import { submitReport } from '../services/api.js';

export default function ReportForm({ onReportSubmitted }) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Auto-detect');
  const [language, setLanguage] = useState('en'); // 'en' | 'te'
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  
  // Location state
  const [locationName, setLocationName] = useState('Cyber Towers, Hitec City, Hyderabad');
  const [latitude, setLatitude] = useState(17.4485);
  const [longitude, setLongitude] = useState(78.3742);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessData, setSubmitSuccessData] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Sample quick scenarios for fast demo testing
  const demoScenarios = [
    {
      label: 'Accident at Cyber Towers',
      text: 'Major multi-vehicle collision near Cyber Towers flyover ramp. Two cars smashed, diesel leaking from delivery truck. People trapped inside sedan.',
      cat: 'Road Accident',
      loc: 'Cyber Towers Junction, Hitec City, Hyderabad',
      lat: 17.4485,
      lng: 78.3742
    },
    {
      label: 'Begumpet Flooding',
      text: 'Water level reached 3.5 feet under Begumpet railway bridge. Autos stalled and water entering nearby basements. People stranded on road divider.',
      cat: 'Flood',
      loc: 'Begumpet Railway Bridge Underpass, Hyderabad',
      lat: 17.4447,
      lng: 78.4664
    },
    {
      label: 'Telugu: భవనం మంటలు (Building Fire)',
      text: 'బంజారా హిల్స్ రోడ్ నెంబర్ 12 లో 4వ అంతస్తులో భారీ మంటలు చెలరేగాయి. నల్లటి పొగ వస్తోంది, 20 మందికి పైగా పై అంతస్తులో చిక్కుకున్నారు. వెంటనే ఫైర్ ఇంజిన్ పంపండి.',
      cat: 'Fire',
      lang: 'te',
      loc: 'Road No. 12, Banjara Hills, Hyderabad',
      lat: 17.4156,
      lng: 78.4350
    }
  ];

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }
  }, [language]);

  const toggleVoiceRecording = () => {
    if (!voiceSupported) {
      alert('Speech recognition is not supported in this browser. Please type your emergency description.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'te' ? 'te-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsRecording(false);
      }
    }
  };

  // Browser Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        // Reverse geocoding using OpenStreetMap Nominatim
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          if (res.ok) {
            const data = await res.json();
            setLocationName(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          } else {
            setLocationName(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          }
        } catch {
          setLocationName(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError(`Location request failed: ${err.message}. Using Hyderabad default.`);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Image Upload handlers
  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setValidationError('Please provide a description of the emergency.');
      return;
    }
    setValidationError('');
    setIsSubmitting(true);

    try {
      const reportPayload = {
        description: description.trim(),
        category,
        language,
        latitude,
        longitude,
        location_name: locationName,
        reporter_name: reporterName.trim() || undefined,
        phone: reporterPhone.trim() || undefined,
        image_preview: imagePreview || undefined,
        submitted_at: new Date().toISOString()
      };

      const result = await submitReport(reportPayload);
      setSubmitSuccessData(result);
      if (onReportSubmitted) {
        onReportSubmitted(result);
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setValidationError('Failed to submit emergency report. Please try again or dial 112 directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setCategory('Auto-detect');
    setReporterName('');
    setReporterPhone('');
    setImageFile(null);
    setImagePreview(null);
    setSubmitSuccessData(null);
    setValidationError('');
  };

  return (
    <div className="relative">
      {/* Success Modal Popup */}
      {submitSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Emergency Dispatched & Logged</h3>
                <p className="text-xs text-slate-500 font-mono">Report ID: {submitSuccessData.report_id}</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Incident Triage:</span>
                <span className="text-xs font-bold font-mono text-red-600 bg-red-100 px-2 py-0.5 rounded">
                  {submitSuccessData.incident_id}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-red-600" />
                  AI Real-Time Assessment
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  {submitSuccessData.ai_summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500">Urgency Severity:</span>
                <span className="font-bold uppercase tracking-wider text-red-700">
                  {submitSuccessData.severity} ({submitSuccessData.priority_score}/100)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-5 text-center">
              Emergency responders in Hyderabad have been automatically alerted. Keep your phone line reachable.
            </p>

            <div className="flex gap-3">
              <button
                onClick={resetForm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Submit Another Report
              </button>
              <a
                href="/map"
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Track on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Report Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚨</span>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  Instant Emergency Report
                </h2>
              </div>
              <p className="text-xs md:text-sm text-red-100 font-medium mt-1">
                AI extracts location, urgency, and correlated hazards in milliseconds
              </p>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-red-800/80 rounded-xl p-1 border border-red-400/40">
              <Globe className="w-3.5 h-3.5 text-red-200 ml-2 mr-1" />
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'en' ? 'bg-white text-red-700 shadow-xs' : 'text-red-100 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('te')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === 'te' ? 'bg-white text-red-700 shadow-xs' : 'text-red-100 hover:text-white'
                }`}
              >
                తెలుగు (Telugu)
              </button>
            </div>
          </div>

          {/* Quick Demo Scenario Chips */}
          <div className="mt-4 pt-3 border-t border-red-500/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-200 block mb-2">
              ⚡ Quick Demo Templates (Click to Auto-fill):
            </span>
            <div className="flex flex-wrap gap-2">
              {demoScenarios.map((sc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDescription(sc.text);
                    setCategory(sc.cat);
                    setLocationName(sc.loc);
                    setLatitude(sc.lat);
                    setLongitude(sc.lng);
                    if (sc.lang) setLanguage(sc.lang);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium border border-white/20 transition-all text-left"
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-7 space-y-6">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Emergency Description & Voice Button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>Emergency Description</span>
                <span className="text-red-600">*</span>
              </label>

              {/* Voice Speech-to-Text Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={isRecording ? 'Click to stop recording' : 'Click to speak emergency report'}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-red-600" />}
                <span>{isRecording ? 'Listening...' : language === 'te' ? 'మాట్లాడండి (Voice)' : 'Voice Input'}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  language === 'te'
                    ? 'ఉదాహరణ: సైబర్ టవర్స్ దగ్గర పెద్ద యాక్సిడెంట్ అయింది. కారులో ఇద్దరు ఇరుక్కుపోయారు. వెంటనే అంబులెన్స్ పంపండి...'
                    : 'Describe what happened, injuries, trapped persons, fire, or immediate hazards (e.g., "3 cars collided at Cyber Towers flyover, fuel leak, 2 passengers unconscious")...'
                }
                className="w-full text-sm p-4 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 leading-relaxed placeholder:text-slate-400 bg-slate-50/50"
                required
              />
            </div>
          </div>

          {/* Category Dropdown & Incident Type Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Emergency Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Auto-detect">✨ Auto-detect with Gemini AI</option>
                <option value="Road Accident">🚗 Road Accident (Collision/Rollover)</option>
                <option value="Flood">🌊 Flood / Severe Waterlogging</option>
                <option value="Fire">🔥 Fire / Explosions / Smoke</option>
                <option value="Building Collapse">🏢 Building / Structural Collapse</option>
                <option value="Medical Emergency">🩺 Medical Emergency / Trauma</option>
                <option value="Gas Leak">💨 Hazardous Gas Leak / Spill</option>
                <option value="Power Outage">⚡ Power Outage / Transformer Fire</option>
                <option value="Other">⚠️ Other Urgent Hazard</option>
              </select>
            </div>

            {/* Reporter Contact Info */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Reporter Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 98765 43210 (For updates)"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Emergency Location & Geotag</span>
              </label>

              {/* Geolocation Button */}
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-red-500 hover:text-red-600 text-xs font-semibold shadow-2xs transition-colors"
              >
                {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" /> : <Navigation className="w-3.5 h-3.5 text-blue-600" />}
                <span>{isLocating ? 'Acquiring GPS...' : 'Use My GPS Location'}</span>
              </button>
            </div>

            {locationError && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                {locationError}
              </p>
            )}

            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Near Cyber Towers Signal, Hitec City, Hyderabad"
              className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />

            <div className="flex items-center gap-4 text-xs font-mono text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
              <span>Latitude: <strong>{latitude.toFixed(5)}</strong></span>
              <span>Longitude: <strong>{longitude.toFixed(5)}</strong></span>
            </div>
          </div>

          {/* Photo / Scene Evidence Drag & Drop Upload */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Photo / Scene Evidence (Optional)
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 max-h-56 bg-slate-900 flex items-center justify-center">
                <img src={imagePreview} alt="Evidence preview" className="max-h-56 object-contain" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
                  isDragging ? 'border-red-500 bg-red-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/30'
                }`}
                onClick={() => document.getElementById('photo-upload-input').click()}
              >
                <input
                  id="photo-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && handleImageChange(e.target.files[0])}
                />
                <Upload className="w-7 h-7 mx-auto mb-2 text-slate-400" />
                <p className="text-xs font-semibold text-slate-700">
                  Click to upload scene photo or drag & drop here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  JPEG, PNG, WebP up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Submit Emergency Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>RapidAid AI Correlating & Dispatched...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5" />
                  <span>TRANSMIT EMERGENCY REPORT NOW</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              For immediate life threats, call <strong>112</strong> immediately. RapidAid AI is directly monitored by central dispatch.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
