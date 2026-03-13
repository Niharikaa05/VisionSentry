export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  severity: AlertSeverity;
  imageUrl?: string;
  status: 'active' | 'resolved' | 'dismissed';
}

export interface DetectionResult {
  isSuspicious: boolean;
  threatLevel: AlertSeverity;
  description: string;
  detectedObjects: string[];
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  event: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface Personnel {
  id: string;
  name: string;
  rank: string;
  status: 'active' | 'on-leave' | 'deployed';
  location: string;
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: string;
}
