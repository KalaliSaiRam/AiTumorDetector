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
      if (!selected.type.startsWith('image/')) {
        alert("Alert: Invalid format. Please upload a valid medical MRI scan image (JPEG, PNG).");
        return;
      }
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

  // Shared DICOM Overlays for the clinical viewer
  const DicomOverlayTopLeft = () => (
    <div className="absolute top-4 left-4 text-[10px] font-mono text-white/80 leading-tight z-20 select-none pointer-events-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
      <p className="font-bold text-primary-400 mb-0.5 uppercase drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]">SUBJECT ID</p>
      <p className="text-white drop-shadow-md">PTR-{patientId.slice(0, 8).toUpperCase()}</p>
    </div>
  );

  const DicomOverlayTopRight = () => (
    <div className="absolute top-4 right-4 text-[10px] font-mono text-white/80 leading-tight text-right z-20 select-none pointer-events-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
      <p className="font-bold text-slate-300 drop-shadow-md">CLINICAL WORKSTATION</p>
      <p className="text-white drop-shadow-md">DATE: {new Date().toISOString().split('T')[0]}</p>
    </div>
  );

  const DicomOverlayBottomLeft = () => (
    <div className="absolute bottom-4 left-4 text-[10px] font-mono text-white/80 leading-tight z-20 select-none pointer-events-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
      <p>THK: 5.0 mm</p>
      <p>LOC: -14.50</p>
    </div>
  );

  const DicomOverlayBottomRight = () => (
    <div className="absolute bottom-4 right-4 text-[10px] font-mono text-white/80 leading-tight text-right z-20 select-none pointer-events-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
      <p>W: 240 / L: 110</p>
      <p>MTX: 512 x 512</p>
    </div>
  );

  return (
    <div className="p-3 md:p-8 max-w-7xl mx-auto flex flex-col h-full overflow-x-hidden w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-10 px-1 md:pl-2">
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2 md:gap-3 drop-shadow-lg leading-tight">
          <BrainCircuit className="text-primary-400 shrink-0" size={32} /> AI Tumor Detection
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-lg">Deposit raw MRI data into the central vault for Neural TriModel neuro-analysis.</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 items-start w-full">
        {/* Upload Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-4 md:p-8 border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col min-h-[400px] md:min-h-[500px]"
        >
          <form onSubmit={handleUpload} className="flex-1 flex flex-col h-full w-full">
            <div className="mb-8 space-y-2 relative z-20">
              <label className="text-xs font-bold tracking-widest uppercase text-slate-400">Target Patient Profile</label>
              <select
                required
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className="w-full glass-input bg-[#0a0f16] border-white/10 text-white font-medium appearance-none shadow-inner rounded-xl h-12 px-4 focus:border-primary-500/50 outline-none transition-colors"
              >
                <option value="" disabled>-- Select Record --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Age: {p.age})</option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-[#06090e] relative overflow-hidden group hover:border-primary-500/40 transition-all min-h-[300px] shadow-inner mb-6">
              {preview ? (
                <img src={preview} alt="MRI Preview" className="absolute inset-0 w-full h-full object-cover p-2 opacity-30 blur-[2px] group-hover:blur-sm transition-all" />
              ) : null}

              <div className="relative z-10 flex flex-col items-center p-6 text-center">
                <div className="w-20 h-20 bg-primary-500/10 border border-primary-500/20 rounded-full flex items-center justify-center text-primary-400 mb-6 backdrop-blur-md shadow-[0_0_30px_rgba(59,130,246,0.15)] group-hover:scale-110 transition-transform">
                  {preview ? <ImageIcon size={36} /> : <UploadCloud size={36} />}
                </div>
                <p className="text-white font-black text-xl tracking-wide drop-shadow-md pb-2">
                  {preview ? file.name : "Secure Data Transfer"}
                </p>
                <p className="text-slate-400 text-sm max-w-[250px] font-medium leading-relaxed">
                  {preview ? "Ready for archival and processing." : "Drag & drop raw clinical MRI segments (JPG/PNG)."}
                </p>
              </div>

              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !file || scanData}
              className={`w-full py-5 rounded-2xl font-black text-lg tracking-wide flex items-center justify-center gap-3 transition-all shadow-xl ${scanData
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                : 'bg-primary-600 hover:bg-primary-500 text-white border border-primary-400'
                } ${(!file || uploading) && !scanData ? 'opacity-50 cursor-not-allowed bg-slate-800 border-transparent text-slate-500' : ''}`}
            >
              {uploading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Encrypting & Depositing...</span>
                </div>
              ) : scanData ? (
                <><CheckCircle2 size={24} /> Uploaded to Secure Vault</>
              ) : (
                <><UploadCloud size={24} /> Execute Upload Sequence</>
              )}
            </button>
          </form>
        </motion.div>

        {/* Prediction Panel */}
        <AnimatePresence mode="wait">
          {scanData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass-panel p-4 md:p-8 border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 md:p-8 opacity-5 pointer-events-none hidden sm:block">
                <BrainCircuit size={160} />
              </div>
              <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-white/10 pb-4 md:pb-6 relative z-10 w-full">
                <div className="w-full">
                  <h2 className="text-lg md:text-2xl font-black text-white flex items-center gap-2 md:gap-3 tracking-wide drop-shadow-md flex-wrap">
                    <BrainCircuit className="text-purple-400 shrink-0" size={24} />
                    <span>Neural Diagnostic Pipeline</span>
                  </h2>
                </div>
              </div>

              {/* Ready State */}
              {!prediction && !predicting && (
                <div className="flex-1 flex flex-col items-center justify-center py-16 relative z-10">
                  <div className="w-24 h-24 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(168,85,247,0.4)]">
                    <BrainCircuit size={48} />
                  </div>
                  <p className="text-2xl font-black text-white mb-4 tracking-tight">Ready for Primary Sweep</p>
                  <p className="text-slate-400 text-base max-w-sm text-center mb-10 leading-relaxed font-medium">Execute the TriModel Convolutional Neural Network to scan and classify local physiological abnormalities.</p>

                  <button
                    onClick={handlePredict}
                    className="px-10 py-5 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xl tracking-wide shadow-[0_0_50px_rgba(147,51,234,0.5)] transition-all flex items-center justify-center gap-4 group hover:scale-[1.02]"
                  >
                    <span>Execute Secure AI Sweep</span>
                    <Activity size={24} className="group-hover:animate-pulse" />
                  </button>
                </div>
              )}

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
                    const rawConf = prediction.confidence * 100;
                    const cappedConf = rawConf >= 100 ? 99.8 : rawConf;

                    const definitions = {
                      pituitary: "A tumor that occurs in the pituitary gland. Changes in vision or headaches are common indicators.",
                      glioma: "A type of tumor that occurs in the brain and spinal cord, beginning in the gluey supportive cells.",
                      meningioma: "A tumor that arises from the meninges — the membranes that surround your brain and spinal cord.",
                      no_tumor: "No visible signs of abnormal tumor formations detected in this specific scan segment."
                    };

                    return (
                      <div className={`border-l-4 rounded-r-xl p-6 md:p-8 bg-slate-900/80 shadow-lg relative overflow-hidden transition-colors ${isClear ? 'border-l-emerald-500' : 'border-l-rose-500'}`}>
                        {/* Background Watermark */}
                        <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                          {isClear ? <CheckCircle2 size={160} /> : <AlertCircle size={160} />}
                        </div>

                        <div className="flex flex-col relative z-10">
                          {/* Logic Column */}
                          <div className="flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                              {isClear ? <CheckCircle2 className="text-emerald-400" size={18} strokeWidth={3} /> : <AlertCircle className="text-rose-400" size={18} strokeWidth={3} />}
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Diagnosis</p>
                            </div>
                            <h3 className={`text-3xl md:text-4xl font-black uppercase tracking-tight mb-5 drop-shadow-md ${colorClass}`}>
                              {prediction.predictedClass.replace('_', ' ')}
                            </h3>

                            {/* Definition Box */}
                            <div className="bg-black/40 border border-white/5 rounded-lg p-5">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <BrainCircuit size={14} /> Clinical Definition Reference
                              </p>
                              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-medium">
                                {definitions[type] || "Atypical formation detected. Recommend further specialist review."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Heatmap Toggle & Display */}
                  <div className="mt-6 w-full relative z-10">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <p className="text-xs font-bold text-slate-300 tracking-[0.1em] uppercase flex items-center gap-2">
                        <BrainCircuit size={16} className="text-primary-400" />
                        Clinical Workstation View
                      </p>
                      <div className="flex bg-[#050505] rounded border border-white/5 shadow-inner p-1">
                        <button
                          onClick={() => setShowHeatmap(true)}
                          className={`px-4 py-1.5 rounded text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 ${showHeatmap ? 'bg-primary-600 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                          <Eye size={12} /> Grad-CAM
                        </button>
                        <button
                          onClick={() => setShowHeatmap(false)}
                          className={`px-4 py-1.5 rounded text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 ${!showHeatmap ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                          <EyeOff size={12} /> Baseline
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#1a1a1a] p-1 sm:p-1.5 rounded-2xl sm:rounded-[1.25rem] border border-[#333] shadow-2xl w-full">
                      <div className="relative flex flex-col bg-black rounded-xl overflow-hidden w-full aspect-square sm:aspect-[4/3] md:h-[400px] border border-[#222]">
                        <div className="absolute top-2 sm:top-3 right-1/2 transform translate-x-1/2 text-[8px] sm:text-[10px] font-bold text-primary-400 uppercase tracking-widest z-20 bg-black/80 px-2 sm:px-3 py-1 rounded border border-primary-500/30 whitespace-nowrap hidden sm:block">
                          {showHeatmap ? 'AI Diagnostic Heatmap' : 'Target Baseline View'}
                        </div>
                        <div className="w-full h-full bg-black flex justify-center items-center relative">
                          <DicomOverlayTopLeft />
                          <DicomOverlayTopRight />
                          <DicomOverlayBottomLeft />
                          <DicomOverlayBottomRight />
                          <img
                            src={showHeatmap ? prediction.heatmapUrl : scanData.imageUrl}
                            alt="Diagnostic MRI"
                            className="w-full h-full object-contain pointer-events-none p-4"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEC Top Predictions */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-5">
                    <p className="text-xs md:text-sm font-medium text-white mb-3 md:mb-4 flex items-center gap-2">
                      <Activity className="text-primary-400 shrink-0" size={18} />
                      <span className="truncate">Differential Probabilities (SEC)</span>
                    </p>
                    <div className="space-y-2.5 md:space-y-3">
                      {prediction.topPredictions.map((pred, idx) => {
                        const rawPc = pred.confidence * 100;
                        const cappedPc = rawPc >= 100 ? 99.8 : rawPc;
                        return (
                          <div key={idx} className="relative">
                            <div className="flex items-center justify-between text-xs md:text-sm mb-1 z-10 relative gap-2">
                              <span className="text-slate-200 capitalize font-medium truncate">{pred.class.replace('_', ' ')}</span>
                              <span className="text-primary-300 font-mono shrink-0">{cappedPc.toFixed(2)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${cappedPc}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="h-full bg-primary-500 rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
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
