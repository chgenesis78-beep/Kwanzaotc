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
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const existenteIndex = store.utilizadores.findIndex(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (existenteIndex >= 0) {
      if (store.utilizadores[existenteIndex].email_verificado) {
        return NextResponse.json({ error: 'Este e-mail já está registado.' }, { status: 400 });
      }
      store.utilizadores[existenteIndex] = {
        ...store.utilizadores[existenteIndex],
        nome,
        telefone,
        senha,
        codigo_verificacao: codigo,
      };
    } else {
      store.utilizadores.push({
        id: crypto.randomUUID(),
        nome,
        email,
        telefone,
        senha,
        role: 'cliente',
        email_verificado: false,
        codigo_verificacao: codigo,
        criado_em: new Date().toISOString(),
      });
    }

    writeStore(store);

    return NextResponse.json({
      success: true,
      codigo_demo: codigo,
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar registo.' }, { status: 500 });
  }
}
