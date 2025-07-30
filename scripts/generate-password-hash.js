#!/usr/bin/env node

const argon2 = require('argon2');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function generateHash() {
  rl.question('Enter password to hash: ', async (password) => {
    if (!password) {
      console.error('Password is required');
      process.exit(1);
    }

    try {
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
      });

      console.log('\nGenerated hash:');
      console.log(hash);
      console.log('\nAdd this to your .env file as ADMIN_PASSWORD_HASH');
    } catch (error) {
      console.error('Error generating hash:', error);
      process.exit(1);
    } finally {
      rl.close();
    }
  });
}

generateHash();
