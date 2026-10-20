# Reference Manager

**🔗 Wersja online: [bibliographic-management-system.vercel.app](https://bibliographic-management-system.vercel.app)**

Kliknij **„Wypróbuj demo”** na stronie głównej – bez rejestracji dostaniesz własne, tymczasowe konto z przykładową biblioteką i wspólnym workspace’em (komentarze, historia zmian). Możesz w nim wszystko zmieniać i usuwać; konto znika po 24 godzinach.

> Backend działa na darmowym hostingu, który usypia serwer po 15 minutach bez ruchu – pierwsze wejście po przerwie może potrwać do minuty.

Aplikacja webowa do kompleksowego zarządzania bibliografią, umożliwiająca gromadzenie źródeł naukowych, takich jak artykuły, książki i preprinty, z automatycznym pobieraniem metadanych na podstawie DOI, ISBN, identyfikatora arXiv lub PMID. Pozwala organizować źródła w kolekcje i oznaczać je etykietami, generować cytowania w popularnych stylach bibliograficznych (APA, MLA, Chicago, Harvard, IEEE i Vancouver) oraz eksportować bibliografię do formatów BibTeX i RIS. Wspiera również współpracę zespołową dzięki wspólnym przestrzeniom roboczym, systemowi ról i uprawnień, komentarzom oraz historii zmian.

## Funkcje

- **Konta użytkowników** – rejestracja z weryfikacją e-mail, logowanie (e-mail lub nazwa użytkownika), logowanie przez Google, reset i zmiana hasła
- **Pozycje bibliograficzne** – dodawanie, edycja, ulubione, kosz z możliwością przywrócenia
- **Automatyczne pobieranie metadanych** – po DOI, ISBN, identyfikatorze arXiv lub PubMed (CrossRef, Open Library, arXiv, PubMed)
- **Kolekcje** – zagnieżdżone foldery, udostępnianie kolekcji innym użytkownikom
- **Etykiety** – kolorowe tagi do grupowania pozycji
- **Przestrzenie robocze (workspaces)** – praca zespołowa z rolami `admin` / `editor` / `viewer`, przekazywanie własności
- **Komentarze** – dyskusja przy pozycjach, oznaczanie jako rozwiązane
- **Historia zmian** – podgląd poprzednich wersji pozycji i przywracanie
- **Cytowania** – style APA 7, MLA 9, Chicago, Harvard, IEEE, Vancouver
- **Eksport** – BibTeX (`.bib`) i RIS (`.ris`) dla pojedynczej pozycji, zaznaczonych pozycji lub całej kolekcji

## Technologie

| Warstwa | Technologie |
|---|---|
| Frontend | React 19, Vite, Mantine UI, Zustand, React Router |
| Backend | Node.js, Express 5, Sequelize, Passport (JWT, Google OAuth) |
| Baza danych | PostgreSQL 17 |
| Bezpieczeństwo | Helmet, rate limiting, bcrypt |
| Testy | Jest, Supertest |
| Hosting | Vercel (frontend), Render (backend), Neon (PostgreSQL) |

## Struktura projektu

```
├── project/
│   ├── backend/      # REST API (Express)
│   ├── frontend/     # Aplikacja React (Vite)
│   └── database/     # schema.sql – schemat bazy danych
├── docs/             # Przypadki testowe, instrukcja wdrożenia
└── .github/          # Szablony zgłoszeń (Issues)
```

## Uruchomienie lokalne

### Wymagania

- Node.js 22+
- PostgreSQL 17+

### 1. Baza danych

Utwórz bazę i załaduj schemat:

```bash
createdb -U postgres bibliography_db
psql -U postgres -d bibliography_db -f project/database/schema.sql
```

> Alternatywnie: utwórz pustą bazę i w folderze `project/backend` uruchom `npm run db:migrate` (migracje Sequelize).

### 2. Backend

```bash
cd project/backend
npm install
cp .env.example .env    # uzupełnij dane do bazy i JWT_SECRET
npm start
```

API działa pod adresem `http://localhost:5000/api`.

### 3. Frontend

```bash
cd project/frontend
npm install
cp .env.example .env
npm run dev
```

Aplikacja działa pod adresem `http://localhost:5173`.

### 4. Konto demo (opcjonalnie)

Lokalnie przycisk „Wypróbuj demo” działa tak samo jak online. Możesz też utworzyć stałe konto demo ze znanym hasłem:

```bash
cd project/backend
npm run seed:demo
```

| Login | Hasło |
|---|---|
| `demo@example.com` | `Demo1234!` |

## Konfiguracja (`project/backend/.env`)

| Zmienna | Opis | Wymagana |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME` | Adres i nazwa bazy danych | tak |
| `DB_USER`, `DB_PASSWORD` | Dane logowania do PostgreSQL | tak |
| `JWT_SECRET` | Klucz do podpisywania tokenów (długi, losowy ciąg) | tak |
| `FRONTEND_URL` | Adres frontendu (CORS, linki w e-mailach) | tak |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Wysyłka e-maili weryfikacyjnych – [hasło aplikacji Google](https://myaccount.google.com/apppasswords) | do wysyłki maili |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Logowanie przez Google (bez nich przycisk Google jest nieaktywny) | do logowania Google |
| `ENABLE_REGISTRATION` | `false` wyłącza rejestrację (używane w wersji online, gdzie nie ma wysyłki maili) | nie |
| `DATABASE_URL` | Connection string bazy – używany zamiast `DB_*` przy `NODE_ENV=production` | na produkcji |

> Bez skonfigurowanego Gmaila e-maile weryfikacyjne nie są wysyłane. Konto można wtedy zweryfikować ręcznie:
> `UPDATE users SET is_verified = true WHERE email = '...';`

## Testy

### Automatyczne

39 testów backendu (Jest + Supertest, baza SQLite w pamięci):

- **jednostkowe** – logika logowania, rejestracji, resetu i zmiany hasła,
- **integracyjne** – rejestracja przez API, konta demo (izolacja danych między odwiedzającymi, automatyczne usuwanie po 24 h, workspace z komentarzami i historią),
- **bezpieczeństwa** – rate limiting (ochrona przed zgadywaniem haseł), brak ujawniania, czy dany e-mail ma konto, blokada zmiany hasła kont demo.

```bash
cd project/backend
npm test                # wszystkie testy
npm run test:security   # testy bezpieczeństwa (rate limiting)
npm run test:coverage   # raport pokrycia kodu
```

### Manualne

- Przypadki testowe: [`docs/test-cases.md`](docs/test-cases.md)
- Zgłoszone błędy: zakładka [Issues](../../issues) (szablon „Zgłoszenie błędu”)

## Wdrożenie

Wersja online: frontend na Vercelu, backend na Renderze, baza PostgreSQL na Neonie – wszystko na darmowych planach. Każdy push na `main` wdraża się automatycznie. Instrukcja krok po kroku: [`docs/deployment.md`](docs/deployment.md).
