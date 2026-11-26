'use client';

import { useState } from 'react';
import { Check, X, Shield } from 'lucide-react';

export default function AcessoAssistentePage() {
  const [assistente, setAssistente] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [ordens, setOrdens] = useState<any[]>([]);
  const [precoAtual, setPrecoAtual] = useState<number>(0);

  const loginAssistente = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'login_assistente', email, senha }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErro(data.error);
      return;
    }
    setAssistente(data.user);
    carregarOrdens();
  };

  const carregarOrdens = async () => {
    const res = await fetch('/api/dados?tipo=painel_equipa');
    const data = await res.json();
    setOrdens(data.ordens || []);
    setPrecoAtual(data.config?.preco_usdt_kz || 0);
  };

  const atualizarStatus = async (ordemId: string, status: string) => {
    await fetch('/api/dados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        acao: 'atualizar_ordem',
        ordem_id: ordemId,
        status,
        atendido_por: `Assistente: ${assistente.nome}`,
      }),
    });
    carregarOrdens();
  };

  if (!assistente) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
        <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <div className="flex items-center gap-2 text-blue-400 font-bold mb-4">
            <Shield className="w-5 h-5" /> Portal Operacional
          </div>
          {erro && <p className="text-xs text-red-400 mb-3">{erro}</p>}
          <form onSubmit={loginAssistente} className="space-y-4">
            <input
              required
              type="email"
              placeholder="E-mail do Assistente"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
            />
            <input
              required
              type="password"
              placeholder="Palavra-passe"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-3 rounded-xl text-sm">
              Entrar no Painel de Vendas
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-blue-400">Painel do Assistente de Vendas</h1>
            <p className="text-xs text-slate-400">Operador: {assistente.nome} | Cotação Fixada pelo Admin: {precoAtual} Kz</p>
          </div>
          <button onClick={() => setAssistente(null)} className="text-xs text-slate-400 hover:text-white">
            Sair
          </button>
        </div>

        <div className="space-y-3">
          {ordens.map((o) => (
            <div key={o.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="font-bold text-white">
                  {o.cliente_nome} — <span className="text-emerald-400">{o.quantidade_usdt} USDT ({o.rede_blockchain})</span>
                </p>
                <p className="text-xs text-slate-400">
                  Valor: {Number(o.valor_kz).toLocaleString('pt-AO')} Kz | Método: {o.metodo_pagamento} | Ref: {o.referencia_comprovativo}
                </p>
                <p className="text-xs font-mono text-amber-300 mt-1">Carteira: {o.wallet_destino}</p>
              </div>

              {o.status === 'pendente' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => atualizarStatus(o.id, 'concluido')}
                    className="flex items-center gap-1 bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg"
                  >
                    <Check className="w-4 h-4" /> Aprovar & Enviar USDT
                  </button>
                  <button
                    onClick={() => atualizarStatus(o.id, 'rejeitado')}
                    className="flex items-center gap-1 bg-red-500/20 text-red-400 font-bold text-xs px-4 py-2 rounded-lg"
                  >
                    <X className="w-4 h-4" /> Rejeitar
                  </button>
                </div>
              ) : (
                <span className="text-xs uppercase font-bold text-slate-400">
                  {o.status} ({o.atendido_por})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
