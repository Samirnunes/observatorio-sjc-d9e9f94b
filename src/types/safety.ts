export type SafetyIncidentType = any;
export type IncidentTypeEnum = string;

export interface SafetyData {
  incidents: SafetyIncidentType[];
}

export interface UploadParameters {
  year: number;
  police_station: string;
  latitude: number;
  longitude: number;
  nature: string;
  date: string;
}

export interface SafetyIncident {
  nature: string;
  date: string;
  location: {
    lat: number;
    lng: number;
  };
  delegacia: string;
}

export interface ClusterInfo {
  center: {
    lat: number;
    lng: number;
  };
  incidents: SafetyIncident[];
  totalIncidents: number;
  year: number;
  policeStation: string;
  topNatures: {
    nature: string;
    count: number;
  }[];
  recentIncidents: {
    nature: string;
    date: string;
  }[];
}

export interface ParsedSafetyData {
  nature: string;
  monthlyData: {
    janeiro: number;
    fevereiro: number;
    marco: number;
    abril: number;
    maio: number;
    junho: number;
    julho: number;
    agosto: number;
    setembro: number;
    outubro: number;
    novembro: number;
    dezembro: number;
  };
  total: number;
}