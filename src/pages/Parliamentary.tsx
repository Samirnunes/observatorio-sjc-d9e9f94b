import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, FileText, Users } from "lucide-react";

interface Councilor {
  id: string;
  name: string;
  party: string;
  district: string;
  status: string;
  total_proposals: number;
  approved_proposals: number;
  attendance_rate: number;
  activity_score: number;
}

const Parliamentary = () => {
  const [councilors, setCouncilors] = useState<Councilor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCouncilors();
  }, []);

  const fetchCouncilors = async () => {
    try {
      const { data, error } = await supabase
        .from('councilors')
        .select('*')
        .order('activity_score', { ascending: false });

      if (error) throw error;
      setCouncilors(data || []);
    } catch (error) {
      console.error('Error fetching councilors:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados dos vereadores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-secondary text-secondary-foreground';
      case 'inactive':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'on_leave':
        return 'Licença';
      default:
        return status;
    }
  };

  const approvalRate = (councilor: Councilor) => {
    if (councilor.total_proposals === 0) return 0;
    return (councilor.approved_proposals / councilor.total_proposals) * 100;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary to-primary-light py-16">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Índice de Atividade Parlamentar
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Acompanhe o desempenho dos vereadores de São José dos Campos com dados atualizados
            </p>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="py-8 border-b bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Vereadores</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{councilors.length}</div>
                  <p className="text-xs text-muted-foreground">Mandato 2025-2028</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Propostas Total</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {councilors.reduce((acc, c) => acc + c.total_proposals, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Apresentadas em 2025</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa Média de Aprovação</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {councilors.length > 0 
                      ? ((councilors.reduce((acc, c) => acc + approvalRate(c), 0) / councilors.length).toFixed(1))
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Média geral</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Councilors List */}
        <section className="py-12">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8">Vereadores</h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-6">
                {councilors.map((councilor) => (
                  <Card key={councilor.id} className="shadow-card hover:shadow-elevated transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{councilor.name}</h3>
                            <Badge className={getStatusColor(councilor.status)}>
                              {getStatusLabel(councilor.status)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
                            <span className="font-medium">{councilor.party}</span>
                            <span>•</span>
                            <span>{councilor.district}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Score de Atividade</p>
                              <p className="text-2xl font-bold text-primary">{councilor.activity_score}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Propostas</p>
                              <p className="text-lg font-semibold">{councilor.total_proposals}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Aprovadas</p>
                              <p className="text-lg font-semibold text-secondary">{councilor.approved_proposals}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Presença</p>
                              <p className="text-lg font-semibold">{councilor.attendance_rate}%</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="md:w-48">
                          <p className="text-xs text-muted-foreground mb-2">Taxa de Aprovação</p>
                          <Progress value={approvalRate(councilor)} className="h-2 mb-1" />
                          <p className="text-xs text-right font-medium">{approvalRate(councilor).toFixed(1)}%</p>
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

export default Parliamentary;
