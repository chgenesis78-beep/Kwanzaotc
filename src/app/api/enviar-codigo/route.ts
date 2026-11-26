import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface Utilizador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  role: 'cliente' | 'assistente';
  email_verificado: boolean;
  codigo_verificacao: string | null;
  criado_em: string;
}

interface StoreData {
  config: Record<string, unknown>;
  utilizadores: Utilizador[];
  ordens: unknown[];
  recuperacoes: unknown[];
}

function getStorePath(): string {
  if (process.env.VERCEL) {
    return path.join('/tmp', 'kwanza-usdt-store.json');
  }
  return path.join(process.cwd(), 'data', 'store.json');
}

function readLocalStore(): StoreData {
  const filePath = getStorePath();
  const dirPath = path.dirname(filePath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    const initial: StoreData = {
      config: { preco_usdt_kz: 1150 },
      utilizadores: [],
      ordens: [],
      recuperacoes: [],
    };
    fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as StoreData;
}

function writeLocalStore(data: StoreData): void {
  const filePath = getStorePath();
  const dirPath = path.dirname(filePath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const nome = String(body?.nome || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const telefone = String(body?.telefone || '').trim();
    const senha = String(body?.senha || '');

    if (!nome || !email || !telefone || !senha) {
      return NextResponse.json(
        { error: 'Preencha nome, e-mail, telefone e palavra-passe.' },
        { status: 400 }
      );
    }

    const store = readLocalStore();
    if (!Array.isArray(store.utilizadores)) {
      store.utilizadores = [];
    }

    const existenteIndex = store.utilizadores.findIndex(
      (u) => String(u.email || '').toLowerCase() === email
    );

    let cliente: Utilizador;

    if (existenteIndex >= 0) {
      if (store.utilizadores[existenteIndex].role === 'cliente') {
        return NextResponse.json(
          { error: 'Este e-mail já está registado como cliente.' },
          { status: 400 }
        );
      }

      cliente = {
        ...store.utilizadores[existenteIndex],
        nome,
        telefone,
        senha,
        email_verificado: true,
        codigo_verificacao: null,
      };
      store.utilizadores[existenteIndex] = cliente;
    } else {
      cliente = {
        id: crypto.randomUUID(),
        nome,
        email,
        telefone,
        senha,
        role: 'cliente',
        email_verificado: true,
        codigo_verificacao: null,
        criado_em: new Date().toISOString(),
      };
      store.utilizadores.push(cliente);
    }

    writeLocalStore(store);

    return NextResponse.json({
      success: true,
      user: cliente,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao registar cliente.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
