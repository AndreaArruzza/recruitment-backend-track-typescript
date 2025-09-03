# Invoice Management API

**Descrizione**

Questa applicazione fornisce una REST API per la gestione di:
- Utenti (Users)
- Profili fiscali (Tax Profiles)
- Fatture (Invoices)

## Table of Contents

- [Caratteristiche](#caratteristiche)
- [Architettura](#architettura)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisiti](#prerequisiti)
  - [Variabili d'ambiente](#variabili)
  - [Run locale](#run-locale)
  - [Run con Docker Compose](#run-con-docker-compose)
- [Database & Migrations](#database--migrations)
- [OpenAPI / Swagger](#openapi--swagger)
- [Codegen](#codegen)
- [Testing](#testing)
- [Struttura progetto](#struttura-progetto)
- [Api Overview](#api-overview)
- [Security Note](#security-note)

---

## Caratteristiche


- **API Express 5** con architettura a livelli MVC (routes → controllers → services)

- **Autenticazione JWT** (/auth/login) con middleware di protezione delle rotte. Viene verificato anche il ruolo, alcuni servizi sono disponibili solo per ruolo = ADMIN

- **Validazione** tramite OpenApiValidator , che controlla request e response sulla base dello spec OpenAPI (YAML).

- **Generazione input/output** tramite orval. Pattern spec first. Viene creato lo yaml e da quello vengono generati le request e le response

- **Prisma** ORM con PostgreSQL

- **Relazioni**: 📊 Modello dati
    - User → TaxProfile (1–N)
    - TaxProfile → Invoice (1–N)
    - Invoice → InvoiceItem (1–N)
    - Customer → CustomerTaxProfile (1–N)
    Sono inoltre presenti alcune tabelle di supporto:
    - Customer e CustomerTaxProfile: utilizzate per gestire le informazioni dei clienti, inclusi indirizzi di spedizione e fatturazione.

    - InvoiceItem: contiene i dettagli delle singole righe di fattura (prodotti, quantità, prezzi, aliquote, totale riga).

-**Paginazione** e filtri sugli endpoint di lista

-**Documentazione** OpenAPI 3.0 con Swagger UI

-**Logging strutturato** con Pino / pino-http

-**Gestione centralizzata degli errori** con risposte JSON standardizzate

-**Docker** con build multi-stage e Compose (DB + opzionale Nginx come reverse proxy)

**Test di integrazione** con Jest + Supertest

## Architettura

- Design REST: /api/users, /api/tax-profiles, /api/invoices

- Controllers come orchestratori, Services che incapsulano la logica di accesso al DB, DTO validati con OpenValidator

---

## Tech Stack

TypeScript, Express 5, Prisma, PostgreSQL, OpenValidator, JWT, pino, Orval, jest, Supertest, Docker, Nginx.

---

## Getting Started

### Prerequisiti

- **Node.js 20+**
- **Docker** (for Compose)
- **npm**

### Variabili

Creare **`.env`** copiando da qui:

```env

NODE_ENV=development
LOG_LEVEL=debug
JWT_SECRET=dev-secret
DATABASE_URL=postgresql://user:password@localhost:5432/invoice_management?schema=public
POSTGRES_USER= user
POSTGRES_PASSWORD= password
POSTGRES_DB= invoice_management


```

```env.test

NODE_ENV=test
LOG_LEVEL=info
DATABASE_URL=postgresql://user:password@localhost:5433/test_invoice_management?schema=public


```

```env.prod

NODE_ENV=production
PORT=3000
LOG_LEVEL=info
JWT_SECRET=change-me
DATABASE_URL=postgresql://user:password@db:5432/invoice_management?schema=public
POSTGRES_USER= user
POSTGRES_PASSWORD= password
POSTGRES_DB= invoice_management


```

### Run con Docker Compose

Build, avvio, migrazione e seeding all’interno di Docker Compose:
questa modalità è la più completa, in quanto esegue Applicazione + Database + Seeds all’interno di container Docker.

- Development
  docker compose -d --build

- Production
  BUILD_TARGET=production docker compose up -d --build

## App:      http://localhost:80/swagger-ui
## Swagger:  http://localhost:80/swagger-ui.json


### Run locale

```bash
# one time
npm ci
npm run prisma:generate          # generate Prisma client
npm run prisma:migrate           # apply migrations to local DB (.env.local)
npm run orval:generator-dto           # generated DTO from openapi

# running
npm run start
```

---

## Database & Migrations
Per i test c'è un docker compose apposito che crea un container di un altro db utilizzato solo per i test

1. Comando avvio docker:

docker compose -f docker-compose-test.yml up -d

2. Generare Prisma Client e applica le migrazioni sul DB di test
   
   npm run prisma:generate:test
   
   npm run prisma:migrate:test

---

## OpenAPI / Swagger

- Source spec: `src/config/openapi/invoice-management-v1.yaml`
- Swagger UI => **` /swagger-ui`**
- Swagger DOCS => **` /swagger-ui.json`**


---

## Codegen

pattern spec first. Generazione automatica request e response partendo dallo spec.yaml tramite Orval

```bash
npm run orval:generator-dto
```

Outputs => `src/api/dto/**`.  


---

## Testing


```bash
# all tests
npm test


# coverage
npm run test --coverage
```

Note:

- Richiesto Docker daemon avviato.

---

## Struttura Progetto

```
src/
├── api/              # Definizioni API e contratti (es. OpenAPI, DTO)
├── config/           # Configurazioni applicative ed environment
├── controller/       # Controllers Express (Auth, User, TaxProfile, Invoice)
├── error/            # Gestione centralizzata degli errori
├── mapper/           # Mapper per conversione tra entità e DTO
├── middleware/       # Middleware (auth, validazione, logging, ecc.)
├── repository/       # Accesso al DB con Prisma (repositories)
├── route/            # Definizione delle rotte Express
├── service/          # Business logic e orchestrazione
├── shared/           # Utilità condivise (logger, costanti, helper)
├── tests/            # Test (unit e integration)
│   └── fixture/      # Fixtures di test (User, Invoice, ecc.)
└── server.ts         # Entry point principale che avvia il server
```

---


## API Overview

**Auth**

POST /auth/login
Effettua il login restituendo accessToken e refreshToken.


**Users**

- GET /users
Restituisce lista utenti (paginata, filtrabile per email, ruolo, stato, ricerca full-text).

- POST /users (solo ADMIN)
Crea un nuovo utente.

- GET /users/{id}
Restituisce i dettagli di un utente.


- PUT /users/{id} (solo ADMIN)
Aggiorna i dati completi di un utente (inclusi email, password, ruolo).

- PATCH /users/{id}
Aggiorna dati non sensibili (nome, cognome, telefono).


- DELETE /users/{id} (solo ADMIN)
Elimina un utente per id.


** Invoices**

- GET /invoices
Restituisce lista fatture (paginata e filtrabile per cliente, stato, data, codice fattura, importo).

- POST /invoices (solo ADMIN)
Crea una nuova fattura con eventuali items.


- GET /invoices/{id}
Recupera i dettagli di una fattura.

- PUT /invoices/{id} (solo ADMIN)
Aggiorna fattura esistente (compresi items).


- DELETE /invoices/{id} (solo ADMIN)
Elimina fattura per id.

- 🧾 Tax Profiles

GET /user-tax-profiles
Restituisce lista profili fiscali utente (paginata, filtrabile per utente, tipo, città, attivo).

- POST /user-tax-profiles
Crea un nuovo profilo fiscale associato a un utente.

- GET /user-tax-profiles/{id}
Restituisce i dettagli di un profilo fiscale.

- PUT /user-tax-profiles/{id}
Aggiorna un profilo fiscale utente.

-- DELETE /user-tax-profiles/{id}
Elimina un profilo fiscale utente.

esempio autenticazione:

```bash
curl -sX POST http://localhost:3000/auth/login   -H 'content-type: application/json'   -d '{"email":"alice@example.com","password":"Password123!"}'

curl -sX GET 'http://localhost:3000/users?page=1&limit=10'   -H 'authorization: Bearer <ACCESS_TOKEN>'
```

---

## Security Note

- Passwords hashed con **bcrypt** .
- JWT access tokens con 'JWT_SECRET`.
- Gli id non devono essere indicati in chiaro per una questione di sicurezza. E' stato utilizzato cripto-js. Utilizzare un encoder online per creare un token tipo => https://stackblitz.com/edit/cryptojs-aes-encrypt-decrypt?file=index.js

inserire input => id key = mysecretkey

Esempio:
![alt text](image.png)

Indicarlo come id nelle varie api

---
