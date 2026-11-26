'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Wallet, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const [precoUsdt, setPrecoUsdt] = useState<number>(1150);
  const [valorKz, setValorKz] = useState<string>('115000');
  const [usdtCalculado, setUsdtCalculado] = useState<string>('100.00');

  useEffect(() => {
    fetch('/api/dados?tipo=config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.preco_usdt_kz) {
          setPrecoUsdt(Number(data.preco_usdt_kz));
          setUsdtCalculado((115000 / Number(data.preco_usdt_kz)).toFixed(2));
        }
      })
      .catch(() => {});
  }, []);

  const handleKzChange = (val: string) => {
    setValorKz(val);
    const num = parseFloat(val) || 0;
    setUsdtCalculado((num / precoUsdt).toFixed(2));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-xl">
              ₮
            </div>
            <span className="text-xl font-bold tracking-tight">
              Kwanza<span className="text-emerald-400">USDT</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Entrar
            </Link>
            <Link
              href="/registar"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm px-5 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Cotação Oficial Hoje: 1 USDT = {precoUsdt.toLocaleString('pt-AO')} Kz
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Compre <span className="text-emerald-400">USDT</span> em Angola com rapidez e segurança.
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed">
            Liquidação direta na sua carteira TRC20 ou BEP20. Pague em Kwanzas usando Multicaixa Express, IBAN, Referência, PayPay, É-Kwanza ou Unitel Money.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/registar"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-7 py-4 rounded-xl transition"
            >
              Começar Agora <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold px-7 py-4 rounded-xl transition"
            >
              Já tenho conta
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" /> Envio Rápido
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Verificado
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" /> Zero Taxas Ocultas
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Simulador de Câmbio</h2>
            <span className="text-xs bg-slate-800 text-emerald-400 px-3 py-1 rounded-lg font-mono">
              1 USDT = {precoUsdt} AOA
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Você Paga (Kwanzas - AOA)</label>
              <div className="relative">
                <input
                  type="number"
                  value={valorKz}
                  onChange={(e) => handleKzChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-xl font-bold focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  AOA
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400">
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Você Recebe (Tether USDT)</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={usdtCalculado}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-xl font-bold text-emerald-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400">
                  USDT
                </span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-slate-400 mb-3">Métodos de pagamento aceites:</p>
              <div className="flex flex-wrap gap-2">
                {['Multicaixa Express', 'IBAN', 'Referência', 'PayPay', 'É-Kwanza', 'Unitel Money'].map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md text-slate-300"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {m}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/registar"
              className="block w-full text-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl transition mt-4"
            >
              Comprar {usdtCalculado} USDT Agora
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} KwanzaUSDT Angola. Todos os direitos reservados.
      </footer>
    </div>
  );
}
