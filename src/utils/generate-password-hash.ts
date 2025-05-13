// generate-password-hash.ts
import * as bcrypt from 'bcrypt';

async function generateHash() {
  const password = 'Test123!';
  const hash = await bcrypt.hash(password, 10);
  console.log(`Hash voor "${password}": ${hash}`);
}

generateHash();
