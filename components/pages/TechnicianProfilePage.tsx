
import React, { useState, useEffect, useCallback } from 'react';
import { Technician, Review } from '../../types';
import { technicianService } from '../../services/technicianService';
import { reviewService } from '../../services/reviewService';
import { notificationService } from '../../services/notificationService';
import AdBanner from '../AdBanner';
import StarRating from '../StarRating';

interface TechnicianProfilePageProps {
  technicianId: string;
  onBack: () => void;
}

const PhoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
);

const EmailIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
);

const ReviewForm: React.FC<{ technicianId: string; technicianName: string; onSubmitSuccess: () => void }> = ({ technicianId, technicianName, onSubmitSuccess }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [authorPhone, setAuthorPhone] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || !comment.trim() || !authorName.trim() || !authorPhone.trim()) {
            setError('Veuillez renseigner votre nom, téléphone, une note et un commentaire.');
            return;
        }
        setError('');
        setSubmitting(true);
        const newReview = await reviewService.add({
            technicianId,
            authorName,
            authorPhone,
            rating,
            comment
        });
        await notificationService.sendNewReviewNotification(newReview, technicianName);
        setSubmitting(false);
        onSubmitSuccess();
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Laissez un avis</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="authorName" className="block text-sm font-medium text-gray-700">Votre nom *</label>
                    <input type="text" id="authorName" value={authorName} onChange={e => setAuthorName(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                </div>
                 <div>
                    <label htmlFor="authorPhone" className="block text-sm font-medium text-gray-700">Votre numéro de téléphone *</label>
                    <input type="tel" id="authorPhone" value={authorPhone} onChange={e => setAuthorPhone(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                     <p className="text-xs text-gray-500 mt-1">Ce numéro est confidentiel et ne sera utilisé que pour vérifier votre expérience.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Votre note *</label>
                    <div className="mt-1">
                        <StarRating rating={rating} onRatingChange={setRating} size="lg" isInteractive={true} />
                    </div>
                </div>
                <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Votre commentaire *</label>
                    <textarea id="comment" rows={4} value={comment} onChange={e => setComment(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400">
                    {submitting ? 'Envoi...' : 'Soumettre l\'avis'}
                </button>
            </form>
        </div>
    );
};


const TechnicianProfilePage: React.FC<TechnicianProfilePageProps> = ({ technicianId, onBack }) => {
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [tech, revs] = await Promise.all([
      technicianService.getById(technicianId),
      reviewService.getAllApprovedByTechnicianId(technicianId)
    ]);
    setTechnician(tech || null);
    setReviews(revs);
    setLoading(false);
  }, [technicianId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

  if (loading) return <p className="text-center p-10">Chargement du profil...</p>;
  if (!technician) return <p className="text-center p-10">Technicien non trouvé.</p>;

  const primaryContact = technician.contact_1 || technician.login_email;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <button onClick={onBack} className="mb-6 text-blue-600 hover:underline">
        &larr; Retour à la liste
      </button>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-4xl font-bold">{technician.full_name}</h1>
          <p className="text-xl mt-2">{technician.commune}</p>
          {reviews.length > 0 && (
             <div className="flex items-center mt-3">
                <StarRating rating={averageRating} size="md" />
                <span className="ml-2 text-blue-100">({reviews.length} avis)</span>
            </div>
          )}
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">Description</h2>
                    <p className="mt-4 text-gray-700">{technician.short_description || 'Aucune description fournie.'}</p>
                </div>
                 <div>
                    <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">Compétences</h2>
                    <div className="mt-4 flex flex-wrap gap-3">
                    {technician.skills.map(skill => (
                        <span key={skill} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full font-medium">{skill}</span>
                    ))}
                    </div>
                </div>

                {/* Reviews Section */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2">Avis des clients</h2>
                    {reviews.length > 0 ? (
                        <div className="mt-4 space-y-4">
                            {reviews.map(review => (
                                <div key={review.id} className="border-b pb-4">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-gray-800">{review.authorName}</p>
                                        <StarRating rating={review.rating} size="sm" />
                                    </div>
                                    <p className="text-gray-600 mt-1">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-4 text-gray-500">Aucun avis pour le moment.</p>
                    )}
                    {reviewSubmitted ? (
                        <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-md text-center">
                            Merci ! Votre avis a été soumis et est en attente de modération.
                        </div>
                    ) : (
                        <ReviewForm technicianId={technicianId} technicianName={technician.full_name} onSubmitSuccess={() => setReviewSubmitted(true)} />
                    )}
                </div>

            </div>
            <aside className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact</h3>
                     {showContact && primaryContact ? (
                        <div className="flex items-center">
                            {technician.contact_1 ? <PhoneIcon /> : <EmailIcon />}
                            <a href={technician.contact_1 ? `tel:${primaryContact}` : `mailto:${primaryContact}`} className="text-gray-700 hover:text-blue-600 font-medium">{primaryContact}</a>
                        </div>
                     ) : primaryContact ? (
                        <button 
                            onClick={() => setShowContact(true)}
                            className="w-full bg-green-500 text-white px-4 py-3 rounded-md font-semibold hover:bg-green-600 transition-colors"
                        >
                            Afficher le contact principal
                        </button>
                    ) : (
                        <p className="text-gray-500">Aucune information de contact fournie.</p>
                    )}
                </div>
                 <div className="bg-green-50 p-6 rounded-lg text-center">
                    <h3 className="text-xl font-semibold text-gray-800">Tarif Indicatif</h3>
                    {technician.price_per_hour || technician.negotiable_per_job ? (
                        <div className="mt-2 space-y-1">
                            {technician.price_per_hour && (
                                <p className="text-3xl font-bold text-green-600">
                                    ${technician.price_per_hour}
                                    <span className="text-lg font-normal text-gray-600">/heure</span>
                                </p>
                            )}
                            {technician.negotiable_per_job && (
                                <p className={`text-gray-700 font-medium ${technician.price_per_hour ? 'mt-1 text-sm' : 'text-lg'}`}>
                                    Négociable à la tâche
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-600 mt-2">Non spécifié</p>
                    )}
                </div>
            </aside>
        </div>
        <div className="px-8 pb-8">
            <AdBanner size="bottom" />
        </div>
      </div>
    </div>
  );
};

export default TechnicianProfilePage;
