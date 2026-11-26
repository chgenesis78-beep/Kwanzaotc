import fs from 'fs';
import path from 'path';

export interface StoreData {
  config: {
    preco_usdt_kz: number;
    iban_empresa: string;
    express_numero: string;
    referencia_entidade: string;
    paypay_conta: string;
    ekwanza_conta: string;
    unitel_money_conta: string;
  };
  utilizadores: Array<{
    id: string;
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    role: 'cliente' | 'assistente';
    email_verificado: boolean;
    codigo_verificacao: string | null;
    criado_em: string;
  }>;
  ordens: Array<any>;
  recuperacoes: Array<{
    id: string;
    email_cliente: string;
    telefone_cliente: string;
    senha_atual: string;
    status: 'pendente' | 'enviado_manualmente';
    criado_em: string;
  }>;
}

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'store.json');

const initialData: StoreData = {
  config: {
    preco_usdt_kz: 1150,
    iban_empresa: 'AO06.0040.0000.1234.5678.9012.3',
    express_numero: '923 000 000',
    referencia_entidade: '00542',
    paypay_conta: '923 000 000',
    ekwanza_conta: '923 000 000',
    unitel_money_conta: '923 000 000',
  },
  utilizadores: [],
  ordens: [],
  recuperacoes: [],
};

export function readStore(): StoreData {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  const raw = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(raw);
}

export function writeStore(data: StoreData): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}
