import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { acao } = body;

    if (acao === 'verificar_otp') {
      const { email, codigo } = body;
      const { data: user } = await supabase
        .from('utilizadores')
        .select('*')
        .eq('email', email)
        .eq('codigo_verificacao', codigo)
        .single();

      if (!user) {
        return NextResponse.json({ error: 'Código inválido ou expirado.' }, { status: 400 });
      }

      await supabase
        .from('utilizadores')
        .update({ email_verificado: true, codigo_verificacao: null })
        .eq('id', user.id);

      return NextResponse.json({ success: true, user });
    }

    if (acao === 'login_cliente') {
      const { email, senha } = body;
      const { data: user } = await supabase
        .from('utilizadores')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .eq('role', 'cliente')
        .single();

      if (!user) {
        return NextResponse.json({ error: 'E-mail ou palavra-passe incorretos.' }, { status: 401 });
      }
      if (!user.email_verificado) {
        return NextResponse.json({ error: 'Por favor, verifique o seu e-mail antes de entrar.' }, { status: 403 });
      }
      return NextResponse.json({ success: true, user });
    }

    if (acao === 'esqueci_senha') {
      const { email, telefone } = body;
      const { data: user } = await supabase
        .from('utilizadores')
        .select('id')
        .eq('email', email)
        .eq('role', 'cliente')
        .single();

      if (!user) {
        return NextResponse.json({ error: 'Nenhuma conta de cliente encontrada com este e-mail.' }, { status: 404 });
      }

      await supabase.from('recuperacao_senhas').insert({
        email_cliente: email,
        telefone_cliente: telefone,
        status: 'pendente',
      });

      return NextResponse.json({
        success: true,
        message: 'Pedido enviado! O Super Administrador irá redefinir a sua senha e entrar em contacto.',
      });
    }

    if (acao === 'login_assistente') {
      const { email, senha } = body;
      const { data: assistente } = await supabase
        .from('utilizadores')
        .select('*')
        .eq('email', email)
        .eq('senha', senha)
        .eq('role', 'assistente')
        .single();

      if (!assistente) {
        return NextResponse.json({ error: 'Credenciais de assistente inválidas.' }, { status: 401 });
      }
      return NextResponse.json({ success: true, user: assistente });
    }

    if (acao === 'login_super_admin') {
      const { email, senha, pin } = body;

      const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'chgenesis78@gmail.com';
      const adminSenha = process.env.SUPER_ADMIN_PASSWORD || '@AlissandraSilva2007@';
      const adminPin = process.env.SUPER_ADMIN_PIN || '00877800';

      if (email === adminEmail && senha === adminSenha && pin === adminPin) {
        return NextResponse.json({
          success: true,
          admin: { nome: 'Super Admin', email, role: 'super_admin' },
        });
      }
      return NextResponse.json({ error: 'Acesso negado. Credenciais mestras inválidas.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
