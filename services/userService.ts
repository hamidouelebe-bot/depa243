import { User } from '../types';
import { db } from './database';

const MAX_EDITORS = 4;

export const userService = {
  getById: async (id: string): Promise<User | undefined> => {
    const users = await db.getUsers();
    return users.find(u => u.id === id);
  },

  findByCredentials: async (username: string, pass: string): Promise<User | undefined> => {
    const user = await db.getUserByUsername(username);
    if (user && user.password_hash === pass) {
      return user;
    }
    return undefined;
  },

  updatePassword: async (userId: string, newPass: string): Promise<boolean> => {
    const result = await db.updateUser(userId, { password_hash: newPass });
    return result !== null;
  },

  addEditor: async (username: string, pass: string): Promise<User | string> => {
    const users = await db.getUsers();
    if (users.filter(u => u.role === 'EDITOR').length >= MAX_EDITORS) {
      return "Le nombre maximum d'éditeurs (4) a été atteint.";
    }
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return "Ce nom d'utilisateur existe déjà.";
    }
    const newEditor = await db.addUser({
      username,
      password_hash: pass,
      role: 'EDITOR',
    });
    return newEditor || "Erreur lors de l'ajout de l'éditeur";
  },

  removeEditor: async (userId: string): Promise<boolean> => {
    // Note: We don't have a delete user method, so we'll need to add it
    // For now, return false as we can't delete users yet
    const users = await db.getUsers();
    const user = users.find(u => u.id === userId);
    if (user && user.role === 'EDITOR') {
      // Would need db.deleteUser(userId) here
      console.warn('User deletion not implemented in database service');
      return false;
    }
    return false;
  },

  getAllEditors: async (): Promise<User[]> => {
    const users = await db.getUsers();
    return users.filter(u => u.role === 'EDITOR');
  }
};
