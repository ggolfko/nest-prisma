import { randomBytes } from 'crypto';
import { SHA256 } from 'crypto-js';

export const generateSalt = () => {
  return randomBytes(16).toString('hex');
};

export const passwordHash = async (password: string) => {
  const salt = generateSalt();
  const _password = `${password}${salt}`;
  const encrypted = SHA256(_password);
  return { salt, encrypted: encrypted.toString() };
};

export const verifyPassword = async (password: any, hashed: any) => {
  const encrypted = SHA256(password);
  if (encrypted.toString() === hashed) return true;
  return false;
};
