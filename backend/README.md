# Backend - Controle Financeiro SaaS

API REST multi-tenant desenvolvida com FastAPI, SQLAlchemy 2.0 e JWT.

## Requisitos

- Python 3.11+
- pip ou pipenv

## Instalação Local

```bash
# Criar ambiente virtual
python -m venv .venv

# Ativar ambiente (Windows)
.venv\Scripts\activate

# Ativar ambiente (Linux/Mac)
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Copiar variáveis de ambiente
cp .env.example .env

# Rodar a aplicação
uvicorn app.main:app --reload --port 8000
```

## Estrutura

```
backend/
├── app/
│   ├── main.py              # Entry point FastAPI
│   ├── core/
│   │   ├── config.py        # Configurações
│   │   ├── database.py      # Conexão DB
│   │   └── security.py      # JWT e hashing
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   └── api/
│       └── v1/              # API routes
├── requirements.txt
├── Dockerfile
└── .env.example
```

## Endpoints

### Auth
- `POST /api/v1/auth/register` - Registrar usuário
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Usuário atual

### Tenants
- `GET /api/v1/tenants` - Listar tenants do usuário
- `POST /api/v1/tenants` - Criar tenant
- `POST /api/v1/tenants/join` - Entrar em tenant
- `GET /api/v1/tenants/{id}/users` - Listar usuários do tenant

### Grupos
- `GET /api/v1/grupos` - Listar grupos
- `POST /api/v1/grupos` - Criar grupo
- `DELETE /api/v1/grupos/{id}` - Deletar grupo

### Categorias
- `GET /api/v1/categorias` - Listar categorias
- `POST /api/v1/categorias` - Criar categoria
- `DELETE /api/v1/categorias/{id}` - Deletar categoria

### Gastos
- `GET /api/v1/gastos` - Listar gastos
- `POST /api/v1/gastos` - Criar gasto
- `PUT /api/v1/gastos/{id}` - Atualizar gasto
- `DELETE /api/v1/gastos/{id}` - Deletar gasto

### Dashboard
- `GET /api/v1/dashboard/stats` - Estatísticas

## Headers Obrigatórios

Todas as rotas (exceto auth) requerem:
- `Authorization: Bearer <token>`
- `X-Tenant-ID: <tenant_uuid>`

## Multi-tenancy

O sistema utiliza header `X-Tenant-ID` para isolar dados entre tenants.
Toda query é automaticamente filtrada pelo tenant atual.
