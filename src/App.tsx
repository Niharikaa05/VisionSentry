/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
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
  Zap,
  Gamepad2,
  X,
  Video,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Clock,
  Phone,
  Trash2
} from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Alert, AlertSeverity, SystemLog, Personnel, WeatherInfo, TacticalEntity, ChatMessage } from './types';
import { analyzeFrame } from './services/aiService';
import { fetchWeather } from './services/weatherService';

// Fix for default marker icons in Leaflet
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// --- Error Boundary ---
class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, error: null };
  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-zinc-900 border border-red-500/20 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">System Critical Error</h2>
            <p className="text-zinc-400 text-sm mb-6">The surveillance terminal encountered an unrecoverable error. Please restart the system.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-500 transition-colors"
            >
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

// --- Login Component ---
function Login({ onLogin }: { onLogin: (name: string) => void }) {
  const [systemId, setSystemId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setError('');
    
    // Simulate a small delay for "system verification"
    setTimeout(() => {
      if (systemId && password) {
        onLogin(systemId);
      } else {
        setError('INVALID_CREDENTIALS: ACCESS_DENIED');
        setIsConnecting(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0b] relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-overlay opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] z-10 p-4"
      >
        <div className="bg-[#111114] border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent shrink-0">
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
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Terminal Status: Ready
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                <span className="text-blue-500 font-bold uppercase tracking-widest mr-2">Notice:</span> 
                Access to this terminal is restricted to authorized personnel only. All activities are monitored and logged.
              </p>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Protocol Step 01</p>
                <p className="text-xs text-white font-medium">Operator Terminal Access</p>
              </div>
              <form onSubmit={handleManualLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">System ID</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="text"
                      value={systemId}
                      onChange={(e) => setSystemId(e.target.value)}
                      placeholder="OPERATOR_ID"
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Access Key</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 overflow-hidden"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isConnecting}
                  className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-blue-600/20"
                >
                  {isConnecting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Wifi className="w-4 h-4" />
                      Establish Connection
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Secure Server Online</span>
              </div>
              <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Region: ASIA-EAST-1</span>
            </div>
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
const PATROL_ROUTES = [
  { id: 'R1', name: 'Route 01', path: '10,10 30,20 50,10 70,20 90,10', color: 'rgba(255, 255, 255, 0.2)' },
  { id: 'R2', name: 'Route 02', path: '10,90 30,70 50,90 70,70 90,90', color: 'rgba(255, 255, 255, 0.2)' },
];

// --- Live Map Component ---
function ControlButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded border text-[10px] font-black transition-all ${
        active 
          ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
          : 'bg-black/60 border-white/10 text-zinc-500 hover:text-white hover:border-white/30'
      }`}
    >
      {label}
    </button>
  );
}

function MapUpdater({ coords }: { coords: { lat: number, lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([coords.lat, coords.lng], map.getZoom());
  }, [coords, map]);
  return null;
}

function LiveMap({ alerts, coords, entities, setAlerts, setSystemLogs, socket, selectedSector, setSelectedSector, setActiveCamera }: { 
  alerts: Alert[], 
  coords: { lat: number, lng: number }, 
  entities: TacticalEntity[],
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>,
  setSystemLogs: React.Dispatch<React.SetStateAction<SystemLog[]>>,
  socket: Socket | null,
  selectedSector: string | null,
  setSelectedSector: (id: string | null) => void,
  setActiveCamera: (id: string) => void
}) {
  const [layer, setLayer] = useState<'satellite' | 'topo' | 'heat'>('satellite');
  const [zoom, setZoom] = useState(13);
  const [dronePos, setDronePos] = useState({ x: 20, y: 20 });
  const [droneHeading, setDroneHeading] = useState(45);
  const [isManualControl, setIsManualControl] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [pings, setPings] = useState<{ id: string, lat: number, lng: number }[]>([]);

  const offsetCoords = (base: { lat: number, lng: number }, x: number, y: number) => {
    const latOffset = (y - 50) * 0.0004;
    const lngOffset = (x - 50) * 0.0004;
    return [base.lat - latOffset, base.lng + lngOffset] as [number, number];
  };

  const sectors = [
    { id: 'ALPHA', name: 'Sector Alpha', pos: { x: 30, y: 40 }, status: 'active', details: 'Primary observation post. High visibility. Automated sentry active.' },
    { id: 'BRAVO', name: 'Sector Bravo', pos: { x: 60, y: 30 }, status: 'active', details: 'Secondary patrol zone. Dense vegetation. Thermal sensors deployed.' },
    { id: 'ECHO', name: 'Sector Echo', pos: { x: 45, y: 65 }, status: 'warning', details: 'Restricted access zone. High risk of infiltration. Motion sensors triggered.' },
    { id: 'DELTA', name: 'Sector Delta', pos: { x: 75, y: 70 }, status: 'active', details: 'Logistics hub. Secure perimeter. 24/7 drone surveillance.' },
  ];

  useEffect(() => {
    const handleRemotePing = (e: any) => {
      const data = e.detail;
      const id = Math.random().toString(36).substr(2, 9);
      const [lat, lng] = offsetCoords(coords, data.x, data.y);
      setPings(prev => [...prev, { id, lat, lng }]);
      setTimeout(() => {
        setPings(prev => prev.filter(p => p.id !== id));
      }, 2000);
    };

    window.addEventListener('remote-ping', handleRemotePing);
    return () => window.removeEventListener('remote-ping', handleRemotePing);
  }, [coords]);

  const [droneTrail, setDroneTrail] = useState<[number, number][]>([]);
  const [showWeather, setShowWeather] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showDroneDetails, setShowDroneDetails] = useState(false);

  // Drone movement simulation
  useEffect(() => {
    if (isManualControl) return;
    
    const interval = setInterval(() => {
      setDronePos(prev => {
        const newPos = {
          x: (prev.x + 0.1) % 100,
          y: (prev.y + 0.05) % 100
        };
        const realPos = offsetCoords(coords, newPos.x, newPos.y);
        setDroneTrail(trail => [...trail.slice(-20), realPos]);
        return newPos;
      });
      setDroneHeading(prev => (prev + 0.5) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, [isManualControl, coords]);

  const moveDrone = (direction: 'w' | 'a' | 's' | 'd') => {
    const step = 1.5;
    
    setDronePos(prev => {
      let newX = prev.x;
      let newY = prev.y;
      let newHeading = droneHeading;

      if (direction === 'w') {
        newX += Math.cos((droneHeading - 90) * (Math.PI / 180)) * step;
        newY += Math.sin((droneHeading - 90) * (Math.PI / 180)) * step;
      }
      if (direction === 's') {
        newX -= Math.cos((droneHeading - 90) * (Math.PI / 180)) * step;
        newY -= Math.sin((droneHeading - 90) * (Math.PI / 180)) * step;
      }
      if (direction === 'a') {
        newHeading = (newHeading - 10 + 360) % 360;
      }
      if (direction === 'd') {
        newHeading = (newHeading + 10) % 360;
      }

      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));

      setDroneHeading(newHeading);
      const realPos = offsetCoords(coords, newX, newY);
      setDroneTrail(trail => [...trail.slice(-20), realPos]);
      return { x: newX, y: newY };
    });
  };

  // Manual Control Handler
  useEffect(() => {
    if (!isManualControl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setActiveKeys(prev => new Set(prev).add(key));
        moveDrone(key as 'w' | 'a' | 's' | 'd');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isManualControl, droneHeading]);

  const tileUrl = layer === 'satellite' 
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = layer === 'satellite'
    ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="w-full h-full bg-zinc-900 rounded-xl border border-sentry-border relative overflow-hidden flex flex-col">
      {/* Map Controls */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 pointer-events-auto">
        <div className="bg-black/80 backdrop-blur-md p-1 rounded-lg border border-white/10 flex flex-col gap-1 shadow-xl">
          <MapControlButton active={layer === 'satellite'} onClick={() => setLayer('satellite')} label="SAT" />
          <MapControlButton active={layer === 'topo'} onClick={() => setLayer('topo')} label="MAP" />
        </div>

        <div className="flex flex-col gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowWeather(!showWeather); }}
            className={`bg-black/80 backdrop-blur-md p-1.5 rounded-lg border transition-all shadow-xl ${showWeather ? 'text-sentry-accent border-sentry-accent/50 bg-sentry-accent/10' : 'text-white border-white/10 hover:bg-white/5'}`}
            title="Weather Simulation"
          >
            <CloudRain className="w-3.5 h-3.5" />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setShowZones(!showZones); }}
            className={`bg-black/80 backdrop-blur-md p-1.5 rounded-lg border transition-all shadow-xl ${showZones ? 'text-sentry-accent border-sentry-accent/50 bg-sentry-accent/10' : 'text-white border-white/10 hover:bg-white/5'}`}
            title="Surveillance Zones"
          >
            <Target className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); setShowRoutes(!showRoutes); }}
            className={`bg-black/80 backdrop-blur-md p-1.5 rounded-lg border transition-all shadow-xl ${showRoutes ? 'text-sentry-accent border-sentry-accent/50 bg-sentry-accent/10' : 'text-white border-white/10 hover:bg-white/5'}`}
            title="Patrol Routes"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); setIsManualControl(!isManualControl); }}
            className={`bg-black/80 backdrop-blur-md p-1.5 rounded-lg border transition-all shadow-xl ${isManualControl ? 'text-orange-500 border-orange-500/50 bg-orange-500/10' : 'text-white border-white/10 hover:bg-white/5'}`}
            title="Manual Drone Control"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Manual Control HUD */}
      {isManualControl && (
        <div className="absolute bottom-4 left-16 z-[1000] bg-black/90 backdrop-blur-md p-3 rounded-xl border border-orange-500/30 flex flex-col gap-2 shadow-2xl">
          <div className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Manual Pilot Mode</span>
            </div>
            <button onClick={() => setIsManualControl(false)} className="text-zinc-500 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div />
            <ControlButton label="W" active={activeKeys.has('w')} onClick={() => moveDrone('w')} />
            <div />
            <ControlButton label="A" active={activeKeys.has('a')} onClick={() => moveDrone('a')} />
            <ControlButton label="S" active={activeKeys.has('s')} onClick={() => moveDrone('s')} />
            <ControlButton label="D" active={activeKeys.has('d')} onClick={() => moveDrone('d')} />
          </div>
        </div>
      )}

      {/* Real Map Container */}
      <div className="flex-1 relative">
        <MapContainer 
          center={[coords.lat, coords.lng]} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%', background: '#09090b' }}
          zoomControl={false}
        >
          <MapUpdater coords={coords} />
          <TileLayer url={tileUrl} attribution={attribution} />
          
          {/* Weather Simulation Overlay (CSS based) */}
          {showWeather && (
            <div className="absolute inset-0 z-[400] pointer-events-none overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, x: Math.random() * 100 + '%' }}
                  animate={{ y: 1000 }}
                  transition={{ duration: 0.4 + Math.random() * 0.6, repeat: Infinity, ease: "linear" }}
                  className="absolute w-[1px] h-10 bg-blue-400/30"
                />
              ))}
            </div>
          )}

          {/* Sectors as Circles/Markers */}
          {sectors.map(sector => {
            const pos = offsetCoords(coords, sector.pos.x, sector.pos.y);
            return (
              <React.Fragment key={sector.id}>
                {showZones && (
                  <Circle 
                    center={pos}
                    radius={300}
                    pathOptions={{ 
                      color: sector.status === 'warning' ? '#f59e0b' : '#10b981',
                      fillColor: sector.status === 'warning' ? '#f59e0b' : '#10b981',
                      fillOpacity: 0.1,
                      weight: 1,
                      dashArray: '5, 5'
                    }}
                  />
                )}
                <Marker 
                  position={pos}
                  eventHandlers={{
                    click: () => {
                      setSelectedSector(sector.id);
                      setActiveCamera(sector.id);
                    }
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[150px]">
                      <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest mb-1">{sector.name}</h3>
                      <p className="text-[10px] text-zinc-600 leading-tight">{sector.details}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${sector.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{sector.status}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

          {/* Patrol Routes as Polylines */}
          {showRoutes && PATROL_ROUTES.map(route => {
            const positions = route.path.split(' ').map(p => {
              const [x, y] = p.split(',').map(Number);
              return offsetCoords(coords, x, y);
            });
            return (
              <Polyline 
                key={route.id}
                positions={positions}
                pathOptions={{ color: 'white', weight: 1, dashArray: '5, 10', opacity: 0.3 }}
              />
            );
          })}

          {/* Drone Trail */}
          <Polyline 
            positions={droneTrail}
            pathOptions={{ color: '#f97316', weight: 2, opacity: 0.5 }}
          />

          {/* Drone Marker */}
          <Marker 
            position={offsetCoords(coords, dronePos.x, dronePos.y)}
            icon={L.divIcon({
              className: 'drone-marker',
              html: `<div style="transform: rotate(${droneHeading}deg); color: #f97316; filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.6));">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                      </svg>
                    </div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })}
          />

          {/* Pings */}
          {pings.map(ping => (
            <Circle 
              key={ping.id}
              center={[ping.lat, ping.lng]}
              radius={100}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.4, weight: 1 }}
            />
          ))}

          {/* Entities */}
          {entities.map(entity => {
            const pos = offsetCoords(coords, entity.x, entity.y);
            const color = entity.type === 'friendly' ? '#3b82f6' : entity.type === 'armed' ? '#ef4444' : '#f59e0b';
            return (
              <Marker 
                key={entity.id}
                position={pos}
                icon={L.divIcon({
                  className: 'entity-marker',
                  html: `<div class="w-4 h-4 rounded-full border-2 shadow-lg animate-pulse" style="border-color: ${color}; background-color: ${color}33;"></div>`,
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })}
              >
                <Popup>
                  <div className="p-2 min-w-[120px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{entity.type}</span>
                      <span className="text-[8px] font-mono text-zinc-400">{entity.id}</span>
                    </div>
                    <p className="text-[11px] font-bold text-zinc-900 mb-1">{entity.label}</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[9px]">
                        <span className="text-zinc-500">Source:</span>
                        <span className="font-mono">{entity.detectedBy}</span>
                      </div>
                      {entity.movementPattern && (
                        <div className="flex justify-between text-[9px]">
                          <span className="text-zinc-500">Pattern:</span>
                          <span className="font-mono uppercase">{entity.movementPattern}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Radar Sweep Overlay (Visual only) */}
        <div className="absolute inset-0 z-[500] pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] origin-center"
            style={{ background: 'conic-gradient(from 0deg, rgba(59, 130, 246, 0.05) 0deg, transparent 60deg)' }}
          />
        </div>
      </div>

      <div className="p-3 border-t border-sentry-border bg-black/40 flex justify-between items-center">
        <div className="flex gap-6">
          <div className="flex items-center gap-2.5">
            <Navigation className="w-3.5 h-3.5 text-sentry-accent flex-shrink-0" />
            <span className="text-[10px] font-mono text-white/90 tracking-tight">LAT: {coords.lat.toFixed(4)}° {coords.lat >= 0 ? 'N' : 'S'}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Navigation className="w-3.5 h-3.5 text-sentry-accent flex-shrink-0" />
            <span className="text-[10px] font-mono text-white/90 tracking-tight">LONG: {coords.lng.toFixed(4)}° {coords.lng >= 0 ? 'E' : 'W'}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <Activity className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
            <span className="text-[10px] font-mono text-zinc-400">WIND: 12km/h NW</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-sentry-success animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-mono text-sentry-success font-bold">GPS: LOCKED</span>
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

function SectorStatus({ label, status, onClick }: { label: string, status: 'secure' | 'warning' | 'alert', onClick: (e: React.MouseEvent) => void }) {
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

function MapControlButton({ active, onClick, label }: { active: boolean, onClick: (e: React.MouseEvent) => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-1.5 py-0.5 rounded text-[8px] font-black transition-all ${
        active ? 'bg-sentry-accent text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );
}

// --- Main App Component ---
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [operatorName, setOperatorName] = useState('OPERATOR_01');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [startTime] = useState(Date.now());
  const [uptime, setUptime] = useState('00:00:00');
  const [showAlerts, setShowAlerts] = useState(false);
  const [generatingClip, setGeneratingClip] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeCamera, setActiveCamera] = useState('ALPHA');
  const [selectedSector, setSelectedSector] = useState<string | null>('ALPHA');
  const [isEditingOperator, setIsEditingOperator] = useState(false);
  const [scanInterval, setScanInterval] = useState(10000); // Default to 10s for stability
  const [hasProfessionalKey, setHasProfessionalKey] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('sentry_alerts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter alerts older than 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return parsed.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        })).filter((a: any) => a.timestamp > oneWeekAgo);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('sentry_alerts', JSON.stringify(alerts));
  }, [alerts]);
  const [alertFilter, setAlertFilter] = useState<'all' | AlertSeverity>('all');
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'nominal' | 'low' | 'medium' | 'high' | 'critical'>('nominal');
  const [lastDetection, setLastDetection] = useState<string | null>(null);
  const [lastDetectionConfidence, setLastDetectionConfidence] = useState<number | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'map' | 'logs' | 'personnel' | 'comms' | 'history'>('feed');
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
  const [coords, setCoords] = useState({ lat: 34.22, lng: 77.58 }); // Default to Leh, Ladakh
  const [threatCounts, setThreatCounts] = useState({ low: 0, medium: 0, high: 0, critical: 0 });

  const handleManualLogin = (name: string) => {
    setOperatorName(name);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleConnectKey = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        setHasProfessionalKey(true);
        addLog("PROFESSIONAL API KEY CONNECTED: QUOTA LIMITS EXTENDED", "success");
      } else {
        addLog("KEY_PICKER_UNAVAILABLE: PLATFORM RESTRICTION", "error");
      }
    } catch (err) {
      console.error("Key selection error:", err);
    }
  };

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    newSocket.on('ping', (data) => {
      window.dispatchEvent(new CustomEvent('remote-ping', { detail: data }));
    });

    newSocket.on('alert', (data) => {
      const alertWithDate = {
        ...data,
        timestamp: data.timestamp instanceof Date ? data.timestamp : new Date(data.timestamp)
      };
      setAlerts(prev => [alertWithDate, ...prev]);
      setSystemLogs(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        event: `REMOTE_ALERT: ${data.description}`,
        type: 'warning'
      }, ...prev]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const generateSatelliteClip = async (alertId: string) => {
    setGeneratingClip(alertId);
    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 3000));
    setGeneratingClip(null);
    // In a real app, this would trigger a notification or open a modal
    setSystemLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      event: `SATELLITE_CLIP_GENERATED_FOR_ALERT_${alertId.slice(0, 4)}`,
      type: 'success'
    }, ...prev]);
  };
  
  // Uptime Counter
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - startTime;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setUptime(`${hours.toString().padStart(3, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [personnel, setPersonnel] = useState<Personnel[]>([
    { id: 'IA-2944-X', name: 'Vikram Singh', rank: 'Major', status: 'ACTIVE', clearance: 'LEVEL_5', lastSeen: 'Sector A' },
    { id: 'IA-8812-B', name: 'Ananya Rao', rank: 'Captain', status: 'DEPLOYED', clearance: 'LEVEL_4', lastSeen: 'Sector B' },
    { id: 'IA-1102-S', name: 'Rajesh Kumar', rank: 'Subedar', status: 'ACTIVE', clearance: 'LEVEL_3', lastSeen: 'Sector C' },
    { id: 'IA-5567-L', name: 'Priya Sharma', rank: 'Lieutenant', status: 'OFF_DUTY', clearance: 'LEVEL_3', lastSeen: 'Base' },
  ]);

  // Add Log Helper
  const addLog = (event: string, type: SystemLog['type'] = 'info') => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      event,
      type
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

  // Add Message Helper
  const sendMessage = (content: string, sender: string = 'OPERATOR', type: ChatMessage['type'] = 'user', isAuto: boolean = false, imageUrl?: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      sender,
      content,
      type,
      isAutoGenerated: isAuto,
      imageUrl
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
            responseText = `Copy that, Operator. This is ${respondingUnit.rank} ${respondingUnit.name}. Unit ${respondingUnit.id} is moving to high alert status. ${respondingUnit.lastSeen || 'Current sector'} is being locked down.`;
          } else if (lowerContent.includes('safe')) {
            responseText = `Acknowledged. ${respondingUnit.rank} ${respondingUnit.name} reporting ${respondingUnit.lastSeen || 'current sector'} is secure. Continuing standard patrol.`;
          } else if (lowerContent.includes('suspicious')) {
            responseText = `Unit ${respondingUnit.id} here. ${respondingUnit.rank} ${respondingUnit.name} has visual on the suspicious activity. Engaging surveillance protocols.`;
          } else {
            responseText = `${respondingUnit.rank} ${respondingUnit.name} reporting in. Current status: ${respondingUnit.status.toUpperCase()} in ${respondingUnit.lastSeen || 'assigned sector'}. All systems nominal.`;
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
          // Explicitly call play to avoid "Failed to load" issues
          videoRef.current.play().catch(e => console.error("Video play error:", e));
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

    const interval = setInterval(async () => {
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
    }, 2000);

    return () => clearInterval(interval);
  }, [isLoggedIn, isMonitoring]);

  // Play Alert Audio (TTS)
  const playAlertAudio = async (text: string) => {
    if (!isSpeakerEnabled) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Announce urgently: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.play();
      }
    } catch (error) {
      console.error('TTS Error:', error);
    }
  };

  // Monitoring Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMonitoring && isLoggedIn) {
      interval = setInterval(async () => {
        if (videoRef.current && canvasRef.current && !isAiProcessing) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          if (video.videoWidth === 0) return;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Flip the frame horizontally to fix "mirror version"
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0);
            
            // Reset transformation for any subsequent drawing if needed
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            const base64Image = canvas.toDataURL('image/jpeg', 0.8);
            
            setIsAiProcessing(true);
            try {
              const result = await analyzeFrame(base64Image, visionMode, activeCamera);
              setIsAiProcessing(false);

              // Update Tactical Entities from AI detection (always, even if not suspicious)
              if (result.detectedObjects && result.detectedObjects.length > 0) {
                const newEntities: TacticalEntity[] = result.detectedObjects.map(obj => ({
                  id: 'AI_' + Math.random().toString(36).substr(2, 4),
                  type: obj.type || 'suspicious',
                  x: obj.x,
                  y: obj.y,
                  label: obj.label || 'AI_DETECTION',
                  hasId: false,
                  detectedBy: 'AI_VISION',
                  movementPattern: result.movementPattern,
                  visualCues: result.visualCues,
                  temperature: result.temperature || (36.4 + Math.random() * 2.2),
                  confidence: obj.confidence || (90 + Math.random() * 9)
                }));

                setTacticalEntities(prev => {
                  const filtered = prev.filter(e => e.detectedBy !== 'AI_VISION');
                  return [...filtered, ...newEntities].slice(-20);
                });
              }

              if (result.isSuspicious) {
                const newAlert: Alert = {
                  id: Math.random().toString(36).substr(2, 9),
                  timestamp: new Date(),
                  type: 'Suspicious Activity',
                  description: result.description,
                  severity: result.threatLevel,
                  imageUrl: base64Image,
                  status: 'active',
                  confidence: result.confidence
                };
                setAlerts(prev => [newAlert, ...prev].slice(0, 50));
                
                // Emit via socket
                if (socket) {
                  socket.emit('alert', newAlert);
                }

                setSystemStatus(result.threatLevel);
                setLastDetection(result.description);
                setLastDetectionConfidence(result.confidence || null);
                addLog(`THREAT DETECTED: ${result.description}`, result.threatLevel === 'critical' ? 'error' : 'warning');
                
                // Update cumulative threat counts
                setThreatCounts(prev => ({
                  ...prev,
                  [result.threatLevel]: prev[result.threatLevel as keyof typeof prev] + 1
                }));

                // TTS Alert
                playAlertAudio(result.description);
              } else {
                setSystemStatus('nominal');
                setLastDetection(null);
                setLastDetectionConfidence(null);
              }
            } catch (err) {
              console.error("Monitoring loop error:", err);
              setIsAiProcessing(false);
            }
          }
        }
      }, scanInterval);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, isLoggedIn, activeCamera, visionMode, socket, scanInterval]);


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

  // Night Vision Processing (Real Image Processing)
  useEffect(() => {
    if (visionMode !== 'night' || !isMonitoring || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let animationId: number;

    const process = () => {
      if (video.paused || video.ended) {
        animationId = requestAnimationFrame(process);
        return;
      }

      // Sync canvas size with video
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Green tint + brightness boost (Real image processing)
        const gray = (r + g + b) / 3;
        data[i] = gray * 0.1;     // R
        data[i + 1] = gray * 1.8;   // G (Boosted)
        data[i + 2] = gray * 0.1;   // B
        
        // Add some noise
        const noise = (Math.random() - 0.5) * 30;
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(process);
    };

    process();
    return () => cancelAnimationFrame(animationId);
  }, [visionMode, isMonitoring]);

  if (!isLoggedIn) {
    return <Login onLogin={handleManualLogin} />;
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
    <div className="flex flex-col md:flex-row h-screen w-full bg-sentry-bg text-zinc-300 font-sans overflow-hidden">
      {/* Sidebar Navigation - Bottom on mobile, Side on desktop */}
      <aside className="w-full md:w-16 h-16 md:h-full flex md:flex-col items-center justify-around md:justify-start pt-0 md:pt-6 pb-0 md:pb-12 border-t md:border-t-0 md:border-r border-sentry-border bg-sentry-panel z-20 order-last md:order-first">
        <div className="hidden md:block mb-8 p-2 bg-sentry-accent rounded-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <nav className="flex md:flex-col gap-4 md:gap-6 items-center">
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
            icon={<Users className="w-5 h-5" />} 
            active={activeTab === 'personnel'} 
            onClick={() => setActiveTab('personnel')}
            label="Personnel"
          />
          <NavItem 
            icon={<Database className="w-5 h-5" />} 
            active={activeTab === 'logs'} 
            onClick={() => setActiveTab('logs')}
            label="Logs"
          />
          <NavItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            active={activeTab === 'comms'} 
            onClick={() => setActiveTab('comms')}
            label="Comms"
          />
          <NavItem 
            icon={<History className="w-5 h-5" />} 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
            label="History"
          />
        </nav>
        </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-auto md:h-16 border-b border-sentry-border bg-sentry-panel/50 backdrop-blur-md flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-2 md:py-0 z-10 gap-2 md:gap-0">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              VISION SENTRY <span className="hidden sm:inline text-[10px] font-mono text-sentry-accent px-2 py-0.5 border border-sentry-accent/30 rounded">BETA v2.4</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-sentry-success animate-pulse' : 'bg-zinc-600'}`} />
              {isMonitoring ? 'LIVE' : 'STANDBY'}
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-6">
            <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1 rounded border border-white/5">
                <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                <span>{weather.temp}°C</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900/50 px-2 py-1 rounded border border-white/5">
                <Wind className="w-3.5 h-3.5 text-blue-400" />
                <span>{weather.windSpeed}km/h</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMonitoring}
                className={`px-3 md:px-4 py-1.5 rounded-md text-[10px] md:text-sm font-medium transition-all ${
                  isMonitoring 
                    ? 'bg-sentry-danger text-white hover:bg-red-600' 
                    : 'bg-sentry-accent text-white hover:bg-blue-600'
                }`}
              >
                {isMonitoring ? 'STOP SURVEILLANCE' : 'START SURVEILLANCE'}
              </button>
              <button 
                onClick={() => setShowAlerts(true)}
                className={`p-2 rounded-full transition-all relative ${
                  showAlerts ? 'bg-sentry-accent/20 text-sentry-accent' : 'bg-zinc-800 text-zinc-500 hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                {alerts.length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-black" />
                )}
              </button>
              <div 
                onClick={() => setIsSpeakerEnabled(!isSpeakerEnabled)}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border cursor-pointer transition-all ${
                  isSpeakerEnabled ? 'bg-sentry-accent/10 border-sentry-accent/20 text-sentry-accent' : 'bg-zinc-800 border-white/5 text-zinc-500'
                }`}
              >
                {isSpeakerEnabled ? <Volume2 className="w-4 h-4 md:w-5 md:h-5" /> : <VolumeX className="w-4 h-4 md:w-5 md:h-5" />}
              </div>
              <div 
                onClick={handleConnectKey}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border cursor-pointer transition-all ${
                  hasProfessionalKey ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-800 border-white/5 text-zinc-500 hover:text-emerald-500'
                }`}
                title="Connect Professional API Key (Extended Quota)"
              >
                <Key className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div 
                onClick={handleLogout}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors shadow-lg shadow-red-500/5"
                title="Exit System"
              >
                <LogOut className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-white/10">
              <div className="text-right hidden xs:block">
                <p className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-widest truncate max-w-[80px]">{operatorName}</p>
                <p className="text-[7px] md:text-[8px] font-mono text-sentry-accent uppercase tracking-widest">ID: SENTRY-01</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 flex flex-col overflow-hidden p-2 md:p-4 gap-4">
          {/* Top Section - Scrollable */}
          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-y-auto custom-scrollbar pr-1">
            {/* Left: Feed/Map and Stats */}
            <div className="flex-[3] flex flex-col gap-4 min-h-0">
              {/* Main Viewport Container */}
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex-1 bg-black rounded-xl border border-sentry-border relative overflow-hidden group min-h-[300px]">
                  {/* Persistent Video/Canvas for AI Processing */}
                  <div className={activeTab === 'feed' ? 'w-full h-full' : 'hidden'}>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      muted 
                      playsInline 
                      src=""
                      onCanPlay={() => videoRef.current?.play().catch(() => {})}
                      className={`w-full h-full object-cover opacity-80 transition-all duration-500 mirrored-feed ${
                        visionMode === 'thermal' ? 'vision-thermal' : visionMode === 'night' ? 'hidden' : ''
                      }`}
                    />
                    <canvas ref={canvasRef} className={`mirrored-feed ${visionMode === 'night' ? 'w-full h-full object-cover' : 'hidden'}`} />
                    
                    {/* Overlays */}
                    <div className="absolute inset-0 grid-overlay pointer-events-none" />
                    <div className="scanline" />
                    <div className={visionMode === 'night' ? 'vision-night-noise' : 'hidden'} />
                    
                    {/* HUD Elements */}
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-col gap-2">
                      <div className="bg-black/60 backdrop-blur-md px-2 md:px-3 py-1 md:py-1.5 rounded border border-white/10 flex items-center gap-2">
                        <Eye className="w-3 h-3 md:w-4 md:h-4 text-sentry-accent" />
                        <span className="text-[8px] md:text-xs font-mono">CAM_01_BORDER_NORTH</span>
                      </div>
                      <div className="bg-black/60 backdrop-blur-md px-2 md:px-3 py-1 md:py-1.5 rounded border border-white/10 flex items-center gap-2">
                        <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
                        <span className="text-[8px] md:text-xs font-mono">PWR: 94%</span>
                      </div>
                    </div>

                    {/* Vision Mode Controls */}
                    <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 flex flex-wrap justify-end gap-1 md:gap-2">
                      <VisionButton active={visionMode === 'normal'} onClick={() => setVisionMode('normal')} label="NORMAL" />
                      <VisionButton active={visionMode === 'thermal'} onClick={() => setVisionMode('thermal')} label="THERMAL" />
                      <VisionButton active={visionMode === 'night'} onClick={() => setVisionMode('night')} label="NIGHT" />
                      <div className="w-px bg-white/10 mx-0.5 md:mx-1" />
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
                              visionMode === 'thermal' ? 'border-white' : 
                              entity.type === 'friendly' ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' :
                              'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
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
                              visionMode === 'thermal' ? 'text-white font-bold' : 
                              entity.type === 'friendly' ? 'bg-emerald-500 text-white' :
                              'bg-red-500 text-white'
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
                              <div className={`absolute -bottom-6 right-0 ${entity.type === 'friendly' ? 'text-emerald-500' : 'text-red-500'} text-[8px] font-mono font-bold`}>
                                CONF: {entity.confidence?.toFixed(1) || (90 + Math.random() * 9).toFixed(1)}%
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
                    <LiveMap 
                      alerts={alerts} 
                      coords={coords} 
                      entities={tacticalEntities} 
                      setAlerts={setAlerts}
                      setSystemLogs={setSystemLogs}
                      socket={socket}
                      selectedSector={selectedSector}
                      setSelectedSector={setSelectedSector}
                      setActiveCamera={setActiveCamera}
                    />
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
                  ) : activeTab === 'history' ? (
                    <div className="w-full h-full bg-zinc-900 flex flex-col overflow-hidden">
                      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                        <div className="flex items-center gap-3">
                          <History className="w-6 h-6 text-sentry-accent" />
                          <h2 className="text-xl font-black text-white tracking-widest uppercase">Tactical Alert History</h2>
                          <div className="ml-4 px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                              {alerts.filter(a => a.severity === 'critical').length} Critical Threats
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              const confirmClear = window.confirm("Are you sure you want to clear all alert history?");
                              if (confirmClear) setAlerts([]);
                            }}
                            className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-[9px] font-black text-red-500 hover:bg-red-500/20 transition-all uppercase tracking-widest"
                          >
                            Purge History
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        <div className="p-4 bg-sentry-accent/5 border border-sentry-accent/20 rounded-xl mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Cpu className="w-4 h-4 text-sentry-accent" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Tactical Scan Optimization</span>
                            </div>
                            <span className="text-[10px] font-mono text-sentry-accent">{scanInterval / 1000}s Interval</span>
                          </div>
                          <div className="flex gap-2">
                            {[5000, 10000, 20000, 30000].map((val) => (
                              <button
                                key={val}
                                onClick={() => setScanInterval(val)}
                                className={`flex-1 py-2 rounded border text-[9px] font-black uppercase transition-all ${
                                  scanInterval === val 
                                    ? 'bg-sentry-accent border-sentry-accent text-white' 
                                    : 'bg-black/40 border-white/10 text-zinc-500 hover:border-white/30'
                                }`}
                              >
                                {val / 1000}s
                              </button>
                            ))}
                          </div>
                          <p className="text-[9px] text-zinc-500 mt-3 italic">
                            * Use 20s or 30s for continuous monitoring during long events to prevent API quota exhaustion.
                          </p>
                        </div>

                        {alerts.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                            <Clock className="w-12 h-12 mb-4" />
                            <p className="text-xs font-bold uppercase tracking-widest">No Historical Data</p>
                            <p className="text-[10px] mt-1">Alert logs are stored for 7 days</p>
                          </div>
                        ) : (
                          alerts.map(alert => (
                            <div key={alert.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/10 transition-all">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${
                                  alert.severity === 'critical' ? 'bg-red-500/20 border-red-500/40 text-red-500' :
                                  alert.severity === 'high' ? 'bg-orange-500/20 border-orange-500/40 text-orange-500' :
                                  alert.severity === 'medium' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' :
                                  'bg-emerald-500/20 border-emerald-500/40 text-emerald-500'
                                }`}>
                                  <Bell className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                      alert.severity === 'critical' ? 'bg-red-500/20 border-red-500/30 text-red-500' :
                                      alert.severity === 'high' ? 'bg-orange-500/20 border-orange-500/30 text-orange-500' :
                                      alert.severity === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500' :
                                      'bg-emerald-500/20 border-emerald-500/30 text-emerald-500'
                                    }`}>
                                      {alert.severity}
                                    </span>
                                    <span className="text-[10px] font-mono text-zinc-400">
                                      {alert.timestamp.toLocaleDateString()} | {alert.timestamp.toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">{alert.type}</h3>
                                  <p className="text-[11px] text-zinc-500 mt-1 max-w-md">{alert.description}</p>
                                  {alert.imageUrl && (
                                    <div className="mt-2 w-24 h-16 rounded overflow-hidden border border-white/10 group relative cursor-zoom-in">
                                      <img 
                                        src={alert.imageUrl} 
                                        alt="Alert Snapshot" 
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        referrerPolicy="no-referrer"
                                      />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Eye className="w-3 h-3 text-white" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button 
                                  onClick={() => {
                                    addLog(`INITIATING EMERGENCY CALL FOR ALERT: ${alert.id}`, 'warning');
                                  }}
                                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-sentry-accent/20 border border-sentry-accent/30 rounded-lg text-[10px] font-black text-sentry-accent hover:bg-sentry-accent/30 transition-all uppercase tracking-widest"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  Call Command
                                </button>
                                <button 
                                  onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : activeTab === 'personnel' ? (
                    <div className="w-full h-full bg-zinc-900 p-6 overflow-y-auto custom-scrollbar">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                          <Users className="w-6 h-6 text-sentry-accent" />
                          <h2 className="text-xl font-black text-white tracking-widest uppercase">Personnel Database</h2>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-[9px] font-black text-zinc-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                            Export Roster
                          </button>
                          <button className="px-3 py-1.5 bg-sentry-accent/20 border border-sentry-accent/30 rounded text-[9px] font-black text-sentry-accent hover:bg-sentry-accent/30 transition-all uppercase tracking-widest">
                            Add Personnel
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Static Personnel */}
                        {personnel.map(p => (
                          <motion.div 
                            key={p.id}
                            whileHover={{ y: -2 }}
                            className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center gap-4 hover:border-sentry-accent/30 transition-all group"
                          >
                            <div className="w-14 h-14 rounded-lg bg-zinc-800 flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
                              <div className="text-[8px] font-black text-zinc-500 mb-0.5">ID_CODE</div>
                              <div className="text-[10px] font-mono font-bold text-sentry-accent">{p.id.split('-')[1]}</div>
                              <div className="absolute inset-0 bg-sentry-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="text-sm font-bold text-white uppercase tracking-tight">{p.name}</h3>
                                <span className="text-[7px] font-mono text-sentry-accent">{p.id}</span>
                              </div>
                              <p className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">{p.rank} | {p.lastSeen || 'Unknown'}</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    p.status === 'ACTIVE' ? 'bg-sentry-success' : p.status === 'DEPLOYED' ? 'bg-sentry-accent' : 'bg-zinc-600'
                                  }`} />
                                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{p.status}</span>
                                </div>
                                <span className="text-[7px] font-mono text-zinc-600">{p.clearance}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {/* Real-time Tactical Units */}
                        {tacticalEntities.filter(e => e.type === 'friendly').map(e => (
                          <motion.div 
                            key={e.id}
                            whileHover={{ y: -2 }}
                            className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20 flex items-center gap-4 hover:border-blue-500/40 transition-all group"
                          >
                            <div className="w-14 h-14 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/30 relative overflow-hidden">
                              <User className="w-7 h-7 text-blue-400" />
                              <div className="absolute inset-0 bg-blue-400/5 animate-pulse" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="text-sm font-bold text-white uppercase tracking-tight">{e.label}</h3>
                                <span className="text-[7px] font-mono text-blue-400">UNIT_ID_{e.id.slice(0, 4)}</span>
                              </div>
                              <p className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">Tactical Unit | GPS Active</p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-sentry-success animate-pulse" />
                                  <span className="text-[8px] font-black uppercase tracking-widest text-sentry-success">In Field</span>
                                </div>
                                <span className="text-[7px] font-mono text-zinc-600">POS: {e.x.toFixed(0)}, {e.y.toFixed(0)}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 uppercase font-black tracking-widest">
                      [SELECT_TAB_FOR_DATA]
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
              </div>
            </div>

            {/* Right: Alerts and Comms Panel */}
            <div className="flex-1 flex flex-col gap-4 min-h-[300px] md:min-h-0 overflow-hidden">
      {/* Alerts Modal - Large Window */}
      <AnimatePresence>
        {showAlerts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl bg-[#0a0a0a] border border-emerald-500/30 flex flex-col max-h-[80vh] rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-emerald-500/30 flex items-center justify-between bg-emerald-500/5">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-emerald-500" />
                  <h2 className="text-xl font-black text-emerald-500 tracking-widest uppercase">Central Alert Repository</h2>
                </div>
                <button 
                  onClick={() => setShowAlerts(false)}
                  className="p-2 hover:bg-emerald-500/10 text-emerald-500 transition-colors rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Filter Bar */}
              <div className="px-6 py-3 border-b border-emerald-500/20 bg-black/40 flex items-center gap-3 overflow-x-auto custom-scrollbar">
                <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest mr-2">Filter:</span>
                {(['all', 'low', 'medium', 'high', 'critical'] as const).map((severity) => (
                  <button
                    key={severity}
                    onClick={() => setAlertFilter(severity)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                      alertFilter === severity
                        ? severity === 'critical' ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20' :
                          severity === 'high' ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' :
                          severity === 'medium' ? 'bg-yellow-500 border-yellow-500 text-black shadow-lg shadow-yellow-500/20' :
                          severity === 'low' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                          'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-transparent border-emerald-500/30 text-emerald-500/50 hover:border-emerald-500 hover:text-emerald-500'
                    }`}
                  >
                    {severity}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/40">
                {alerts.filter(a => alertFilter === 'all' || a.severity === alertFilter).length === 0 ? (
                  <div className="text-center py-20 text-emerald-500/30 uppercase tracking-widest font-bold">
                    {alertFilter === 'all' ? 'No active alerts in system' : `No ${alertFilter} severity alerts`}
                  </div>
                ) : (
                  alerts
                    .filter(a => alertFilter === 'all' || a.severity === alertFilter)
                    .map((alert) => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all hover:bg-white/5 ${
                        alert.severity === 'critical' ? 'bg-red-500/5 border-red-500/30' :
                        alert.severity === 'high' ? 'bg-orange-500/5 border-orange-500/30' :
                        'bg-emerald-500/5 border-emerald-500/30'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`mt-1 p-3 rounded-xl ${
                          alert.severity === 'critical' ? 'bg-red-500 text-white' :
                          alert.severity === 'high' ? 'bg-orange-500 text-white' :
                          'bg-emerald-500 text-white'
                        }`}>
                          <Bell className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-mono text-zinc-500">
                              {alert.timestamp instanceof Date ? alert.timestamp.toLocaleTimeString() : new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                              alert.severity === 'critical' ? 'bg-red-500 text-white' :
                              alert.severity === 'high' ? 'bg-orange-500 text-white' :
                              'bg-emerald-500 text-white'
                            }`}>
                              {alert.severity}
                            </span>
                            {alert.confidence && (
                              <span className="text-[10px] font-mono font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                CONF: {alert.confidence.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <h3 className="text-white font-bold uppercase tracking-wider mb-1">{alert.type}</h3>
                          <p className="text-zinc-400 text-sm leading-relaxed">{alert.description}</p>
                          {alert.imageUrl && (
                            <div className="mt-3 w-full max-w-[200px] h-32 rounded-lg overflow-hidden border border-white/10 group relative">
                              <img 
                                src={alert.imageUrl} 
                                alt="Alert Snapshot" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                          className="p-2 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-emerald-500/30 bg-zinc-900/50 flex justify-between items-center">
                <div className="text-[10px] text-red-500 uppercase tracking-widest font-black flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Critical Threats: {alerts.filter(a => a.severity === 'critical').length}
                </div>
                <button 
                  onClick={() => setAlerts([])}
                  className="text-[10px] text-red-500 hover:underline uppercase tracking-widest font-bold"
                >
                  Clear All Logs
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

          {/* Comms Panel - Enlarged to fill gap */}
              <div className="flex-1 flex flex-col bg-sentry-panel rounded-xl border border-sentry-border overflow-hidden">
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

          {/* Global Alert Bar - Outside scrollable area */}
          <AnimatePresence>
            {systemStatus !== 'nominal' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="px-2 md:px-0"
              >
                <div className={`px-4 md:px-6 py-2 md:py-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between backdrop-blur-md shadow-2xl gap-4 ${
                  systemStatus === 'critical' ? 'bg-red-500/20 border-red-500/50' : 
                  systemStatus === 'high' ? 'bg-orange-500/20 border-orange-500/50' :
                  systemStatus === 'medium' ? 'bg-yellow-500/20 border-yellow-500/50' :
                  'bg-blue-500/20 border-blue-500/50'
                }`}>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={`p-1.5 md:p-2 rounded-lg ${
                      systemStatus === 'critical' ? 'bg-red-500' : 
                      systemStatus === 'high' ? 'bg-orange-500' :
                      systemStatus === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    } animate-pulse`}>
                      <AlertTriangle className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-[10px] md:text-sm font-black uppercase tracking-[0.2em] ${
                          systemStatus === 'critical' ? 'text-red-500' : 
                          systemStatus === 'high' ? 'text-orange-500' :
                          systemStatus === 'medium' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`}>
                          {systemStatus === 'critical' ? 'CRITICAL THREAT DETECTED' : 'SUSPICIOUS ACTIVITY LOGGED'}
                        </h3>
                        <span className={`text-[8px] md:text-[10px] font-bold px-1.5 md:py-0.5 rounded border ${
                          systemStatus === 'critical' ? 'bg-red-500/20 border-red-500/30 text-red-500' : 
                          systemStatus === 'high' ? 'bg-orange-500/20 border-orange-500/30 text-orange-500' :
                          systemStatus === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500' :
                          'bg-blue-500/20 border-blue-500/30 text-blue-500'
                        }`}>
                          {systemStatus.toUpperCase()}
                        </span>
                        {lastDetectionConfidence && (
                          <span className="text-[8px] md:text-[10px] font-mono font-black text-white/60 bg-white/5 px-1.5 rounded border border-white/10">
                            CONF: {lastDetectionConfidence.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] md:text-xs text-white font-medium mt-0.5 md:mt-1">{lastDetection}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <button 
                      onClick={() => setSystemStatus('nominal')}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors w-full sm:w-auto"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Stats Row - Always Visible */}
          <div className="h-auto md:h-24 grid grid-cols-2 md:flex gap-2 md:gap-4 items-stretch flex-shrink-0">
            <StatCard label="UPTIME" value={uptime} icon={<Activity className="w-4 h-4" />} className="flex-1" />
            <StatCard 
              label="THREATS" 
              value={(threatCounts.low + threatCounts.medium + threatCounts.high + threatCounts.critical).toString()} 
              icon={<Shield className="w-4 h-4" />} 
              trend={threatCounts.critical > 0 ? 'critical' : undefined}
              className="flex-1"
            />
            <StatCard label="RANGE" value="50 KM" icon={<Navigation className="w-4 h-4" />} className="flex-1 hidden sm:flex" />
            <div className="flex-1 relative group h-full hidden sm:block">
              <StatCard 
                label="OPERATOR" 
                value={operatorName} 
                icon={<User className="w-4 h-4" />} 
                onClick={() => setIsEditingOperator(true)}
                className="w-full h-full"
              />
              {isEditingOperator && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-xl border border-sentry-accent p-2 flex items-center gap-2 z-50">
                  <input 
                    autoFocus
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingOperator(false)}
                    onBlur={() => setIsEditingOperator(false)}
                    className="flex-1 bg-transparent border-none text-white font-black text-sm focus:outline-none uppercase"
                  />
                  <button onClick={() => setIsEditingOperator(false)} className="text-sentry-accent text-[10px] font-bold">SET</button>
                </div>
              )}
            </div>
            <StatCard label="AI DIAGNOSTICS" value="OPTIMAL" icon={<Cpu className="w-4 h-4" />} className="flex-1" />
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
        <div className="absolute left-1/2 md:left-full -translate-x-1/2 md:translate-x-0 bottom-full md:bottom-auto md:top-1/2 md:-translate-y-1/2 mb-2 md:mb-0 md:ml-4 px-2 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, trend, onClick, className, subtitle }: { label: string, value: string, icon: React.ReactNode, trend?: 'critical', onClick?: () => void, className?: string, subtitle?: string }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-sentry-panel rounded-xl border p-4 flex flex-col justify-between group transition-all ${
      trend === 'critical' ? 'border-red-500/50 bg-red-500/5' : 'border-sentry-border hover:border-sentry-accent/50'
    } ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className || ''}`}>
      <div className={`flex items-center justify-between transition-colors ${
        trend === 'critical' ? 'text-red-500' : 'text-zinc-500 group-hover:text-sentry-accent'
      }`}>
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className={`text-xl font-mono font-bold truncate ${trend === 'critical' ? 'text-red-500' : 'text-white'}`}>{value}</span>
        {subtitle && (
          <span className="text-[8px] font-mono text-zinc-500 mb-1">{subtitle}</span>
        )}
        {trend === 'critical' && (
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping mb-1" />
        )}
      </div>
    </div>
  );
}
