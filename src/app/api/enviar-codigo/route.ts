import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { readStore, writeStore } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { nome, email, telefone, senha } = await req.json();

    if (!nome || !email || !telefone || !senha) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    const store = readStore();
    const existenteIndex = store.utilizadores.findIndex(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    let cliente;

    if (existenteIndex >= 0) {
      if (store.utilizadores[existenteIndex].role === 'cliente') {
        return NextResponse.json({ error: 'Este e-mail já está registado.' }, { status: 400 });
      }
      store.utilizadores[existenteIndex] = {
        ...store.utilizadores[existenteIndex],
        nome,
        telefone,
        senha,
        email_verificado: true,
        codigo_verificacao: null,
      };
      cliente = store.utilizadores[existenteIndex];
    } else {
      cliente = {
        id: crypto.randomUUID(),
        nome,
        email,
        telefone,
        senha,
        role: 'cliente' as const,
        email_verificado: true,
        codigo_verificacao: null,
        criado_em: new Date().toISOString(),
      };
      store.utilizadores.push(cliente);
    }

    writeStore(store);

    return NextResponse.json({
      success: true,
      user: cliente,
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar registo.' }, { status: 500 });
  }
}
