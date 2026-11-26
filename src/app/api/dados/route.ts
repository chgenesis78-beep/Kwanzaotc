import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { readStore, writeStore } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get('tipo');
  const store = readStore();

  if (tipo === 'config') {
    return NextResponse.json(store.config);
  }

  if (tipo === 'ordens_cliente') {
    const clienteId = searchParams.get('clienteId');
    return NextResponse.json(store.ordens.filter((o) => o.cliente_id === clienteId));
  }

  if (tipo === 'painel_equipa') {
    return NextResponse.json({ ordens: store.ordens, config: store.config });
  }

  if (tipo === 'painel_admin') {
    return NextResponse.json({
      ordens: store.ordens,
      config: store.config,
      assistentes: store.utilizadores.filter((u) => u.role === 'assistente'),
      clientes: store.utilizadores.filter((u) => u.role === 'cliente'),
      recuperacoes: store.recuperacoes,
    });
  }

  return NextResponse.json({ error: 'Parâmetro inválido' }, { status: 400 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { acao } = body;
  const store = readStore();

  if (acao === 'criar_ordem') {
    store.ordens.unshift({
      id: crypto.randomUUID(),
      cliente_id: body.cliente_id,
      cliente_nome: body.cliente_nome,
      cliente_email: body.cliente_email,
      quantidade_usdt: body.quantidade_usdt,
      valor_kz: body.valor_kz,
      cotacao_aplicada: body.cotacao_aplicada,
      metodo_pagamento: body.metodo_pagamento,
      referencia_comprovativo: body.referencia_comprovativo,
      wallet_destino: body.wallet_destino,
      rede_blockchain: body.rede_blockchain,
      status: 'pendente',
      atendido_por: null,
      criado_em: new Date().toISOString(),
    });
    writeStore(store);
    return NextResponse.json({ success: true });
  }

  if (acao === 'atualizar_ordem') {
    const idx = store.ordens.findIndex((o) => o.id === body.ordem_id);
    if (idx >= 0) {
      store.ordens[idx].status = body.status;
      store.ordens[idx].atendido_por = body.atendido_por;
      writeStore(store);
    }
    return NextResponse.json({ success: true });
  }

  if (acao === 'atualizar_config') {
    store.config = {
      ...store.config,
      preco_usdt_kz: Number(body.preco_usdt_kz) || store.config.preco_usdt_kz,
      iban_empresa: body.iban_empresa ?? store.config.iban_empresa,
      express_numero: body.express_numero ?? store.config.express_numero,
      referencia_entidade: body.referencia_entidade ?? store.config.referencia_entidade,
      paypay_conta: body.paypay_conta ?? store.config.paypay_conta,
      ekwanza_conta: body.ekwanza_conta ?? store.config.ekwanza_conta,
      unitel_money_conta: body.unitel_money_conta ?? store.config.unitel_money_conta,
    };
    writeStore(store);
    return NextResponse.json({ success: true });
  }

  if (acao === 'registar_assistente') {
    const { nome, email, telefone, senha } = body;
    const jaExiste = store.utilizadores.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (jaExiste) {
      return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 400 });
    }
    store.utilizadores.push({
      id: crypto.randomUUID(),
      nome,
      email,
      telefone,
      senha,
      role: 'assistente',
      email_verificado: true,
      codigo_verificacao: null,
      criado_em: new Date().toISOString(),
    });
    writeStore(store);
    return NextResponse.json({ success: true });
  }

  if (acao === 'remover_assistente') {
    store.utilizadores = store.utilizadores.filter((u) => u.id !== body.id);
    writeStore(store);
    return NextResponse.json({ success: true });
  }

  if (acao === 'marcar_senha_enviada') {
    const idx = store.recuperacoes.findIndex((r) => r.id === body.pedido_id);
    if (idx >= 0) {
      store.recuperacoes[idx].status = 'enviado_manualmente';
      writeStore(store);
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
}
