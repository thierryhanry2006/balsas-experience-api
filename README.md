# Balsas Experience API

API REST para consultar e gerenciar atrações turísticas de Balsas-MA. Este projeto inicial foi montado com base nos laboratórios fornecidos na disciplina e ainda precisa ser executado, testado e publicado pela equipe.

## Tecnologias
- Node.js 22 (recomendado no material da disciplina)
- Express 5
- PostgreSQL
- Prisma ORM 7.10
- JavaScript com módulos ES

## Pré-requisitos
- Node.js 22 e npm
- Um banco PostgreSQL (local ou hospedado, por exemplo no Neon)
- Cliente HTTP para testar endpoints (Postman, Insomnia ou extensão REST Client)

## Instalação e configuração

```bash
npm install
```

Copie `.env.example` para `.env` e substitua o valor de `DATABASE_URL` pela URL real do seu PostgreSQL. Não publique o `.env` nem compartilhe sua senha.

No Windows PowerShell, por exemplo:

```powershell
Copy-Item .env.example .env
```

Depois de configurar o banco:

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run seed
npm run dev
```

A API ficará disponível em `http://localhost:3000` por padrão.

## Endpoints

| Método | Caminho | Descrição |
|---|---|---|
| GET | `/` | Informações da API |
| GET | `/health` | Verifica a API e a conexão com o banco |
| GET | `/atracoes` | Lista atrações |
| GET | `/atracoes?categoria=Histórico%20e%20Urbano` | Filtra por categoria |
| GET | `/atracoes?tag=cultura` | Filtra por tag |
| GET | `/atracoes?q=rio` | Busca no nome e na descrição |
| GET | `/atracoes/:id` | Consulta uma atração e suas avaliações |
| POST | `/atracoes` | Cria uma atração (201) |
| PUT | `/atracoes/:id` | Atualiza uma atração |
| DELETE | `/atracoes/:id` | Exclui uma atração (204) |
| POST | `/atracoes/:id/avaliacoes` | Registra avaliação (201) |
| GET | `/categorias` | Lista categorias e quantidade de atrações |

### Exemplo de criação
Enviar `POST /atracoes` com `Content-Type: application/json` e o corpo:

```json
{
  "nome": "Exemplo de atração",
  "descricao": "Descrição de exemplo para teste da API.",
  "categoria": "Cultura",
  "cidade": "Balsas",
  "estado": "MA",
  "distanciaCentroKm": 2.5,
  "tags": ["cultura", "visita"]
}
```

## Publicação
A URL pública será adicionada após a equipe publicar e testar a API. O repositório GitHub também será informado após sua criação.

## Equipe
Preencher com os nomes dos integrantes e suas contribuições reais antes da entrega.
