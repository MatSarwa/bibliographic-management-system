# Reference Manager

System do zarządzania bibliografią z funkcjami współpracy zespołowej.

## Wymagania

- Node.js 22+
- PostgreSQL 17+
- npm

## Struktura projektu

```
├── backend-v2/      # Serwer Node.js + Express
├── frontend-v2/     # Aplikacja React + Vite
└── README.md
```

## Instalacja

### 1. Baza danych

Stwórz bazę danych PostgreSQL:

```bash
createdb -U postgres bibliography_db
```

Zaimportuj schemat bazy danych:

```bash
psql -U postgres -d bibliography_db -f database/schema.sql
```

### 2. Backend

```bash
cd backend-v2
npm install
cp .env.example .env
```

Uzupełnij plik `.env` danymi dostępowymi do bazy danych.

Uruchom serwer:

```bash
npm start
```

Serwer uruchomi się na: `http://localhost:5000`

### 3. Frontend

```bash
cd frontend-v2
npm install
cp .env.example .env
```

Uruchom aplikację:

```bash
npm run dev
```

Aplikacja uruchomi się na: `http://localhost:5173`

## Konfiguracja .env (backend)

| Zmienna | Opis |
|---------|------|
| DB_HOST | Host bazy danych |
| DB_PORT | Port bazy danych |
| DB_NAME | Nazwa bazy danych |
| DB_USER | Użytkownik bazy danych |
| DB_PASSWORD | Hasło do bazy danych |
| JWT_SECRET | Klucz do podpisywania tokenów JWT |
| GMAIL_USER | Email do wysyłania powiadomień |
| GMAIL_APP_PASSWORD | Hasło aplikacji Gmail |
| GOOGLE_CLIENT_ID | ID klienta Google OAuth |
| GOOGLE_CLIENT_SECRET | Sekret klienta Google OAuth |

## Uruchomienie

1. Uruchom backend: `cd backend-v2 && npm run dev`
2. Uruchom frontend: `cd frontend-v2 && npm run dev`
3. Otwórz przeglądarkę: `http://localhost:5173`

## Technologie

**Backend:**
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- JWT

**Frontend:**
- React
- Vite
- Mantine UI