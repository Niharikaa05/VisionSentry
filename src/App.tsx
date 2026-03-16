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
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Send,
  Share2,
  Database,
  Radio,
  Target,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Alert, AlertSeverity, SystemLog, Personnel, WeatherInfo, TacticalEntity, ChatMessage } from './types';
import { analyzeFrame } from './services/aiService';
import { fetchWeather } from './services/weatherService';

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
                <h1 className="text-xl font-bold text-white tracking-tight">VISION SENTRY</h1>
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

// --- Constants for Map ---
const SECTOR_DEFINITIONS = [
  { id: 'SEC_ALPHA', name: 'Sector Alpha', points: '20,10 40,5 60,15 50,30 30,25' },
  { id: 'SEC_BRAVO', name: 'Sector Bravo', points: '70,40 90,35 95,60 75,65 65,50' },
  { id: 'SEC_CHARLIE', name: 'Sector Charlie', points: '10,60 30,55 40,80 20,90 5,75' },
];

const PATROL_ROUTES = [
  { id: 'R1', name: 'Alpha Route', path: '10,10 30,20 50,10 70,20 90,10', color: 'rgba(255, 255, 255, 0.2)' },
  { id: 'R2', name: 'Bravo Route', path: '10,90 30,70 50,90 70,70 90,90', color: 'rgba(255, 255, 255, 0.2)' },
];

