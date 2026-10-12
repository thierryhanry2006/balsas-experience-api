# Balsas Experience API

API REST que disponibiliza informações sobre atrações turísticas de Balsas, Maranhão. Permite listar, filtrar, cadastrar, atualizar e excluir atrações, além de registrar avaliações de visitantes. Os dados ficam em um banco PostgreSQL hospedado no Neon e são acessados com o Prisma ORM.

- **API publicada:** https://balsas-experience-api-wzjo.onrender.com
- **Repositório:** https://github.com/thierryhanry2006/balsas-experience-api

> A API está no plano gratuito do Render, que desliga o serviço após 15 minutos sem uso. A primeira requisição depois disso pode levar cerca de 1 minuto para responder.

## Identificação

| Campo | Informação |
|---|---|
| Instituição | Centro Universitário Unibalsas |
| Curso | Análise e Desenvolvimento de Sistemas (ADS) |
| Disciplina | Programação para Web |
| Professor | Marcos David Souza Ramos |
| Entrega | 17/10/2026 |

## Equipe

| Integrante | Contribuição |
|---|---|
| Thierry Hanry Ribeiro da Silva Cardoso | Desenvolvimento do código da API |
| Emilly Karoline Cunha Fernandes | Publicação da API (banco no Neon, repositório no GitHub e serviço no Render) |

## Tecnologias

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Node.js | 22 (Render) / 24 (desenvolvimento) | Executar JavaScript no servidor |
| Express | 5.x | Criar a API HTTP e suas rotas |
| PostgreSQL | gerenciado pelo Neon | Armazenar os dados |
| Prisma ORM | 7.10.0 | Definir o modelo de dados, migrações e consultas |
| @prisma/adapter-pg e pg | 7.10.0 e 8.x | Conectar o Prisma ao PostgreSQL |
| dotenv | 17.x | Ler as variáveis do arquivo `.env` |
| Neon | — | Hospedar o banco PostgreSQL (região São Paulo) |
| Render | — | Hospedar a API publicamente |
| Git e GitHub | — | Controle de versões e hospedagem do código |

## Pré-requisitos

