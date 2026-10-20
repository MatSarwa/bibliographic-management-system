# Przypadki testowe

**Środowisko:** lokalne (frontend `http://localhost:5173`, backend `http://localhost:5000`)
**Ostatnie wykonanie:** _RRRR-MM-DD_

**Statusy:** ✅ Pass · ❌ Fail (link do Issue) · ⏸️ Blocked · ⬜ Nie wykonano
**Priorytety:** Wysoki · Średni · Niski

---

## 1. Rejestracja i logowanie (AUTH)

| ID | Tytuł | Warunki wstępne | Kroki | Oczekiwany wynik | Priorytet | Status |
|---|---|---|---|---|---|---|
| TC-AUTH-01 | Rejestracja z poprawnymi danymi | Brak konta z danym e-mailem | 1. Otwórz stronę rejestracji<br>2. Wpisz nazwę użytkownika, e-mail i hasło<br>3. Kliknij „Zarejestruj” | Konto utworzone, komunikat o konieczności weryfikacji e-mail | Wysoki | ⬜ |
| TC-AUTH-02 | Rejestracja z zajętym e-mailem | Istnieje konto z e-mailem `test@test.pl` | 1. Zarejestruj się z e-mailem `test@test.pl` | Komunikat, że e-mail jest zajęty; konto nie powstaje | Wysoki | ⬜ |
| TC-AUTH-03 | Logowanie na niezweryfikowane konto | Konto istnieje, `is_verified = false` | 1. Zaloguj się poprawnymi danymi | Logowanie zablokowane, komunikat o konieczności weryfikacji | Wysoki | ⬜ |
| TC-AUTH-04 | Logowanie e-mailem | Zweryfikowane konto | 1. Wpisz e-mail i poprawne hasło<br>2. Kliknij „Zaloguj” | Przekierowanie do dashboardu | Wysoki | ⬜ |
| TC-AUTH-05 | Logowanie nazwą użytkownika | Zweryfikowane konto | 1. Wpisz nazwę użytkownika i poprawne hasło<br>2. Kliknij „Zaloguj” | Przekierowanie do dashboardu | Średni | ⬜ |
| TC-AUTH-06 | Logowanie z błędnym hasłem | Zweryfikowane konto | 1. Wpisz poprawny e-mail i błędne hasło | Komunikat o błędnych danych, brak logowania; komunikat nie zdradza, czy konto istnieje | Wysoki | ⬜ |
| TC-AUTH-07 | Dostęp do dashboardu bez logowania | Użytkownik wylogowany | 1. Wejdź bezpośrednio na `/dashboard` | Przekierowanie na stronę logowania | Wysoki | ⬜ |
| TC-AUTH-08 | Wylogowanie | Użytkownik zalogowany | 1. Kliknij „Wyloguj”<br>2. Kliknij „Wstecz” w przeglądarce | Powrót na stronę logowania; dashboard niedostępny | Średni | ⬜ |

## 2. Pozycje bibliograficzne (ITEM)

| ID | Tytuł | Warunki wstępne | Kroki | Oczekiwany wynik | Priorytet | Status |
|---|---|---|---|---|---|---|
| TC-ITEM-01 | Dodanie pozycji ręcznie | Zalogowany użytkownik | 1. Kliknij „Dodaj pozycję”<br>2. Uzupełnij tytuł i autora<br>3. Zapisz | Pozycja widoczna na liście | Wysoki | ⬜ |
| TC-ITEM-02 | Dodanie pozycji po DOI | Zalogowany użytkownik | 1. Kliknij „Dodaj pozycję”<br>2. Wpisz DOI `10.1038/nature14539`<br>3. Pobierz metadane | Tytuł, autorzy i rok uzupełnione automatycznie | Wysoki | ⬜ |
| TC-ITEM-03 | Usunięcie i przywrócenie z kosza | Istnieje co najmniej 1 pozycja | 1. Usuń pozycję<br>2. Otwórz kosz<br>3. Przywróć pozycję | Pozycja wraca na listę z niezmienionymi danymi | Średni | ⬜ |

<!-- Dalsze moduły do opisania: COLL (kolekcje), LABEL (etykiety), WS (workspaces i role), COMM (komentarze), HIST (historia), CITE (cytowania), EXP (eksport) -->
