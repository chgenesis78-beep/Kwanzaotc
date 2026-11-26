'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginClientePage() {
  const router = useRouter();
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'login_cliente', email, senha }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErro(data.error);
      return;
    }

    localStorage.setItem('cliente_usdt', JSON.stringify(data.user));
    router.push('/painel');
  };

  const handleEsqueciSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setMensagem('');

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'esqueci_senha', email, telefone }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErro(data.error);
      return;
    }

    setMensagem(data.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-black text-emerald-400">
            KwanzaUSDT
          </Link>
          <h1 className="text-xl font-bold mt-2">
            {modoRecuperar ? 'Recuperar Palavra-Passe' : 'Área do Cliente'}
          </h1>
        </div>

        {erro && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl mb-4">{erro}</div>}
        {mensagem && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-xl mb-4">{mensagem}</div>}

        {!modoRecuperar ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">E-mail</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <div className="flex justify-between">
                <label className="text-xs text-slate-400">Palavra-passe</label>
                <button
                  type="button"
                  onClick={() => setModoRecuperar(true)}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Esqueci a palavra-passe
                </button>
              </div>
              <input
                required
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition"
            >
              {loading ? 'A entrar...' : 'Entrar na Conta'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleEsqueciSenha} className="space-y-4">
            <p className="text-xs text-slate-400">
              Informe o seu e-mail cadastrado e WhatsApp. O nosso Administrador irá gerar uma nova senha e devolver diretamente para si.
            </p>
            <div>
              <label className="text-xs text-slate-400">E-mail Cadastrado</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">WhatsApp para receber a nova senha</label>
              <input
                required
                type="tel"
                placeholder="923 000 000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl transition"
            >
              Solicitar Nova Palavra-Passe
            </button>
            <button
              type="button"
              onClick={() => setModoRecuperar(false)}
              className="w-full text-xs text-slate-400 hover:text-white py-2"
            >
              Voltar ao Login
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          Ainda não tem conta?{' '}
          <Link href="/registar" className="text-emerald-400 font-semibold hover:underline">
            Criar Conta
          </Link>
        </p>
      </div>
    </div>
  );
}
