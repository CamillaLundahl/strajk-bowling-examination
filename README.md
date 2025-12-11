# Strajk Bowling

[![GitHub Workflow Status](https://github.com/CamillaLundahl/strajk-bowling-examination/actions/workflows/run-tests.yml/badge.svg)](https://github.com/CamillaLundahl/strajk-bowling-examination/actions/workflows/run-tests.yml)

[![Test Coverage](https://img.shields.io/badge/Coverage-100%25%20(Statements,%20Lines,%20Funcs)-brightgreen)](./coverage/index.html)

---

## Om Projektet

Strajk bowling är en nyöppnad bowlinghall i centrala Bromölla. Ägaren K. Ägla gillar tekniska lösningar och har tillsammans med brorsonen Keso Ägla byggt denna webbapp. Herr Ägla är väldigt nöjd med appen men vill försäkra sig om att den är fortsatt stabil när ny funktionalitet läggs till framöver.

Mitt fokus har legat på att bygga en **robust och vältestad lösning** med **React** och **Vitest**.

### Teststrategi och Kvalitet
*   **Omfattande Enhetstester:** Utvecklat en komplett uppsättning enhetstester med **React Testing Library** och **Vitest**, som täcker alla specificerade user stories och acceptanskriterier (inklusive VG-kriterier).
*   **Robusta Felhanteringstester:** Skapat specifika testfall för att verifiera att applikationen korrekt hanterar och visar felmeddelanden för:
    *   Saknade obligatoriska fält (datum, tid, antal spelare/banor).
    *   Inkonsekventa skostorlekar/antal spelare.
    *   Begränsningar för antal spelare per bana.
*   **Testtäckning:** Uppnått en testtäckning med **100% för Statements, Functions och Lines**.
*   **API- och Navigationsmockning:** Implementerat mocking av externa API-anrop (`global.fetch`) och React Routers navigationskrokar (`useNavigate`) för isolerade och pålitliga tester.

---

## 🛠️ Installation och Användning

1.  **Klona repositoryt:**
    ```bash
    git clone "https://github.com/CamillaLundahl/strajk-bowling-examination"
    cd strajk-bowling-examination
    ```
2.  **Installera beroenden:**
    ```bash
    npm install
    ```
3.  **Starta applikationen lokalt:**
    ```bash
    npm run dev
    ```

---

## 🧪 Köra Tester och Täckningsrapport

1.  **Installera täckningsverktyg (om det saknas):**
    ```bash
    npm install -D @vitest/coverage-c8
    ```
2.  **Kör tester och generera täckningsrapport:**
    ```bash
    npm test -- --coverage
    ```
    En detaljerad rapport finns i `coverage/index.html`.