- Node.js 22.12 ou superior
- npm
- Git
- Um banco PostgreSQL (por exemplo, um projeto gratuito no [Neon](https://neon.com))

## Instalação

```bash
git clone https://github.com/thierryhanry2006/balsas-experience-api.git
cd balsas-experience-api
npm install
```

Se o npm avisar que os scripts de instalação do Prisma não foram autorizados (`install-scripts`), autorize e reconstrua:

```bash
npm install-scripts approve prisma @prisma/engines
npm rebuild prisma @prisma/engines
```

## Configuração

Copie o arquivo de exemplo e preencha a conexão com o banco:

```bash
# Windows (PowerShell)
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

Conteúdo do `.env`:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST/NOME_DO_BANCO?sslmode=require"
PORT=3000
```

No Neon, use a connection string **sem connection pooling** (o endereço não deve conter `-pooler`). O `.env` está no `.gitignore` e nunca deve ser enviado ao GitHub.

## Migrações

Cria as tabelas no banco e gera o cliente do Prisma:

```bash
npx prisma migrate deploy
npx prisma generate
```

Os dois comandos juntos também podem ser executados com `npm run build`.

## Carga inicial (seed)

Insere as 8 atrações de exemplo, com 3 categorias e 15 tags:

```bash
npm run seed
```

O seed usa `upsert`, então pode ser executado mais de uma vez sem duplicar registros.

## Execução

```bash
npm run dev    # desenvolvimento, reinicia ao alterar arquivos em src/
npm start      # produção
```

A API fica disponível em `http://localhost:3000`. Para conferir, acesse `http://localhost:3000/health`.

## Testes

O arquivo `testes.http` reúne 15 requisições que cobrem todos os endpoints, incluindo os casos de erro. Para executá-lo no VS Code, instale a extensão **REST Client** (Huachao Mao) e clique em **Send Request** acima de cada requisição, na ordem. Os testes 11 a 15 usam o ID da atração criada no teste 9.

## Modelo de dados

| Tabela | Campos principais | Relacionamentos |
|---|---|---|
| `Categoria` | `id`, `nome` (único) | uma categoria tem várias atrações |
| `Tag` | `id`, `nome` (único) | muitos-para-muitos com `Atracao` |
| `Atracao` | `id`, `nome`, `descricao`, `cidade`, `estado`, `distanciaCentroKm`, `criadaEm`, `categoriaId` | pertence a uma categoria, tem várias tags e várias avaliações |
| `Avaliacao` | `id`, `visitante`, `nota`, `comentario`, `criadaEm`, `atracaoId` | pertence a uma atração; é apagada junto com ela (`onDelete: Cascade`) |
| `_AtracaoToTag` | `A` (atração), `B` (tag) | tabela de ligação criada pelo Prisma |

Uma atração pode ter várias tags, e uma tag pode estar em várias atrações. Por isso a relação entre as duas é muitos-para-muitos, guardada na tabela de ligação `_AtracaoToTag`.

## Endpoints

| Método | Rota | Finalidade | Status |
|---|---|---|---|
| GET | `/` | Informações da API | 200 |
| GET | `/health` | Verifica a API e a conexão com o banco | 200 |
| GET | `/atracoes` | Lista as atrações | 200 |
| GET | `/atracoes?categoria=...` | Filtra por categoria | 200 |
| GET | `/atracoes?tag=...` | Filtra por tag | 200 |
| GET | `/atracoes?q=...` | Busca por texto no nome e na descrição | 200 |
| GET | `/atracoes/:id` | Consulta uma atração com avaliações e nota média | 200, 400, 404 |
| POST | `/atracoes` | Cadastra uma atração | 201, 400 |
| PUT | `/atracoes/:id` | Atualiza uma atração e substitui suas tags | 200, 400, 404 |
| DELETE | `/atracoes/:id` | Exclui uma atração | 204, 400, 404 |
| POST | `/atracoes/:id/avaliacoes` | Registra uma avaliação (nota de 1 a 5) | 201, 400, 404 |
| GET | `/categorias` | Lista as categorias com a quantidade de atrações | 200 |

Os filtros não diferenciam maiúsculas de minúsculas. Rotas inexistentes respondem 404, um JSON malformado no corpo responde 400 e erros internos respondem 500 sem expor detalhes do banco.

### Exemplo: cadastrar uma atração

Requisição:

```http
POST /atracoes
Content-Type: application/json

{
  "nome": "Atração de teste",
  "descricao": "Registro criado para testar o cadastro da API.",
  "categoria": "Lazer",
  "distanciaCentroKm": 5,
  "tags": ["teste", "lazer"]
}
```

Resposta `201 Created` (cabeçalho `Location: /atracoes/9`):

```json
{
  "id": 9,
  "nome": "Atração de teste",
  "descricao": "Registro criado para testar o cadastro da API.",
  "cidade": "Balsas",
  "estado": "MA",
  "distanciaCentroKm": 5,
  "criadaEm": "2026-10-12T00:49:17.105Z",
  "categoriaId": 2,
  "categoria": { "id": 2, "nome": "Lazer" },
  "tags": [
    { "id": 8, "nome": "lazer" },
    { "id": 16, "nome": "teste" }
  ]
}
```

## Publicação

A API está publicada no Render, com o banco no Neon:

| Configuração | Valor |
|---|---|
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| Variáveis de ambiente | `DATABASE_URL` (connection string do Neon) e `NODE_VERSION=22` |

A cada `git push` na branch `main`, o Render publica a nova versão automaticamente. O `prisma migrate deploy` roda no build e aplica apenas migrações pendentes, sem apagar dados.

## Estrutura do projeto

```
balsas-experience-api/
├── prisma/
│   ├── migrations/          # migrações versionadas
│   ├── atracoes.json        # dados de exemplo
│   ├── schema.prisma        # modelo de dados
│   └── seed.js              # carga inicial
├── src/
│   ├── controllers/         # lógica de cada endpoint
│   ├── routes/              # definição das rotas
│   ├── app.js               # configuração do Express
│   └── prisma.js            # conexão com o banco
├── .env.example
├── prisma.config.ts
├── package.json
└── testes.http              # coleção de testes (REST Client)
```