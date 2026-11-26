# KwanzaUSDT - Plataforma Oficial de Venda de USDT em Angola

## Como Configurar e Hospedar na Vercel

### 1. Configurar Banco de Dados (Supabase)
1. Crie uma conta gratuita em https://supabase.com e crie um novo projeto.
2. Vá em **SQL Editor**, cole todo o conteúdo do arquivo `database.sql` e clique em **Run**.
3. Vá em **Project Settings > API** e copie:
   - `Project URL` -> será a variável `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` (secret key) -> será a variável `SUPABASE_SERVICE_ROLE_KEY`

### 2. Configurar Envio de E-mail (Resend)
1. Crie uma conta gratuita em https://resend.com.
2. Gere uma **API Key** -> será a variável `RESEND_API_KEY`.
3. Se ainda não tiver domínio próprio configurado no Resend, use `onboarding@resend.dev` na variável `EMAIL_REMETENTE`.

### 3. Subir para o GitHub e Hospedar na Vercel
1. Suba esta pasta para um repositório no seu GitHub.
2. Acesse https://vercel.com, importe o repositório e adicione as 7 variáveis de ambiente (veja o arquivo `.env.example`):
   - `SUPER_ADMIN_EMAIL`
   - `SUPER_ADMIN_PASSWORD`
   - `SUPER_ADMIN_PIN`
   - `RESEND_API_KEY`
   - `EMAIL_REMETENTE`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 4. URLs Secretas do Sistema
- **Cliente:** `/login` e `/registar`
- **Assistente de Vendas (Oculto):** `/acesso-equipa`
- **Super Admin (Oculto):** `/controle-mestre`
