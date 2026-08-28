# Planner Virtual — Projeto PLP

Planner pessoal com **PostgreSQL**, API **Ruby on Rails** e frontend **Next.js (TypeScript)**. O stack sobe com Docker Compose.

```text
.
├── docker-compose.yml
├── .env.example
├── backend/          # Rails 8 + PostgreSQL
└── frontend/         # Next.js App Router
```

| Serviço   | URL                    |
|-----------|------------------------|
| Frontend  | http://localhost:3000  |
| Backend   | http://localhost:3001  |
| Postgres  | localhost:5432         |

## Como executar

```bash
cp .env.example .env
docker compose up --build
```

Na primeira subida o backend roda `db:prepare` (cria o banco e aplica as migrations).

## Desenvolvimento sem Docker nas apps

Suba só o banco:

```bash
docker compose up db
```

Depois, em terminais separados:

```bash
cd backend && bundle install && bin/rails db:prepare && bin/rails server
cd frontend && npm install && npm run dev
```

O frontend em modo local (fora do Compose) usa a porta **3000** do Next. Ajuste `FRONTEND_ORIGIN` se as portas mudarem.

## Variáveis de ambiente

Copie `.env.example` para `.env`. O Rails lê `POSTGRES_*`; o Next lê `NEXT_PUBLIC_API_URL`.
