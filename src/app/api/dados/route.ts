import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get('tipo');

  if (tipo === 'config') {
    const { data } = await supabase.from('configuracoes').select('*').eq('id', 1).single();
    return NextResponse.json(data || { preco_usdt_kz: 1150 });
  }

  if (tipo === 'ordens_cliente') {
    const clienteId = searchParams.get('clienteId');
    const { data } = await supabase
      .from('ordens')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('criado_em', { ascending: false });
    return NextResponse.json(data || []);
  }

  if (tipo === 'painel_equipa') {
    const { data: ordens } = await supabase.from('ordens').select('*').order('criado_em', { ascending: false });
    const { data: config } = await supabase.from('configuracoes').select('*').eq('id', 1).single();
    return NextResponse.json({ ordens: ordens || [], config });
  }

  if (tipo === 'painel_admin') {
    const { data: ordens } = await supabase.from('ordens').select('*').order('criado_em', { ascending: false });
    const { data: config } = await supabase.from('configuracoes').select('*').eq('id', 1).single();
    const { data: assistentes } = await supabase.from('utilizadores').select('*').eq('role', 'assistente');
    const { data: clientes } = await supabase.from('utilizadores').select('*').eq('role', 'cliente');
    const { data: recuperacoes } = await supabase
      .from('recuperacao_senhas')
      .select('*')
      .order('criado_em', { ascending: false });

    return NextResponse.json({
      ordens: ordens || [],
      config,
      assistentes: assistentes || [],
      clientes: clientes || [],
      recuperacoes: recuperacoes || [],
    });
  }

  return NextResponse.json({ error: 'Parâmetro inválido' }, { status: 400 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { acao } = body;

  if (acao === 'criar_ordem') {
    const {
      cliente_id,
      cliente_nome,
      cliente_email,
      quantidade_usdt,
      valor_kz,
      cotacao_aplicada,
      metodo_pagamento,
      referencia_comprovativo,
      wallet_destino,
      rede_blockchain,
    } = body;

    const { error } = await supabase.from('ordens').insert({
      cliente_id,
      cliente_nome,
      cliente_email,
      quantidade_usdt,
      valor_kz,
      cotacao_aplicada,
      metodo_pagamento,
      referencia_comprovativo,
      wallet_destino,
      rede_blockchain,
      status: 'pendente',
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (acao === 'atualizar_ordem') {
    const { ordem_id, status, atendido_por } = body;
    await supabase.from('ordens').update({ status, atendido_por }).eq('id', ordem_id);
    return NextResponse.json({ success: true });
  }

  if (acao === 'atualizar_config') {
    const {
      preco_usdt_kz,
      iban_empresa,
      express_numero,
      referencia_entidade,
      paypay_conta,
      ekwanza_conta,
      unitel_money_conta,
    } = body;

    await supabase
      .from('configuracoes')
      .update({
        preco_usdt_kz,
        iban_empresa,
        express_numero,
        referencia_entidade,
        paypay_conta,
        ekwanza_conta,
        unitel_money_conta,
      })
      .eq('id', 1);

    return NextResponse.json({ success: true });
  }

  if (acao === 'registar_assistente') {
    const { nome, email, telefone, senha } = body;
    const { error } = await supabase.from('utilizadores').insert({
      nome,
      email,
      telefone,
      senha,
      role: 'assistente',
      email_verificado: true,
    });
    if (error) return NextResponse.json({ error: 'E-mail já está em uso.' }, { status: 400 });
    return NextResponse.json({ success: true });
  }

  if (acao === 'remover_assistente') {
    await supabase.from('utilizadores').delete().eq('id', body.id);
    return NextResponse.json({ success: true });
  }

  if (acao === 'redefinir_senha_cliente') {
    const { pedido_id, email_cliente, nova_senha } = body;
    await supabase.from('utilizadores').update({ senha: nova_senha }).eq('email', email_cliente);
    await supabase
      .from('recuperacao_senhas')
      .update({ status: 'resolvido', nova_senha_definida: nova_senha })
      .eq('id', pedido_id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
}
