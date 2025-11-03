import { Technician, Review, User, SiteSettings } from '../types';
import { sql, executeQuery } from './neon';

/**
 * Database service using Neon Postgres as the backend
 * This replaces the previous localStorage implementation
 */
class Database {
  /**
   * Get all technicians from the database
   */
  async getTechnicians(): Promise<Technician[]> {
    try {
      const result = await sql`
        SELECT * FROM technicians 
        ORDER BY created_at DESC
      `;
      return result as Technician[];
    } catch (error) {
      console.error('Error fetching technicians:', error);
      return [];
    }
  }

  /**
   * Get a single technician by ID
   */
  async getTechnicianById(id: string): Promise<Technician | null> {
    try {
      const result = await sql`
        SELECT * FROM technicians 
        WHERE id = ${id}
      `;
      return result[0] as Technician || null;
    } catch (error) {
      console.error('Error fetching technician:', error);
      return null;
    }
  }

  /**
   * Add a new technician
   */
  async addTechnician(technician: Omit<Technician, 'id' | 'created_at' | 'updated_at'>): Promise<Technician | null> {
    try {
      const result = await sql`
        INSERT INTO technicians (
          full_name, contact_1, contact_2, commune, skills,
          short_description, price_per_hour, negotiable_per_job,
          registration_status, login_email, password_hash
        ) VALUES (
          ${technician.full_name},
          ${technician.contact_1 || null},
          ${technician.contact_2 || null},
          ${technician.commune},
          ${technician.skills},
          ${technician.short_description || null},
          ${technician.price_per_hour || null},
          ${technician.negotiable_per_job || false},
          ${technician.registration_status},
          ${technician.login_email || null},
          ${technician.password_hash}
        )
        RETURNING *
      `;
      return result[0] as Technician || null;
    } catch (error) {
      console.error('Error adding technician:', error);
      return null;
    }
  }

  /**
   * Update an existing technician
   */
  async updateTechnician(id: string, updates: Partial<Technician>): Promise<Technician | null> {
    try {
      // Build SET clause dynamically
      const setClauses: string[] = [];
      const params: any[] = [id];
      let paramIndex = 2;

      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) return null;

      // Execute raw SQL query
      const query = `
        UPDATE technicians 
        SET ${setClauses.join(', ')}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await executeQuery<Technician>(query, params);
      return result[0] || null;
    } catch (error) {
      console.error('Error updating technician:', error);
      return null;
    }
  }

  /**
   * Delete a technician
   */
  async deleteTechnician(id: string): Promise<boolean> {
    try {
      await sql`DELETE FROM technicians WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('Error deleting technician:', error);
      return false;
    }
  }

  /**
   * Get all reviews
   */
  async getReviews(): Promise<Review[]> {
    try {
      const result = await sql`
        SELECT * FROM reviews 
        ORDER BY created_at DESC
      `;
      return result as Review[];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  /**
   * Get reviews for a specific technician
   */
  async getReviewsByTechnicianId(technicianId: string): Promise<Review[]> {
    try {
      const result = await sql`
        SELECT * FROM reviews 
        WHERE technician_id = ${technicianId}
        ORDER BY created_at DESC
      `;
      return result as Review[];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  /**
   * Add a new review
   */
  async addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review | null> {
    try {
      const result = await sql`
        INSERT INTO reviews (
          technician_id, author_name, author_phone,
          rating, comment, status
        ) VALUES (
          ${review.technician_id},
          ${review.author_name},
          ${review.author_phone || null},
          ${review.rating},
          ${review.comment || null},
          ${review.status}
        )
        RETURNING *
      `;
      return result[0] as Review || null;
    } catch (error) {
      console.error('Error adding review:', error);
      return null;
    }
  }

  /**
   * Update a review
   */
  async updateReview(id: string, updates: Partial<Review>): Promise<Review | null> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [id];
      let paramIndex = 2;

      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'created_at') {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) return null;

      const query = `
        UPDATE reviews 
        SET ${setClauses.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const result = await executeQuery<Review>(query, params);
      return result[0] || null;
    } catch (error) {
      console.error('Error updating review:', error);
      return null;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(id: string): Promise<boolean> {
    try {
      await sql`DELETE FROM reviews WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }

  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    try {
      const result = await sql`SELECT * FROM users`;
      return result as User[];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await sql`
        SELECT * FROM users 
        WHERE username = ${username}
      `;
      return result[0] as User || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Add a new user
   */
  async addUser(user: Omit<User, 'id'>): Promise<User | null> {
    try {
      const result = await sql`
        INSERT INTO users (username, password_hash, role)
        VALUES (${user.username}, ${user.password_hash}, ${user.role})
        RETURNING *
      `;
      return result[0] as User || null;
    } catch (error) {
      console.error('Error adding user:', error);
      return null;
    }
  }

  /**
   * Update a user
   */
  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const setClauses: string[] = [];
      const params: any[] = [id];
      let paramIndex = 2;

      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id') {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) return null;

      const query = `
        UPDATE users 
        SET ${setClauses.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const result = await executeQuery<User>(query, params);
      return result[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  /**
   * Get site settings
   */
  async getSettings(): Promise<SiteSettings | null> {
    try {
      const result = await sql`
        SELECT * FROM site_settings 
        LIMIT 1
      `;
      return result[0] as SiteSettings || null;
    } catch (error) {
      console.error('Error fetching settings:', error);
      return null;
    }
  }

  /**
   * Update site settings
   */
  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings | null> {
    try {
      const setClauses: string[] = [];
      const settingsId = settings.id || '1';
      const params: any[] = [settingsId];
      let paramIndex = 2;

      for (const [key, value] of Object.entries(settings)) {
        if (key !== 'id') {
          setClauses.push(`${key} = $${paramIndex}`);
          params.push(value);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) return null;

      const query = `
        UPDATE site_settings 
        SET ${setClauses.join(', ')}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await executeQuery<SiteSettings>(query, params);
      return result[0] || null;
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  }

  // Legacy methods for backward compatibility (synchronous to async migration)
  // These methods are deprecated and should be replaced with their async counterparts
  
  /**
   * @deprecated Use getTechnicians() instead
   */
  setTechnicians(_technicians: Technician[]) {
    console.warn('setTechnicians is deprecated. Use addTechnician() or updateTechnician() instead.');
  }

  /**
   * @deprecated Use getReviews() instead
   */
  setReviews(_reviews: Review[]) {
    console.warn('setReviews is deprecated. Use addReview() or updateReview() instead.');
  }

  /**
   * @deprecated Use getUsers() instead
   */
  setUsers(_users: User[]) {
    console.warn('setUsers is deprecated. Use addUser() or updateUser() instead.');
  }

  /**
   * @deprecated Use updateSettings() instead
   */
  setSettings(_settings: SiteSettings) {
    console.warn('setSettings is deprecated. Use updateSettings() instead.');
  }

}

export const db = new Database();