// --- Live Map Component ---
function LiveMap({ alerts, coords, entities }: { alerts: Alert[], coords: { lat: number, lng: number }, entities: TacticalEntity[] }) {
  const [layer, setLayer] = useState<'satellite' | 'topo' | 'heat'>('satellite');
  const [zoom, setZoom] = useState(1);
  const [dronePos, setDronePos] = useState({ x: 20, y: 20 });
  const [droneTrail, setDroneTrail] = useState<{x: number, y: number}[]>([]);
  const [showWeather, setShowWeather] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Dynamic sector statuses based on entities and alerts
  const getSectorStatus = (sectorId: string): 'secure' | 'warning' | 'alert' => {
    // If there's an active alert in this sector (simulated by random or proximity)
    // For now, let's use the entities to determine status
    const sectorEntities = entities.filter(e => {
      // Simple logic: Alpha is top, Bravo is right, Charlie is bottom
      if (sectorId === 'SEC_ALPHA') return e.y < 40;
      if (sectorId === 'SEC_BRAVO') return e.x > 60;
      if (sectorId === 'SEC_CHARLIE') return e.y > 60;
      return false;
    });

    if (sectorEntities.some(e => e.type === 'armed')) return 'alert';
    if (sectorEntities.some(e => e.type === 'suspicious')) return 'warning';
    return 'secure';
  };

  const getSectorColor = (status: 'secure' | 'warning' | 'alert') => {
    if (status === 'alert') return 'rgba(239, 68, 68, 0.3)'; // red
    if (status === 'warning') return 'rgba(245, 158, 11, 0.3)'; // orange
    return 'rgba(16, 185, 129, 0.2)'; // green
  };

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
      {/* Map Controls - Ultra-compact to prevent overlap */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 pointer-events-auto">
        {/* Layer Selection */}
        <div className="bg-black/80 backdrop-blur-md p-1 rounded border border-white/10 flex flex-col gap-1 shadow-xl">
          <MapControlButton active={layer === 'satellite'} onClick={() => setLayer('satellite')} label="SAT" />
          <MapControlButton active={layer === 'topo'} onClick={() => setLayer('topo')} label="TOPO" />
          <MapControlButton active={layer === 'heat'} onClick={() => setLayer('heat')} label="HEAT" />
        </div>

        {/* Zoom Controls */}
        <div className="bg-black/80 backdrop-blur-md p-1 rounded border border-white/10 flex flex-col gap-1 shadow-xl">
          <button 
            onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(3, z + 0.2)); }} 
            className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded text-white font-bold text-sm transition-colors"
          >
            +
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.2)); }} 
            className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded text-white font-bold text-sm transition-colors"
          >
            -
          </button>
        </div>

        {/* Tactical Overlays */}
        <div className="flex flex-col gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowWeather(!showWeather); }}
            className={`bg-black/80 backdrop-blur-md p-1.5 rounded border transition-all shadow-xl ${showWeather ? 'text-sentry-accent border-sentry-accent/50 bg-sentry-accent/10' : 'text-white border-white/10 hover:bg-white/5'}`}
            title="Weather Simulation"
          >
            <CloudRain className="w-3.5 h-3.5" />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setShowZones(!showZones); }}
            className={`bg-black/80 backdrop-blur-md p-1.5 rounded border transition-all shadow-xl ${showZones ? 'text-sentry-accent border-sentry-accent/50 bg-sentry-accent/10' : 'text-white border-white/10 hover:bg-white/5'}`}
            title="Surveillance Zones"
          >
            <Target className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); setShowRoutes(!showRoutes); }}
            className={`bg-black/80 backdrop-blur-md p-1.5 rounded border transition-all shadow-xl ${showRoutes ? 'text-sentry-accent border-sentry-accent/50 bg-sentry-accent/10' : 'text-white border-white/10 hover:bg-white/5'}`}
            title="Patrol Routes"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sector Status Overlay - Dynamic based on status */}
      <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-1">
        {SECTOR_DEFINITIONS.map(sector => (
          <div key={sector.id}>
            <SectorStatus 
              label={sector.id} 
              status={getSectorStatus(sector.id)} 
              onClick={() => setSelectedSector(sector.id)} 
            />
          </div>
        ))}
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
              <DetailRow label="Personnel" value={`${entities.filter(e => e.type === 'friendly').length} Active`} />
              <DetailRow label="Last Scan" value="Real-time" />
              <DetailRow label="Stability" value={entities.some(e => e.type === 'armed') ? 'CRITICAL' : 'STABLE'} />
              <DetailRow label="Threats" value={entities.filter(e => e.type !== 'friendly').length.toString()} />
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

      <div className="flex-1 relative overflow-hidden bg-black/40">
        {/* Scaling Container - Wraps everything to ensure zoom works */}
        <motion.div 
          animate={{ scale: zoom }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="absolute inset-0 origin-center flex items-center justify-center"
        >
          <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />
          
          <div className="relative w-full h-full">
            {/* Weather Simulation Overlay */}
            {showWeather && (
              <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/10" />
                {[...Array(50)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20, x: Math.random() * 100 + '%' }}
                    animate={{ y: 1000 }}
                    transition={{ duration: 0.4 + Math.random() * 0.6, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[1px] h-10 bg-blue-400/40"
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

            {/* Surveillance Zones - Color-coded by status */}
            {showZones && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {SECTOR_DEFINITIONS.map(sector => {
                  const status = getSectorStatus(sector.id);
                  return (
                    <g key={sector.id}>
                      <motion.polygon 
                        points={sector.points} 
                        initial={false}
                        animate={{ fill: getSectorColor(status) }}
                        stroke={status === 'alert' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.2)'} 
                        strokeWidth={status === 'alert' ? "1" : "0.5"}
                        className="transition-colors duration-500"
                      />
                      <text 
                        x={sector.points.split(' ')[0].split(',')[0]} 
                        y={sector.points.split(' ')[0].split(',')[1]} 
                        className="text-[3px] fill-white/50 font-mono font-black"
                      >
                        {sector.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Patrol Routes */}
            {showRoutes && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {PATROL_ROUTES.map(route => (
                  <polyline 
                    key={route.id}
                    points={route.path}
                    fill="none"
                    stroke={route.color}
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                ))}
              </svg>
            )}

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
            {alerts.filter(a => a.status === 'active').map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [1 / zoom, 1.2 / zoom, 1 / zoom], // Compensate for map zoom
                  opacity: 1 
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute cursor-pointer group/marker"
                style={{ 
                  top: `${35 + (i * 12) % 30}%`, 
                  left: `${25 + (i * 18) % 50}%` 
                }}
              >
                <div className={`w-4 h-4 rounded-full animate-ping absolute ${
                  alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                }`} />
                <div className={`w-4 h-4 rounded-full relative border-2 border-white/50 ${
                  alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                }`} />
                
                {/* Threat Label */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded border border-white/20 whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity z-50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black text-white uppercase tracking-tighter">{alert.severity} THREAT</span>
                    <span className="text-[7px] font-mono text-zinc-400 max-w-[120px] truncate">{alert.description}</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Tactical Entities (Personnel/Threats) */}
            {entities.map((entity) => (
              <motion.div
                key={entity.id}
                className="absolute"
                style={{ left: `${entity.x}%`, top: `${entity.y}%` }}
                animate={{ scale: 1 / zoom }} // Compensate for map zoom
              >
                <div className="relative group/entity">
                  <div className={`p-1 rounded-full border shadow-lg transition-all ${
                    entity.type === 'friendly' ? 'bg-blue-600/20 border-blue-500 text-blue-400' :
                    entity.type === 'armed' ? 'bg-red-600/20 border-red-500 text-red-500 animate-pulse' :
                    'bg-orange-600/20 border-orange-500 text-orange-400'
                  }`}>
                    {entity.type === 'friendly' ? <User className="w-3 h-3" /> :
                     entity.type === 'armed' ? <AlertTriangle className="w-3 h-3" /> :
                     <Target className="w-3 h-3" />}
                  </div>

                  {/* Entity Label */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1.5 rounded border border-white/10 whitespace-nowrap opacity-0 group-hover/entity:opacity-100 transition-opacity z-50 shadow-2xl">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[8px] font-black text-white uppercase tracking-wider">{entity.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[6px] font-bold px-1 rounded ${
                          entity.movementPattern === 'aggressive' ? 'bg-red-500/20 text-red-500' :
                          entity.movementPattern === 'stealthy' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-zinc-500/20 text-zinc-400'
                        }`}>
                          {entity.movementPattern?.toUpperCase()}
                        </span>
                        <span className="text-[6px] font-mono text-zinc-500">
                          {entity.detectedBy} {entity.hasId ? '| ID_VERIFIED' : '| NO_ID'}
                        </span>
                      </div>
                      {entity.visualCues && (
                        <div className="flex flex-wrap gap-1 justify-center max-w-[120px]">
                          {entity.visualCues.map(cue => (
                            <span key={cue} className="text-[5px] text-zinc-400 border border-white/5 px-1 rounded bg-white/5">
                              {cue}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detection Ring for Suspicious/Armed */}
                  {entity.type !== 'friendly' && (
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
                      entity.type === 'armed' ? 'bg-red-500' : 'bg-orange-500'
                    }`} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="p-4 border-t border-sentry-border bg-black/20 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <Navigation className="w-3 h-3 text-sentry-accent" />
            <span className="text-[10px] font-mono">LAT: {coords.lat.toFixed(4)}° {coords.lat >= 0 ? 'N' : 'S'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="w-3 h-3 text-sentry-accent" />
            <span className="text-[10px] font-mono">LONG: {coords.lng.toFixed(4)}° {coords.lng >= 0 ? 'E' : 'W'}</span>
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
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'logs' | 'personnel' | 'comms'>('feed');
  const [visionMode, setVisionMode] = useState<'normal' | 'thermal' | 'night'>('normal');
  const [showTacticalOverlay, setShowTacticalOverlay] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [weather, setWeather] = useState<WeatherInfo>({
    temp: 14,
    condition: 'Clear',
    humidity: 42,
    windSpeed: 12,
    visibility: '10km'
  });
  const [tacticalEntities, setTacticalEntities] = useState<TacticalEntity[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
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

  // Add Message Helper
  const sendMessage = (content: string, sender: string = 'OPERATOR', type: ChatMessage['type'] = 'user', isAuto: boolean = false) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      sender,
      content,
      type,
      isAutoGenerated: isAuto
    };
    setMessages(prev => [...prev, newMessage]);
    
    if (isSpeakerEnabled && isAuto && type !== 'system') {
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
    }

    // AI Unit Response Logic
    if (type === 'user' && !isAuto) {
      const lowerContent = content.toLowerCase();
      const keywords = ['alert', 'red', 'safe', 'suspicious', 'status', 'report'];
      const hasKeyword = keywords.some(k => lowerContent.includes(k));

      if (hasKeyword) {
        // Delay response for realism
        setTimeout(() => {
          const respondingUnit = personnel[Math.floor(Math.random() * personnel.length)];
          let responseText = '';

          if (lowerContent.includes('alert') || lowerContent.includes('red')) {
            responseText = `Copy that, Operator. This is ${respondingUnit.rank} ${respondingUnit.name}. Unit ${respondingUnit.id} is moving to high alert status. ${respondingUnit.location} is being locked down.`;
          } else if (lowerContent.includes('safe')) {
            responseText = `Acknowledged. ${respondingUnit.rank} ${respondingUnit.name} reporting ${respondingUnit.location} is secure. Continuing standard patrol.`;
          } else if (lowerContent.includes('suspicious')) {
            responseText = `Unit ${respondingUnit.id} here. ${respondingUnit.rank} ${respondingUnit.name} has visual on the suspicious activity. Engaging surveillance protocols.`;
          } else {
            responseText = `${respondingUnit.rank} ${respondingUnit.name} reporting in. Current status: ${respondingUnit.status.toUpperCase()} in ${respondingUnit.location}. All systems nominal.`;
          }

          const aiMessage: ChatMessage = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            sender: respondingUnit.name.toUpperCase(),
            content: responseText,
            type: 'unit',
            isAutoGenerated: true
          };
          setMessages(prev => [...prev, aiMessage]);

          if (isSpeakerEnabled) {
            const utterance = new SpeechSynthesisUtterance(responseText);
            window.speechSynthesis.speak(utterance);
          }
        }, 1500);
      }
    }
  };

  const shareLiveData = () => {
    const data = `TACTICAL BROADCAST: ${tacticalEntities.length} entities tracked. Status: ${systemStatus.toUpperCase()}. Weather: ${weather.temp}°C ${weather.condition}.`;
    sendMessage(data, 'SYSTEM', 'system');
    addLog('Tactical data broadcasted to all units.', 'success');
  };

  // Initialize camera
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real weather based on location
  useEffect(() => {
    if (!isLoggedIn) return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        addLog(`Location acquired: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`, 'info');
        const weatherData = await fetchWeather(latitude, longitude);
        setWeather(weatherData);
        addLog(`Weather updated for current location: ${weatherData.temp}°C, ${weatherData.condition}`, 'success');
      }, (error) => {
        console.error("Geolocation error:", error);
        addLog('Failed to acquire location. Using default weather data.', 'warning');
      });
    }
  }, [isLoggedIn]);

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

  // Tactical Entity Simulation
  useEffect(() => {
    if (!isLoggedIn || !isMonitoring) return;

    // Initial entities
    const initialEntities: TacticalEntity[] = [
      { 
        id: 'F01', 
        type: 'friendly', 
        x: 30, 
        y: 40, 
        label: 'UNIT_ALPHA', 
        hasId: true, 
        detectedBy: 'GPS',
        movementPattern: 'steady',
        visualCues: ['Standard Uniform', 'Authorized Gear']
      },
      { 
        id: 'F02', 
        type: 'friendly', 
        x: 60, 
        y: 20, 
        label: 'UNIT_BRAVO', 
        hasId: true, 
        detectedBy: 'GPS',
        movementPattern: 'steady',
        visualCues: ['Standard Uniform', 'Authorized Gear']
      },
      { 
        id: 'S01', 
        type: 'suspicious', 
        x: 10, 
        y: 10, 
        label: 'UNKNOWN_01', 
        hasId: false, 
        detectedBy: 'AI_VISION',
        movementPattern: 'stealthy',
        visualCues: ['Dark Clothing', 'Face Masked']
      },
    ];
    setTacticalEntities(initialEntities);

    const interval = setInterval(() => {
      setTacticalEntities(prev => prev.map(entity => {
        // Move entities based on pattern
        let speed = 0.2;
        let randomness = 0.5;

        if (entity.movementPattern === 'stealthy') {
          speed = 0.05;
          randomness = 0.2;
        } else if (entity.movementPattern === 'erratic') {
          speed = 0.4;
          randomness = 0.8;
        } else if (entity.movementPattern === 'aggressive') {
          speed = 0.6;
          randomness = 0.3;
        }

        const dx = (Math.random() - randomness) * speed;
        const dy = (Math.random() - randomness) * speed;
        
        return {
          ...entity,
          x: Math.max(0, Math.min(100, entity.x + dx)),
          y: Math.max(0, Math.min(100, entity.y + dy))
        };
      }));

      // Randomly spawn a new suspicious/armed person
      if (Math.random() > 0.98) {
        const isArmed = Math.random() > 0.7;
        const pattern = isArmed ? 'aggressive' : (Math.random() > 0.5 ? 'stealthy' : 'erratic');
        
        const cues = isArmed 
          ? ['Weapon Visible', 'Tactical Vest', 'Rapid Movement'] 
          : ['Unidentified Gear', 'Avoiding Cameras', 'Loitering'];

        const newEntity: TacticalEntity = {
          id: 'T' + Math.random().toString(36).substr(2, 4),
          type: isArmed ? 'armed' : 'suspicious',
          x: Math.random() * 100,
          y: Math.random() * 100,
          label: isArmed ? 'ARMED_THREAT' : 'SUSPICIOUS_PERSON',
          hasId: false,
          detectedBy: 'AI_VISION',
          movementPattern: pattern,
          visualCues: cues
        };
        
        setTacticalEntities(prev => [...prev, newEntity]);
        
        // Add alert for suspicious/armed
        const sector = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
        const newAlert: Alert = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          type: isArmed ? 'Armed Personnel' : 'Suspicious Movement',
          description: `${isArmed ? 'Armed individual' : 'Unidentified person'} detected in Sector ${sector}. ` +
                       `Movement: ${pattern}. Cues: ${cues.join(', ')}. No military ID detected.`,
          severity: isArmed ? 'critical' : 'high',
          status: 'active'
        };
        setAlerts(prev => [newAlert, ...prev]);
        addLog(`AI VISION: ${newAlert.description}`, isArmed ? 'error' : 'warning');
        setSystemStatus(isArmed ? 'critical' : 'high');
        setLastDetection(newAlert.description);

        // Automatic message to all units
        sendMessage(`ALERT: ${newAlert.description}. All units in Sector ${sector} move to intercept.`, 'COMMAND_AI', 'system', true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoggedIn, isMonitoring]);

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
            const result = await analyzeFrame(base64Image, visionMode);
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
              
              // Automatic message to all units
              sendMessage(`CRITICAL: ${result.description}. Immediate response required.`, 'SENTRY_AI', 'system', true);

              // Add to tactical entities
              const isArmed = result.threatLevel === 'critical' || result.detectedObjects.some(o => o.toLowerCase().includes('weapon'));
              const newEntity: TacticalEntity = {
                id: 'AI_' + Math.random().toString(36).substr(2, 4),
                type: isArmed ? 'armed' : 'suspicious',
                x: 30 + (Math.random() * 40), 
                y: 30 + (Math.random() * 40),
                label: isArmed ? 'AI_ARMED_THREAT' : 'AI_SUSPICIOUS_PERSON',
                hasId: false,
                detectedBy: 'AI_VISION',
                movementPattern: result.movementPattern,
                visualCues: result.visualCues,
                temperature: result.temperature || (36.4 + Math.random() * 2.2)
              };
              setTacticalEntities(prev => {
                const filtered = prev.filter(e => e.detectedBy !== 'AI_VISION' || (Date.now() - (e as any)._timestamp < 30000));
                const aiEntities = filtered.filter(e => e.detectedBy === 'AI_VISION');
                if (aiEntities.length >= 3) {
                  const firstAiIndex = filtered.findIndex(e => e.detectedBy === 'AI_VISION');
                  if (firstAiIndex !== -1) filtered.splice(firstAiIndex, 1);
                }
                return [...filtered, { ...newEntity, _timestamp: Date.now() } as any];
              });
            } else {
              setSystemStatus('nominal');
            }
          }
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, isAiProcessing, isLoggedIn]);

  const [coords, setCoords] = useState({ lat: 32.7266, lng: 74.8570 });

  // Get real location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          addLog('GPS signal locked. Coordinates synchronized.', 'info');
        },
        (error) => {
          console.error("Geolocation error:", error);
          addLog('GPS signal weak. Using fallback coordinates.', 'warning');
        }
      );
    }
  }, []);

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
          <NavItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            active={activeTab === 'comms'} 
            onClick={() => setActiveTab('comms')}
            label="Comms"
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
              VISION SENTRY <span className="text-xs font-mono text-sentry-accent px-2 py-0.5 border border-sentry-accent/30 rounded">BETA v2.4</span>
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
            <div 
              onClick={() => setIsSpeakerEnabled(!isSpeakerEnabled)}
              className={`w-10 h-10 rounded-full flex items-center justify-center border cursor-pointer transition-all ${
                isSpeakerEnabled ? 'bg-sentry-accent/10 border-sentry-accent/20 text-sentry-accent' : 'bg-zinc-800 border-white/5 text-zinc-500'
              }`}
            >
              {isSpeakerEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </div>
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
                  {/* Persistent Video/Canvas for AI Processing */}
                  <div className={activeTab === 'feed' ? 'w-full h-full' : 'hidden'}>
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

                    {/* Tactical Overlay (Dynamic Bounding Boxes) */}
                    {showTacticalOverlay && (
                      <div className="absolute inset-0 pointer-events-none">
                        {tacticalEntities.filter(e => e.detectedBy === 'AI_VISION').map(entity => (
                          <motion.div 
                            key={entity.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`absolute border-2 transition-colors duration-500 ${
                              visionMode === 'thermal' ? 'border-white' : 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                            }`}
                            style={{ 
                              top: `${entity.y}%`, 
                              left: `${entity.x}%`, 
                              width: '15%', 
                              height: '25%',
                              transform: 'translate(-50%, -50%)'
                            }}
                          >
                            <div className={`absolute -top-6 left-0 ${
                              visionMode === 'thermal' ? 'text-white font-bold' : 'bg-red-500 text-white'
                            } text-[10px] font-black px-1.5 py-0.5 uppercase flex items-center gap-1`}>
                              {visionMode === 'thermal' ? (
                                <span className="drop-shadow-md">{entity.temperature?.toFixed(1)} °C</span>
                              ) : (
                                <>
                                  <Target className="w-2.5 h-2.5" />
                                  {entity.label}
                                </>
                              )}
                            </div>
                            {visionMode !== 'thermal' && (
                              <div className="absolute -bottom-6 right-0 text-red-500 text-[8px] font-mono font-bold">
                                CONF: {(90 + Math.random() * 9).toFixed(1)}%
                              </div>
                            )}
                            {/* Corner brackets */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {activeTab === 'map' ? (
                    <LiveMap alerts={alerts} coords={coords} entities={tacticalEntities} />
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
                  ) : activeTab === 'comms' ? (
                    <CommsCenter 
                      messages={messages} 
                      onSendMessage={(content) => sendMessage(content)} 
                      onShareData={shareLiveData}
                      isRecording={isRecording}
                      setIsRecording={setIsRecording}
                      currentTime={currentTime}
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 p-6 overflow-y-auto custom-scrollbar">
                      <h2 className="text-xl font-black text-white tracking-widest uppercase mb-6 flex items-center gap-3">
                        <Users className="w-6 h-6 text-sentry-accent" />
                        Personnel Deployment
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Static Personnel */}
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
                        {/* Real-time Tactical Units */}
                        {tacticalEntities.filter(e => e.type === 'friendly').map(e => (
                          <div key={e.id} className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                              <User className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">{e.label}</h3>
                              <p className="text-[10px] font-mono text-zinc-500 uppercase">Tactical Unit | GPS Active</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-sentry-success animate-pulse" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-sentry-success">In Field</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Common HUD Elements */}
                  {activeTab !== 'comms' && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 z-50">
                      <span className="text-xs font-mono text-white">
                        {currentTime.toLocaleTimeString()} | {currentTime.toLocaleDateString()}
                      </span>
                    </div>
                  )}

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
                <div className="p-3 border-b border-sentry-border bg-black/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-sentry-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Tactical Comms</span>
                  </div>
                  <button 
                    onClick={() => setActiveTab('comms')}
                    className="text-[8px] font-bold text-sentry-accent hover:underline uppercase"
                  >
                    Open Center
                  </button>
                </div>
                <div className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar">
                  {messages.length === 0 ? (
                    <p className="text-[9px] text-zinc-600 text-center mt-4">No recent transmissions</p>
                  ) : (
                    messages.slice(-5).map(msg => (
                      <div key={msg.id}>
                        <CommsMessage 
                          user={msg.sender} 
                          text={msg.content} 
                          time={msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                        />
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-sentry-border bg-black/20">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.target as any).elements.msg;
                    if (input.value.trim()) {
                      sendMessage(input.value);
                      input.value = '';
                    }
                  }}>
                    <input 
                      name="msg"
                      type="text" 
                      placeholder="Send message..." 
                      className="w-full bg-zinc-900 border border-white/5 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-sentry-accent"
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats Row */}
          <div className="h-24 flex gap-4">
            <StatCard label="UPTIME" value="142:12:05" icon={<Activity className="w-4 h-4" />} />
            <StatCard 
              label="THREATS DETECTED" 
              value={tacticalEntities.filter(e => e.type !== 'friendly').length.toString()} 
              icon={<Shield className="w-4 h-4" />} 
              trend={tacticalEntities.some(e => e.type === 'armed') ? 'critical' : undefined}
            />
            <StatCard label="RANGE SCAN" value="50 KM" icon={<Navigation className="w-4 h-4" />} />
            <StatCard label="OPERATOR" value="OFFICER_58" icon={<User className="w-4 h-4" />} />
            <StatCard label="AI DIAGNOSTICS" value="OPTIMAL" icon={<Cpu className="w-4 h-4" />} />
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Comms Center Component ---
function CommsCenter({ 
  messages, 
  onSendMessage, 
  onShareData, 
  isRecording, 
  setIsRecording,
  currentTime
}: { 
  messages: ChatMessage[], 
  onSendMessage: (content: string) => void, 
  onShareData: () => void,
  isRecording: boolean,
  setIsRecording: (val: boolean) => void,
  currentTime: Date
}) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-sentry-accent" />
          Comms Center
        </h2>
        <div className="flex gap-3 items-center">
          <div className="bg-black/40 px-3 py-1.5 rounded border border-white/10 mr-2">
            <span className="text-[10px] font-mono text-white">
              {currentTime.toLocaleTimeString()} | {currentTime.toLocaleDateString()}
            </span>
          </div>
          <button 
            onClick={onShareData}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors text-blue-400"
          >
            <Share2 className="w-3.5 h-3.5" />
            Broadcast Tactical Data
          </button>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
            <Radio className="w-12 h-12 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Secure Channel Active</p>
            <p className="text-[10px] mt-1">Waiting for transmission...</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className={`text-[9px] font-black uppercase tracking-widest ${
                msg.type === 'user' ? 'text-blue-400' : msg.type === 'unit' ? 'text-emerald-400' : 'text-red-400'
              }`}>{msg.sender}</span>
              <span className="text-[8px] font-mono text-zinc-600">{msg.timestamp.toLocaleTimeString()}</span>
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.type === 'user' 
                ? 'bg-sentry-accent text-white rounded-tr-none' 
                : msg.type === 'system' 
                  ? 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-none'
                  : 'bg-zinc-800 text-zinc-300 rounded-tl-none border border-white/5'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-black/40 border-t border-white/5 flex gap-3">
        <button 
          type="button"
          onClick={toggleRecording}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border ${
            isRecording 
              ? 'bg-red-600 border-red-500 animate-pulse text-white' 
              : 'bg-zinc-800 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRecording ? "Listening..." : "Enter message to all units..."}
          className="flex-1 bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sentry-accent/50 transition-all"
        />
        <button 
          type="submit"
          className="w-12 h-12 bg-sentry-accent hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-600/20"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </form>
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

function StatCard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend?: 'critical' }) {
  return (
    <div className={`flex-1 bg-sentry-panel rounded-xl border p-4 flex flex-col justify-between group transition-all ${
      trend === 'critical' ? 'border-red-500/50 bg-red-500/5' : 'border-sentry-border hover:border-sentry-accent/50'
    }`}>
      <div className={`flex items-center justify-between transition-colors ${
        trend === 'critical' ? 'text-red-500' : 'text-zinc-500 group-hover:text-sentry-accent'
      }`}>
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-xl font-mono font-bold truncate ${trend === 'critical' ? 'text-red-500' : 'text-white'}`}>{value}</span>
        {trend === 'critical' && (
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping mb-1" />
        )}
      </div>
    </div>
  );
}
