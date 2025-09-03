


Come avviare l’applicazione

1. Alza i servizi base (DB, Adminer se presente)
docker compose up -d

2. Installa le dipendenze e genera Prisma Client
npm ci
npm run prisma:generate

3. Applica le migrazioni e seed, poi builda
npm run prisma:migrate
npm run prisma:seed
npm run build

4. Avvia l’API in modalità watch
npm run dev

5. Verifica

API → http://localhost:3000
Swagger UI → http://localhost:3000/swagger-ui
Adminer (se presente) → http://localhost:8081


Come effettuare i test (con DB di test)
1. Avvia il DB di test
docker compose -f docker-compose-test.yml up -d

2. Genera Prisma Client e applica le migrazioni sul DB di test
npm run prisma:generate:test
npm run prisma:migrate:test

3. Lancia i test
npm test

Come avviare l’app su Docker (multistage)
Il progetto utilizza un Dockerfile multistage con due target:

- Development
docker compose -d --build

- Production
BUILD_TARGET=production docker compose up -d --build


SWAGGER => http://localhost:8080/swagger-ui/#/
API DOC => http://localhost:8080/swagger-ui.json