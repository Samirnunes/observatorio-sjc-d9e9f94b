import { Building2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">Observatório da Cidade</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Plataforma de transparência e dados públicos de São José dos Campos
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">Início</a></li>
              <li><a href="/parlamentar" className="hover:text-primary transition-colors">Atividade Parlamentar</a></li>
              <li><a href="/seguranca" className="hover:text-primary transition-colors">Segurança Pública</a></li>
              <li><a href="/blog" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Sobre</h3>
            <p className="text-sm text-muted-foreground">
              Uma iniciativa cidadã para promover transparência e engajamento cívico em São José dos Campos.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2025 Observatório da Cidade - São José dos Campos. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
