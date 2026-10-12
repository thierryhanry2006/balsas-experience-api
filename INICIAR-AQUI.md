# Comece por aqui

1. Instale Node.js 22.
2. Abra esta pasta no VS Code.
3. Abra o terminal na raiz da pasta e execute `npm install`.
4. Crie um banco PostgreSQL no Neon ou use uma instalação local.
5. Copie `.env.example` para `.env` e configure `DATABASE_URL`.
6. Execute `npx prisma migrate dev --name init`.
7. Execute `npx prisma generate`.
8. Execute `npm run seed` para carregar as atrações de exemplo fornecidas no material da disciplina.
9. Execute `npm run dev`.
10. Teste `http://localhost:3000/health` no navegador ou cliente HTTP.

Se algum comando apresentar erro, copie a mensagem completa do terminal (mas nunca envie a senha do banco) para que possamos corrigir.

Importante: este é um ponto de partida de código, ainda não validado no seu computador. Antes da entrega, a equipe precisa instalar, executar e testar todos os endpoints, revisar os dados, adicionar os nomes reais no README, criar o repositório público e publicar a API.
