// test-login.ts - Een eenvoudig test-script om in te loggen
import axios from 'axios';

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3000/auth/login', {
      email: 'filip.smet@medecare.be',
      password: 'Test123!',
      platform: 'web'
    });
    
    console.log('Login succesvol:', response.data);
  } catch (error: any) {
    console.error('Login mislukt:', error.response ? error.response.data : error.message);
  }
}

testLogin();
