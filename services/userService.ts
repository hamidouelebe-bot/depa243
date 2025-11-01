import { User } from '../types';
import { db } from './database';

const MAX_EDITORS = 4;

export const userService = {
  getById: async (id: string): Promise<User | undefined> => {
    const users = db.getUsers();
    return users.find(u => u.id === id);
  },

  findByCredentials: async (username: string, pass: string): Promise<User | undefined> => {
    const users = db.getUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password_hash === pass);
  },

  updatePassword: async (userId: string, newPass: string): Promise<boolean> => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].password_hash = newPass;
      db.setUsers(users);
      return true;
    }
    return false;
  },

  addEditor: async (username: string, pass: string): Promise<User | string> => {
    const users = db.getUsers();
    if (users.filter(u => u.role === 'EDITOR').length >= MAX_EDITORS) {
      return "Le nombre maximum d'éditeurs (4) a été atteint.";
    }
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return "Ce nom d'utilisateur existe déjà.";
    }
    const newEditor: User = {
      id: `user_${Date.now()}`,
      username,
      password_hash: pass,
      role: 'EDITOR',
    };
    users.push(newEditor);
    db.setUsers(users);
    return newEditor;
  },

  removeEditor: async (userId: string): Promise<boolean> => {
    let users = db.getUsers();
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);
    if (users.length < initialLength) {
      db.setUsers(users);
      return true;
    }
    return false;
  },

  getAllEditors: async (): Promise<User[]> => {
    const users = db.getUsers();
    return users.filter(u => u.role === 'EDITOR');
  }
};
