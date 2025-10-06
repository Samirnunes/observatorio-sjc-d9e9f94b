import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, AlertTriangle, TrendingDown } from "lucide-react";

interface SafetyIncident {
  id: string;
  incident_type: string;
  latitude: number;
  longitude: number;
  neighborhood: string;
  incident_date: string;
  description: string;
}

const Safety = () => {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('safety_incidents')
        .select('*')
        .order('incident_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de segurança.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIncidentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      furto: 'Furto',
      roubo: 'Roubo',
      homicidio: 'Homicídio',
      lesao_corporal: 'Lesão Corporal',
      outros: 'Outros'
    };
    return labels[type] || type;
  };

  const getIncidentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      furto: 'bg-yellow-500 text-white',
      roubo: 'bg-orange-500 text-white',
      homicidio: 'bg-red-500 text-white',
      lesao_corporal: 'bg-red-400 text-white',
      outros: 'bg-gray-500 text-white'
    };
    return colors[type] || 'bg-gray-500 text-white';
  };

  const incidentsByType = incidents.reduce((acc, incident) => {
    acc[incident.incident_type] = (acc[incident.incident_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-secondary to-secondary-light py-16">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Mapa de Segurança Pública
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Visualize e acompanhe indicadores de segurança pública em São José dos Campos
            </p>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="py-8 border-b bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{incidents.length}</div>
                  <p className="text-xs text-muted-foreground">Últimos registros</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tipo Mais Frequente</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Object.keys(incidentsByType).length > 0 
                      ? getIncidentTypeLabel(Object.entries(incidentsByType).sort((a, b) => b[1] - a[1])[0][0])
                      : '-'}
                  </div>
                  <p className="text-xs text-muted-foreground">Categoria principal</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bairros Afetados</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(incidents.map(i => i.neighborhood)).size}
                  </div>
                  <p className="text-xs text-muted-foreground">Diferentes localidades</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Map Placeholder */}
        <section className="py-8 bg-muted/30">
          <div className="container">
            <Card className="shadow-elevated">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Mapa Interativo</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Visualização geográfica dos incidentes em desenvolvimento
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Incidents List */}
        <section className="py-12">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8">Incidentes Recentes</h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4">
                {incidents.map((incident) => (
                  <Card key={incident.id} className="shadow-card hover:shadow-elevated transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={getIncidentTypeColor(incident.incident_type)}>
                              {getIncidentTypeLabel(incident.incident_type)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(incident.incident_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">{incident.neighborhood}</span>
                          </div>
                          {incident.description && (
                            <p className="text-sm text-muted-foreground">{incident.description}</p>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground md:text-right">
                          <p>Lat: {incident.latitude.toFixed(4)}</p>
                          <p>Lng: {incident.longitude.toFixed(4)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Safety;
