import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Technician, RegistrationStatus } from '../../types';
import { technicianService } from '../../services/technicianService';
import { reviewService } from '../../services/reviewService';
import TechnicianCard from '../TechnicianCard';
import AdBanner from '../AdBanner';
import { SiteSettingsContext } from '../../context/SiteSettingsContext';

interface PublicListingPageProps {
  onViewProfile: (id: string) => void;
}

const PublicListingPage: React.FC<PublicListingPageProps> = ({ onViewProfile }) => {
  const { settings } = useContext(SiteSettingsContext);
  const [allTechnicians, setAllTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [techs, reviews] = await Promise.all([
        technicianService.getAll(),
        reviewService.getAllApproved()
      ]);

      const approvedTechs = techs.filter(t => t.registration_status === RegistrationStatus.APPROVED);

      // Calculate average ratings
      const ratings: { [key: string]: { total: number, count: number } } = {};
      reviews.forEach(review => {
        if (!ratings[review.technicianId]) {
          ratings[review.technicianId] = { total: 0, count: 0 };
        }
        ratings[review.technicianId].total += review.rating;
        ratings[review.technicianId].count++;
      });
      
      const techsWithRatings = approvedTechs.map(tech => ({
          ...tech,
          average_rating: ratings[tech.id] ? ratings[tech.id].total / ratings[tech.id].count : undefined
      }));

      setAllTechnicians(techsWithRatings);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredTechnicians = useMemo(() => {
    return allTechnicians.filter(tech => {
      const nameMatch = tech.full_name.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = tech.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const communeMatch = selectedCommune ? tech.commune === selectedCommune : true;
      const skillMatch = selectedSkill ? tech.skills.includes(selectedSkill) : true;
      return (nameMatch || descMatch) && communeMatch && skillMatch;
    });
  }, [allTechnicians, searchTerm, selectedCommune, selectedSkill]);

  const renderTechniciansWithAds = () => {
    const items = [];
    for (let i = 0; i < filteredTechnicians.length; i++) {
        items.push(<TechnicianCard key={filteredTechnicians[i].id} technician={filteredTechnicians[i]} onViewProfile={onViewProfile} />);
        if ((i + 1) % 6 === 0) {
            items.push(<AdBanner key={`ad-${i}`} size="listing" />);
        }
    }
    return items;
  };

  if (!settings) return <p>Chargement...</p>;


  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">Trouvez un technicien qualifié</h1>
        <p className="mt-2 text-lg text-gray-600">Recherchez parmi les meilleurs professionnels de Lubumbashi.</p>
      </div>
      
      <div className="mb-8">
        <AdBanner size="top" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters */}
        <aside className="md:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-bold mb-4">Filtres</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">Rechercher</label>
              <input
                type="text"
                id="search"
                placeholder="Nom, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="commune" className="block text-sm font-medium text-gray-700">Commune</label>
              <select
                id="commune"
                value={selectedCommune}
                onChange={(e) => setSelectedCommune(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Toutes</option>
                {settings.communes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="skill" className="block text-sm font-medium text-gray-700">Compétence</label>
              <select
                id="skill"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Toutes</option>
                {settings.skills.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
           <div className="mt-8">
             <AdBanner size="sidebar" />
           </div>
        </aside>

        {/* Listings */}
        <div className="md:col-span-3">
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTechnicians.length > 0 ? 
                renderTechniciansWithAds()
               : (
                <p className="col-span-full text-center text-gray-500">Aucun technicien ne correspond à vos critères.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default PublicListingPage;
