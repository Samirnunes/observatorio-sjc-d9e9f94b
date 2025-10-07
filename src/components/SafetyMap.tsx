import { supabase } from '@/integrations/supabase/client';
import { ClusterInfo, SafetyIncident } from '@/types/safety';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { Circle, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { Card, CardContent } from './ui/card';

const CLUSTER_RADIUS = 200; // 1km in meters

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function clusterIncidents(incidents: SafetyIncident[]): ClusterInfo[] {
  const clusters: ClusterInfo[] = [];

  incidents.forEach((incident) => {
    let foundCluster = false;

    // Check if incident belongs to any existing cluster
    for (const cluster of clusters) {
      const distance = calculateDistance(
        cluster.center.lat,
        cluster.center.lng,
        incident.location.lat,
        incident.location.lng
      );

      if (distance <= CLUSTER_RADIUS) {
        cluster.incidents.push(incident);
        cluster.totalIncidents++;
        
        // Update cluster stats
        const natureCount = cluster.topNatures.find(n => n.nature === incident.nature);
        if (natureCount) {
          natureCount.count++;
        } else {
          cluster.topNatures.push({ nature: incident.nature, count: 1 });
        }

        cluster.topNatures.sort((a, b) => b.count - a.count);
        cluster.topNatures = cluster.topNatures.slice(0, 5);

        cluster.recentIncidents.push({
          nature: incident.nature,
          date: incident.date
        });
        cluster.recentIncidents.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        cluster.recentIncidents = cluster.recentIncidents.slice(0, 5);

        foundCluster = true;
        break;
      }
    }

    // If incident doesn't belong to any cluster, create a new one
    if (!foundCluster) {
      clusters.push({
        center: incident.location,
        incidents: [incident],
        totalIncidents: 1,
        year: parseInt(incident.date.split('-')[0]),
        policeStation: incident.delegacia,
        topNatures: [{ nature: incident.nature, count: 1 }],
        recentIncidents: [{
          nature: incident.nature,
          date: incident.date
        }]
      });
    }
  });

  return clusters;
}

const SafetyMap = () => {
  const [clusters, setClusters] = useState<ClusterInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all safety incidents
        const { data: result, error: queryError } = await supabase
          .from('safety_incidents')
          .select('*')
          .order('incident_date', { ascending: false });

        if (queryError) throw queryError;

        console.log('Safety data:', result);

        // Transform data into incidents
        const incidents: SafetyIncident[] = [];
        if (result) {
          result.forEach((row) => {
            incidents.push({
              nature: row.incident_type,
              date: row.incident_date,
              location: {
                lat: row.latitude,
                lng: row.longitude
              },
              delegacia: row.police_station
            });
          });
        }

        // Create clusters from incidents
        const newClusters = clusterIncidents(incidents);
        console.log('Loaded incidents:', incidents.length);
        console.log('Created clusters:', newClusters.length);
        setClusters(newClusters);
      } catch (error) {
        console.error('Error fetching safety data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('safety_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'safety_incidents' },
        fetchData
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <Card className="shadow-elevated">
        <CardContent className="p-6">
          <div className="text-center">Carregando dados de segurança...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elevated">
      <CardContent className="p-0">
        <div className="h-[600px] w-full">
          <MapContainer
            center={[-23.2237, -45.9009]} // São José dos Campos coordinates
            zoom={13}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {clusters.map((cluster, index) => (
              <Circle
                key={index}
                center={[cluster.center.lat, cluster.center.lng]}
                pathOptions={{
                  color: '#ff0000',
                  fillColor: cluster.totalIncidents > 10 ? '#ff0000' : cluster.totalIncidents > 5 ? '#ff4444' : '#ff8888',
                  fillOpacity: 0.6,
                  weight: 3,
                }}
                radius={CLUSTER_RADIUS} // Fixed 1km radius
              >
                <Popup>
                  <div className="p-3 space-y-3">
                    <h3 className="font-bold text-lg text-center border-b pb-2">Resumo da Região</h3>

                    <p className="font-medium">Total de ocorrências: {cluster.totalIncidents}</p>
                    
                    <div>
                      <h4 className="font-semibold">Principais tipos de ocorrências:</h4>
                      <ul className="list-disc list-inside">
                        {cluster.topNatures.map((nature, i) => (
                          <li key={i}>
                            {nature.nature}: {nature.count}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold">Últimas 5 ocorrências:</h4>
                      <ul className="list-disc list-inside">
                        {cluster.recentIncidents.map((incident, i) => (
                          <li key={i}>
                            {incident.nature} - {format(new Date(incident.date), 'dd/MM/yyyy')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SafetyMap;