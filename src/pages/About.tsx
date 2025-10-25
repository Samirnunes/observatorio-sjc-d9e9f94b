import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, Eye, Shield } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary to-primary-light py-20">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Quem Somos
            </h1>
            <p className="text-xl text-white/90 max-w-3xl">
              Promovendo transparência e participação cidadã em São José dos Campos
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Nossa Missão</h2>
              <p className="text-lg text-muted-foreground text-center mb-12">
                O Observatório da Cidade de São José dos Campos é uma iniciativa cidadã dedicada a 
                promover a transparência, o controle social e a participação democrática através do 
                monitoramento e análise de dados públicos sobre a gestão municipal.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Eye className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>Transparência</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Tornamos os dados públicos acessíveis e compreensíveis para todos os cidadãos, 
                      facilitando o acompanhamento das ações governamentais.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <Users className="h-6 w-6 text-secondary" />
                      </div>
                      <CardTitle>Participação Cidadã</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Incentivamos a participação ativa dos cidadãos no monitoramento e avaliação 
                      das políticas públicas municipais.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>Dados Objetivos</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Utilizamos metodologias rigorosas para coletar, processar e apresentar informações 
                      de forma imparcial e baseada em evidências.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <Shield className="h-6 w-6 text-secondary" />
                      </div>
                      <CardTitle>Controle Social</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Fortalecemos os mecanismos de fiscalização e accountability, permitindo que a 
                      sociedade acompanhe o desempenho de seus representantes.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* About the Platform */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-center">Sobre a Plataforma</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Nossa plataforma oferece ferramentas inovadoras para o acompanhamento da gestão pública 
                  em São José dos Campos:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Observabilidade da Qualidade das Ações Parlamentares:</strong> Sistema colaborativo 
                    de avaliação do desempenho dos vereadores, permitindo que cidadãos, técnicos e parlamentares 
                    avaliem proposições legislativas com base em critérios objetivos de relevância, viabilidade, 
                    impacto e inovação.
                  </li>
                  <li>
                    <strong>Mapa de Segurança Pública:</strong> Visualização geográfica de indicadores de 
                    segurança, permitindo a identificação de padrões e tendências na cidade.
                  </li>
                  <li>
                    <strong>Blog com Análises Contextualizadas:</strong> Artigos gerados com inteligência 
                    artificial que combinam dados de atividade parlamentar e segurança pública para oferecer 
                    insights relevantes sobre a gestão municipal.
                  </li>
                </ul>
                <p>
                  Todos os dados utilizados são provenientes de fontes oficiais públicas, garantindo a 
                  confiabilidade e a legitimidade das informações apresentadas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Participe</h2>
              <p className="text-lg text-muted-foreground mb-6">
                O Observatório da Cidade é um projeto colaborativo e contamos com a participação 
                de todos os cidadãos interessados em contribuir para uma gestão pública mais 
                transparente e eficiente.
              </p>
              <p className="text-muted-foreground">
                Para se tornar um avaliador ou colaborar com o projeto, navegue até a seção de 
                Atividade Parlamentar e cadastre-se como avaliador.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
