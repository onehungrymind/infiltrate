/**
 * Migration script to set default 'user' role for existing users without a role
 * 
 * Run this once to update existing users in the database.
 * 
 * Usage:
 * 1. Import this in a migration or run manually
 * 2. Or execute SQL directly: UPDATE users SET role = 'user' WHERE role IS NULL OR role = '';
 */

import { DataSource } from 'typeorm';

import { User } from '../entities/user.entity';

export async function setDefaultRolesForExistingUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  
  // Find all users without a role or with empty string role
  const usersWithoutRole = await userRepository.find({
    where: [
      { role: null },
      { role: '' },
    ],
  });

  if (usersWithoutRole.length === 0) {
    console.log('No users need role updates.');
    return;
  }

  console.log(`Updating ${usersWithoutRole.length} users with default 'user' role...`);

  // Update all users without roles to 'user'
  await userRepository.update(
    [
      { role: null },
      { role: '' },
    ],
    { role: 'user' }
  );

  console.log(`Successfully updated ${usersWithoutRole.length} users.`);
}

/**
 * SQL version (can be run directly in SQLite):
 * 
 * UPDATE users 
 * SET role = 'user' 
 * WHERE role IS NULL OR role = '';
 */
