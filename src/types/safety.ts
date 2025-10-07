import { Database } from '@/integrations/supabase/types';

export type SafetyIncidentType = Database['public']['Tables']['safety_incidents']['Row'];
export type IncidentTypeEnum = Database['public']['Enums']['incident_type'];

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