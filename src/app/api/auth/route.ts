import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { readStore, writeStore } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { acao } = body;
    const store = readStore();

    if (acao === 'login_cliente') {
      const { email, senha } = body;

      if (!email || !senha) {
        return NextResponse.json(
          { error: 'Preencha o e-mail e a palavra-passe.' },
          { status: 400 }
        );
      }

      const user = store.utilizadores.find(
        (u) =>
          u.email.toLowerCase() === String(email).toLowerCase() &&
          u.senha === senha &&
          u.role === 'cliente'
      );

      if (!user) {
        return NextResponse.json(
          { error: 'E-mail ou palavra-passe incorretos.' },
          { status: 401 }
        );
      }

      return NextResponse.json({ success: true, user });
    }

    if (acao === 'esqueci_senha') {
      const { email, telefone } = body;
      const user = store.utilizadores.find(
        (u) =>
          u.email.toLowerCase() === String(email).toLowerCase() &&
          u.role === 'cliente'
      );

      if (!user) {
        return NextResponse.json(
          { error: 'Nenhuma conta de cliente encontrada com este e-mail.' },
          { status: 404 }
        );
      }

      store.recuperacoes.unshift({
        id: crypto.randomUUID(),
        email_cliente: user.email,
        telefone_cliente: telefone || user.telefone,
        senha_atual: user.senha,
        status: 'pendente',
        criado_em: new Date().toISOString(),
      });
      writeStore(store);

      return NextResponse.json({
        success: true,
        message:
          'Pedido enviado! O Super Administrador irá consultar a sua senha e enviar para o seu e-mail.',
      });
    }

    if (acao === 'login_assistente') {
      const { email, senha } = body;
      const assistente = store.utilizadores.find(
        (u) =>
          u.email.toLowerCase() === String(email).toLowerCase() &&
          u.senha === senha &&
          u.role === 'assistente'
      );

      if (!assistente) {
        return NextResponse.json(
          { error: 'Credenciais de assistente inválidas.' },
          { status: 401 }
        );
      }

      return NextResponse.json({ success: true, user: assistente });
    }

    if (acao === 'login_super_admin') {
      const { email, senha, pin } = body;

      const adminEmail = process.env.SUPER_ADMIN_EMAIL || '';
      const adminSenha = process.env.SUPER_ADMIN_PASSWORD || '';
      const adminPin = process.env.SUPER_ADMIN_PIN || '';

      if (
        adminEmail &&
        email === adminEmail &&
        senha === adminSenha &&
        pin === adminPin
      ) {
        return NextResponse.json({
          success: true,
          admin: { nome: 'Super Admin', email, role: 'super_admin' },
        });
      }

      return NextResponse.json(
        { error: 'Acesso negado. Credenciais mestras inválidas.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
