import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KwanzaUSDT | Compra e Venda Oficial de USDT em Angola',
  description: 'Compre USDT em Kwanzas com IBAN, Multicaixa Express, PayPay, É-Kwanza e Unitel Money.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-AO">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
