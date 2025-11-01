import React, { useContext } from 'react';
import { SiteSettingsContext } from '../../context/SiteSettingsContext';

const FAQPage: React.FC = () => {
  const { settings } = useContext(SiteSettingsContext);

  if (!settings) return <p>Chargement...</p>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">
          Questions Fréquemment Posées (FAQ)
        </h1>
        <div className="space-y-4">
          {settings.faq.length > 0 ? (
            settings.faq.map((item, index) => (
              <details key={item.id} className="bg-white p-6 rounded-lg shadow-md group" open={index < 2}>
                <summary className="font-semibold text-lg cursor-pointer flex justify-between items-center text-gray-800 group-hover:text-blue-600">
                  {item.question}
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform duration-300 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </summary>
                <div className="mt-4 text-gray-600">
                  <p className="whitespace-pre-wrap">{item.answer}</p>
                </div>
              </details>
            ))
          ) : (
            <p className="text-center text-gray-500">Aucune question n'a été ajoutée pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
