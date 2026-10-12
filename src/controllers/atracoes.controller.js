import { prisma } from '../prisma.js';

const COM_RELACOES = {
  categoria: true,
  tags: { orderBy: { nome: 'asc' } }
};

function montarDados({ nome, descricao, categoria, cidade, estado, distanciaCentroKm, tags }) {
  return {
    nome: nome.trim(),
    descricao: descricao.trim(),
    cidade: cidade?.trim() || 'Balsas',
    estado: estado?.trim() || 'MA',
    distanciaCentroKm: distanciaCentroKm === '' || distanciaCentroKm == null ? null : Number(distanciaCentroKm),
    categoria: {
      connectOrCreate: {
        where: { nome: categoria.trim() },
        create: { nome: categoria.trim() }
      }
    },
    tags: {
      connectOrCreate: (Array.isArray(tags) ? tags : []).filter(t => typeof t === 'string' && t.trim()).map(tag => ({
        where: { nome: tag.trim().toLowerCase() },
        create: { nome: tag.trim().toLowerCase() }
      }))
    }
  };
}

export async function listar(req, res) {
  const { categoria, tag, q } = req.query;
  const atracoes = await prisma.atracao.findMany({
    where: {
      categoria: categoria ? { nome: { equals: String(categoria), mode: 'insensitive' } } : undefined,
      tags: tag ? { some: { nome: { equals: String(tag), mode: 'insensitive' } } } : undefined,
      OR: q ? [
        { nome: { contains: String(q), mode: 'insensitive' } },
        { descricao: { contains: String(q), mode: 'insensitive' } }
      ] : undefined
    },
    include: COM_RELACOES,
    orderBy: { nome: 'asc' }
  });
  res.json(atracoes);
}

export async function buscarPorId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'ID inválido' });
  const atracao = await prisma.atracao.findUnique({
    where: { id },
    include: { ...COM_RELACOES, avaliacoes: { orderBy: { criadaEm: 'desc' } } }
  });
  if (!atracao) return res.status(404).json({ erro: 'Atração não encontrada' });
  const resumo = await prisma.avaliacao.aggregate({ where: { atracaoId: id }, _avg: { nota: true }, _count: true });
  res.json({ ...atracao, notaMedia: resumo._avg.nota, totalAvaliacoes: resumo._count });
}

function validarCorpo(body) {
  return body && typeof body.nome === 'string' && body.nome.trim() &&
    typeof body.descricao === 'string' && body.descricao.trim() &&
    typeof body.categoria === 'string' && body.categoria.trim();
}

export async function criar(req, res) {
  if (!validarCorpo(req.body)) return res.status(400).json({ erro: 'Os campos nome, descricao e categoria são obrigatórios' });
  if (req.body.distanciaCentroKm != null && req.body.distanciaCentroKm !== '' && (!Number.isFinite(Number(req.body.distanciaCentroKm)) || Number(req.body.distanciaCentroKm) < 0)) {
    return res.status(400).json({ erro: 'distanciaCentroKm deve ser um número não negativo' });
  }
  const nova = await prisma.atracao.create({ data: montarDados(req.body), include: COM_RELACOES });
  res.status(201).location(`/atracoes/${nova.id}`).json(nova);
}

export async function atualizar(req, res) {
  if (!validarCorpo(req.body)) return res.status(400).json({ erro: 'Os campos nome, descricao e categoria são obrigatórios' });
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'ID inválido' });
    if (req.body.distanciaCentroKm != null && req.body.distanciaCentroKm !== '' && (!Number.isFinite(Number(req.body.distanciaCentroKm)) || Number(req.body.distanciaCentroKm) < 0)) {
    return res.status(400).json({ erro: 'distanciaCentroKm deve ser um número não negativo' });
  }
  try {
    const dados = montarDados(req.body);
    const atualizada = await prisma.atracao.update({
      where: { id },
      data: { ...dados, tags: { set: [], connectOrCreate: dados.tags.connectOrCreate } },
      include: COM_RELACOES
    });
    res.json(atualizada);
  } catch (erro) {
    if (erro.code === 'P2025') return res.status(404).json({ erro: 'Atração não encontrada' });
    throw erro;
  }
}

export async function remover(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ erro: 'ID inválido' });
  try {
    await prisma.atracao.delete({ where: { id } });
    res.status(204).end();
  } catch (erro) {
    if (erro.code === 'P2025') return res.status(404).json({ erro: 'Atração não encontrada' });
    throw erro;
  }
}

export async function avaliar(req, res) {
  const atracaoId = Number(req.params.id);
  const { visitante, nota, comentario } = req.body ?? {};
  if (!Number.isInteger(atracaoId) || atracaoId < 1) return res.status(400).json({ erro: 'ID inválido' });
  if (typeof visitante !== 'string' || !visitante.trim() || !Number.isInteger(nota) || nota < 1 || nota > 5) {
    return res.status(400).json({ erro: 'Informe o visitante e uma nota inteira de 1 a 5' });
  }
  try {
    const avaliacao = await prisma.avaliacao.create({
      data: { visitante: visitante.trim(), nota, comentario: typeof comentario === 'string' && comentario.trim() ? comentario.trim() : null, atracao: { connect: { id: atracaoId } } }
    });
    res.status(201).location(`/atracoes/${atracaoId}`).json(avaliacao);
  } catch (erro) {
    if (erro.code === 'P2025') return res.status(404).json({ erro: 'Atração não encontrada' });
    throw erro;
  }
}
