import { Technician, Review, User, RegistrationStatus, SiteSettings } from '../types';
import { defaultSettings } from '../constants';

const DB_KEY = 'handy-pro-connect-db';

interface DatabaseSchema {
  technicians: Technician[];
  reviews: Review[];
  users: User[];
  settings: SiteSettings;
}

const getDefaultData = (): DatabaseSchema => ({
  technicians: [
      {
        id: 'tech_1',
        full_name: 'Jean Kabila',
        contact_1: '0812345678',
        commune: 'Lubumbashi',
        skills: ['Plomberie', 'Électricité'],
        short_description: 'Plombier et électricien expérimenté avec 10 ans d\'expérience. Service rapide et fiable.',
        price_per_hour: 25,
        negotiable_per_job: true,
        registration_status: RegistrationStatus.APPROVED,
        login_email: 'jean.kabila@example.com',
        password_hash: 'password123'
      },
      {
        id: 'tech_2',
        full_name: 'Marie Ilunga',
        contact_1: '0998765432',
        contact_2: '0823456789',
        commune: 'Kampemba',
        skills: ['Peinture', 'Carrelage'],
        short_description: 'Artiste peintre et carreleuse professionnelle. Transformez votre maison avec des finitions impeccables.',
        price_per_hour: 20,
        registration_status: RegistrationStatus.APPROVED,
        login_email: 'marie.ilunga@example.com',
        password_hash: 'password123'
      },
      {
        id: 'tech_3',
        full_name: 'Pierre Numbi',
        commune: 'Katuba',
        skills: ['Maçonnerie'],
        short_description: 'Maçon qualifié pour tous vos travaux de construction et de rénovation.',
        registration_status: RegistrationStatus.PENDING,
        login_email: 'pierre.numbi@example.com',
        password_hash: 'password123',
        negotiable_per_job: true,
      },
      {
        id: 'tech_4',
        full_name: 'Aline Mongo',
        contact_1: '0811122334',
        commune: 'Ruashi',
        skills: ['Jardinage'],
        short_description: 'Passionnée de jardinage, j\'entretiens vos espaces verts.',
        price_per_hour: 15,
        registration_status: RegistrationStatus.REJECTED,
        login_email: 'aline.mongo@example.com',
        password_hash: 'password123'
      },
       {
        id: 'tech_5',
        full_name: 'David Tshisekedi',
        contact_1: '0977777777',
        commune: 'Kamalondo',
        skills: ['Climatisation', 'Réparation d\'appareils'],
        short_description: 'Spécialiste en climatisation et réparation de gros électroménagers. Intervention rapide.',
        price_per_hour: 30,
        registration_status: RegistrationStatus.APPROVED,
        login_email: 'david.t@example.com',
        password_hash: 'password123'
      },
      {
        id: 'tech_6',
        full_name: 'Fatou Diop',
        contact_1: '0855555555',
        commune: 'Kenya',
        skills: ['Menuiserie'],
        short_description: 'Menuisière créative pour meubles sur mesure et réparations bois.',
        price_per_hour: 22,
        registration_status: RegistrationStatus.PENDING,
        password_hash: 'password123',
        negotiable_per_job: true
      },
  ],
  reviews: [
      { id: 'rev_1', technicianId: 'tech_1', authorName: 'Alice', authorPhone: '0811111111', rating: 5, comment: 'Excellent travail, très professionnel et rapide !', status: 'APPROVED' },
      { id: 'rev_2', technicianId: 'tech_2', authorName: 'Bob', authorPhone: '0822222222', rating: 4, comment: 'Bonne peintre, mais un peu en retard.', status: 'APPROVED' },
      { id: 'rev_3', technicianId: 'tech_1', authorName: 'Charlie', authorPhone: '0833333333', rating: 5, comment: 'Je recommande vivement Jean. Il a résolu mon problème de plomberie en un rien de temps.', status: 'PENDING' },
  ],
  users: [
    { id: 'user_admin', username: 'admin', password_hash: 'admin', role: 'ADMIN' },
  ],
  settings: defaultSettings,
});


class Database {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;
    try {
      const data = localStorage.getItem(DB_KEY);
      if (!data) {
        console.log('Initializing database with default data...');
        const defaultData = getDefaultData();
        localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
      }
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize database:", error);
    }
  }

  private read(): DatabaseSchema {
    try {
      const data = localStorage.getItem(DB_KEY);
      if (!data) {
        this.initialize();
        return this.read();
      }
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to read from database:", error);
      return getDefaultData();
    }
  }

  private write(data: DatabaseSchema) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to write to database:", error);
    }
  }

  getTechnicians(): Technician[] {
    return this.read().technicians;
  }
  
  setTechnicians(technicians: Technician[]) {
    const db = this.read();
    db.technicians = technicians;
    this.write(db);
  }

  getReviews(): Review[] {
    return this.read().reviews;
  }

  setReviews(reviews: Review[]) {
    const db = this.read();
    db.reviews = reviews;
    this.write(db);
  }
  
  getUsers(): User[] {
    return this.read().users;
  }
  
  setUsers(users: User[]) {
    const db = this.read();
    db.users = users;
    this.write(db);
  }
  
  getSettings(): SiteSettings {
      return this.read().settings;
  }
  
  setSettings(settings: SiteSettings) {
      const db = this.read();
      db.settings = settings;
      this.write(db);
  }

}

export const db = new Database();
