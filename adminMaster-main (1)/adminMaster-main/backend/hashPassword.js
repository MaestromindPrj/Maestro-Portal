import bcrypt from 'bcryptjs';

const password = '123456'; // replace with real password

const hashPassword = async () => {
  const hashed = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hashed);
};

hashPassword();
