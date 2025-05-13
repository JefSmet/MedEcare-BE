# Demo Instructies voor MedEcare met SQLite

Deze instructies helpen je bij het opzetten en uitvoeren van een demo voor MedEcare met SQLite als database.

## 1. Configuratie

De `.env` file is al aangepast om SQLite te gebruiken in plaats van MS SQL Server:

```properties
# Database Connection String (SQLite)
DB_URL="file:./dev.db"
```

## 2. Database Initialiseren

Om de SQLite database te initialiseren, voer de volgende commando's uit:

```powershell
# Stap 1: Migratie uitvoeren om de database structuur te maken
npx prisma migrate dev --name sqlite_setup

# Stap 2: Database vullen met mock data
npx ts-node src/prisma/seed-sqlite.ts
```

## 3. Server Starten

Start de server met het volgende commando:

```powershell
npx ts-node src/server.ts
```

De server draait nu op http://localhost:3000 en de API documentatie is beschikbaar op http://localhost:3000/api-docs.

## 4. Inloggen

Je kunt inloggen met de volgende gegevens:

- **Admin gebruiker**
  - Email: filip.smet@medecare.be
  - Wachtwoord: Test123!

- **Gewone gebruiker**
  - Email: isabeau.verbelen@medecare.be
  - Wachtwoord: Test123!

- **Gewone gebruiker**
  - Email: annemie.vaningelgem@medecare.be
  - Wachtwoord: Test123!

## 5. Demo Scenario's

1. **Login/Authenticatie**
   - Log in als verschillende gebruikers
   - Bekijk de verschillende rechten (admin vs gebruiker)

2. **Personen beheren**
   - Bekijk de lijst van personen
   - Bekijk details van een persoon

3. **Shift Planning**
   - Bekijk de roosters (activities)
   - Filter activities op persoon
   - Filter activities op type (SHIFT, LEAVE)

4. **Verlof Aanvragen**
   - Bekijk verlofaanvragen
   - Maak een nieuwe verlofaanvraag

5. **Gebruikersbeperkingen (Constraints)**
   - Bekijk gebruikersbeperkingen (max shifts, rusttijden)

## 6. Belangrijke API Routes

- **Authenticatie**: `/auth/login`, `/auth/logout`
- **Personen**: `/admin/persons`
- **Activiteiten (Shifts/Verlof)**: `/admin/activities`
- **Shift Types**: `/admin/shift-types`
- **Shift Type Tarieven**: `/admin/shift-type-rates` 
- **Gebruikersbeperkingen**: `/admin/user-constraints`
- **Rollen**: `/admin/roles`
- **Gebruikers**: `/admin/users`

## 7. Testen van Routes

Je kunt alle routes testen met de meegeleverde test scripts:

```powershell
# Test alle admin routes (overzicht)
npx ts-node src/tests/test-all-routes.ts

# Test gedetailleerde routes (details per item)
npx ts-node src/tests/test-detail-routes.ts

# Test specifiek admin routes toegang
npx ts-node src/tests/test-admin-routes.ts

# Test login functionaliteit
npx ts-node src/tests/test-login.ts
```

## Troubleshooting

### Authentication Issues

Als je problemen hebt met inloggen, controleer of je het correcte wachtwoord gebruikt (Test123!). Je kunt ook een nieuw wachtwoord hash genereren met:

```powershell
npx ts-node src/utils/generate-password-hash.ts
```

En dan de hash bijwerken in `src/prisma/seed-sqlite.ts` en de database opnieuw initialiseren.

### Admin Routes

De admingebruiker heeft de rol 'admin' (kleine letters). Als je problemen hebt met admin routes, controleer of de rol-middleware overeenkomt met de database rollen:

- In `src/middleware/role-middleware.ts` controleert de `requireAdmin` functie of de rol 'admin' is (kleine letters).
- Als je admin routes niet kunt benaderen, kun je dit testen met:

```powershell
npx ts-node src/tests/test-admin-routes.ts
```

### Testen van Beschikbare Mock Data

Om te controleren of alle routes werken en of alle mock data beschikbaar is, kun je de volgende test scripts gebruiken:

```powershell
# Test alle admin routes (overzicht)
npx ts-node src/tests/test-all-routes.ts

# Test gedetailleerde routes (details per item)
npx ts-node src/tests/test-detail-routes.ts
```

Deze scripts zullen alle beschikbare routes testen en de resultaten tonen.
