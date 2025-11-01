import React, { useState, useEffect, useCallback, useContext } from 'react';
import { technicianService } from '../../services/technicianService';
import { RegistrationStatus, Technician } from '../../types';
import { SiteSettingsContext } from '../../context/SiteSettingsContext';

interface TechnicianDashboardPageProps {
  technicianId: string;
  onProfileUpdate: () => void;
}

const TechnicianDashboardPage: React.FC<TechnicianDashboardPageProps> = ({ technicianId, onProfileUpdate }) => {
  const { settings } = useContext(SiteSettingsContext);
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [formData, setFormData] = useState<Partial<Technician>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchTechnician = useCallback(async () => {
    setLoading(true);
    const tech = await technicianService.getById(technicianId);
    setTechnician(tech || null);
    setFormData(tech || {});
    setLoading(false);
  }, [technicianId]);

  useEffect(() => {
    fetchTechnician();
  }, [fetchTechnician]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name) newErrors.full_name = 'Le nom complet est requis.';
    if (!formData.commune) newErrors.commune = 'La commune est requise.';
    if (!formData.contact_1 && !formData.login_email) {
      newErrors.contact_1 = 'Au moins un contact (téléphone 1 ou email) est requis.';
      newErrors.login_email = 'Au moins un contact (téléphone 1 ou email) est requis.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSkillChange = (skill: string) => {
    const currentSkills = formData.skills || [];
    setFormData(prev => ({
      ...prev,
      skills: currentSkills.includes(skill)
        ? currentSkills.filter(s => s !== skill)
        : [...currentSkills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const updateData = {
          ...formData,
          price_per_hour: formData.price_per_hour ? Number(formData.price_per_hour) : undefined,
          registration_status: RegistrationStatus.PENDING,
      };
      await technicianService.update(technicianId, updateData);
      onProfileUpdate();
    } catch (error) {
      setErrors({ form: "Erreur lors de la mise à jour." });
    } finally {
      setSubmitting(false);
    }
  };
  
  const getStatusBanner = () => {
    if (!technician) return null;
    switch(technician.registration_status) {
        case RegistrationStatus.PENDING:
            return <div className="p-4 mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">Votre profil est en attente d'approbation. Il n'est pas visible publiquement.</div>
        case RegistrationStatus.APPROVED:
            return <div className="p-4 mb-6 bg-green-100 border-l-4 border-green-500 text-green-700">Votre profil est approuvé et visible publiquement.</div>
        case RegistrationStatus.REJECTED:
            return <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700">Votre profil a été rejeté. Veuillez contacter le support.</div>
    }
  }


  if (loading || !settings) return <p className="text-center p-10">Chargement...</p>;
  if (!technician) return <p className="text-center p-10">Profil non trouvé.</p>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
      <p className="text-gray-600 mb-6">Mettez à jour vos informations ici. <span className="font-bold">Attention: toute modification soumettra à nouveau votre profil à approbation.</span></p>

      {getStatusBanner()}

      <div className="bg-white p-8 rounded-lg shadow-md">
        <form className="space-y-6" onSubmit={handleSubmit}>
           <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nom complet *</label>
              <input type="text" id="full_name" value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <label htmlFor="commune" className="block text-sm font-medium text-gray-700">Commune *</label>
              <select id="commune" value={formData.commune || ''} onChange={e => setFormData({...formData, commune: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="">Sélectionnez votre commune</option>
                {settings.communes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.commune && <p className="text-red-500 text-xs mt-1">{errors.commune}</p>}
            </div>
            
             <div>
                <p className="text-sm font-medium text-gray-700">Compétences</p>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {settings.skills.map(skill => (
                        <label key={skill} className="flex items-center space-x-2 border p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" checked={formData.skills?.includes(skill)} onChange={() => handleSkillChange(skill)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-700">{skill}</span>
                        </label>
                    ))}
                </div>
            </div>
             <div>
              <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">Courte description</label>
              <textarea id="short_description" rows={3} value={formData.short_description || ''} onChange={e => setFormData({...formData, short_description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <label htmlFor="contact_1" className="block text-sm font-medium text-gray-700">Téléphone principal</label>
                  <input type="tel" id="contact_1" value={formData.contact_1 || ''} onChange={e => setFormData({...formData, contact_1: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                   {errors.contact_1 && <p className="text-red-500 text-xs mt-1">{errors.contact_1}</p>}
                </div>
                 <div>
                  <label htmlFor="contact_2" className="block text-sm font-medium text-gray-700">Téléphone secondaire</label>
                  <input type="tel" id="contact_2" value={formData.contact_2 || ''} onChange={e => setFormData({...formData, contact_2: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                 <div>
                  <label htmlFor="login_email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="login_email" value={formData.login_email || ''} onChange={e => setFormData({...formData, login_email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                   {errors.login_email && <p className="text-red-500 text-xs mt-1">{errors.login_email}</p>}
                </div>
                 <div>
                  <label htmlFor="price_per_hour" className="block text-sm font-medium text-gray-700">Tarif par heure (USD)</label>
                  <input type="number" id="price_per_hour" value={formData.price_per_hour || ''} onChange={e => setFormData({...formData, price_per_hour: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
            </div>
            
             <div>
                <div className="relative flex items-start">
                    <div className="flex h-5 items-center">
                        <input
                            id="negotiable_per_job"
                            name="negotiable_per_job"
                            type="checkbox"
                            checked={!!formData.negotiable_per_job}
                            onChange={e => setFormData({ ...formData, negotiable_per_job: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="negotiable_per_job" className="font-medium text-gray-700">
                            Négociable à la tâche
                        </label>
                        <p className="text-gray-500">Cochez si vous préférez discuter du prix par projet plutôt qu'un tarif horaire.</p>
                    </div>
                </div>
            </div>
            
            <div className="pt-4">
                 <button type="submit" disabled={submitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                    {submitting ? 'Mise à jour...' : 'Mettre à jour et soumettre pour approbation'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default TechnicianDashboardPage;
