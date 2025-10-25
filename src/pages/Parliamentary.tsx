import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, FileText, Users, Star, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CouncilorScore {
  id: string;
  councilor: {
    id: string;
    name: string;
    party: string;
    district: string;
    photo_url: string | null;
  };
  score_total: number;
  num_acoes_avaliadas: number;
  score_medio: number;
  ranking_position: number | null;
}

const Parliamentary = () => {
  const [scores, setScores] = useState<CouncilorScore[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const { data, error } = await supabase
        .from('scores_vereador')
        .select(`
          *,
          councilor:councilors(id, name, party, district, photo_url)
        `)
        .order('score_total', { ascending: false });

      if (error) throw error;
      
      // Atualizar ranking_position baseado na ordem
      const scoresWithRanking = (data || []).map((item, index) => ({
        ...item,
        ranking_position: index + 1
      }));
      
      setScores(scoresWithRanking);
    } catch (error) {
      console.error('Error fetching scores:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar o ranking de vereadores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-700';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary to-primary-light py-16">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ranking de Qualidade Parlamentar
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Avaliação colaborativa das ações legislativas dos vereadores de São José dos Campos
            </p>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="py-8 border-b bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vereadores Avaliados</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{scores.filter(s => s.num_acoes_avaliadas > 0).length}</div>
                  <p className="text-xs text-muted-foreground">Com avaliações</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Ações Avaliadas</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {scores.reduce((acc, s) => acc + s.num_acoes_avaliadas, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Proposições analisadas</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {scores.length > 0 && scores.filter(s => s.num_acoes_avaliadas > 0).length > 0
                      ? (scores
                          .filter(s => s.num_acoes_avaliadas > 0)
                          .reduce((acc, s) => acc + s.score_medio, 0) / 
                          scores.filter(s => s.num_acoes_avaliadas > 0).length
                        ).toFixed(1)
                      : '0.0'}
                  </div>
                  <p className="text-xs text-muted-foreground">de 5.0 pontos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Melhor Avaliado</CardTitle>
                  <Award className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {scores.length > 0 && scores[0].num_acoes_avaliadas > 0 ? (
                    <>
                      <div className="text-lg font-bold truncate">{scores[0].councilor.name}</div>
                      <p className="text-xs text-muted-foreground">{scores[0].score_medio.toFixed(1)} pontos</p>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Sem dados</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Ranking */}
        <section className="py-12">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8">Ranking de Vereadores</h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : scores.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Ainda não há avaliações disponíveis. Seja o primeiro a avaliar as ações parlamentares!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {scores.map((score) => (
                  <Card 
                    key={score.id} 
                    className={`shadow-card hover:shadow-elevated transition-shadow ${
                      score.ranking_position && score.ranking_position <= 3 ? 'border-2 border-primary/20' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        {/* Ranking Position */}
                        <div className="flex items-center justify-center md:w-24">
                          <div className="text-center">
                            {score.ranking_position && score.ranking_position <= 3 ? (
                              <Award className={`h-12 w-12 mx-auto mb-1 ${getMedalColor(score.ranking_position)}`} />
                            ) : (
                              <div className="text-4xl font-bold text-muted-foreground mb-1">
                                #{score.ranking_position || '-'}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">Posição</div>
                          </div>
                        </div>

                        {/* Councilor Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{score.councilor.name}</h3>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
                            <Badge variant="outline">{score.councilor.party}</Badge>
                            <span>•</span>
                            <span>{score.councilor.district}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Score Total</p>
                              <p className="text-2xl font-bold text-primary">
                                {score.score_total.toFixed(1)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Ações Avaliadas</p>
                              <p className="text-lg font-semibold">{score.num_acoes_avaliadas}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Média por Ação</p>
                              <p className="text-lg font-semibold text-secondary">
                                {score.score_medio.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Qualidade</p>
                              <Progress 
                                value={(score.score_medio / 5) * 100} 
                                className="h-2 mt-2" 
                              />
                              <p className="text-xs text-right font-medium mt-1">
                                {((score.score_medio / 5) * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>
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
