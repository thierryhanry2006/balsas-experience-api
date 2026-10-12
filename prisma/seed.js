import 'dotenv/config';
import fs from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL no arquivo .env antes de executar o seed.');
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

try {
  const caminho = new URL('./atracoes.json', import.meta.url);
  const atracoes = JSON.parse(await fs.readFile(caminho, 'utf8'));
  for (const item of atracoes) {
    const localizacao = item.localizacao ?? {};
    const categoriaNome = item.categoria || 'Outros';
    const categoria = await prisma.categoria.upsert({ where: { nome: categoriaNome }, update: {}, create: { nome: categoriaNome } });
    const tagConnect = [];
    for (const nomeBruto of (item.tags ?? [])) {
      const nome = String(nomeBruto).trim().toLowerCase();
      if (!nome) continue;
      const tag = await prisma.tag.upsert({ where: { nome }, update: {}, create: { nome } });
      tagConnect.push({ id: tag.id });
    }
    await prisma.atracao.upsert({
      where: { id: Number(item.id) },
      update: {
        nome: item.nome, descricao: item.descricao, cidade: localizacao.cidade || 'Balsas',
        estado: localizacao.estado || 'MA', distanciaCentroKm: item.distanciaCentroKm ?? null,
        categoria: { connect: { id: categoria.id } }, tags: { set: tagConnect }
      },
      create: {
        id: Number(item.id), nome: item.nome, descricao: item.descricao,
        cidade: localizacao.cidade || 'Balsas', estado: localizacao.estado || 'MA',
        distanciaCentroKm: item.distanciaCentroKm ?? null,
        categoriaId: categoria.id, tags: { connect: tagConnect }
      }
    });
  }
  // Ajusta o contador de IDs, porque o seed inseriu IDs fixos (1 a 8)
  await prisma.$queryRaw`SELECT setval(pg_get_serial_sequence('"Atracao"', 'id'), (SELECT MAX(id) FROM "Atracao"))`;
  console.log(`Carga inicial concluída: ${atracoes.length} atrações processadas.`);
} finally {
  await prisma.$disconnect();
}
