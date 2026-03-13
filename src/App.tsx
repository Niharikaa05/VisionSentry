/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Camera, 
  Activity, 
  Users, 
  Settings, 
  Bell, 
  History,
  Eye,
  Lock,
  Wifi,
  Cpu,
  Map as MapIcon,
  Navigation,
  LogOut,
  User,
  Key,
  CloudRain,
  Wind,
  Thermometer,
  MessageSquare,
  Database,
  Radio,
  Target,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, AlertSeverity, SystemLog, Personnel, WeatherInfo } from './types';
import { analyzeFrame } from './services/aiService';

// --- Login Component ---
function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutUntil) {
      timer = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          setLockoutUntil(null);
          setAttempts(0);
          setError('');
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutUntil) return;

    if (username === 'admin' && password === 'sentry2026') {
      onLogin();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        const lockTime = Date.now() + 60000;
        setLockoutUntil(lockTime);
        setTimeLeft(60);
        setError('TERMINAL LOCKED: Security breach protocol active.');
      } else {
        setError(`Access Denied. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0b] relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-overlay opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="bg-[#111114] border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">SECOND SENTRY</h1>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-0.5">Border Surveillance System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${lockoutUntil ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {lockoutUntil ? 'System Lockdown Active' : 'Terminal Status: Ready'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Operator ID</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  disabled={!!lockoutUntil}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700"
                  placeholder="Enter Operator ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password" 
                  disabled={!!lockoutUntil}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border text-[11px] font-medium flex items-center gap-2 ${
                  lockoutUntil ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={!!lockoutUntil}
              className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all ${
                lockoutUntil 
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]'
              }`}
            >
              {lockoutUntil ? `Locked: ${timeLeft}s` : 'Authenticate'}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-6 bg-black/20 border-t border-white/5 flex justify-between items-center">
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Node: Border_Alpha_1</span>
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">v2.4.0-Stable</span>
          </div>
        </div>
        <p className="text-center mt-8 text-zinc-600 text-[10px] uppercase tracking-[0.3em] font-medium">
          Authorized Military Access Only
        </p>
      </motion.div>
    </div>
  );
}

