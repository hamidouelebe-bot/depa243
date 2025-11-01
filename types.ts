export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Technician {
  id: string;
  full_name: string;
  contact_1?: string;
  contact_2?: string;
  commune: string;
  skills: string[];
  short_description?: string;
  price_per_hour?: number;
  negotiable_per_job?: boolean;
  registration_status: RegistrationStatus;
  login_email?: string;
  password_hash: string;
  average_rating?: number;
}

export interface Review {
  id: string;
  technicianId: string;
  authorName: string;
  authorPhone: string;
  rating: number;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: 'ADMIN' | 'EDITOR';
}

export enum UserRole {
  TECHNICIAN = 'TECHNICIAN',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  PUBLIC = 'PUBLIC',
}

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  name: string;
}

export interface BannerSettings {
    top: string | null;
    sidebar: string | null;
    listing: string | null;
    bottom: string | null;
}

export interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

export interface SiteSettings {
    logo: string | null;
    banners: BannerSettings;
    faq: FAQItem[];
    communes: string[];
    skills: string[];
    appName: string;
    footerText: string;
}
