# 🚀 Tech Flow API

> API centralizada para gestão, distribuição e inteligência de leads para o mercado de Cursos Técnicos.

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-orange)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Node](https://img.shields.io/badge/NodeJS-18%2B-green)
![Framework](https://img.shields.io/badge/NestJS-Framework-red)
![Database](https://img.shields.io/badge/PostgreSQL-Database-blue)

---

## 📖 Sobre o Projeto

O **Tech Flow API** é uma plataforma backend desenvolvida para centralizar, analisar e distribuir leads de interessados em cursos técnicos, conectando potenciais alunos a instituições de ensino de maneira automatizada e inteligente.

---

## 🎯 Objetivo do Sistema

✅ Centralizar leads  
✅ Distribuir leads automaticamente  
✅ Gerar ranking de empresas  
✅ Controle de acesso JWT  
✅ Inteligência de dados integrada

---

## 🧠 Diferenciais

- Business Intelligence interno
- Arquitetura modular
- JWT
- Pronto para escalar

---

## 📂 Estrutura do Projeto

```text
src/
│
├── auth/
│   ├── controllers
│   └── services
│
├── users/
│   ├── admin
│   └── operators
│
├── enterprises/
│   ├── crud
│   └── analytics
│
└── leads/
    ├── ingestion
    └── assignment
```

---

## 🔌 Endpoints

### Auth
| Método | Rota |
|--------|------|
| POST | /auth/login |
| POST | /auth/register |

### Enterprises
| Método | Rota |
|--------|------|
| GET | /enterprises |
| GET | /enterprises/analytics/ranking |

### Leads
| Método | Rota |
|--------|------|
| POST | /leads |

---

## 🛠 Tecnologias

- Node.js
- NestJS
- PostgreSQL
- TypeORM
- JWT

---

## 🚀 Como Rodar

### 1. Clone
```bash
git clone https://github.com/seu-usuario/tech-flow-api.git
cd tech-flow-api
```

### 2. Instale
```bash
npm install
```

### 3. Execute
```bash
npm run start:dev
```

---

## 📜 Licença
MIT

---

## 👨‍💻 Autor
Pedro Peixoto
