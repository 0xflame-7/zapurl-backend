import bcrypt from 'bcrypt';

/**
 * Hashes a plain text password.
 * * @param password - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 */
export const hashValue = async (value: string): Promise<string> => {
  const saltRounds = 10; // Standard industry default
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(value, salt);
};

/**
 * Compares a plain text password with a stored hash.
 * * @param password - The plain text password provided by user
 * @param hash - The hashed password stored in database
 * @returns {Promise<boolean>} True if they match
 */
export const compareHashValue = async (
  value: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(value, hash);
};
