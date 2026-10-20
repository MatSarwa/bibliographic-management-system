# Wdrożenie (Neon + Render + Vercel)

Wszystkie trzy serwisy mają darmowe plany. Kolejność ma znaczenie: baza → backend → frontend → powrót do backendu.

| Co | Gdzie | Link |
|---|---|---|
| Baza PostgreSQL | Neon | https://neon.com |
| Backend (API) | Render | https://render.com |
| Frontend | Vercel | https://vercel.com |

Na każdym z nich zaloguj się **przez GitHub** – nie trzeba zakładać osobnego konta.

---

## 0. Kod na GitHubie

Render i Vercel pobierają kod z GitHuba, więc wszystkie zmiany muszą być wypchnięte (`git push`) na gałąź `main`.

---

## 1. Neon – baza danych

1. Zaloguj się na https://neon.com przez GitHub.
2. **Create project** → nazwa np. `bibliography`, region **Europe (Frankfurt)**, wersja Postgres domyślna.
3. Po utworzeniu kliknij **Connect** i skopiuj **connection string**. Wygląda tak:
   ```
   postgresql://uzytkownik:haslo@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Zapisz go na chwilę w notatniku – to Twój `DATABASE_URL`. **Nie wklejaj go nigdzie publicznie.**

---

## 2. Render – backend

1. Zaloguj się na https://render.com przez GitHub.
2. **New** → **Web Service** → wybierz repozytorium `bibliographic-management-system`.
3. Ustawienia:

   | Pole | Wartość |
   |---|---|
   | Name | np. `bibliography-api` |
   | Region | Frankfurt (EU Central) |
   | Branch | `main` |
   | Root Directory | `project/backend` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm run db:migrate && npm run seed:demo && npm start` |
   | Instance Type | **Free** |

   Start Command przy każdym starcie: aktualizuje tabele (migracje), tworzy konto demo, jeśli go nie ma, i uruchamia serwer.

4. **Environment Variables** – dodaj:

   | Klucz | Wartość |
   |---|---|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | connection string z Neona |
   | `JWT_SECRET` | długi losowy ciąg – wygeneruj poleceniem poniżej |
   | `FRONTEND_URL` | na razie `http://localhost:5173` – podmienisz w kroku 4 |
   | `ENABLE_REGISTRATION` | `false` – bez wysyłki maili rejestracja tylko zbierałaby adresy odwiedzających |

   Generowanie `JWT_SECRET` (w terminalu na swoim komputerze):
   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

   Opcjonalnie (wysyłka maili przy rejestracji): `GMAIL_USER`, `GMAIL_APP_PASSWORD`. Bez nich rejestracja utworzy konto, ale mail weryfikacyjny nie dojdzie – konto demo działa niezależnie od tego.

5. **Create Web Service** i poczekaj, aż log skończy się linią `Server running ...`.
6. Skopiuj adres serwisu (np. `https://bibliography-api.onrender.com`) i sprawdź w przeglądarce
   `https://bibliography-api.onrender.com/health` – powinno pokazać `{"status":"ok", ...}`.

> Darmowy Render usypia serwer po 15 minutach bez ruchu. Pierwsze wejście po przerwie trwa ok. 30–60 s.

---

## 3. Vercel – frontend

1. Zaloguj się na https://vercel.com przez GitHub.
2. **Add New** → **Project** → **Import** repozytorium `bibliographic-management-system`.
3. Ustawienia:

   | Pole | Wartość |
   |---|---|
   | Root Directory | `project/frontend` (kliknij **Edit**) |
   | Framework Preset | Vite (wykryje się sam) |

4. **Environment Variables**:

   | Klucz | Wartość |
   |---|---|
   | `VITE_API_URL` | adres z Rendera + `/api`, np. `https://bibliography-api.onrender.com/api` |
   | `VITE_ENABLE_GOOGLE_LOGIN` | `false` |
   | `VITE_ENABLE_REGISTRATION` | `false` (ukrywa rejestrację i reset hasła) |

5. **Deploy**. Po chwili dostaniesz adres, np. `https://bibliography-xyz.vercel.app`.

---

## 4. Połączenie frontu z backendem (CORS)

Backend przyjmuje zapytania tylko z adresu ustawionego w `FRONTEND_URL`.

1. W Renderze → Twój serwis → **Environment** → zmień `FRONTEND_URL` na adres z Vercela, **bez ukośnika na końcu**, np. `https://bibliography-xyz.vercel.app`.
2. **Save Changes** – Render sam zrestartuje serwer.

---

## 5. Sprawdzenie

1. Wejdź na adres z Vercela.
2. Zaloguj się kontem demo: `demo@example.com` / `Demo1234!`.
3. Sprawdź: lista pozycji, dodanie pozycji, eksport kolekcji do BibTeX, tryb ciemny, odświeżenie strony na `/dashboard` (nie może być 404).
4. Wpisz link do wersji online w `README.md` (sekcja na górze).

---

## Gdy coś nie działa

| Objaw | Przyczyna |
|---|---|
| Strona się ładuje, ale logowanie nic nie robi / błąd sieci | Zły `VITE_API_URL` (brak `/api` na końcu) albo backend jeszcze się wybudza – odczekaj minutę |
| W konsoli przeglądarki błąd **CORS** | `FRONTEND_URL` w Renderze nie zgadza się z adresem Vercela (sprawdź `https`, brak `/` na końcu) |
| Render: `Brak JWT_SECRET` w logach | Nie dodano zmiennej `JWT_SECRET` |
| Render: błąd połączenia z bazą | Zły `DATABASE_URL` – skopiuj ponownie z Neona |
| Po zmianie zmiennych w Vercelu nic się nie zmienia | Zmienne `VITE_*` są wkompilowane w build – zrób **Redeploy** |

## Reset konta demo

Odwiedzający mogą zmienić albo usunąć dane demo. Żeby przywrócić je do stanu początkowego, uruchom na swoim komputerze w `project/backend` (PowerShell):

```powershell
$env:NODE_ENV="production"; $env:DATABASE_URL="<connection string z Neona>"; npm run seed:demo -- --reset
```
