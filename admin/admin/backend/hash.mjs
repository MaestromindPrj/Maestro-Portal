import bcrypt from 'bcryptjs';

const run = async () => {
  const hash = await bcrypt.hash('yourpassword', 10);
  console.log('Hashed:', hash);
};

run();
