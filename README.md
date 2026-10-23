# Finora

> Sistema de controle de finanças pessoais: cadastre seus cartões, organize gastos por categoria e acompanhe para onde vai o seu dinheiro.

![Java](https://img.shields.io/badge/Java-25-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?logo=springboot)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como executar](#como-executar)
- [Endpoints da API](#endpoints-da-api)
- [Roadmap](#roadmap)
- [Autor](#autor)

---

## Sobre o projeto

O **Finora** é uma aplicação full stack para gestão de finanças pessoais. O objetivo é oferecer uma visão clara das despesas, permitindo registrar cartões, classificar gastos por categoria e, futuramente, acompanhar orçamentos e relatórios mensais.

O projeto também serve como estudo prático de boas práticas de desenvolvimento backend e frontend: arquitetura em camadas, DTOs, validação, tratamento global de exceções e o padrão **Backend for Frontend (BFF)**.

<!-- Adicione aqui um print ou GIF da aplicação quando o frontend estiver pronto -->
<!-- ![Tela inicial do Finora](docs/screenshot.png) -->

---

## Funcionalidades

| Funcionalidade | Status |
|---|---|
| Cadastro de cartões (nome e bandeira) | ✅ Implementado |
| Consulta e atualização de cartões | ✅ Implementado |
| Validação de dados e tratamento de erros | ✅ Implementado |
| Cadastro de categorias de gastos | ✅ Implementado |
| Lançamento de despesas e receitas | ✅ Implementado |
| Dashboard com resumo mensal | 🚧 Em desenvolvimento  |
| Autenticação de usuários | 📋 Planejado |

---

## Tecnologias

### Backend — `finora-api`
- **Java 25**
- **Spring Boot 4** — Web MVC, Data JPA, Validation
- **H2 Database** — banco em arquivo para desenvolvimento
- **MapStruct** — mapeamento entre DTOs e entidades
- **Lombok** — redução de código repetitivo
- **Maven** — build e dependências

### Frontend — `finora-app`
- **Angular 21**
- **TypeScript 5.9**
- **SCSS**

---

## Arquitetura

A API segue o padrão **Backend for Frontend**: ela atende especificamente a aplicação Angular e devolve os dados já no formato que cada tela precisa, cabendo a ela a agregação e a adaptação das informações.

Internamente, o backend é organizado em camadas:

```
Angular ──JSON──▶ Controller ──▶ Service ──▶ Repository ──▶ Banco de dados
                     │              │
                  DTO (Form)    Validação + Mapper ──▶ Entity
                     ▲
                  DTO (Detalhes) ◀── resposta
```

| Camada | Responsabilidade |
|---|---|
| **Controller** | Recebe as requisições HTTP e devolve as respostas |
| **Service** | Regras de negócio: validar → mapear → persistir |
| **Repository** | Persistência com Spring Data JPA |
| **Entity** | Representação das tabelas do banco |
| **DTOs** (`Form` / `Detalhes`) | Objetos JSON de entrada e saída, criados como `record` |
| **Mapper** | Converte formulários em entidades e entidades em DTOs (MapStruct) |

### Organização dos pacotes

```
finora_api
├── common/            # Código reutilizável por todos os domínios
│   ├── exceptions/
│   └── validation/
├── dominio/           # Domínios de negócio
│   ├── cartao/
│   │   ├── dto/
│   │   ├── mapper/
│   │   └── model/
│   └── categoria/
└── infra/             # Configurações e infraestrutura
    └── handlers/      # Tratamento global de exceções
```

---

## Estrutura do repositório

Este é um **monorepo** com o backend e o frontend:

```
finora/
├── finora-api/    # API REST em Spring Boot
└── finora-app/    # Aplicação web em Angular
```

---

## Como executar

### Pré-requisitos
- [JDK 25](https://jdk.java.net/)
- [Node.js 24+](https://nodejs.org/) e npm
- [Angular CLI 21](https://angular.dev/tools/cli): `npm install -g @angular/cli`

### 1. Clonar o repositório

```bash
git clone https://github.com/melchiorettorafael2/finora.git
cd finora
```

### 2. Subir a API

```bash
cd finora-api
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`.

O console do banco H2 fica em `http://localhost:8080/h2-console`:
- **JDBC URL:** `jdbc:h2:file:./data/finora-db`
- **Usuário:** `sa`
- **Senha:** `sa`

### 3. Subir o frontend

Em outro terminal:

```bash
cd finora-app
npm install
ng serve
```

A aplicação abre em `http://localhost:4200`.

---

## Endpoints da API

### Cartões — `/cartoes`

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/cartoes` | Cadastra um cartão |
| `GET` | `/cartoes/{id}` | Busca um cartão pelo ID |
| `PUT` | `/cartoes/{id}` | Atualiza um cartão |

**Exemplo de requisição**

```http
POST /cartoes
Content-Type: application/json

{
  "nome": "Cartão principal",
  "bandeira": "MASTERCARD"
}
```

**Bandeiras aceitas:** `VISA`, `MASTERCARD`, `AMERICAN_EXPRESS`, `DINNERS`, `ELO`

**Respostas de erro**

| Status | Quando acontece |
|---|---|
| `422 Unprocessable Content` | Campos obrigatórios ausentes ou dados inválidos |
| `404 Not Found` | Cartão não encontrado para o ID informado |

---

## Roadmap

- [x] Estrutura inicial da API em camadas
- [x] CRUD de cartões com validação
- [x] Tratamento global de exceções
- [x] CRUD de categorias
- [x] Lançamentos (despesas e receitas)
- [x] Telas do frontend em Angular
- [ ] Dashboard com gráficos de gastos por categoria
- [ ] Autenticação com Spring Security + JWT
- [ ] Migrar para PostgreSQL e versionar o banco com Flyway
- [ ] Documentação da API com Swagger / OpenAPI
- [ ] Testes unitários e de integração
- [ ] Docker Compose para subir tudo com um comando
- [ ] Pipeline de CI/CD com GitHub Actions
- [ ] Deploy na AWS

---

## Autor

**Rafael Melchioretto** — Desenvolvedor Java Full Stack

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/SEU-PERFIL)
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/melchiorettorafael2)