// --- Live Map Component ---
function LiveMap({ alerts }: { alerts: Alert[] }) {
  const [layer, setLayer] = useState<'satellite' | 'topo' | 'heat'>('satellite');
  const [zoom, setZoom] = useState(1);
  const [dronePos, setDronePos] = useState({ x: 20, y: 20 });
  const [droneTrail, setDroneTrail] = useState<{x: number, y: number}[]>([]);
  const [showWeather, setShowWeather] = useState(false);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Drone movement simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setDronePos(prev => {
        const newPos = {
          x: (prev.x + 0.1) % 100,
          y: (prev.y + 0.05) % 100
        };
        setDroneTrail(trail => [...trail.slice(-20), newPos]);
        return newPos;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-zinc-900 rounded-xl border border-sentry-border relative overflow-hidden flex flex-col">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10 flex flex-col gap-1">
          <MapControlButton active={layer === 'satellite'} onClick={() => setLayer('satellite')} label="SAT" />
          <MapControlButton active={layer === 'topo'} onClick={() => setLayer('topo')} label="TOPO" />
          <MapControlButton active={layer === 'heat'} onClick={() => setLayer('heat')} label="HEAT" />
        </div>
        <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10 flex flex-col gap-1">
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 hover:bg-white/10 rounded text-white">+</button>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-white/10 rounded text-white">-</button>
        </div>
        <button 
          onClick={() => setShowWeather(!showWeather)}
          className={`bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 text-white transition-colors ${showWeather ? 'text-sentry-accent border-sentry-accent/50' : ''}`}
        >
          <CloudRain className="w-4 h-4" />
        </button>
      </div>

      {/* Sector Status Overlay */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        <SectorStatus label="SEC_A" status="secure" onClick={() => setSelectedSector('SEC_A')} />
        <SectorStatus label="SEC_B" status="warning" onClick={() => setSelectedSector('SEC_B')} />
        <SectorStatus label="SEC_C" status="secure" onClick={() => setSelectedSector('SEC_C')} />
      </div>

      {/* Sector Details Modal */}
      <AnimatePresence>
        {selectedSector && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-32 z-30 w-48 bg-black/80 backdrop-blur-xl border border-sentry-border rounded-xl p-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-black text-white tracking-widest uppercase">{selectedSector} DETAILS</h3>
              <button onClick={() => setSelectedSector(null)} className="text-zinc-500 hover:text-white">×</button>
            </div>
            <div className="space-y-2">
              <DetailRow label="Personnel" value={`${Math.floor(Math.random() * 15) + 5} Active`} />
              <DetailRow label="Last Scan" value={`${Math.floor(Math.random() * 10) + 1}m ago`} />
              <DetailRow label="Stability" value={`${95 + Math.floor(Math.random() * 5)}%`} />
              <DetailRow label="Threats" value="0" />
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-sentry-success animate-ping" />
                  <span className="text-[7px] font-mono text-sentry-success uppercase">Uplink Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 relative overflow-hidden">
        <motion.div 
          animate={{ scale: zoom }}
          className="absolute inset-0 grid-overlay opacity-30 transition-transform duration-500" 
        />
        
        {/* Map Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Weather Simulation Overlay */}
            {showWeather && (
              <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/10" />
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20, x: Math.random() * 100 + '%' }}
                    animate={{ y: 1000 }}
                    transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: "linear" }}
                    className="absolute w-px h-4 bg-blue-400/30"
                  />
                ))}
              </div>
            )}

            {/* Simulated Terrain Features based on layer */}
            {layer === 'topo' && (
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
                <path d="M0 20 Q 25 10 50 20 T 100 20" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M0 40 Q 25 30 50 40 T 100 40" fill="none" stroke="white" strokeWidth="0.5" />
                <path d="M0 60 Q 25 50 50 60 T 100 60" fill="none" stroke="white" strokeWidth="0.5" />
              </svg>
            )}

            {layer === 'heat' && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-orange-500/10 to-red-500/10 animate-pulse" />
            )}

            {/* Simulated Border Line */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-red-500/30 border-t border-dashed border-red-500/50" />
            <div className="absolute top-[48%] left-4 text-[10px] font-mono text-red-500/50 uppercase">Border Line Alpha-7</div>

            {/* Radar Circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] aspect-square border border-white/5 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] aspect-square border border-white/5 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] aspect-square border border-white/5 rounded-full" />
            
            {/* Radar Sweep */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full origin-center pointer-events-none"
              style={{ background: 'conic-gradient(from 0deg, rgba(59, 130, 246, 0.1) 0deg, transparent 90deg)' }}
            />

            {/* Drone Trail */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                points={droneTrail.map(p => `${(p.x / 100) * 1000},${(p.y / 100) * 1000}`).join(' ')}
                fill="none"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="2"
                viewBox="0 0 1000 1000"
              />
            </svg>

            {/* Drone Marker */}
            <motion.div 
              className="absolute w-4 h-4 text-sentry-accent"
              style={{ left: `${dronePos.x}%`, top: `${dronePos.y}%` }}
            >
              <Navigation className="w-full h-full rotate-45" />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[6px] font-mono text-white bg-black/50 px-1 rounded">DRONE_01</div>
            </motion.div>

            {/* Alert Markers */}
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute"
                style={{ 
                  top: `${40 + (i * 10) % 20}%`, 
                  left: `${30 + (i * 15) % 40}%` 
                }}
              >
                <div className={`w-3 h-3 rounded-full animate-ping absolute ${
                  alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                }`} />
                <div className={`w-3 h-3 rounded-full relative ${
                  alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                }`} />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap">
                  <span className="text-[8px] font-mono text-white uppercase">{alert.severity} THREAT</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-sentry-border bg-black/20 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Navigation className="w-3 h-3 text-sentry-accent" />
            <span className="text-[10px] font-mono">LAT: 32.7266° N</span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="w-3 h-3 text-sentry-accent" />
            <span className="text-[10px] font-mono">LONG: 74.8570° E</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] font-mono">WIND: 12km/h NW</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sentry-success animate-pulse" />
            <span className="text-[10px] font-mono">GPS: LOCKED</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[9px] font-mono text-zinc-500 uppercase">{label}</span>
      <span className="text-[9px] font-bold text-white">{value}</span>
    </div>
  );
}

