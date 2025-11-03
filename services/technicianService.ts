import { Technician, RegistrationStatus } from '../types';
import { db } from './database';

export const technicianService = {
  getAll: async (): Promise<Technician[]> => {
    return await db.getTechnicians();
  },

  getById: async (id: string): Promise<Technician | null> => {
    return await db.getTechnicianById(id);
  },

  add: async (data: Omit<Technician, 'id' | 'registration_status' | 'created_at' | 'updated_at'>): Promise<Technician | null> => {
    const newTechnician = {
      ...data,
      registration_status: 'PENDING' as RegistrationStatus,
      negotiable_per_job: data.negotiable_per_job || false
    };
    return await db.addTechnician(newTechnician);
  },

  update: async (id: string, data: Partial<Omit<Technician, 'id'>>): Promise<Technician | null> => {
    return await db.updateTechnician(id, data);
  },

  delete: async (id: string): Promise<boolean> => {
    return await db.deleteTechnician(id);
  },
  
  findByCredentials: async (login: string, pass: string): Promise<Technician | undefined> => {
    const technicians = await db.getTechnicians();
    return technicians.find(t => (t.login_email === login || t.contact_1 === login) && t.password_hash === pass);
  }
};
