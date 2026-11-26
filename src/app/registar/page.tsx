'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone } from 'lucide-react';

export default function RegistarPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const enviarCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    const res = await fetch('/api/enviar-codigo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErro(data.error || 'Erro ao criar conta.');
      return;
    }

    localStorage.setItem('cliente_usdt', JSON.stringify(data.user));
    router.push('/painel');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-emerald-400">
            KwanzaUSDT
          </Link>
          <h1 className="text-xl font-bold mt-2">Criar Conta de Cliente</h1>
          <p className="text-sm text-slate-400 mt-1">
            Preencha os seus dados para começar a comprar USDT
          </p>
        </div>

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={enviarCadastro} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400">Nome Completo</label>
            <div className="relative mt-1">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                required
                type="text"
                placeholder="Ex: João Manuel"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">E-mail</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                required
                type="email"
                placeholder="seuemail@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">Telefone / WhatsApp (Angola)</label>
            <div className="relative mt-1">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                required
                type="tel"
                placeholder="923 000 000"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">Palavra-passe</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition"
          >
            {loading ? 'A criar conta...' : 'Criar Conta e Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
            Iniciar Sessão
          </Link>
        </p>
      </div>
    </div>
  );
}
