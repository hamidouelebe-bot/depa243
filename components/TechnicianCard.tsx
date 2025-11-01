
import React, { useState } from 'react';
import { Technician } from '../types';
import StarRating from './StarRating';

interface TechnicianCardProps {
  technician: Technician;
  onViewProfile: (id: string) => void;
}

const LocationIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const PhoneIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
);

const EmailIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
);


const TechnicianCard: React.FC<TechnicianCardProps> = ({ technician, onViewProfile }) => {
  const [showContact, setShowContact] = useState(false);
  const primaryContact = technician.contact_1 || technician.login_email;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800">{technician.full_name}</h3>
        {technician.average_rating !== undefined && (
          <div className="mt-1">
            <StarRating rating={technician.average_rating} size="sm" />
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600 mt-2">
            <LocationIcon />
            <span>{technician.commune}</span>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          {technician.skills.map((skill) => (
            <span key={skill} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {skill}
            </span>
          ))}
        </div>
        
        <p className="text-gray-600 mt-4 text-sm h-10 overflow-hidden">
          {technician.short_description || 'Aucune description disponible.'}
        </p>
      </div>

      <div className="p-6 border-t mt-auto flex justify-between items-center">
        <div>
          {showContact && primaryContact ? (
            <div className="flex items-center text-sm text-gray-700 font-semibold">
              {technician.contact_1 ? <PhoneIcon /> : <EmailIcon />}
              <a href={technician.contact_1 ? `tel:${primaryContact}` : `mailto:${primaryContact}`} className="ml-1 hover:underline">{primaryContact}</a>
            </div>
          ) : (technician.price_per_hour || technician.negotiable_per_job) ? (
              <div>
                  {technician.price_per_hour && (
                      <p className="text-lg font-bold text-green-600">${technician.price_per_hour}<span className="text-sm font-normal text-gray-500">/heure</span></p>
                  )}
                  {technician.negotiable_per_job && (
                      <p className={`text-gray-600 font-medium ${technician.price_per_hour ? 'text-xs' : 'text-sm'}`}>Négociable à la tâche</p>
                  )}
              </div>
          ) : <div className="h-7"></div>}
        </div>
          
          <div className="flex items-center space-x-2">
            {!showContact && primaryContact && (
              <button
                onClick={() => setShowContact(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
              >
                Contacter
              </button>
            )}
            <button
            onClick={() => onViewProfile(technician.id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
            Voir Profil
            </button>
          </div>
      </div>
    </div>
  );
};

export default TechnicianCard;
