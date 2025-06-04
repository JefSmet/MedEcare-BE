import axios from 'axios';

/**
 * Dit script test alle admin routes met specifieke ID's om te controleren of 
 * er van elke route mockdata opgevraagd kan worden.
 * 
 * Functionaliteit:
 * 1. Logt in als admin gebruiker
 * 2. Test alle admin routes voor de verschillende entiteiten met specifieke ID's
 * 
 * Run met: npx ts-node src/test-detail-routes.ts
 */
async function testDetailRoutes() {
    try {
        console.log("=================================================================");
        console.log("==            TEST GEDETAILLEERDE ADMIN ROUTES                 ==");
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
        
        // 2. EERST OPHALEN VAN ALLE DATA OM ID'S TE KRIJGEN
        console.log("\n2. Ophalen van ID's voor gedetailleerde testen...");
        
        // 2.1 Personen
        const personsResponse = await axios.get('http://localhost:3000/admin/persons', axiosConfig);
        const personId = personsResponse.data[0]?.id;
        
        // 2.2 Users
        const usersResponse = await axios.get('http://localhost:3000/admin/users', axiosConfig);
        const userId = usersResponse.data[0]?.personId;
        
        // 2.3 Roles
        const rolesResponse = await axios.get('http://localhost:3000/admin/roles', axiosConfig);
        const roleId = rolesResponse.data[0]?.id;
          // 2.4 ShiftTypes
        const shiftTypesResponse = await axios.get('http://localhost:3000/admin/shift-types', axiosConfig);
        const shiftTypeId = shiftTypesResponse.data[0]?.id;
        
        // 2.5 Rosters
        const rostersResponse = await axios.get('http://localhost:3000/admin/rosters', axiosConfig);
        const rosterId = rostersResponse.data[0]?.id;
        
        // 2.6 Activities
        const activitiesResponse = await axios.get('http://localhost:3000/admin/activities', axiosConfig);
        const activityId = activitiesResponse.data[0]?.id;
        
        // 2.7 User Constraints
        const userConstraintsResponse = await axios.get('http://localhost:3000/admin/user-constraints', axiosConfig);
        const userConstraintId = userConstraintsResponse.data[0]?.id;
        
        // 3. TEST GEDETAILLEERDE ROUTES MET ID'S
        console.log("\n3. Testen van gedetailleerde routes met ID's...");
        
        // 3.1 Persoon details
        if (personId) {
            await testDetailRoute(`admin/persons/${personId}`, `Persoon details (ID: ${personId})`, axiosConfig);
        } else {
            console.log("❌ Geen persoon ID beschikbaar voor test");
        }
        
        // 3.2 User details
        if (userId) {
            await testDetailRoute(`admin/users/${userId}`, `Gebruiker details (ID: ${userId})`, axiosConfig);
        } else {
            console.log("❌ Geen gebruiker ID beschikbaar voor test");
        }
          // 3.3 Roster details
        if (rosterId) {
            await testDetailRoute(`admin/rosters/${rosterId}`, `Roster details (ID: ${rosterId})`, axiosConfig);
        } else {
            console.log("❌ Geen roster ID beschikbaar voor test");
        }
        
        // 3.4 Activiteit details
        if (activityId) {
            await testDetailRoute(`admin/activities/${activityId}`, `Activiteit details (ID: ${activityId})`, axiosConfig);
        } else {
            console.log("❌ Geen activiteit ID beschikbaar voor test");
        }
        
        // 3.5 User Constraint details
        if (userConstraintId) {
            await testDetailRoute(`admin/user-constraints/${userConstraintId}`, `Gebruikersbeperking details (ID: ${userConstraintId})`, axiosConfig);
        } else {
            console.log("❌ Geen gebruikersbeperking ID beschikbaar voor test");
        }
        
        console.log("\n=================================================================");
        console.log("==               DETAIL TESTS VOLTOOID                         ==");
        console.log("=================================================================");
        
    } catch (error: any) {
        console.error("❌ Algemene fout bij testen:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

async function testDetailRoute(route: string, description: string, axiosConfig: any) {
    console.log(`\n3.${description} - Test route: /${route}`);
    try {
        const response = await axios.get(`http://localhost:3000/${route}`, axiosConfig);
        console.log(`✅ ${description} route succesvol:`, response.data);
    } catch (error: any) {
        console.error(`❌ Fout bij ${description} route:`, error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

// Start de test
testDetailRoutes();
