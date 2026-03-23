import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { User, Calendar, Activity, AlertCircle, Clock, ChevronLeft, BrainCircuit, SplitSquareHorizontal, Image as ImageIcon, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  const [predictingId, setPredictingId] = useState(null);
  const [activeTab, setActiveTab] = useState('assessment');
  const [selectedHistoryScan, setSelectedHistoryScan] = useState(null);
  
  // 3-way toggle state for analyzed scans
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' | 'original' | 'split'

  const handlePredict = async (scanId) => {
    setPredictingId(scanId);
    try {
      const res = await api.post(`/scans/${scanId}/predict`);
      setPatient(prev => ({
        ...prev,
        scans: prev.scans.map(s => s.id === scanId ? { ...s, prediction: res.data.data.prediction } : s)
      }));
      // Auto-set view mode to heatmap when prediction completes
      setViewMode('heatmap');
    } catch (err) {
      alert(err.response?.data?.message || 'Prediction failed');
    } finally {
      setPredictingId(null);
    }
  };

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get(`/patients/${id}`);
        setPatient(res.data.data);
      } catch (err) {
        console.error("Failed to load patient history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center p-12">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!patient) {
    return <div className="p-8 text-center text-slate-400">Patient record not found.</div>;
  }

  const sortedScans = patient.scans ? [...patient.scans].sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)) : [];
  const latestScan = sortedScans[0];
  const historicalScans = sortedScans.slice(1);

  const renderMassiveViewer = (scan, isHistorical = false) => {
    return (
      <motion.div 
        key={scan.id}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
        className="flex flex-col gap-10"
      >
        {isHistorical && (
          <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl">
            <p className="text-slate-300 font-medium flex items-center gap-2">
              <Clock className="text-primary-400" size={18} />
              Viewing Historical Record from {new Date(scan.uploadedAt).toLocaleString()}
            </p>
            <button 
              onClick={() => setSelectedHistoryScan(null)}
              className="px-4 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-sm font-bold hover:bg-rose-500/30 transition-colors"
            >
              Close Archive Viewer
            </button>
          </div>
        )}

        {/* IMAGE VIEWER AREA */}
        {!scan.prediction ? (
          <div className="glass-panel p-6 w-full">
            <p className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-3">
              Incoming MRI Feed
              <span className="px-3 py-1 bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-full text-xs uppercase tracking-wider">Unverified Baseline</span>
            </p>
            <div className="w-full aspect-video md:h-[600px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-white/10 flex justify-center shadow-2xl relative transition-all duration-500">
              <img src={scan.imageUrl} alt="Raw MRI" className="w-full h-full object-contain p-2" />
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            {/* VIEWPORT CONTROLLER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/5 shadow-lg bg-slate-900/60 backdrop-blur-md">
              <p className="font-bold text-white flex items-center gap-3 tracking-wide">
                <BrainCircuit className="text-primary-400" size={20} />
                Neural TriModel Perspective
              </p>
              
              <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 w-fit">
                <button 
                  onClick={() => setViewMode('heatmap')} 
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'heatmap' ? 'bg-primary-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Crosshair size={16} /> Grad-CAM Heatmap Focus
                </button>
                <button 
                  onClick={() => setViewMode('original')} 
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'original' ? 'bg-primary-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <ImageIcon size={16} /> Baseline Original
                </button>
                <button 
                  onClick={() => setViewMode('split')} 
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'split' ? 'bg-primary-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <SplitSquareHorizontal size={16} /> Side-by-Side Compare
                </button>
              </div>
            </div>

            {/* DYNAMIC VIEWPORT RENDERING */}
            <motion.div layout transition={{ duration: 0.5, ease: "easeInOut" }}>
              {viewMode === 'split' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="glass-panel p-4 border-white/5 flex flex-col">
                     <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest text-center">Reference: Baseline</p>
                     <div className="w-full aspect-square md:h-[500px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-white/5 flex justify-center shadow-inner">
                        <img src={scan.imageUrl} alt="Raw MRI" className="w-full h-full object-contain p-2" />
                     </div>
                  </div>
                  <div className="glass-panel p-4 border-primary-500/40 relative flex flex-col shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                     <div className="absolute inset-x-0 top-0 h-32 bg-primary-500/10 blur-[60px] pointer-events-none"></div>
                     <p className="text-xs font-bold text-primary-400 mb-2 uppercase tracking-widest text-center flex justify-center items-center gap-1"><Activity size={12}/> Analysis: Grad-CAM</p>
                     <div className="w-full aspect-square md:h-[500px] rounded-2xl overflow-hidden bg-slate-950 border-2 border-primary-500/40 flex justify-center shadow-[0_0_40px_rgba(59,130,246,0.2)] relative z-10">
                        <img src={scan.prediction.heatmapUrl} alt="Heatmap MRI" className="w-full h-full object-contain p-2" />
                     </div>
                  </div>
                </div>
              ) : viewMode === 'heatmap' ? (
                <div className="glass-panel p-4 border-primary-500/40 relative flex flex-col shadow-[0_0_60px_rgba(59,130,246,0.15)] w-full transition-all duration-500">
                   <div className="absolute inset-x-0 -top-24 h-48 bg-primary-500/20 blur-[100px] pointer-events-none"></div>
                   <p className="text-sm font-bold text-primary-400 mb-3 uppercase tracking-widest flex items-center gap-2 ml-2"><Activity size={16}/> Dominant View: Grad-CAM Network Heatmap</p>
                   <div className="w-full aspect-video md:h-[650px] rounded-3xl overflow-hidden bg-slate-950 border-2 border-primary-500/40 flex justify-center shadow-[0_0_50px_rgba(59,130,246,0.25)] relative z-10">
                      <img src={scan.prediction.heatmapUrl} alt="Heatmap MRI" className="w-full h-full object-contain p-4" />
                   </div>
                </div>
              ) : (
                <div className="glass-panel p-4 border-white/5 flex flex-col w-full transition-all duration-500">
                   <p className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest flex items-center gap-2 ml-2"><ImageIcon size={16}/> Dominant View: Baseline Reference Scan</p>
                   <div className="w-full aspect-video md:h-[650px] rounded-3xl overflow-hidden bg-slate-950 border-2 border-white/10 flex justify-center shadow-2xl relative z-10">
                      <img src={scan.imageUrl} alt="Raw MRI" className="w-full h-full object-contain p-4" />
                   </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* AI DIAGNOSTICS STATS CARD */}
        <div className="glass-panel p-8 md:p-10 border-t-4 border-t-purple-500/50 shadow-[0_-10px_40px_rgba(147,51,234,0.15)] bg-gradient-to-b from-purple-900/10 to-transparent mt-4 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3.5 bg-purple-500/20 text-purple-400 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)]"><BrainCircuit size={32} /></div>
            <h2 className="text-3xl font-black text-white tracking-tight">Neural TriModel Analysis Core</h2>
          </div>

          {!scan.prediction ? (
            <div className="bg-black/30 border border-white/5 rounded-3xl p-16 flex flex-col items-center shadow-inner">
              <p className="text-slate-400 mb-8 text-center text-xl max-w-2xl leading-relaxed">System awaits Doctor authorization to execute primary neural sweep.<br/>Model will assess localized regions for pathological structures.</p>
              {!isHistorical ? (
                <button 
                  onClick={() => handlePredict(scan.id)}
                  disabled={predictingId === scan.id}
                  className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-black text-xl shadow-[0_0_40px_rgba(147,51,234,0.5)] transition-all flex items-center gap-4 w-full max-w-lg justify-center group hover:-translate-y-1"
                >
                  {predictingId === scan.id ? (
                    <div className="flex items-center gap-4">
                      <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing Neural Pipeline...</span>
                    </div>
                  ) : (
                    <span>Execute Full AI Diagnostics</span>
                  )}
                </button>
              ) : (
                <div className="px-10 py-5 bg-slate-800/50 text-slate-500 rounded-2xl font-black text-xl border border-white/5 flex items-center gap-4 w-full max-w-lg justify-center cursor-not-allowed">
                  Neural Scan Locked (Historical Archive)
                </div>
              )}
            </div>
          ) : (() => {
            const predictionObj = scan.prediction;
            const type = predictionObj.predictedClass.toLowerCase();
            const isClear = type.includes('no_tumor');
            const colorClass = isClear ? 'text-emerald-400' : 'text-rose-400';
            const bgGradient = isClear ? 'from-emerald-500/20 to-emerald-950 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)]' : 'from-rose-500/20 to-rose-950 border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.15)]';

            return (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* PRIMARY READOUT */}
                <div className={`xl:col-span-1 border-2 rounded-3xl p-10 bg-gradient-to-br flex flex-col justify-center ${bgGradient} relative overflow-hidden backdrop-blur-xl transition-all duration-500`}>
                  <div className="absolute -top-10 -right-10 p-8 opacity-10 rotate-12">
                    <Activity size={200} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-widest opacity-80 flex items-center gap-2"><Crosshair size={14}/> Primary Flagging</p>
                    <p className={`text-5xl font-black uppercase tracking-tight mb-10 ${colorClass}`}>
                      {type.replace('_', ' ')}
                    </p>
                    
                    <p className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-widest opacity-80 flex items-center gap-2"><Activity size={14}/> Confidence Matrix</p>
                    <p className="text-6xl font-black text-white drop-shadow-lg">
                      {(predictionObj.confidence * 100).toFixed(2)}<span className="text-4xl text-slate-400 ml-1">%</span>
                    </p>
                  </div>
                </div>

                {/* PREMIUM SEC CARD (DIFFERENTIAL) */}
                <div className="xl:col-span-2 bg-slate-900/90 border border-white/10 rounded-3xl p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                  <p className="text-xl font-black text-white mb-8 flex items-center gap-3 border-b border-white/10 pb-5 tracking-wide">
                    <Activity className="text-primary-400" size={28} />
                    Differential SEC Neural Probabilities
                  </p>
                  <div className="space-y-7 relative z-10">
                    {predictionObj.topPredictions.map((pred, idx) => {
                        const predPercent = (pred.confidence * 100).toFixed(2);
                        // Deep premium gradients for SEC bars
                        const barGradients = [
                            "from-primary-400 to-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]",
                            "from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]",
                            "from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]",
                            "from-slate-500 to-slate-400"
                        ];
                        const curGradient = barGradients[idx] || barGradients[3];

                        return (
                        <div key={idx} className="relative group">
                          <div className="flex items-center justify-between text-lg mb-2 z-10 relative px-1">
                            <span className="text-slate-100 font-bold tracking-widest uppercase text-sm">{pred.class.replace('_', ' ')}</span>
                            <span className="text-white font-mono font-black">{predPercent}%</span>
                          </div>
                          <div className="w-full h-4 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${predPercent}%` }}
                              transition={{ duration: 1.5, delay: idx * 0.15, ease: "easeOut" }}
                              className={`h-full rounded-full bg-gradient-to-r ${curGradient}`}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-primary-400 hover:text-white transition-colors mb-8 font-bold w-fit uppercase tracking-widest text-sm"
      >
        <ChevronLeft size={18} /> Back to Doctor Dashboard
      </button>

      {/* PATIENT HEADER */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col gap-2">
        <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-lg">{patient.name}</h1>
        <div className="flex items-center gap-6 text-slate-400 mt-2 text-base font-medium">
          <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><User size={18} className="text-primary-400" /> PTR-{patient.id.slice(0, 8).toUpperCase()}</span>
          <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Calendar size={18} className="text-primary-400" /> Age {patient.age}</span>
          <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Activity size={18} className="text-primary-400" /> {patient.gender}</span>
        </div>
      </motion.div>

      {!latestScan ? (
        <div className="glass-panel p-16 text-center flex flex-col items-center justify-center mt-8 border-dashed border-2 border-white/10 mx-auto w-full max-w-3xl">
          <AlertCircle size={64} className="text-slate-600 mb-6 drop-shadow-md" />
          <p className="text-white font-bold text-2xl mb-2 tracking-wide">No Scans Recorded</p>
          <p className="text-slate-400 text-lg">The Receptionist desk has not routed an MRI scan for this patient yet.</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          {/* TABS CONTROLLER */}
          <div className="flex gap-3 border-b-2 border-white/10 pb-5 mb-10">
            <button 
              onClick={() => { setActiveTab('assessment'); setSelectedHistoryScan(null); setViewMode('heatmap'); }} 
              className={`px-8 py-3.5 rounded-xl font-bold transition-all shadow-md tracking-wide ${activeTab === 'assessment' ? 'bg-primary-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-primary-400 scale-[1.02]' : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'}`}
            >
              ACTIVE DIAGNOSIS
            </button>
            <button 
              onClick={() => setActiveTab('history')} 
              className={`px-8 py-3.5 rounded-xl font-bold transition-all shadow-md tracking-wide ${activeTab === 'history' ? 'bg-primary-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-primary-400 scale-[1.02]' : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'}`}
            >
              ARCHIVED RECORDS <span className="ml-2 bg-black/30 px-2 py-0.5 rounded-md text-sm">{historicalScans.length}</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* ACTIVE ASSESSMENT TAB */}
            {activeTab === 'assessment' && !selectedHistoryScan && renderMassiveViewer(latestScan, false)}

            {/* PATIENT HISTORY TAB */}
            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              >
                {selectedHistoryScan ? (
                  renderMassiveViewer(selectedHistoryScan, true)
                ) : historicalScans.length === 0 ? (
                  <div className="glass-panel p-20 text-center mt-6 border-dashed border-2 border-white/10 max-w-4xl mx-auto">
                    <Clock size={64} className="text-slate-600 mb-6 mx-auto drop-shadow-md" />
                    <p className="text-3xl font-bold text-white mb-2 tracking-wide">Vault Empty</p>
                    <p className="text-slate-400 text-lg">There are no historical diagnostic scans available for this patient.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {historicalScans.map((scan) => (
                      <div 
                        key={scan.id} 
                        onClick={() => { setSelectedHistoryScan(scan); setViewMode('heatmap'); }}
                        className="glass-panel p-8 flex gap-8 hover:border-primary-500/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] group cursor-pointer bg-slate-900/40 hover:bg-slate-900/80"
                      >
                        <div className="w-36 h-36 rounded-2xl overflow-hidden bg-black shrink-0 relative border-2 border-white/10 shadow-2xl">
                          <img src={scan.prediction?.heatmapUrl || scan.imageUrl} alt="Historical Scan" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                          {scan.prediction && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-6 pb-2 text-center">
                              <p className="text-xs font-black text-primary-400 tracking-[0.2em] shadow-black drop-shadow-md">ANALYZED</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center flex-1">
                          <p className="text-sm font-bold text-slate-400 flex items-center gap-2 mb-4 bg-black/40 w-fit px-4 py-1.5 rounded-lg border border-white/5 tracking-wider">
                            <Clock size={16} className="text-primary-400"/> {new Date(scan.uploadedAt).toLocaleString()}
                          </p>
                          {scan.prediction ? (
                            <div className="space-y-2">
                              <p className={`text-2xl font-black uppercase tracking-tight group-hover:text-primary-300 transition-colors drop-shadow-md ${scan.prediction.predictedClass.includes('no_tumor') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {scan.prediction.predictedClass.replace('_', ' ')}
                              </p>
                              <p className="text-sm font-bold text-slate-300 tracking-wider">
                                CONFIDENCE: <span className="text-white font-black text-lg ml-1">{(scan.prediction.confidence * 100).toFixed(2)}%</span>
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-xl font-black text-slate-300 group-hover:text-primary-300 transition-colors tracking-wide">BASELINE REGISTRATION</p>
                              <p className="text-sm text-slate-500 font-medium">No Neural AI processing executed.</p>
                            </div>
                          )}
                        </div>
                        <div className="hidden md:flex flex-col justify-center items-end pr-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 text-primary-400 font-bold text-sm uppercase tracking-[0.2em]">
                          Expand ➜
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
