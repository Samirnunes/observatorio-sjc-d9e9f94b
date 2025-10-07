import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Edit, Loader2, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  author_name: string;
  published: boolean;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [keywords, setKeywords] = useState("");
  const { toast } = useToast();

  const [manualTitle, setManualTitle] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [manualKeywords, setManualKeywords] = useState("");
  const [submittingManual, setSubmittingManual] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const cleanedPosts = data?.map(post => {
        const cleanedContent = post.content.replace(/```(?:html)?/g, '').trim();
        const titleMatch = cleanedContent.match(/<h2>(.*?)<\/h2>/);
        const contentWithoutTitle = titleMatch ? cleanedContent.replace(titleMatch[0], '') : cleanedContent;
        const title = titleMatch ? titleMatch[1] : post.title;

        return {
          ...post,
          title: title,
          content: contentWithoutTitle,
        };
      }) || [];

      setPosts(cleanedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Erro ao carregar posts",
        description: "Não foi possível carregar os posts do blog.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePost = async () => {
    if (!keywords.trim()) {
      toast({
        title: "Palavras-chave necessárias",
        description: "Por favor, insira palavras-chave para gerar o artigo.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
      
      const { data, error } = await supabase.functions.invoke('generate-blog', {
        body: { keywords: keywordArray }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast({
            title: "Limite excedido",
            description: "Muitas requisições. Aguarde alguns instantes.",
            variant: "destructive",
          });
        } else if (error.message.includes('402')) {
          toast({
            title: "Créditos insuficientes",
            description: "Adicione créditos ao workspace para continuar.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      if (data?.content) {
        const cleanedContent = data.content.replace(/```(?:html)?/g, '').trim();
        const titleMatch = cleanedContent.match(/<h2>(.*?)<\/h2>/);
        const title = titleMatch ? titleMatch[1] : 'Artigo Gerado';
        const contentWithoutTitle = titleMatch ? cleanedContent.replace(titleMatch[0], '') : cleanedContent;
        
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert({
            title,
            content: contentWithoutTitle,
            keywords: keywordArray,
            author_name: 'IA do Observatório',
            published: true
          });

        if (insertError) throw insertError;

        toast({
          title: "Artigo gerado!",
          description: "O artigo foi criado e publicado com sucesso.",
        });

        setKeywords("");
        fetchPosts();
      }
    } catch (error) {
      console.error('Error generating post:', error);
      toast({
        title: "Erro ao gerar artigo",
        description: "Não foi possível gerar o artigo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualTitle.trim() || !manualContent.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e conteúdo são necessários para publicar.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingManual(true);
    try {
      const keywordArray = manualKeywords.split(',').map(k => k.trim()).filter(k => k);

      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: manualTitle,
          content: `<p>${manualContent.replace(/\n/g, '</p><p>')}</p>`,
          keywords: keywordArray,
          author_name: 'Equipe do Observatório', // TODO: Get from logged in user
          published: true
        });

      if (error) throw error;

      toast({
        title: "Artigo publicado!",
        description: "Seu artigo foi publicado com sucesso.",
      });

      setManualTitle("");
      setManualContent("");
      setManualKeywords("");
      fetchPosts();
    } catch (error) {
      console.error('Error submitting post:', error);
      toast({
        title: "Erro ao publicar artigo",
        description: "Não foi possível publicar o seu artigo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmittingManual(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-r from-primary to-secondary py-16">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Blog do Observatório
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Análises e reflexões sobre questões importantes para São José dos Campos
            </p>
          </div>
        </section>

        <section className="py-12 bg-gradient-to-b from-background to-muted/30">
          <div className="container grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
            <Card className="shadow-elevated border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Gerador de Artigos com IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Digite palavras-chave (separadas por vírgula) e a IA gerará um artigo.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: transporte público, mobilidade"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    disabled={generating}
                    onKeyPress={(e) => e.key === 'Enter' && generatePost()}
                  />
                  <Button 
                    onClick={generatePost} 
                    disabled={generating}
                    className="gap-2"
                  >
                    {generating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Gerando...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> Gerar</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Escrever Artigo Manualmente
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-title">Título</Label>
                  <Input 
                    id="manual-title"
                    placeholder="Título do seu artigo"
                    value={manualTitle}
                    onChange={e => setManualTitle(e.target.value)}
                    disabled={submittingManual}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-content">Conteúdo</Label>
                  <Textarea
                    id="manual-content"
                    placeholder="Escreva seu artigo aqui. O conteúdo será formatado como parágrafos."
                    value={manualContent}
                    onChange={e => setManualContent(e.target.value)}
                    disabled={submittingManual}
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-keywords">Palavras-chave (separadas por vírgula)</Label>
                  <Input 
                    id="manual-keywords"
                    placeholder="Ex: segurança, câmeras, policiamento"
                    value={manualKeywords}
                    onChange={e => setManualKeywords(e.target.value)}
                    disabled={submittingManual}
                  />
                </div>
                <Button 
                  onClick={handleManualSubmit} 
                  disabled={submittingManual}
                  className="gap-2 w-full"
                >
                  {submittingManual ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Publicando...</>
                  ) : (
                    <>Publicar Artigo</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <h2 className="text-3xl font-bold mb-8">Artigos Publicados</h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  Nenhum artigo publicado ainda. Use os formulários acima para criar.
                </p>
              </Card>
            ) : (
              <div className="grid gap-8 max-w-4xl mx-auto">
                {posts.map((post) => (
                  <Card key={post.id} className="shadow-card hover:shadow-elevated transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        {post.author_name && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {post.author_name}
                            </div>
                          </>
                        )}
                      </div>
                      {post.keywords && post.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {post.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary">{keyword}</Badge>
                          ))}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="prose prose-sm max-w-none blog-content"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
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

export default Blog;