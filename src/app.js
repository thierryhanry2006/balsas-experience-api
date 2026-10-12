import 'dotenv/config';
import express from 'express';
import atracoesRoutes from './routes/atracoes.routes.js';
import categoriasRoutes from './routes/categorias.routes.js';
import { prisma } from './prisma.js';

const app = express();
const PORTA = process.env.PORT || 3000;
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => res.json({
  nome: 'Balsas Experience API',
  versao: '1.0.0',
  descricao: 'API de experiências turísticas em Balsas-MA, com PostgreSQL e Prisma',
  endpoints: ['/health', '/atracoes', '/categorias']
}));
app.get('/health', async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok', banco: 'conectado' });
});
app.use('/atracoes', atracoesRoutes);
app.use('/categorias', categoriasRoutes);
app.use((req, res) => res.status(404).json({ erro: `Rota não encontrada: ${req.method} ${req.originalUrl}` }));
app.use((erro, req, res, next) => {
  console.error(erro);
  if (erro.code === 'P2002') return res.status(409).json({ erro: 'Já existe um registro com esse valor único' });
  if (erro instanceof SyntaxError && 'body' in erro) return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  res.status(erro.status || 500).json({ erro: (erro.status && erro.status < 500) ? erro.message : 'Erro interno no servidor' });
});

const server = app.listen(PORTA, '0.0.0.0', () => console.log(`Balsas Experience API rodando na porta ${PORTA}`));
async function encerrar() {
  server.close(async () => { await prisma.$disconnect(); process.exit(0); });
}
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
