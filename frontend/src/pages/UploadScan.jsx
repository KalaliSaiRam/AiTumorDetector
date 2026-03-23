import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { UploadCloud, Image as ImageIcon, Activity, Eye, EyeOff, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadScan() {
  const [searchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patient') || '';

  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState(initialPatientId);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const [scanData, setScanData] = useState(null); // { scanId, imageUrl }
  
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Fetch patients to populate dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/patients');
        setPatients(res.data.data.patients);
      } catch (err) {
        console.error("Failed to load patients", err);
      }
    };
    fetchPatients();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setScanData(null);
      setPrediction(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !patientId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('patientId', patientId);

    try {
      const res = await api.post('/scans/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setScanData(res.data.data); // has scanId, imageUrl
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handlePredict = async () => {
    if (!scanData?.scanId) return;
    setPredicting(true);

    try {
      const res = await api.post(`/scans/${scanData.scanId}/predict`);
      setPrediction(res.data.data.prediction);
    } catch (err) {
      alert(err.response?.data?.message || 'Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Upload & Predict</h1>
        <p className="text-slate-400 mt-1">Upload an MRI scan to the secure Cloudinary vault and run neuro-analysis.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-6 flex flex-col"
        >
          <form onSubmit={handleUpload} className="flex-1 flex flex-col">
            <div className="mb-6 space-y-2">
              <label className="text-sm font-medium text-slate-300">Select Patient</label>
              <select
                required
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className="w-full glass-input bg-slate-900 border-white/10 text-slate-300 appearance-none"
              >
                <option value="" disabled>-- Choose a patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Age: {p.age})</option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl bg-white/5 relative overflow-hidden group hover:border-primary-500/50 transition-colors min-h-[300px]">
              {preview ? (
                <img src={preview} alt="MRI Preview" className="absolute inset-0 w-full h-full object-cover p-2 opacity-50 blur-sm group-hover:blur-md transition-all" />
              ) : null}
              
              <div className="relative z-10 flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-400 mb-4 backdrop-blur-md">
                  {preview ? <ImageIcon size={32} /> : <UploadCloud size={32} />}
                </div>
                <p className="text-white font-medium text-lg">
                  {preview ? file.name : "Drag & drop MRI Scan"}
                </p>
                <p className="text-slate-400 text-sm mt-1 max-w-[200px]">
                  {preview ? "Click to change file" : "JPG, PNG formats supported up to 10MB"}
                </p>
              </div>

              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !file || scanData}
              className={`w-full mt-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                scanData 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'glass-button'
              } ${(!file || uploading) && !scanData ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : scanData ? (
                <><CheckCircle2 size={20} /> Uploaded to Secure Vault</>
              ) : (
                <><UploadCloud size={20} /> Upload Scan Segment</>
              )}
            </button>
          </form>
        </motion.div>

        {/* Prediction Panel */}
        <AnimatePresence>
          {scanData && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass-panel p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <BrainCircuit className="text-purple-400" size={24} />
                    Pending Doctor Analysis
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">Image segmented and routed to the assigned specialist</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-emerald-400 font-medium text-lg">Scan Securely Archived</p>
                <p className="text-slate-400 mt-2 max-w-[250px] mx-auto text-sm leading-relaxed">
                  The MRI data has been stored. The assigned Doctor will run the Neural TriModel analysis securely from their portal.
                </p>
              </div>

              {predicting && (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <Activity size={48} className="text-purple-500 animate-pulse mb-4" />
                  <p className="text-purple-400 font-medium">Computing neural pathways... this may take a moment.</p>
                </div>
              )}

              {prediction && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
                  {/* Results Cards */}
                  
                  {(() => {
                    const type = prediction.predictedClass.toLowerCase();
                    const isClear = type.includes('no_tumor');
                    const colorClass = isClear ? 'text-emerald-400' : 'text-rose-400';
                    const bgClass = isClear ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';
                    
                    const definitions = {
                      pituitary: "A tumor that occurs in the pituitary gland. Changes in vision or headaches are common indicators.",
                      glioma: "A type of tumor that occurs in the brain and spinal cord, beginning in the gluey supportive cells.",
                      meningioma: "A tumor that arises from the meninges — the membranes that surround your brain and spinal cord.",
                      no_tumor: "No visible signs of abnormal tumor formations detected in this specific scan segment."
                    };
                    
                    return (
                      <div className="flex flex-col gap-4">
                        <div className={`border rounded-xl p-5 ${bgClass}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-slate-300 mb-1">Primary AI Diagnosis</p>
                              <p className={`text-3xl font-bold uppercase tracking-wide ${colorClass}`}>
                                {prediction.predictedClass.replace('_', ' ')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-300 mb-1">Confidence Score</p>
                              <p className="text-3xl font-bold text-white">
                                {(prediction.confidence * 100).toFixed(2)}%
                              </p>
                            </div>
                          </div>
                          <p className="mt-4 text-slate-300 text-sm leading-relaxed border-t border-white/10 pt-4">
                            {definitions[type] || "Atypical formation detected. Recommend further specialist review."}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Heatmap Toggle & Display */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-slate-300">Grad-CAM Spatial Heatmap Focus</p>
                      <button 
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-primary-400 hover:text-white hover:bg-white/10 transition-colors font-medium shadow-sm"
                      >
                        {showHeatmap ? <><EyeOff size={14} /> Compare Original</> : <><Eye size={14} /> Reveal Heatmap</>}
                      </button>
                    </div>
                    <div className="rounded-xl overflow-hidden border-2 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative bg-slate-900 flex justify-center w-full">
                      <img 
                        src={showHeatmap ? prediction.heatmapUrl : scanData.imageUrl} 
                        alt="Brain Scan" 
                        className="w-full object-contain max-h-[450px]"
                      />
                    </div>
                  </div>

                  {/* SEC Top Predictions */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <p className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                      <Activity size={18} className="text-primary-400" />
                      Differential Probabilities (SEC)
                    </p>
                    <div className="space-y-3">
                      {prediction.topPredictions.map((pred, idx) => (
                        <div key={idx} className="relative">
                          <div className="flex items-center justify-between text-sm mb-1 z-10 relative">
                            <span className="text-slate-200 capitalize font-medium">{pred.class.replace('_', ' ')}</span>
                            <span className="text-primary-300 font-mono">{(pred.confidence * 100).toFixed(2)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${pred.confidence * 100}%` }}
                              transition={{ duration: 1, delay: idx * 0.1 }}
                              className="h-full bg-primary-500 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
