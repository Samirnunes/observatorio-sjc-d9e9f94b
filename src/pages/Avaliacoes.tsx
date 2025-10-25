import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star, FileText, CheckCircle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Acao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  data_proposicao: string;
  area_tematica: string;
  councilor: {
    name: string;
    party: string;
  };
}

interface MinhaAvaliacao {
  acao_id: string;
  criterio_1_relevancia: number;
  criterio_2_viabilidade: number;
  criterio_3_impacto: number;
  criterio_4_clareza: number;
  criterio_5_abrangencia: number;
  criterio_6_inovacao: number;
  comentario: string;
  created_at: string;
  acoes: Acao;
}

const Avaliacoes = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [acoesDisponiveis, setAcoesDisponiveis] = useState<Acao[]>([]);
  const [minhasAvaliacoes, setMinhasAvaliacoes] = useState<MinhaAvaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile || profile.role === 'visitante') {
        toast({
          title: "Acesso negado",
          description: "Você precisa ser um avaliador aprovado para acessar esta página.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      if (profile.evaluator_status !== 'approved') {
        toast({
          title: "Aguardando aprovação",
          description: "Seu cadastro como avaliador ainda está pendente de aprovação.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setUserProfile(profile);
      await loadAcoesDisponiveis(user.id);
      await loadMinhasAvaliacoes(user.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as informações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAcoesDisponiveis = async (userId: string) => {
    try {
      // Buscar ações que ainda não foram avaliadas pelo usuário
      const { data, error } = await supabase
        .from('acoes')
        .select(`
          *,
          councilor:councilors(name, party)
        `)
        .eq('status', 'under_evaluation')
        .not('id', 'in', `(
          SELECT acao_id FROM avaliacoes WHERE evaluator_id = '${userId}'
        )`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAcoesDisponiveis(data || []);
    } catch (error) {
      console.error('Error loading acoes:', error);
    }
  };

  const loadMinhasAvaliacoes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('avaliacoes')
        .select(`
          *,
          acoes(
            id,
            titulo,
            descricao,
            tipo,
            data_proposicao,
            area_tematica,
            councilor:councilors(name, party)
          )
        `)
        .eq('evaluator_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMinhasAvaliacoes(data || []);
    } catch (error) {
      console.error('Error loading avaliacoes:', error);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'avaliador_pg': 'População Geral',
      'avaliador_tec': 'Técnico',
      'avaliador_par': 'Parlamentar'
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary to-primary-light py-12">
          <div className="container">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Painel de Avaliações
                </h1>
                <p className="text-lg text-white/90">
                  Bem-vindo, {userProfile?.full_name}
                </p>
                <Badge className="mt-2" variant="secondary">
                  {getRoleLabel(userProfile?.role)}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm">Total de Avaliações</div>
                <div className="text-4xl font-bold text-white">{minhasAvaliacoes.length}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 border-b bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avaliações Concluídas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{minhasAvaliacoes.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{acoesDisponiveis.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Média de Pontuação</CardTitle>
                  <Star className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {minhasAvaliacoes.length > 0
                      ? (minhasAvaliacoes.reduce((acc, av) => 
                          acc + (av.criterio_1_relevancia + av.criterio_2_viabilidade + 
                                 av.criterio_3_impacto + av.criterio_4_clareza + 
                                 av.criterio_5_abrangencia + av.criterio_6_inovacao) / 6
                        , 0) / minhasAvaliacoes.length).toFixed(1)
                      : '0.0'}
                  </div>
                  <p className="text-xs text-muted-foreground">de 5.0</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-12">
          <div className="container">
            <Tabs defaultValue="disponiveis" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="disponiveis">Disponíveis ({acoesDisponiveis.length})</TabsTrigger>
                <TabsTrigger value="minhas">Minhas Avaliações ({minhasAvaliacoes.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="disponiveis" className="mt-6">
                <div className="grid gap-6">
                  {acoesDisponiveis.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Não há ações disponíveis para avaliação no momento.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    acoesDisponiveis.map((acao) => (
                      <Card key={acao.id} className="shadow-card hover:shadow-elevated transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2">{acao.titulo}</CardTitle>
                              <CardDescription className="flex flex-wrap gap-2 items-center">
                                <Badge variant="outline">{acao.tipo}</Badge>
                                <span>•</span>
                                <span>{acao.councilor?.name || 'Vereador não informado'}</span>
                                <span>•</span>
                                <span>{acao.councilor?.party || 'Partido não informado'}</span>
                                <span>•</span>
                                <span>{new Date(acao.data_proposicao).toLocaleDateString('pt-BR')}</span>
                              </CardDescription>
                              {acao.area_tematica && (
                                <Badge className="mt-2" variant="secondary">{acao.area_tematica}</Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                            {acao.descricao}
                          </p>
                          <Button 
                            onClick={() => navigate(`/avaliar/${acao.id}`)}
                            className="w-full md:w-auto"
                          >
                            <Star className="mr-2 h-4 w-4" />
                            Avaliar Esta Ação
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="minhas" className="mt-6">
                <div className="grid gap-6">
                  {minhasAvaliacoes.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Você ainda não realizou nenhuma avaliação.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    minhasAvaliacoes.map((avaliacao) => {
                      const mediaScore = (
                        avaliacao.criterio_1_relevancia +
                        avaliacao.criterio_2_viabilidade +
                        avaliacao.criterio_3_impacto +
                        avaliacao.criterio_4_clareza +
                        avaliacao.criterio_5_abrangencia +
                        avaliacao.criterio_6_inovacao
                      ) / 6;

                      return (
                        <Card key={avaliacao.acao_id} className="shadow-card">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg mb-2">{avaliacao.acoes.titulo}</CardTitle>
                                <CardDescription className="flex flex-wrap gap-2 items-center">
                                  <Badge variant="outline">{avaliacao.acoes.tipo}</Badge>
                                  <span>•</span>
                                  <span>Avaliado em {new Date(avaliacao.created_at).toLocaleDateString('pt-BR')}</span>
                                </CardDescription>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{mediaScore.toFixed(1)}</div>
                                <div className="text-xs text-muted-foreground">Pontuação</div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                              <div>
                                <div className="text-xs text-muted-foreground">Relevância</div>
                                <Progress value={(avaliacao.criterio_1_relevancia / 5) * 100} className="h-2 mt-1" />
                                <div className="text-xs text-right mt-1">{avaliacao.criterio_1_relevancia}/5</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Viabilidade</div>
                                <Progress value={(avaliacao.criterio_2_viabilidade / 5) * 100} className="h-2 mt-1" />
                                <div className="text-xs text-right mt-1">{avaliacao.criterio_2_viabilidade}/5</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Impacto</div>
                                <Progress value={(avaliacao.criterio_3_impacto / 5) * 100} className="h-2 mt-1" />
                                <div className="text-xs text-right mt-1">{avaliacao.criterio_3_impacto}/5</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Clareza</div>
                                <Progress value={(avaliacao.criterio_4_clareza / 5) * 100} className="h-2 mt-1" />
                                <div className="text-xs text-right mt-1">{avaliacao.criterio_4_clareza}/5</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Abrangência</div>
                                <Progress value={(avaliacao.criterio_5_abrangencia / 5) * 100} className="h-2 mt-1" />
                                <div className="text-xs text-right mt-1">{avaliacao.criterio_5_abrangencia}/5</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Inovação</div>
                                <Progress value={(avaliacao.criterio_6_inovacao / 5) * 100} className="h-2 mt-1" />
                                <div className="text-xs text-right mt-1">{avaliacao.criterio_6_inovacao}/5</div>
                              </div>
                            </div>
                            {avaliacao.comentario && (
                              <div className="mt-4 p-3 bg-muted rounded-lg">
                                <div className="text-xs font-medium mb-1">Comentário:</div>
                                <p className="text-sm text-muted-foreground">{avaliacao.comentario}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Avaliacoes;
