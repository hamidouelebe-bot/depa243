import { Technician, Review } from '../types';
import { db } from './database';

/**
 * A mock notification service to simulate sending emails.
 * In a real application, this would integrate with an email API (e.g., SendGrid, Mailgun).
 */
export const notificationService = {
  /**
   * Simulates sending a new registration notification to an admin.
   * @param technician The technician who has just registered.
   */
  sendNewRegistrationNotification: async (technician: Technician): Promise<void> => {
    const appName = db.getSettings().appName;
    return new Promise((resolve) => {
      const adminEmail = 'hamidou.elebe@gmail.com';
      console.log(`
        ==================================================
        📧 SIMULATING ADMIN NOTIFICATION 📧
        --------------------------------------------------
        To: ${adminEmail}
        From: no-reply@lubumbashi-handy-pro.com
        Subject: Nouvelle inscription de technicien !

        Bonjour Admin,

        Un nouveau technicien vient de s'inscrire sur la plateforme et est en attente d'approbation.

        Détails du technicien:
        - Nom: ${technician.full_name}
        - ID: ${technician.id}
        - Commune: ${technician.commune}
        - Compétences: ${technician.skills.join(', ')}
        - Contact: ${technician.contact_1 || technician.login_email || 'Non fourni'}

        Veuillez vous connecter au tableau de bord administrateur pour examiner et approuver le profil.

        L'équipe de ${appName}
        ==================================================
      `);
      // Simulate network delay
      setTimeout(resolve, 500);
    });
  },

  /**
   * Simulates sending a notification to an admin about a new review.
   * @param review The new review that was submitted.
   * @param technicianName The name of the technician who was reviewed.
   */
  sendNewReviewNotification: async (review: Review, technicianName: string): Promise<void> => {
    const appName = db.getSettings().appName;
    return new Promise((resolve) => {
      const adminEmail = 'hamidou.elebe@gmail.com';
      console.log(`
        ==================================================
        📧 SIMULATING ADMIN NOTIFICATION - NEW REVIEW 📧
        --------------------------------------------------
        To: ${adminEmail}
        From: no-reply@lubumbashi-handy-pro.com
        Subject: Nouvel avis en attente de modération

        Bonjour Admin,

        Un nouvel avis a été soumis et est en attente de modération.

        Détails de l'avis:
        - Auteur: ${review.authorName} (${review.authorPhone})
        - Technicien: ${technicianName} (ID: ${review.technicianId})
        - Note: ${review.rating}/5
        - Commentaire: "${review.comment}"

        Veuillez vous connecter au tableau de bord administrateur pour examiner et approuver cet avis.

        L'équipe de ${appName}
        ==================================================
      `);
      // Simulate network delay
      setTimeout(resolve, 500);
    });
  },

  /**
   * Simulates sending an approval email to a technician.
   * @param technician The technician who has been approved.
   */
  sendApprovalEmail: async (technician: Technician): Promise<void> => {
    const appName = db.getSettings().appName;
    return new Promise((resolve) => {
      if (technician.login_email) {
        console.log(`
          ==================================================
          📧 SIMULATING EMAIL NOTIFICATION 📧
          --------------------------------------------------
          To: ${technician.login_email}
          From: no-reply@lubumbashi-handy-pro.com
          Subject: Votre profil a été approuvé !

          Bonjour ${technician.full_name},

          Félicitations ! Votre profil sur ${appName} a été examiné et approuvé par nos administrateurs.
          Il est maintenant visible publiquement et les clients peuvent vous contacter.

          Connectez-vous à votre tableau de bord pour gérer vos informations.

          L'équipe de ${appName}
          ==================================================
        `);
      } else {
        console.warn(`
          ==================================================
          ⚠️ EMAIL NOTIFICATION FAILED ⚠️
          --------------------------------------------------
          Technician: ${technician.full_name} (ID: ${technician.id})
          Reason: No email address provided. Cannot send approval notification.
          ==================================================
        `);
      }
      // Simulate network delay
      setTimeout(resolve, 500);
    });
  },
};
