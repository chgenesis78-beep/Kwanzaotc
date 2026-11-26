import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { nome, email, telefone, senha } = await req.json();

    if (!nome || !email || !telefone || !senha) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    const { data: existente } = await supabase
      .from('utilizadores')
      .select('id, email_verificado')
      .eq('email', email)
      .single();

    if (existente && existente.email_verificado) {
      return NextResponse.json({ error: 'Este e-mail já está registado.' }, { status: 400 });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    if (existente) {
      const { error } = await supabase
        .from('utilizadores')
        .update({ nome, telefone, senha, codigo_verificacao: codigo })
        .eq('id', existente.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('utilizadores').insert({
        nome,
        email,
        telefone,
        senha,
        role: 'cliente',
        email_verificado: false,
        codigo_verificacao: codigo,
      });
      if (error) throw error;
    }

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_REMETENTE || 'onboarding@resend.dev',
        to: email,
        subject: 'Código de Verificação - KwanzaUSDT Angola',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; background: #0f172a; color: #ffffff; border-radius: 14px;">
            <h2 style="color: #10b981; margin-top: 0;">Verifique a sua conta</h2>
            <p>Olá <strong>${nome}</strong>,</p>
            <p>Use o código abaixo para ativar a sua conta na plataforma KwanzaUSDT:</p>
            <div style="background: #1e293b; padding: 18px; text-align: center; font-size: 30px; font-weight: bold; letter-spacing: 8px; color: #10b981; border-radius: 10px; margin: 20px 0;">
              ${codigo}
            </div>
            <p style="font-size: 12px; color: #94a3b8;">Se não solicitou este registo, ignore este e-mail.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erro ao processar registo. Verifique a conexão com o banco de dados.' },
      { status: 500 }
    );
  }
}
