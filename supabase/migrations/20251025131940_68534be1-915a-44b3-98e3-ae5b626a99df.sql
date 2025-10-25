-- ============================================
-- MÓDULO DE AVALIAÇÃO PARLAMENTAR
-- ============================================

-- 1. CRIAR ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'avaliador_pg', 'avaliador_tec', 'avaliador_par', 'visitante');
CREATE TYPE public.evaluator_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.action_status AS ENUM ('draft', 'under_evaluation', 'completed', 'archived');

-- 2. TABELA DE PERFIS DE USUÁRIO
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role public.app_role DEFAULT 'visitante',
  evaluator_status public.evaluator_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. TABELA DE DOCUMENTOS DE COMPROVAÇÃO
CREATE TABLE public.user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL, -- 'cpf', 'diploma', 'proof_of_residence', etc
  document_url TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.user_profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

-- 4. TABELA DE AÇÕES PARLAMENTARES
CREATE TABLE public.acoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  councilor_id UUID REFERENCES public.councilors(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL, -- 'Projeto de Lei', 'Emenda', etc
  numero TEXT,
  data_proposicao DATE NOT NULL,
  area_tematica TEXT,
  status public.action_status DEFAULT 'draft',
  external_id TEXT, -- ID do sistema câmara sem papel
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.acoes ENABLE ROW LEVEL SECURITY;

-- 5. CONFIGURAÇÃO DE PESOS
CREATE TABLE public.pesos_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criterio_1_relevancia NUMERIC(3,2) DEFAULT 0.20,
  criterio_2_viabilidade NUMERIC(3,2) DEFAULT 0.20,
  criterio_3_impacto NUMERIC(3,2) DEFAULT 0.15,
  criterio_4_clareza NUMERIC(3,2) DEFAULT 0.15,
  criterio_5_abrangencia NUMERIC(3,2) DEFAULT 0.15,
  criterio_6_inovacao NUMERIC(3,2) DEFAULT 0.15,
  peso_pg NUMERIC(3,2) DEFAULT 1.0,
  peso_tec NUMERIC(3,2) DEFAULT 2.0,
  peso_par NUMERIC(3,2) DEFAULT 1.5,
  lambda_recencia NUMERIC(4,3) DEFAULT 0.120,
  tempo_minimo_leitura INTEGER DEFAULT 30,
  min_avaliacoes_pg INTEGER DEFAULT 10,
  min_avaliacoes_tec INTEGER DEFAULT 3,
  min_avaliacoes_par INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pesos_config ENABLE ROW LEVEL SECURITY;

-- Inserir configuração padrão
INSERT INTO public.pesos_config (id) VALUES (gen_random_uuid());

-- 6. TABELA DE AVALIAÇÕES
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acao_id UUID REFERENCES public.acoes(id) ON DELETE CASCADE NOT NULL,
  evaluator_id UUID REFERENCES public.user_profiles(user_id) ON DELETE CASCADE NOT NULL,
  criterio_1_relevancia INTEGER NOT NULL CHECK (criterio_1_relevancia >= 0 AND criterio_1_relevancia <= 5),
  criterio_2_viabilidade INTEGER NOT NULL CHECK (criterio_2_viabilidade >= 0 AND criterio_2_viabilidade <= 5),
  criterio_3_impacto INTEGER NOT NULL CHECK (criterio_3_impacto >= 0 AND criterio_3_impacto <= 5),
  criterio_4_clareza INTEGER NOT NULL CHECK (criterio_4_clareza >= 0 AND criterio_4_clareza <= 5),
  criterio_5_abrangencia INTEGER NOT NULL CHECK (criterio_5_abrangencia >= 0 AND criterio_5_abrangencia <= 5),
  criterio_6_inovacao INTEGER NOT NULL CHECK (criterio_6_inovacao >= 0 AND criterio_6_inovacao <= 5),
  comentario TEXT,
  tempo_leitura INTEGER NOT NULL, -- em segundos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(acao_id, evaluator_id)
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- 7. TABELA DE SCORES POR AÇÃO
CREATE TABLE public.scores_acao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acao_id UUID REFERENCES public.acoes(id) ON DELETE CASCADE NOT NULL UNIQUE,
  score_total NUMERIC(5,2) DEFAULT 0.00,
  num_avaliacoes_pg INTEGER DEFAULT 0,
  num_avaliacoes_tec INTEGER DEFAULT 0,
  num_avaliacoes_par INTEGER DEFAULT 0,
  score_pg NUMERIC(5,2) DEFAULT 0.00,
  score_tec NUMERIC(5,2) DEFAULT 0.00,
  score_par NUMERIC(5,2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.scores_acao ENABLE ROW LEVEL SECURITY;

-- 8. TABELA DE SCORES POR VEREADOR
CREATE TABLE public.scores_vereador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  councilor_id UUID REFERENCES public.councilors(id) ON DELETE CASCADE NOT NULL UNIQUE,
  score_total NUMERIC(7,2) DEFAULT 0.00,
  num_acoes_avaliadas INTEGER DEFAULT 0,
  score_medio NUMERIC(5,2) DEFAULT 0.00,
  ranking_position INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.scores_vereador ENABLE ROW LEVEL SECURITY;

-- 9. TABELA DE AUDITORIA
CREATE TABLE public.auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(user_id),
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject'
  table_name TEXT NOT NULL,
  record_id UUID,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNÇÕES DE SEGURANÇA (SECURITY DEFINER)
-- ============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = _user_id
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_evaluator(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = _user_id
      AND role IN ('avaliador_pg', 'avaliador_tec', 'avaliador_par')
      AND evaluator_status = 'approved'
  );
$$;

-- ============================================
-- RLS POLICIES
-- ============================================

-- user_profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os perfis"
  ON public.user_profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Usuários podem criar seu próprio perfil"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem atualizar qualquer perfil"
  ON public.user_profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- user_documents
CREATE POLICY "Usuários podem ver seus próprios documentos"
  ON public.user_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os documentos"
  ON public.user_documents FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Usuários podem inserir seus próprios documentos"
  ON public.user_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem atualizar documentos"
  ON public.user_documents FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- acoes
CREATE POLICY "Todos podem ver ações"
  ON public.acoes FOR SELECT
  USING (true);

CREATE POLICY "Admins podem inserir ações"
  ON public.acoes FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar ações"
  ON public.acoes FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem deletar ações"
  ON public.acoes FOR DELETE
  USING (public.is_admin(auth.uid()));

-- pesos_config
CREATE POLICY "Todos podem ver configurações de pesos"
  ON public.pesos_config FOR SELECT
  USING (true);

CREATE POLICY "Admins podem atualizar configurações"
  ON public.pesos_config FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- avaliacoes
CREATE POLICY "Avaliadores podem ver suas próprias avaliações"
  ON public.avaliacoes FOR SELECT
  USING (auth.uid() = evaluator_id);

CREATE POLICY "Admins podem ver todas as avaliações"
  ON public.avaliacoes FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Avaliadores aprovados podem inserir avaliações"
  ON public.avaliacoes FOR INSERT
  WITH CHECK (
    auth.uid() = evaluator_id AND 
    public.is_evaluator(auth.uid())
  );

CREATE POLICY "Avaliadores podem atualizar suas próprias avaliações"
  ON public.avaliacoes FOR UPDATE
  USING (auth.uid() = evaluator_id);

-- scores_acao
CREATE POLICY "Todos podem ver scores de ações"
  ON public.scores_acao FOR SELECT
  USING (true);

-- scores_vereador
CREATE POLICY "Todos podem ver scores de vereadores"
  ON public.scores_vereador FOR SELECT
  USING (true);

-- auditoria
CREATE POLICY "Admins podem ver auditoria"
  ON public.auditoria FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Sistema pode inserir logs de auditoria"
  ON public.auditoria FOR INSERT
  WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acoes_updated_at
  BEFORE UPDATE ON public.acoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pesos_config_updated_at
  BEFORE UPDATE ON public.pesos_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNÇÃO PARA CALCULAR SCORES
-- ============================================

CREATE OR REPLACE FUNCTION public.calculate_action_score(action_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  config RECORD;
  pg_score NUMERIC := 0;
  tec_score NUMERIC := 0;
  par_score NUMERIC := 0;
  pg_count INTEGER := 0;
  tec_count INTEGER := 0;
  par_count INTEGER := 0;
  total_score NUMERIC := 0;
  eval RECORD;
  profile_weight NUMERIC;
  criteria_score NUMERIC;
BEGIN
  -- Buscar configuração
  SELECT * INTO config FROM public.pesos_config LIMIT 1;
  
  -- Calcular scores por perfil
  FOR eval IN 
    SELECT a.*, up.role
    FROM public.avaliacoes a
    JOIN public.user_profiles up ON a.evaluator_id = up.user_id
    WHERE a.acao_id = action_id
  LOOP
    -- Calcular score ponderado pelos critérios
    criteria_score := (
      eval.criterio_1_relevancia * config.criterio_1_relevancia +
      eval.criterio_2_viabilidade * config.criterio_2_viabilidade +
      eval.criterio_3_impacto * config.criterio_3_impacto +
      eval.criterio_4_clareza * config.criterio_4_clareza +
      eval.criterio_5_abrangencia * config.criterio_5_abrangencia +
      eval.criterio_6_inovacao * config.criterio_6_inovacao
    );
    
    -- Aplicar peso do perfil
    IF eval.role = 'avaliador_pg' THEN
      pg_score := pg_score + (criteria_score * config.peso_pg);
      pg_count := pg_count + 1;
    ELSIF eval.role = 'avaliador_tec' THEN
      tec_score := tec_score + (criteria_score * config.peso_tec);
      tec_count := tec_count + 1;
    ELSIF eval.role = 'avaliador_par' THEN
      par_score := par_score + (criteria_score * config.peso_par);
      par_count := par_count + 1;
    END IF;
  END LOOP;
  
  -- Calcular médias
  IF pg_count > 0 THEN pg_score := pg_score / pg_count; END IF;
  IF tec_count > 0 THEN tec_score := tec_score / tec_count; END IF;
  IF par_count > 0 THEN par_score := par_score / par_count; END IF;
  
  -- Score total (média ponderada dos perfis)
  total_score := (pg_score + tec_score + par_score) / GREATEST(
    CASE WHEN pg_count > 0 THEN 1 ELSE 0 END +
    CASE WHEN tec_count > 0 THEN 1 ELSE 0 END +
    CASE WHEN par_count > 0 THEN 1 ELSE 0 END, 1
  );
  
  -- Atualizar ou inserir score
  INSERT INTO public.scores_acao (
    acao_id, score_total, num_avaliacoes_pg, num_avaliacoes_tec, 
    num_avaliacoes_par, score_pg, score_tec, score_par
  ) VALUES (
    action_id, total_score, pg_count, tec_count, 
    par_count, pg_score, tec_score, par_score
  )
  ON CONFLICT (acao_id) DO UPDATE SET
    score_total = EXCLUDED.score_total,
    num_avaliacoes_pg = EXCLUDED.num_avaliacoes_pg,
    num_avaliacoes_tec = EXCLUDED.num_avaliacoes_tec,
    num_avaliacoes_par = EXCLUDED.num_avaliacoes_par,
    score_pg = EXCLUDED.score_pg,
    score_tec = EXCLUDED.score_tec,
    score_par = EXCLUDED.score_par,
    updated_at = now();
END;
$$;

-- Trigger para recalcular score quando nova avaliação é inserida
CREATE OR REPLACE FUNCTION public.trigger_recalculate_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.calculate_action_score(NEW.acao_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER recalculate_action_score
  AFTER INSERT OR UPDATE ON public.avaliacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalculate_scores();