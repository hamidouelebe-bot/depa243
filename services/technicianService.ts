import { Technician, RegistrationStatus } from '../types';
import { db } from './database';

export const technicianService = {
  getAll: async (): Promise<Technician[]> => {
    return db.getTechnicians();
  },

  getById: async (id: string): Promise<Technician | undefined> => {
    const technicians = db.getTechnicians();
    return technicians.find(t => t.id === id);
  },

  add: async (data: Omit<Technician, 'id' | 'registration_status'>): Promise<Technician> => {
    const technicians = db.getTechnicians();
    const newTechnician: Technician = {
      ...data,
      id: `tech_${Date.now()}`,
      registration_status: RegistrationStatus.PENDING,
    };
    technicians.push(newTechnician);
    db.setTechnicians(technicians);
    return newTechnician;
  },

  update: async (id: string, data: Partial<Omit<Technician, 'id'>>): Promise<Technician | undefined> => {
    const technicians = db.getTechnicians();
    const index = technicians.findIndex(t => t.id === id);
    if (index !== -1) {
      technicians[index] = { ...technicians[index], ...data };
      db.setTechnicians(technicians);
      return technicians[index];
    }
    return undefined;
  },

  delete: async (id: string): Promise<boolean> => {
    let technicians = db.getTechnicians();
    const initialLength = technicians.length;
    technicians = technicians.filter(t => t.id !== id);
    if (technicians.length < initialLength) {
      db.setTechnicians(technicians);
      return true;
    }
    return false;
  },
  
  findByCredentials: async (login: string, pass: string): Promise<Technician | undefined> => {
    const technicians = db.getTechnicians();
    return technicians.find(t => (t.login_email === login || t.contact_1 === login) && t.password_hash === pass);
  }
};
