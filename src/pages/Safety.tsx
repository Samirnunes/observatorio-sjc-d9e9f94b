import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SafetyDataUpload from "@/components/SafetyDataUpload";
import SafetyMap from "@/components/SafetyMap";

const Safety = () => {

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



        {/* Map */}
        <section className="py-8 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8">Visualização no Mapa</h2>
            <SafetyMap />
          </div>
        </section>

        {/* Data Upload */}
        <section className="py-8 bg-muted/30">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8">Ocorrências</h2>
            <SafetyDataUpload />
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
};

export default Safety;
