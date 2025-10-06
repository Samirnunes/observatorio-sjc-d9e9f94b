import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, MapPin, FileText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";
import parliamentaryIcon from "@/assets/parliamentary-icon.png";
import safetyIcon from "@/assets/safety-icon.png";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
          </div>
          
          <div className="relative container py-24 md:py-32">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Observatório da Cidade de São José dos Campos
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                Transparência, dados e engajamento cívico para uma cidade melhor
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/parlamentar">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Explorar Dados <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/blog">
                  <Button size="lg" variant="outline" className="gap-2 bg-white/10 text-white border-white hover:bg-white hover:text-primary">
                    Ler Blog <FileText className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ferramentas do Observatório</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Acesse dados públicos e indicadores importantes para acompanhar a cidade
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-primary/20">
                <CardHeader>
                  <div className="mb-4">
                    <img src={parliamentaryIcon} alt="Atividade Parlamentar" className="h-16 w-16" />
                  </div>
                  <CardTitle className="text-2xl">Índice de Atividade Parlamentar</CardTitle>
                  <CardDescription>
                    Acompanhe o desempenho dos vereadores de São José dos Campos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Propostas apresentadas e aprovadas
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Taxa de comparecimento
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Score de atividade
                    </li>
                  </ul>
                  <Link to="/parlamentar">
                    <Button className="w-full gap-2">
                      Acessar Dashboard <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-secondary/20">
                <CardHeader>
                  <div className="mb-4">
                    <img src={safetyIcon} alt="Segurança Pública" className="h-16 w-16" />
                  </div>
                  <CardTitle className="text-2xl">Mapa de Segurança Pública</CardTitle>
                  <CardDescription>
                    Visualize indicadores de segurança pública na cidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-secondary" />
                      Mapa interativo de incidentes
                    </li>
                    <li className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-secondary" />
                      Estatísticas por região
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-secondary" />
                      Tendências temporais
                    </li>
                  </ul>
                  <Link to="/seguranca">
                    <Button variant="secondary" className="w-full gap-2">
                      Ver Mapa <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Sobre o Observatório</h2>
              <p className="text-lg text-muted-foreground mb-6">
                O Observatório da Cidade é uma plataforma dedicada a promover transparência e engajamento 
                cívico em São José dos Campos. Utilizamos dados públicos para criar ferramentas que 
                permitem aos cidadãos acompanhar indicadores importantes da cidade.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Nossa missão é facilitar o acesso à informação pública, permitindo que cidadãos comuns 
                possam contribuir para uma cidade mais transparente e participativa.
              </p>
              <Link to="/blog">
                <Button size="lg" variant="outline" className="gap-2">
                  Conheça Nosso Blog <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