function SectorStatus({ label, status, onClick }: { label: string, status: 'secure' | 'warning' | 'alert', onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 flex items-center gap-2 min-w-[80px] cursor-pointer hover:bg-white/5 transition-colors"
    >
      <div className={`w-1.5 h-1.5 rounded-full ${
        status === 'secure' ? 'bg-sentry-success' : status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
      }`} />
      <span className="text-[9px] font-bold text-white">{label}</span>
      <span className="text-[8px] font-mono text-zinc-500 ml-auto uppercase">{status}</span>
    </div>
  );
}

function MapControlButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
        active ? 'bg-sentry-accent text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );
}

// --- Main App Component ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'nominal' | 'low' | 'medium' | 'high' | 'critical'>('nominal');
  const [lastDetection, setLastDetection] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'logs' | 'personnel'>('feed');
  const [visionMode, setVisionMode] = useState<'normal' | 'thermal' | 'night'>('normal');
  const [showTacticalOverlay, setShowTacticalOverlay] = useState(true);
  const [weather, setWeather] = useState<WeatherInfo>({
    temp: 14,
    condition: 'Clear',
    humidity: 42,
    windSpeed: 12,
    visibility: '10km'
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Mock Personnel Data
  const personnel: Personnel[] = [
    { id: 'P01', name: 'Maj. Vikram Singh', rank: 'Major', status: 'active', location: 'Sector A' },
    { id: 'P02', name: 'Capt. Ananya Rao', rank: 'Captain', status: 'deployed', location: 'Sector B' },
    { id: 'P03', name: 'Sub. Rajesh Kumar', rank: 'Subedar', status: 'active', location: 'Sector C' },
    { id: 'P04', name: 'Lt. Priya Sharma', rank: 'Lieutenant', status: 'on-leave', location: 'Base' },
  ];

  // Add Log Helper
  const addLog = (event: string, type: SystemLog['type'] = 'info') => {
    const newLog: SystemLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      event,
      type
    };
    setSystemLogs(prev => [newLog, ...prev].slice(0, 100));
  };

  // Initialize camera
  useEffect(() => {
    if (!isLoggedIn) return;
    addLog('System initialized. Operator authenticated.', 'success');

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    setupCamera();
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [isLoggedIn]);

  // Monitoring Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMonitoring && isLoggedIn) {
      interval = setInterval(async () => {
        if (videoRef.current && canvasRef.current && !isAiProcessing) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            const base64Image = canvas.toDataURL('image/jpeg', 0.8);
            
            setIsAiProcessing(true);
            const result = await analyzeFrame(base64Image);
            setIsAiProcessing(false);

            if (result.isSuspicious) {
              const newAlert: Alert = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date(),
                type: 'Suspicious Activity',
                description: result.description,
                severity: result.threatLevel,
                imageUrl: base64Image,
                status: 'active'
              };
              setAlerts(prev => [newAlert, ...prev].slice(0, 50));
              setSystemStatus(result.threatLevel);
              setLastDetection(result.description);
              addLog(`THREAT DETECTED: ${result.description}`, result.threatLevel === 'critical' ? 'error' : 'warning');
            } else {
              setSystemStatus('nominal');
            }
          }
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, isAiProcessing, isLoggedIn]);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    addLog(isMonitoring ? 'Surveillance suspended.' : 'Surveillance active.', isMonitoring ? 'warning' : 'info');
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'text-red-500 border-red-500/50 bg-red-500/10';
      case 'high': return 'text-orange-500 border-orange-500/50 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
      default: return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
    }
  };

  return (
    <div className="flex h-screen w-full bg-sentry-bg text-zinc-300 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-16 flex flex-col items-center py-6 border-r border-sentry-border bg-sentry-panel z-20">
        <div className="mb-8 p-2 bg-sentry-accent rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <nav className="flex flex-col gap-6">
          <NavItem 
            icon={<Camera className="w-5 h-5" />} 
            active={activeTab === 'feed'} 
            onClick={() => setActiveTab('feed')}
            label="Feed"
          />
          <NavItem 
            icon={<MapIcon className="w-5 h-5" />} 
            active={activeTab === 'map'} 
            onClick={() => setActiveTab('map')}
            label="Map"
          />
          <NavItem 
            icon={<Database className="w-5 h-5" />} 
            active={activeTab === 'logs'} 
            onClick={() => setActiveTab('logs')}
            label="Logs"
          />
          <NavItem 
            icon={<Users className="w-5 h-5" />} 
            active={activeTab === 'personnel'} 
            onClick={() => setActiveTab('personnel')}
            label="Units"
          />
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-sentry-border cursor-pointer hover:bg-zinc-700 transition-colors">
            <Settings className="w-4 h-4" />
          </div>
          <div 
            onClick={() => setIsLoggedIn(false)}
            className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-sentry-border bg-sentry-panel/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SECOND SENTRY <span className="text-xs font-mono text-sentry-accent px-2 py-0.5 border border-sentry-accent/30 rounded">BETA v2.4</span>
            </h1>
            <div className="h-4 w-px bg-sentry-border mx-2" />
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-sentry-success animate-pulse' : 'bg-zinc-600'}`} />
              {isMonitoring ? 'LIVE MONITORING ACTIVE' : 'SYSTEM STANDBY'}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1 rounded border border-white/5">
                <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                <span>{weather.temp}°C</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1 rounded border border-white/5">
                <Wind className="w-3.5 h-3.5 text-blue-400" />
                <span>{weather.windSpeed}km/h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-sentry-success" />
                <span>SIGNAL: 100%</span>
              </div>
            </div>
            <button 
              onClick={toggleMonitoring}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                isMonitoring 
                  ? 'bg-sentry-danger text-white hover:bg-red-600' 
                  : 'bg-sentry-accent text-white hover:bg-blue-600'
              }`}
            >
              {isMonitoring ? 'STOP SURVEILLANCE' : 'START SURVEILLANCE'}
            </button>
            <Bell className="w-5 h-5 text-zinc-500 cursor-pointer hover:text-white transition-colors" />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 flex flex-col overflow-hidden p-4 gap-4">
          <div className="flex-1 flex gap-4 overflow-hidden">
            {/* Left: Feed/Map and Stats */}
            <div className="flex-[3] flex flex-col gap-4 overflow-hidden">
              {/* Main Viewport Container */}
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex-1 bg-black rounded-xl border border-sentry-border relative overflow-hidden group">
                  {activeTab === 'feed' ? (
                    <>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className={`w-full h-full object-cover opacity-80 transition-all duration-500 ${
                          visionMode === 'thermal' ? 'vision-thermal' : visionMode === 'night' ? 'vision-night' : ''
                        }`}
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {/* Overlays */}
                      <div className="absolute inset-0 grid-overlay pointer-events-none" />
                      <div className="scanline" />
                      
                      {/* HUD Elements */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 flex items-center gap-2">
                          <Eye className="w-4 h-4 text-sentry-accent" />
                          <span className="text-xs font-mono">CAM_01_BORDER_NORTH</span>
                        </div>
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs font-mono">PWR: 94%</span>
                        </div>
                      </div>

                      {/* Vision Mode Controls */}
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <VisionButton active={visionMode === 'normal'} onClick={() => setVisionMode('normal')} label="NORMAL" />
                        <VisionButton active={visionMode === 'thermal'} onClick={() => setVisionMode('thermal')} label="THERMAL" />
                        <VisionButton active={visionMode === 'night'} onClick={() => setVisionMode('night')} label="NIGHT" />
                        <div className="w-px bg-white/10 mx-1" />
                        <VisionButton active={showTacticalOverlay} onClick={() => setShowTacticalOverlay(!showTacticalOverlay)} label="AI_HUD" />
                      </div>

                      {/* Tactical Overlay (Simulated Bounding Boxes) */}
                      {showTacticalOverlay && systemStatus !== 'nominal' && (
                        <div className="absolute inset-0 pointer-events-none">
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0.8, 1] }}
                            className="absolute border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                            style={{ top: '30%', left: '40%', width: '15%', height: '25%' }}
                          >
                            <div className="absolute -top-6 left-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 uppercase flex items-center gap-1">
                              <Target className="w-2 h-2" />
                              UNAUTHORIZED_ENTRY
                            </div>
                            <div className="absolute -bottom-6 right-0 text-red-500 text-[8px] font-mono font-bold">
                              CONF: 98.4%
                            </div>
                            {/* Corner brackets */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white" />
                          </motion.div>
                        </div>
                      )}
                    </>
                  ) : activeTab === 'map' ? (
                    <LiveMap alerts={alerts} />
                  ) : activeTab === 'logs' ? (
                    <div className="w-full h-full bg-zinc-900 p-6 overflow-y-auto custom-scrollbar">
                      <h2 className="text-xl font-black text-white tracking-widest uppercase mb-6 flex items-center gap-3">
                        <Database className="w-6 h-6 text-sentry-accent" />
                        System Event Logs
                      </h2>
                      <div className="space-y-3">
                        {systemLogs.map(log => (
                          <div key={log.id} className="flex gap-4 p-3 rounded-lg bg-black/40 border border-white/5 items-start">
                            <span className="text-[10px] font-mono text-zinc-500 mt-1">{log.timestamp.toLocaleTimeString()}</span>
                            <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
                              log.type === 'success' ? 'bg-sentry-success' : log.type === 'warning' ? 'bg-orange-500' : log.type === 'error' ? 'bg-red-500' : 'bg-sentry-accent'
                            }`} />
                            <p className="text-sm font-medium text-zinc-300">{log.event}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-zinc-900 p-6 overflow-y-auto custom-scrollbar">
                      <h2 className="text-xl font-black text-white tracking-widest uppercase mb-6 flex items-center gap-3">
                        <Users className="w-6 h-6 text-sentry-accent" />
                        Personnel Deployment
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {personnel.map(p => (
                          <div key={p.id} className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-sentry-border">
                              <User className="w-6 h-6 text-zinc-500" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">{p.name}</h3>
                              <p className="text-[10px] font-mono text-zinc-500 uppercase">{p.rank} | {p.location}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  p.status === 'active' ? 'bg-sentry-success' : p.status === 'deployed' ? 'bg-sentry-accent' : 'bg-zinc-600'
                                }`} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">{p.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common HUD Elements */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-white/10">
                    <span className="text-xs font-mono text-white">
                      {new Date().toLocaleTimeString()} | {new Date().toLocaleDateString()}
                    </span>
                  </div>

                  {/* Corner Accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-sentry-accent/50 m-2" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-sentry-accent/50 m-2" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-sentry-accent/50 m-2" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-sentry-accent/50 m-2" />
                </div>

                {/* Alert Bar - Dedicated space below the viewport */}
                <AnimatePresence>
                  {systemStatus !== 'nominal' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`px-6 py-4 rounded-xl border flex items-center justify-between backdrop-blur-md shadow-2xl ${
                        systemStatus === 'critical' ? 'bg-red-500/10 border-red-500/50' : 
                        systemStatus === 'high' ? 'bg-orange-500/10 border-orange-500/50' :
                        systemStatus === 'medium' ? 'bg-yellow-500/10 border-yellow-500/50' :
                        'bg-blue-500/10 border-blue-500/50'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            systemStatus === 'critical' ? 'bg-red-500' : 
                            systemStatus === 'high' ? 'bg-orange-500' :
                            systemStatus === 'medium' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          } animate-pulse`}>
                            <AlertTriangle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${
                                systemStatus === 'critical' ? 'text-red-500' : 
                                systemStatus === 'high' ? 'text-orange-500' :
                                systemStatus === 'medium' ? 'text-yellow-500' :
                                'text-blue-500'
                              }`}>
                                {systemStatus === 'critical' ? 'CRITICAL THREAT DETECTED' : 'SUSPICIOUS ACTIVITY LOGGED'}
                              </h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                systemStatus === 'critical' ? 'bg-red-500/20 border-red-500/30 text-red-500' : 
                                systemStatus === 'high' ? 'bg-orange-500/20 border-orange-500/30 text-orange-500' :
                                systemStatus === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500' :
                                'bg-blue-500/20 border-blue-500/30 text-blue-500'
                              }`}>
                                {systemStatus.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-xs text-white font-medium mt-1">{lastDetection}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setSystemStatus('nominal')}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                          >
                            Acknowledge
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Alerts and Comms Panel */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              {/* Alerts Panel */}
              <div className="flex-1 flex flex-col bg-sentry-panel rounded-xl border border-sentry-border overflow-hidden">
                <div className="p-4 border-b border-sentry-border flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Bell className="w-4 h-4 text-sentry-accent" />
                    Live Alerts
                  </h2>
                  <span className="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
                    {alerts.length} LOGGED
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {alerts.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-2 opacity-50">
                        <Shield className="w-12 h-12" />
                        <p className="text-xs font-mono uppercase">No active threats</p>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg border flex flex-col gap-2 ${getSeverityColor(alert.severity)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{alert.type}</span>
                            <span className="text-[10px] font-mono opacity-70">
                              {alert.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs font-medium leading-tight text-white">{alert.description}</p>
                          {alert.imageUrl && (
                            <div className="mt-1 rounded overflow-hidden border border-white/10 h-20">
                              <img src={alert.imageUrl} alt="Detection" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Comms Panel */}
              <div className="h-48 flex flex-col bg-sentry-panel rounded-xl border border-sentry-border overflow-hidden">
                <div className="p-3 border-b border-sentry-border bg-black/20 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-sentry-accent" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Tactical Comms</span>
                </div>
                <div className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar">
                  <CommsMessage user="HQ" text="Sentry-1, confirm status." time="13:42" />
                  <CommsMessage user="OPERATOR" text="Status nominal. Monitoring sector A-7." time="13:43" />
                  <CommsMessage user="HQ" text="Copy. Drone-01 is on station." time="13:45" />
                </div>
                <div className="p-2 border-t border-sentry-border bg-black/20">
                  <input 
                    type="text" 
                    placeholder="Send message..." 
                    className="w-full bg-zinc-900 border border-white/5 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-sentry-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats Row */}
          <div className="h-24 flex gap-4">
            <StatCard label="UPTIME" value="142:12:05" icon={<Activity className="w-4 h-4" />} />
            <StatCard label="THREATS DETECTED" value={alerts.length.toString()} icon={<Shield className="w-4 h-4" />} />
            <StatCard label="RANGE SCAN" value="50 KM" icon={<Navigation className="w-4 h-4" />} />
            <StatCard label="OPERATOR" value="OFFICER_58" icon={<User className="w-4 h-4" />} />
            <StatCard label="AI DIAGNOSTICS" value="OPTIMAL" icon={<Cpu className="w-4 h-4" />} />
          </div>
        </div>
      </main>
    </div>
  );
}

function CommsMessage({ user, text, time }: { user: string, text: string, time: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className={`text-[8px] font-black tracking-widest ${user === 'HQ' ? 'text-sentry-accent' : 'text-sentry-success'}`}>{user}</span>
        <span className="text-[8px] font-mono text-zinc-600">{time}</span>
      </div>
      <p className="text-[10px] text-zinc-300 leading-tight bg-white/5 p-1.5 rounded">{text}</p>
    </div>
  );
}

function VisionButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all border ${
        active 
          ? 'bg-sentry-accent border-sentry-accent text-white shadow-lg shadow-sentry-accent/20' 
          : 'bg-black/60 border-white/10 text-zinc-500 hover:text-white hover:border-white/30'
      }`}
    >
      {label}
    </button>
  );
}

function NavItem({ icon, active = false, onClick, label }: { icon: React.ReactNode, active?: boolean, onClick?: () => void, label?: string }) {
  return (
    <div 
      onClick={onClick}
      className={`p-2.5 rounded-xl cursor-pointer transition-all relative group ${
        active 
          ? 'bg-sentry-accent/10 text-sentry-accent border border-sentry-accent/20' 
          : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
      }`}
    >
      {icon}
      {label && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex-1 bg-sentry-panel rounded-xl border border-sentry-border p-4 flex flex-col justify-between group hover:border-sentry-accent/50 transition-colors">
      <div className="flex items-center justify-between text-zinc-500 group-hover:text-sentry-accent transition-colors">
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className="text-xl font-mono font-bold text-white truncate">{value}</div>
    </div>
  );
}
