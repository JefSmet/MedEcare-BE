import axios from 'axios';

/**
 * Dit script test of admin routes correct werken.
 * Het voert de volgende stappen uit:
 * 1. Login als admin gebruiker
 * 2. Test toegang tot /admin/users
 * 3. Test toegang tot /admin/persons
 * 
 * Als de test slaagt, worden gebruikers en personen getoond.
 * Als er een 403 fout optreedt, dan is er mogelijk een probleem met de rol-middleware.
 * 
 * Run met: npx ts-node src/test-admin-routes.ts
 */
async function testAdminRoutes() {
    try {
        // Log in eerst
        console.log("1. Inloggen als admin gebruiker...");
        const loginResponse = await axios.post('http://localhost:3000/auth/login', {
            email: 'filip.smet@medecare.be',
            password: 'Test123!'
        }, {
            withCredentials: true
        });
        
        console.log("Login succesvol:", loginResponse.data);
        
        // Bewaar de cookies die we krijgen
        const cookies = loginResponse.headers['set-cookie'];
        
        if (!cookies) {
            console.error("Geen cookies ontvangen bij login!");
            return;
        }
        
        // Test een admin route (lijst van gebruikers)
        console.log("\n2. Test admin route om gebruikers op te halen...");
        try {
            const adminResponse = await axios.get('http://localhost:3000/admin/users', {
                headers: {
                    Cookie: cookies.join('; ')
                },
                withCredentials: true
            });
            
            console.log("Admin route resultaat:", adminResponse.data);
        } catch (adminError: any) {
            console.error("Fout bij admin route:", adminError.message);
            if (adminError.response) {
                console.error("Status:", adminError.response.status);
                console.error("Data:", adminError.response.data);
            }
        }
        
        // Test ook een specifieke admin entiteitsroute
        console.log("\n3. Test admin route om personen op te halen...");
        try {
            const personsResponse = await axios.get('http://localhost:3000/admin/persons', {
                headers: {
                    Cookie: cookies.join('; ')
                },
                withCredentials: true
            });
            
            console.log("Persons route resultaat:", personsResponse.data);
        } catch (personsError: any) {
            console.error("Fout bij persons route:", personsError.message);
            if (personsError.response) {
                console.error("Status:", personsError.response.status);
                console.error("Data:", personsError.response.data);
            }
        }
        
    } catch (error: any) {
        console.error("Fout bij test:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

testAdminRoutes();

testAdminRoutes();
