import { Review } from '../types';
import { db } from './database';

export const reviewService = {
  add: async (reviewData: Omit<Review, 'id' | 'status'>): Promise<Review> => {
    const reviews = db.getReviews();
    const newReview: Review = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      status: 'PENDING',
    };
    reviews.push(newReview);
    db.setReviews(reviews);
    return newReview;
  },
  
  getAll: async (): Promise<Review[]> => {
    return db.getReviews();
  },

  getAllPending: async (): Promise<Review[]> => {
    const reviews = db.getReviews();
    return reviews.filter(r => r.status === 'PENDING');
  },

  getAllApprovedByTechnicianId: async (technicianId: string): Promise<Review[]> => {
    const reviews = db.getReviews();
    return reviews.filter(r => r.technicianId === technicianId && r.status === 'APPROVED');
  },

  getAllApproved: async (): Promise<Review[]> => {
    const reviews = db.getReviews();
    return reviews.filter(r => r.status === 'APPROVED');
  },

  updateStatus: async (reviewId: string, status: 'APPROVED' | 'REJECTED'): Promise<boolean> => {
    const reviews = db.getReviews();
    const index = reviews.findIndex(r => r.id === reviewId);
    if (index !== -1) {
      reviews[index].status = status;
      db.setReviews(reviews);
      return true;
    }
    return false;
  },

  deleteByTechnicianId: async (technicianId: string): Promise<boolean> => {
    let reviews = db.getReviews();
    const initialLength = reviews.length;
    reviews = reviews.filter(r => r.technicianId !== technicianId);
    if (reviews.length < initialLength) {
        db.setReviews(reviews);
        return true;
    }
    return false;
  },
};
