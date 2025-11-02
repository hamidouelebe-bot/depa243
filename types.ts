// --------------- ENUMS ----------------
export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AppUserRole = 'TECHNICIAN' | 'ADMIN' | 'EDITOR' | 'PUBLIC';

// --------------- TABLE TYPES ----------------
export interface Technician {
  id: string;
  full_name: string;
  contact_1?: string | null;
  contact_2?: string | null;
  commune: string;
  skills: string[];
  short_description?: string | null;
  price_per_hour?: number | null;
  negotiable_per_job: boolean;
  registration_status: RegistrationStatus;
  login_email?: string | null;
  password_hash: string;
  average_rating?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  technician_id: string;
  author_name: string;
  author_phone?: string | null;
  rating: number;
  comment?: string | null;
  status: ReviewStatus;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  logo: string | null;
  banners: any;
  faq: any;
  communes: string[];
  skills: string[];
  app_name: string | null;
  footer_text: string | null;
  updated_at: string;
}

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

