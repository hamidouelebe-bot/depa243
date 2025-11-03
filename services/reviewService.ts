import { Review } from '../types';
import { db } from './database';

export const reviewService = {
  add: async (reviewData: Omit<Review, 'id' | 'status' | 'created_at'>): Promise<Review | null> => {
    const newReview = {
      ...reviewData,
      status: 'PENDING' as const,
    };
    return await db.addReview(newReview);
  },
  
  getAll: async (): Promise<Review[]> => {
    return await db.getReviews();
  },

  getAllPending: async (): Promise<Review[]> => {
    const reviews = await db.getReviews();
    return reviews.filter(r => r.status === 'PENDING');
  },

  getAllApprovedByTechnicianId: async (technicianId: string): Promise<Review[]> => {
    const reviews = await db.getReviewsByTechnicianId(technicianId);
    return reviews.filter(r => r.status === 'APPROVED');
  },

  getAllApproved: async (): Promise<Review[]> => {
    const reviews = await db.getReviews();
    return reviews.filter(r => r.status === 'APPROVED');
  },

  updateStatus: async (reviewId: string, status: 'APPROVED' | 'REJECTED'): Promise<boolean> => {
    const result = await db.updateReview(reviewId, { status });
    return result !== null;
  },

  deleteByTechnicianId: async (technicianId: string): Promise<boolean> => {
    const reviews = await db.getReviewsByTechnicianId(technicianId);
    let deleted = false;
    for (const review of reviews) {
      const success = await db.deleteReview(review.id);
      if (success) deleted = true;
    }
    return deleted;
  },
};
