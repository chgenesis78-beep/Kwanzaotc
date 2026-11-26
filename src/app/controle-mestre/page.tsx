'use client';

import { useState } from 'react';
import { Crown, DollarSign, Users, KeyRound, Check, X, Trash2 } from 'lucide-react';

export default function SuperAdminPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [credenciais, setCredenciais] = useState({ email: '', senha: '', pin: '' });
  const [erro, setErro] = useState('');

  const [dados, setDados] = useState<any>(null);
  const [aba, setAba] = useState<'ordens' | 'cotacao' | 'assistentes' | 'senhas'>('ordens');

  const [configForm, setConfigForm] = useState<any>({});
  const [novoAssistente, setNovoAssistente] = useState({ nome: '', email: '', telefone: '', senha: '' });
  const [novasSenhas, setNovasSenhas] = useState<{ [key: string]: string }>({});

  const entrarAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'login_super_admin', ...credenciais }),
    });
    if (!res.ok) {
      setErro('Credenciais de Super Admin inválidas.');
      return;
    }
    setAutenticado(true);
    carregarTudo();
  };

  const carregarTudo = async () => {
    const res = await fetch('/api/dados?tipo=painel_admin');
    const json = await res.json();
    setDados(json);
    setConfigForm(json.config || {});
  };

  const salvarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/dados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'atualizar_config', ...configForm }),
    });
    alert('Cotação e dados de pagamento atualizados!');
    carregarTudo();
  };

  const criarAssistente = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/dados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'registar_assistente', ...novoAssistente }),
    });
    if (!res.ok) {
      alert('Erro: E-mail já cadastrado.');
      return;
    }
    setNovoAssistente({ nome: '', email: '', telefone: '', senha: '' });
    carregarTudo();
  };

  const redefinirSenhaCliente = async (pedido: any) => {
    const novaSenha = novasSenhas[pedido.id];
    if (!novaSenha) return alert('Digite a nova palavra-passe primeiro.');

    await fetch('/api/dados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        acao: 'redefinir_senha_cliente',
        pedido_id: pedido.id,
        email_cliente: pedido.email_cliente,
        nova_senha: novaSenha,
      }),
    });
    alert(`Senha alterada para: ${novaSenha}. Envie para o cliente via WhatsApp (${pedido.telefone_cliente}).`);
    carregarTudo();
  };

  if (!autenticado) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
        <div className="max-w-sm w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8">
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-6">
            <Crown className="w-6 h-6" /> Controle Mestre
          </div>
          {erro && <p className="text-xs text-red-400 mb-3">{erro}</p>}
          <form onSubmit={entrarAdmin} className="space-y-4">
            <input
              required
              type="email"
              placeholder="E-mail Mestre"
              value={credenciais.email}
              onChange={(e) => setCredenciais({ ...credenciais, email: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
            />
            <input
              required
              type="password"
              placeholder="Senha Mestra"
              value={credenciais.senha}
              onChange={(e) => setCredenciais({ ...credenciais, senha: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
            />
            <input
              required
              type="password"
              placeholder="PIN de Segurança"
              value={credenciais.pin}
              onChange={(e) => setCredenciais({ ...credenciais, pin: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
            />
            <button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-sm">
              Desbloquear Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-4 mb-6 gap-4">
          <h1 className="text-2xl font-black text-amber-400 flex items-center gap-2">
            <Crown className="w-6 h-6" /> Painel Super Extra Mega Admin
          </h1>
          <div className="flex gap-2">
            <button onClick={() => setAba('ordens')} className={`px-4 py-2 rounded-xl text-xs font-bold ${aba === 'ordens' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900'}`}>
              Vendas ({dados?.ordens?.length || 0})
            </button>
            <button onClick={() => setAba('cotacao')} className={`px-4 py-2 rounded-xl text-xs font-bold ${aba === 'cotacao' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900'}`}>
              Preço USDT & Contas
            </button>
            <button onClick={() => setAba('assistentes')} className={`px-4 py-2 rounded-xl text-xs font-bold ${aba === 'assistentes' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900'}`}>
              Assistentes ({dados?.assistentes?.length || 0})
            </button>
            <button onClick={() => setAba('senhas')} className={`px-4 py-2 rounded-xl text-xs font-bold ${aba === 'senhas' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900'}`}>
              Recuperar Senhas ({dados?.recuperacoes?.filter((r: any) => r.status === 'pendente').length || 0})
            </button>
          </div>
        </div>

        {aba === 'ordens' && (
          <div className="space-y-3">
            {dados?.ordens?.map((o: any) => (
              <div key={o.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold">{o.cliente_nome} — <span className="text-emerald-400">{o.quantidade_usdt} USDT</span></p>
                  <p className="text-xs text-slate-400">{Number(o.valor_kz).toLocaleString('pt-AO')} Kz via {o.metodo_pagamento} | Ref: {o.referencia_comprovativo}</p>
                  <p className="text-xs font-mono text-amber-300">{o.wallet_destino} ({o.rede_blockchain})</p>
                </div>
                {o.status === 'pendente' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await fetch('/api/dados', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ acao: 'atualizar_ordem', ordem_id: o.id, status: 'concluido', atendido_por: 'Super Admin' }),
                        });
                        carregarTudo();
                      }}
                      className="bg-emerald-500 text-slate-950 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Aprovar
                    </button>
                    <button
                      onClick={async () => {
                        await fetch('/api/dados', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ acao: 'atualizar_ordem', ordem_id: o.id, status: 'rejeitado', atendido_por: 'Super Admin' }),
                        });
                        carregarTudo();
                      }}
                      className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Rejeitar
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold uppercase text-slate-400">{o.status} ({o.atendido_por})</span>
                )}
              </div>
            ))}
          </div>
        )}

        {aba === 'cotacao' && (
          <form onSubmit={salvarConfig} className="max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="font-bold text-amber-400 flex items-center gap-2"><DollarSign className="w-5 h-5" /> Definir Cotação e Contas de Recebimento</h2>
            <div>
              <label className="text-xs text-slate-400">Preço de 1 USDT em Kwanzas (Exclusivo Admin)</label>
              <input
                type="number"
                value={configForm.preco_usdt_kz || ''}
                onChange={(e) => setConfigForm({ ...configForm, preco_usdt_kz: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-amber-500/40 rounded-xl px-4 py-3 text-lg font-bold text-emerald-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">IBAN da Empresa</label>
              <input
                type="text"
                value={configForm.iban_empresa || ''}
                onChange={(e) => setConfigForm({ ...configForm, iban_empresa: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Multicaixa Express</label>
                <input
                  type="text"
                  value={configForm.express_numero || ''}
                  onChange={(e) => setConfigForm({ ...configForm, express_numero: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Entidade Referência</label>
                <input
                  type="text"
                  value={configForm.referencia_entidade || ''}
                  onChange={(e) => setConfigForm({ ...configForm, referencia_entidade: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">PayPay AO</label>
                <input
                  type="text"
                  value={configForm.paypay_conta || ''}
                  onChange={(e) => setConfigForm({ ...configForm, paypay_conta: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">É-Kwanza</label>
                <input
                  type="text"
                  value={configForm.ekwanza_conta || ''}
                  onChange={(e) => setConfigForm({ ...configForm, ekwanza_conta: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Unitel Money</label>
                <input
                  type="text"
                  value={configForm.unitel_money_conta || ''}
                  onChange={(e) => setConfigForm({ ...configForm, unitel_money_conta: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
            </div>
            <button className="w-full bg-amber-500 text-slate-950 font-bold py-3 rounded-xl">
              Guardar Alterações
            </button>
          </form>
        )}

        {aba === 'assistentes' && (
          <div className="grid md:grid-cols-2 gap-6">
            <form onSubmit={criarAssistente} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="font-bold flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" /> Cadastrar Novo Assistente</h2>
              <input
                required
                placeholder="Nome do Assistente"
                value={novoAssistente.nome}
                onChange={(e) => setNovoAssistente({ ...novoAssistente, nome: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
              />
              <input
                required
                type="email"
                placeholder="E-mail de Acesso"
                value={novoAssistente.email}
                onChange={(e) => setNovoAssistente({ ...novoAssistente, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
              />
              <input
                required
                placeholder="Telefone"
                value={novoAssistente.telefone}
                onChange={(e) => setNovoAssistente({ ...novoAssistente, telefone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
              />
              <input
                required
                placeholder="Definir Palavra-passe"
                value={novoAssistente.senha}
                onChange={(e) => setNovoAssistente({ ...novoAssistente, senha: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
              />
              <button className="w-full bg-blue-600 font-bold py-3 rounded-xl text-sm">
                Registar Assistente
              </button>
            </form>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <h2 className="font-bold">Equipa Ativa</h2>
              {dados?.assistentes?.map((a: any) => (
                <div key={a.id} className="bg-slate-950 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{a.nome}</p>
                    <p className="text-xs text-slate-400">{a.email} • Senha: {a.senha}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch('/api/dados', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ acao: 'remover_assistente', id: a.id }),
                      });
                      carregarTudo();
                    }}
                    className="text-red-400 p-2 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {aba === 'senhas' && (
          <div className="space-y-3">
            <h2 className="font-bold flex items-center gap-2 text-amber-400"><KeyRound className="w-5 h-5" /> Pedidos de Redefinição de Senha</h2>
            {dados?.recuperacoes?.map((r: any) => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="font-bold text-sm">{r.email_cliente}</p>
                  <p className="text-xs text-slate-400">WhatsApp do Cliente: {r.telefone_cliente}</p>
                </div>

                {r.status === 'pendente' ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nova senha para o cliente"
                      value={novasSenhas[r.id] || ''}
                      onChange={(e) => setNovasSenhas({ ...novasSenhas, [r.id]: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs"
                    />
                    <button
                      onClick={() => redefinirSenhaCliente(r)}
                      className="bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl"
                    >
                      Definir & Devolver
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-emerald-400">
                    Resolvido • Nova senha definida: <strong>{r.nova_senha_definida}</strong>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
