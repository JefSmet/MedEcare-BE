import axios from 'axios';

/**
 * Dit script test alle admin routes om te controleren of er van elke route mockdata opgevraagd kan worden.
 * 
 * Functionaliteit:
 * 1. Logt in als admin gebruiker
 * 2. Test alle admin routes voor de verschillende entiteiten
 * 
 * Run met: npx ts-node src/test-all-routes.ts
 */
async function testAllAdminRoutes() {
    try {
        console.log("=================================================================");
        console.log("==                  TEST ALLE ADMIN ROUTES                     ==");
        console.log("=================================================================");
        
        // 1. INLOGGEN ALS ADMIN GEBRUIKER
        console.log("\n1. Inloggen als admin gebruiker...");
        const loginResponse = await axios.post('http://localhost:3000/auth/login', {
            email: 'filip.smet@medecare.be',
            password: 'Test123!'
        }, {
            withCredentials: true
        });
        
        console.log("✅ Login succesvol:", loginResponse.data.message);
        
        // Bewaar de cookies voor alle volgende requests
        const cookies = loginResponse.headers['set-cookie'];
        
        if (!cookies) {
            console.error("❌ Geen cookies ontvangen bij login! Kan niet doorgaan met testen.");
            return;
        }
        
        // Axios configuratie met cookies voor alle volgende requests
        const axiosConfig = {
            headers: {
                Cookie: cookies.join('; ')
            },
            withCredentials: true
        };
        
        // 2. TEST ALLE ADMIN ROUTES
        
        // 2.1 Users
        await testRoute("admin/users", "Gebruikers", axiosConfig);
        
        // 2.2 Persons
        await testRoute("admin/persons", "Personen", axiosConfig);
        
        // 2.3 Roles
        await testRoute("admin/roles", "Rollen", axiosConfig);
        
        // 2.4 Shift Types
        await testRoute("admin/shift-types", "Shift Types", axiosConfig);
          // 2.5 Shift Type Rates
        await testRoute("admin/shift-type-rates", "Shift Type Tarieven", axiosConfig);
        
        // 2.6 Rosters
        await testRoute("admin/rosters", "Roosters", axiosConfig);
        
        // 2.7 Activities (Shifts & Leave)
        await testRoute("admin/activities", "Activiteiten (Shifts/Verlof)", axiosConfig);
        
        // 2.8 User Constraints
        await testRoute("admin/user-constraints", "Gebruikersbeperkingen", axiosConfig);
        
        console.log("\n=================================================================");
        console.log("==                   ALLE TESTS VOLTOOID                       ==");
        console.log("=================================================================");
        
    } catch (error: any) {
        console.error("❌ Algemene fout bij testen:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

async function testRoute(route: string, description: string, axiosConfig: any) {
    console.log(`\n2.${description} - Test admin route: /${route}`);
    try {
        const response = await axios.get(`http://localhost:3000/${route}`, axiosConfig);
        
        // Print het resultaat op een nette manier
        if (Array.isArray(response.data)) {
            console.log(`✅ ${description} route succesvol (${response.data.length} items):`);
            if (response.data.length > 0) {
                // Toon alleen de eerste 3 items als er meer zijn
                const itemsToShow = response.data.slice(0, 3);
                itemsToShow.forEach((item: any, index: number) => {
                    console.log(`   Item ${index + 1}:`, getSummary(item));
                });
                
                if (response.data.length > 3) {
                    console.log(`   ... en ${response.data.length - 3} meer items.`);
                }
            } else {
                console.log("   Geen items gevonden.");
            }
        } else {
            console.log(`✅ ${description} route succesvol:`, getSummary(response.data));
        }
    } catch (error: any) {
        console.error(`❌ Fout bij ${description} route:`, error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

// Helper functie om een korte samenvatting van objecten te maken
function getSummary(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Voor arrays, return het aantal items
    if (Array.isArray(obj)) {
        return `Array met ${obj.length} items`;
    }
    
    // Voor objecten, return een samenvatting met de belangrijkste velden
    const summary: Record<string, any> = {};
    
    // Veel voorkomende id velden
    if (obj.id) summary.id = obj.id;
    if (obj.personId) summary.personId = obj.personId;
    
    // Veel voorkomende naam/omschrijving velden
    if (obj.name) summary.name = obj.name;
    if (obj.firstName) summary.firstName = obj.firstName;
    if (obj.lastName) summary.lastName = obj.lastName;
    if (obj.email) summary.email = obj.email;
    
    // Activiteit-specifiek
    if (obj.activityType) summary.activityType = obj.activityType;
    if (obj.status) summary.status = obj.status;
    
    // Als er niets gevonden is, toon de eerste paar keys
    if (Object.keys(summary).length === 0) {
        const firstFewKeys = Object.keys(obj).slice(0, 3);
        firstFewKeys.forEach(key => {
            summary[key] = typeof obj[key] === 'object' ? '[Object]' : obj[key];
        });
    }
    
    return summary;
}

// Start de test
testAllAdminRoutes();
