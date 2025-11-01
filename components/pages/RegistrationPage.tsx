import React, { useState, useContext } from 'react';
import { technicianService } from '../../services/technicianService';
import { SiteSettingsContext } from '../../context/SiteSettingsContext';
import { notificationService } from '../../services/notificationService';

interface RegistrationPageProps {
  onRegistrationSuccess: () => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onRegistrationSuccess }) => {
  const { settings } = useContext(SiteSettingsContext);
  const [formData, setFormData] = useState({
    full_name: '',
    contact_1: '',
    contact_2: '',
    commune: '',
    skills: [] as string[],
    short_description: '',
    price_per_hour: '',
    negotiable_per_job: false,
    login_email: '',
    password_hash: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name) newErrors.full_name = 'Le nom complet est requis.';
    if (!formData.commune) newErrors.commune = 'La commune est requise.';
    if (!formData.password_hash) newErrors.password_hash = 'Le mot de passe est requis.';
    if (formData.password_hash !== formData.confirm_password) newErrors.confirm_password = 'Les mots de passe ne correspondent pas.';
    if (!formData.contact_1 && !formData.login_email) {
      newErrors.contact_1 = 'Au moins un contact (téléphone 1 ou email) est requis.';
      newErrors.login_email = 'Au moins un contact (téléphone 1 ou email) est requis.';
    }
    if (formData.login_email && !/\S+@\S+\.\S+/.test(formData.login_email)) {
        newErrors.login_email = 'L\'adresse email est invalide.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSkillChange = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      const newTechnician = await technicianService.add({
        full_name: formData.full_name,
        commune: formData.commune,
        password_hash: formData.password_hash,
        contact_1: formData.contact_1 || undefined,
        contact_2: formData.contact_2 || undefined,
        skills: formData.skills,
        short_description: formData.short_description || undefined,
        price_per_hour: formData.price_per_hour ? parseFloat(formData.price_per_hour) : undefined,
        negotiable_per_job: formData.negotiable_per_job,
        login_email: formData.login_email || undefined,
      });
      await notificationService.sendNewRegistrationNotification(newTechnician);
      onRegistrationSuccess();
    } catch (e) {
      console.error("Registration failed:", e);
      setErrors({ form: "Une erreur s'est produite. Veuillez réessayer." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!settings) return <p>Chargement...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Devenez un technicien partenaire
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Rejoignez notre plateforme et trouvez de nouveaux clients.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Form fields */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nom complet *</label>
              <input type="text" id="full_name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <label htmlFor="commune" className="block text-sm font-medium text-gray-700">Commune *</label>
              <select id="commune" value={formData.commune} onChange={e => setFormData({...formData, commune: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="">Sélectionnez votre commune</option>
                {settings.communes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.commune && <p className="text-red-500 text-xs mt-1">{errors.commune}</p>}
            </div>

            <div>
                <p className="text-sm font-medium text-gray-700">Compétences</p>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {settings.skills.map(skill => (
                        <label key={skill} className="flex items-center space-x-2 border p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" checked={formData.skills.includes(skill)} onChange={() => handleSkillChange(skill)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-700">{skill}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
              <label htmlFor="short_description" className="block text-sm font-medium text-gray-700">Courte description</label>
              <textarea id="short_description" rows={3} value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} placeholder="Décrivez votre expérience, vos outils, vos spécialités..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div>
              <label htmlFor="price_per_hour" className="block text-sm font-medium text-gray-700">Tarif par heure (USD)</label>
              <input type="number" id="price_per_hour" value={formData.price_per_hour} onChange={e => setFormData({...formData, price_per_hour: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            
            <div>
                <div className="relative flex items-start">
                    <div className="flex h-5 items-center">
                        <input
                            id="negotiable_per_job"
                            name="negotiable_per_job"
                            type="checkbox"
                            checked={formData.negotiable_per_job}
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

            <div className="border-t border-gray-200 pt-6 space-y-6">
                <p className="text-sm text-gray-600">Informations de contact et de connexion. <span className="font-bold">Au moins un contact (téléphone ou email) est requis.</span></p>
                
                 <div>
                  <label htmlFor="contact_1" className="block text-sm font-medium text-gray-700">Téléphone principal</label>
                  <input type="tel" id="contact_1" value={formData.contact_1} onChange={e => setFormData({...formData, contact_1: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  {errors.contact_1 && <p className="text-red-500 text-xs mt-1">{errors.contact_1}</p>}
                </div>
                
                 <div>
                  <label htmlFor="contact_2" className="block text-sm font-medium text-gray-700">Téléphone secondaire (optionnel)</label>
                  <input type="tel" id="contact_2" value={formData.contact_2} onChange={e => setFormData({...formData, contact_2: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>
                
                <div>
                  <label htmlFor="login_email" className="block text-sm font-medium text-gray-700">Email (optionnel)</label>
                  <input type="email" id="login_email" value={formData.login_email} onChange={e => setFormData({...formData, login_email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                  {errors.login_email && <p className="text-red-500 text-xs mt-1">{errors.login_email}</p>}
                </div>

                 <div>
                  <label htmlFor="password_hash" className="block text-sm font-medium text-gray-700">Mot de passe *</label>
                  <input type="password" id="password_hash" value={formData.password_hash} onChange={e => setFormData({...formData, password_hash: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                   {errors.password_hash && <p className="text-red-500 text-xs mt-1">{errors.password_hash}</p>}
                </div>
                 <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe *</label>
                  <input type="password" id="confirm_password" value={formData.confirm_password} onChange={e => setFormData({...formData, confirm_password: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                   {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
                </div>
            </div>

            <div>
              <button type="submit" disabled={submitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                {submitting ? 'Envoi en cours...' : 'Soumettre pour approbation'}
              </button>
               {errors.form && <p className="text-red-500 text-sm mt-2 text-center">{errors.form}</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
