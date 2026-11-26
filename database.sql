-- COPIE E COLE ESTE CODIGO NO SQL EDITOR DO SUPABASE

CREATE TABLE IF NOT EXISTS configuracoes (
  id INT PRIMARY KEY DEFAULT 1,
  preco_usdt_kz NUMERIC NOT NULL DEFAULT 1150,
  iban_empresa TEXT DEFAULT 'AO06.0040.0000.1234.5678.9012.3',
  express_numero TEXT DEFAULT '923 000 000',
  referencia_entidade TEXT DEFAULT '00542',
  paypay_conta TEXT DEFAULT '923 000 000',
  ekwanza_conta TEXT DEFAULT '923 000 000',
  unitel_money_conta TEXT DEFAULT '923 000 000'
);

INSERT INTO configuracoes (id, preco_usdt_kz)
VALUES (1, 1150)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS utilizadores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT NOT NULL,
  senha TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cliente',
  email_verificado BOOLEAN DEFAULT FALSE,
  codigo_verificacao TEXT,
  wallet_usdt_padrao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ordens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES utilizadores(id),
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  quantidade_usdt NUMERIC NOT NULL,
  valor_kz NUMERIC NOT NULL,
  cotacao_aplicada NUMERIC NOT NULL,
  metodo_pagamento TEXT NOT NULL,
  referencia_comprovativo TEXT NOT NULL,
  wallet_destino TEXT NOT NULL,
  rede_blockchain TEXT NOT NULL DEFAULT 'TRC20',
  status TEXT NOT NULL DEFAULT 'pendente',
  atendido_por TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recuperacao_senhas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_cliente TEXT NOT NULL,
  telefone_cliente TEXT,
  status TEXT DEFAULT 'pendente',
  nova_senha_definida TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
