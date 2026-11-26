'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Wallet, Clock, CheckCircle2, XCircle, Copy, Send } from 'lucide-react';

export default function PainelClientePage() {
  const router = useRouter();
  const [cliente, setCliente] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [ordens, setOrdens] = useState<any[]>([]);

  const [quantidadeUsdt, setQuantidadeUsdt] = useState('50');
  const [metodo, setMetodo] = useState('Multicaixa Express');
  const [wallet, setWallet] = useState('');
  const [rede, setRede] = useState('TRC20');
  const [referencia, setReferencia] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    const salvo = localStorage.getItem('cliente_usdt');
    if (!salvo) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(salvo);
    setCliente(user);
    carregarDados(user.id);
  }, [router]);

  const carregarDados = async (clienteId: string) => {
    const resConfig = await fetch('/api/dados?tipo=config');
    setConfig(await resConfig.json());

    const resOrdens = await fetch(`/api/dados?tipo=ordens_cliente&clienteId=${clienteId}`);
    setOrdens(await resOrdens.json());
  };

  const precoUnitario = Number(config?.preco_usdt_kz || 1150);
  const totalKz = (parseFloat(quantidadeUsdt) || 0) * precoUnitario;

  const obterInstrucaoPagamento = () => {
    if (!config) return '';
    switch (metodo) {
      case 'IBAN':
        return `IBAN: ${config.iban_empresa}`;
      case 'Multicaixa Express':
        return `Nº Express: ${config.express_numero}`;
      case 'Pagamentos por Referência':
        return `Entidade: ${config.referencia_entidade} | Ref: ${cliente?.telefone}`;
      case 'PayPay':
        return `Conta PayPay AO: ${config.paypay_conta}`;
      case 'É-Kwanza':
        return `Conta É-Kwanza BAI: ${config.ekwanza_conta}`;
      case 'Unitel Money':
        return `Conta Unitel Money: ${config.unitel_money_conta}`;
      default:
        return '';
    }
  };

  const handleComprar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setSucesso('');

    await fetch('/api/dados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        acao: 'criar_ordem',
        cliente_id: cliente.id,
        cliente_nome: cliente.nome,
        cliente_email: cliente.email,
        quantidade_usdt: parseFloat(quantidadeUsdt),
        valor_kz: totalKz,
        cotacao_aplicada: precoUnitario,
        metodo_pagamento: metodo,
        referencia_comprovativo: referencia,
        wallet_destino: wallet,
        rede_blockchain: rede,
      }),
    });

    setEnviando(false);
    setReferencia('');
    setSucesso('Pedido enviado com sucesso! O vendedor já está a validar o seu pagamento.');
    carregarDados(cliente.id);
  };

  if (!cliente) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 px-6 py-4 flex justify-between items-center">
        <div>
          <span className="text-lg font-black text-emerald-400">KwanzaUSDT</span>
          <span className="ml-3 text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-300">
            Olá, {cliente.nome}
          </span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('cliente_usdt');
            router.push('/login');
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" /> Comprar USDT
            </h2>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg">
              1 USDT = {precoUnitario.toLocaleString('pt-AO')} Kz
            </span>
          </div>

          {sucesso && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-xl mb-4">
              {sucesso}
            </div>
          )}

          <form onSubmit={handleComprar} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400">Quantidade USDT</label>
                <input
                  required
                  type="number"
                  min="150"
                  step="0.01"
                  value={quantidadeUsdt}
                  onChange={(e) => setQuantidadeUsdt(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-bold text-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Total a Pagar (Kz)</label>
                <input
                  readOnly
                  value={`${totalKz.toLocaleString('pt-AO')} Kz`}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-bold text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Método de Pagamento (Angola)</label>
              <select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
              >
                <option>Multicaixa Express</option>
                <option>IBAN</option>
                <option>Pagamentos por Referência</option>
                <option>PayPay</option>
                <option>É-Kwanza</option>
                <option>Unitel Money</option>
              </select>
            </div>

            <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Transfira {totalKz.toLocaleString('pt-AO')} Kz para:</p>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{obterInstrucaoPagamento()}</p>
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(obterInstrucaoPagamento())}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                title="Copiar"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-slate-400">Sua Carteira USDT (Wallet)</label>
                <input
                  required
                  type="text"
                  placeholder="T..."
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Rede</label>
                <select
                  value={rede}
                  onChange={(e) => setRede(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm"
                >
                  <option>TRC20</option>
                  <option>BEP20</option>
                  <option>Polygon</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">ID da Transação / Nº do Comprovativo</label>
              <input
                required
                type="text"
                placeholder="Ex: Transação #9823412 ou Nome do Titular"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
              />
            </div>

            <button
              disabled={enviando}
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition"
            >
              <Send className="w-4 h-4" />
              {enviando ? 'A registar ordem...' : 'Confirmar Pagamento e Pedir USDT'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h2 className="text-lg font-bold mb-4">Minhas Compras de USDT</h2>
          <div className="space-y-3">
            {ordens.length === 0 && (
              <p className="text-sm text-slate-500 py-8 text-center">Ainda não realizou nenhuma compra.</p>
            )}
            {ordens.map((ordem) => (
              <div
                key={ordem.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400">{ordem.quantidade_usdt} USDT</span>
                    <span className="text-xs text-slate-500">• {ordem.rede_blockchain}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Pago: {Number(ordem.valor_kz).toLocaleString('pt-AO')} Kz via {ordem.metodo_pagamento}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-[240px]">
                    Wallet: {ordem.wallet_destino}
                  </p>
                </div>

                <div>
                  {ordem.status === 'pendente' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" /> Pendente
                    </span>
                  )}
                  {ordem.status === 'concluido' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enviado
                    </span>
                  )}
                  {ordem.status === 'rejeitado' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full">
                      <XCircle className="w-3.5 h-3.5" /> Rejeitado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
