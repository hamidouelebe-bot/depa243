import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { Technician, RegistrationStatus, Review, User, AuthenticatedUser, UserRole } from '../../types';
import { technicianService } from '../../services/technicianService';
import { reviewService } from '../../services/reviewService';
import { userService } from '../../services/userService';
import { notificationService } from '../../services/notificationService';
import { SiteSettingsContext } from '../../context/SiteSettingsContext';
import StarRating from '../StarRating';
import DashboardPage from './DashboardPage';

interface AdminPageProps {
  user: AuthenticatedUser;
}

type AdminTab = 'stats' | 'users' | 'reviews' | 'team' | 'settings';

const AdminPage: React.FC<AdminPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tableau de bord administrateur</h1>
      
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
           <button
            onClick={() => setActiveTab('stats')}
            className={`${activeTab === 'stats' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Statistiques
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Gérer Techniciens
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`${activeTab === 'reviews' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Approuver Avis
          </button>
          {user.role === UserRole.ADMIN && (
            <>
            <button
                onClick={() => setActiveTab('team')}
                className={`${activeTab === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
                Gestion de l'équipe
            </button>
            <button
                onClick={() => setActiveTab('settings')}
                className={`${activeTab === 'settings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
                Paramètres du site
            </button>
            </>
          )}
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'stats' && <DashboardPage />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'reviews' && <ReviewManagement />}
        {activeTab === 'team' && user.role === UserRole.ADMIN && <TeamManagement user={user} />}
        {activeTab === 'settings' && user.role === UserRole.ADMIN && <SiteSettingsManagement />}
      </div>
    </div>
  );
};


const UserManagement = () => {
    const [allTechnicians, setAllTechnicians] = useState<Technician[]>([]);
    const [statusFilter, setStatusFilter] = useState<RegistrationStatus | 'ALL'>(RegistrationStatus.PENDING);
    const [loading, setLoading] = useState(true);

    const fetchTechnicians = useCallback(async () => {
        setLoading(true);
        const all = await technicianService.getAll();
        setAllTechnicians(all);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchTechnicians();
    }, [fetchTechnicians]);

    const handleUpdateStatus = async (technician: Technician, status: RegistrationStatus) => {
        await technicianService.update(technician.id, { registration_status: status });
        if (status === RegistrationStatus.APPROVED) {
            await notificationService.sendApprovalEmail(technician);
        }
        fetchTechnicians();
    };

    const handleDelete = async (technicianId: string) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce technicien ? Cette action est irréversible et supprimera également tous les avis associés.")) {
            await technicianService.delete(technicianId);
            await reviewService.deleteByTechnicianId(technicianId);
            fetchTechnicians();
        }
    };

    const statusCounts = useMemo(() => {
        return allTechnicians.reduce((acc, tech) => {
            acc[tech.registration_status] = (acc[tech.registration_status] || 0) + 1;
            return acc;
        }, {} as Partial<Record<RegistrationStatus, number>>);
    }, [allTechnicians]);

    const filteredTechnicians = useMemo(() => {
        if (statusFilter === 'ALL') return allTechnicians;
        return allTechnicians.filter(t => t.registration_status === statusFilter);
    }, [allTechnicians, statusFilter]);

    const FilterButton: React.FC<{ status: RegistrationStatus | 'ALL'; label: string; count?: number }> = ({ status, label, count }) => (
        <button
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-md ${statusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
            {label} {count !== undefined && `(${count})`}
        </button>
    );

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Gestion des Techniciens</h2>
            <div className="flex space-x-2 mb-4 flex-wrap gap-2">
                <FilterButton status="ALL" label="Tous" />
                <FilterButton status={RegistrationStatus.PENDING} label="En attente" count={statusCounts[RegistrationStatus.PENDING] || 0} />
                <FilterButton status={RegistrationStatus.APPROVED} label="Approuvés" count={statusCounts[RegistrationStatus.APPROVED] || 0} />
                <FilterButton status={RegistrationStatus.REJECTED} label="Rejetés" count={statusCounts[RegistrationStatus.REJECTED] || 0} />
            </div>
            {loading ? (
                <p>Chargement...</p>
            ) : filteredTechnicians.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                    Aucun technicien ne correspond à ce filtre.
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {filteredTechnicians.map((tech) => (
                            <li key={tech.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <p className="text-lg font-medium text-blue-600 truncate">{tech.full_name}</p>
                                        <p className="text-sm text-gray-500">{tech.commune} - {tech.skills.join(', ')}</p>
                                        <p className="text-sm text-gray-500 mt-1">Email: {tech.login_email || 'N/A'} | Tél: {tech.contact_1 || 'N/A'}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex items-center space-x-2">
                                        {tech.registration_status === RegistrationStatus.PENDING && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(tech, RegistrationStatus.APPROVED)}
                                                    className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                                >
                                                    Approuver
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(tech, RegistrationStatus.REJECTED)}
                                                    className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600"
                                                >
                                                    Rejeter
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDelete(tech.id)}
                                            className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const ReviewManagement = () => {
    const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingReviews = useCallback(async () => {
        setLoading(true);
        const reviews = await reviewService.getAllPending();
        setPendingReviews(reviews);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPendingReviews();
    }, [fetchPendingReviews]);

    const handleUpdateStatus = async (reviewId: string, status: 'APPROVED' | 'REJECTED') => {
        await reviewService.updateStatus(reviewId, status);
        fetchPendingReviews();
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Avis en attente de modération</h2>
            {loading ? <p>Chargement...</p> : pendingReviews.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">Aucun avis en attente.</div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {pendingReviews.map(review => (
                            <li key={review.id} className="px-4 py-4 sm:px-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-baseline space-x-2">
                                            <p className="font-semibold">{review.authorName}</p>
                                            <p className="text-sm text-gray-500">({review.authorPhone})</p>
                                        </div>
                                        <p className="text-sm text-gray-600">Avis pour le technicien ID: {review.technicianId}</p>
                                        <div className="my-1"><StarRating rating={review.rating} size="sm" /></div>
                                        <p className="text-gray-700 italic">"{review.comment}"</p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                                        <button onClick={() => handleUpdateStatus(review.id, 'APPROVED')} className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">Approuver</button>
                                        <button onClick={() => handleUpdateStatus(review.id, 'REJECTED')} className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">Rejeter</button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const TeamManagement: React.FC<{user: AuthenticatedUser}> = ({ user }) => {
    const [editors, setEditors] = useState<User[]>([]);
    const [newPassword, setNewPassword] = useState('');
    const [newEditor, setNewEditor] = useState({ username: '', password: '' });
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const fetchEditors = useCallback(async () => {
        const editorList = await userService.getAllEditors();
        setEditors(editorList);
    }, []);

    useEffect(() => {
        fetchEditors();
    }, [fetchEditors]);

    const handlePasswordChange = async () => {
        if (!newPassword) return;
        const success = await userService.updatePassword(user.id, newPassword);
        if (success) {
            setFeedback({ type: 'success', message: 'Mot de passe mis à jour avec succès.' });
            setNewPassword('');
        } else {
             setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour.' });
        }
    };
    
    const handleInviteEditor = async () => {
        if (!newEditor.username || !newEditor.password) return;
        const result = await userService.addEditor(newEditor.username, newEditor.password);
        if (typeof result === 'string') {
            setFeedback({ type: 'error', message: result });
        } else {
            setFeedback({ type: 'success', message: `Éditeur ${result.username} ajouté.`});
            setNewEditor({username: '', password: ''});
            fetchEditors();
        }
    };
    
    const handleRemoveEditor = async (editorId: string) => {
        await userService.removeEditor(editorId);
        setFeedback({ type: 'success', message: 'Éditeur supprimé.'});
        fetchEditors();
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Changer mon mot de passe (Admin)</h2>
                <div className="flex items-end space-x-2">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                    </div>
                    <button onClick={handlePasswordChange} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Changer</button>
                </div>
            </div>
            
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Gérer les Éditeurs</h2>
                 <h3 className="font-semibold mb-2">Éditeurs actuels ({editors.length}/4)</h3>
                 {editors.length > 0 ? (
                    <ul className="divide-y mb-6">
                        {editors.map(editor => (
                            <li key={editor.id} className="py-2 flex justify-between items-center">
                                <span>{editor.username}</span>
                                <button onClick={() => handleRemoveEditor(editor.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Supprimer</button>
                            </li>
                        ))}
                    </ul>
                 ) : <p className="text-gray-500 mb-6 text-sm">Aucun éditeur.</p>}
                 
                 <div className="border-t pt-4">
                     <h3 className="font-semibold mb-2">Inviter un nouvel éditeur</h3>
                     <div className="space-y-3">
                         <input type="text" placeholder="Nom d'utilisateur" value={newEditor.username} onChange={e => setNewEditor({...newEditor, username: e.target.value})} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                         <input type="password" placeholder="Mot de passe temporaire" value={newEditor.password} onChange={e => setNewEditor({...newEditor, password: e.target.value})} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                         <button onClick={handleInviteEditor} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm">Inviter</button>
                     </div>
                 </div>
            </div>

            {feedback.message && (
                <div className={`p-4 rounded-md ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {feedback.message}
                </div>
            )}
        </div>
    )
};


const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const SiteSettingsManagement = () => {
    const { settings, updateSettings } = useContext(SiteSettingsContext);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [newCommune, setNewCommune] = useState('');
    const [newSkill, setNewSkill] = useState('');

    if (!settings) return <p>Chargement des paramètres...</p>;

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'logo' | keyof (typeof settings.banners)) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            if (key === 'logo') {
                updateSettings({ ...settings, logo: base64 });
            } else {
                updateSettings({ ...settings, banners: { ...settings.banners, [key]: base64 } });
            }
        }
    };

    const removeImage = (key: 'logo' | keyof (typeof settings.banners)) => {
         if (key === 'logo') {
            updateSettings({ ...settings, logo: null });
        } else {
            updateSettings({ ...settings, banners: { ...settings.banners, [key]: null } });
        }
    };

    const addFaq = () => {
        if (newFaq.question && newFaq.answer) {
            const updatedFaq = [...settings.faq, { id: Date.now(), ...newFaq }];
            updateSettings({ ...settings, faq: updatedFaq });
            setNewFaq({ question: '', answer: '' });
        }
    };

    const removeFaq = (id: number) => {
        const updatedFaq = settings.faq.filter(item => item.id !== id);
        updateSettings({ ...settings, faq: updatedFaq });
    };

    const handleAddItem = (type: 'commune' | 'skill') => {
        const input = type === 'commune' ? newCommune : newSkill;
        const existingItems = type === 'commune' ? settings.communes : settings.skills;

        if (!input.trim()) return;

        const newItems = input
            .split(/[\n,]+/)
            .map(item => item.trim())
            .filter(item => item)
            .filter(item => !existingItems.includes(item));
        
        if (newItems.length > 0) {
            if (type === 'commune') {
                updateSettings({ ...settings, communes: [...existingItems, ...newItems].sort() });
            } else {
                updateSettings({ ...settings, skills: [...existingItems, ...newItems].sort() });
            }
        }

        if (type === 'commune') {
            setNewCommune('');
        } else {
            setNewSkill('');
        }
    };

    const handleRemoveItem = (type: 'commune' | 'skill', itemToRemove: string) => {
        if (type === 'commune') {
            updateSettings({ ...settings, communes: settings.communes.filter(c => c !== itemToRemove) });
        }
        if (type === 'skill') {
            updateSettings({ ...settings, skills: settings.skills.filter(s => s !== itemToRemove) });
        }
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateSettings({ ...settings, [name]: value });
    };


    const ImageUploader: React.FC<{
        label: string;
        image: string | null;
        onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
        onRemove: () => void;
    }> = ({ label, image, onUpload, onRemove }) => (
         <div className="border p-4 rounded-md">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            {image && <img src={image} alt={label} className="mt-2 h-20 w-auto object-contain border p-1" />}
            <div className="mt-2 flex items-center space-x-2">
                <input type="file" accept="image/*" onChange={onUpload} className="text-sm"/>
                {image && <button onClick={onRemove} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Retirer</button>}
            </div>
        </div>
    );

    const ListManager: React.FC<{
        title: string;
        items: string[];
        newItem: string;
        setNewItem: (value: string) => void;
        onAdd: () => void;
        onRemove: (item: string) => void;
    }> = ({ title, items, newItem, setNewItem, onAdd, onRemove }) => (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
            <div className="flex flex-col space-y-2 mb-2">
                <textarea
                    rows={4}
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                    placeholder={`Ajouter une ou plusieurs ${title.toLowerCase()}, séparées par une virgule ou un retour à la ligne.`}
                />
                <button onClick={onAdd} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm whitespace-nowrap self-start">Ajouter</button>
            </div>
            <ul className="space-y-1 max-h-48 overflow-y-auto border p-2 rounded-md">
                {items.map(item => (
                    <li key={item} className="flex justify-between items-center text-sm p-1 hover:bg-gray-50">
                        <span>{item}</span>
                        <button onClick={() => onRemove(item)} className="text-red-500 hover:text-red-700 text-xs">Supprimer</button>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-semibold text-gray-700 mb-4">Informations Générales du Site</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="appName" className="block text-sm font-medium text-gray-700">Nom de l'application</label>
                        <input
                            type="text"
                            id="appName"
                            name="appName"
                            value={settings.appName}
                            onChange={handleTextChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="footerText" className="block text-sm font-medium text-gray-700">Texte du pied de page</label>
                        <input
                            type="text"
                            id="footerText"
                            name="footerText"
                            value={settings.footerText}
                            onChange={handleTextChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Gestion des Listes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ListManager 
                        title="Communes"
                        items={settings.communes}
                        newItem={newCommune}
                        setNewItem={setNewCommune}
                        onAdd={() => handleAddItem('commune')}
                        onRemove={(item) => handleRemoveItem('commune', item)}
                    />
                     <ListManager 
                        title="Compétences"
                        items={settings.skills}
                        newItem={newSkill}
                        setNewItem={setNewSkill}
                        onAdd={() => handleAddItem('skill')}
                        onRemove={(item) => handleRemoveItem('skill', item)}
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Personnalisation du site</h2>
                <div className="space-y-4">
                    <ImageUploader label="Logo du site" image={settings.logo} onUpload={(e) => handleImageUpload(e, 'logo')} onRemove={() => removeImage('logo')} />
                    <ImageUploader label="Bannière du haut" image={settings.banners.top} onUpload={(e) => handleImageUpload(e, 'top')} onRemove={() => removeImage('top')} />
                    <ImageUploader label="Bannière latérale" image={settings.banners.sidebar} onUpload={(e) => handleImageUpload(e, 'sidebar')} onRemove={() => removeImage('sidebar')} />
                    <ImageUploader label="Bannière de listing" image={settings.banners.listing} onUpload={(e) => handleImageUpload(e, 'listing')} onRemove={() => removeImage('listing')} />
                    <ImageUploader label="Bannière du bas" image={settings.banners.bottom} onUpload={(e) => handleImageUpload(e, 'bottom')} onRemove={() => removeImage('bottom')} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Gestion de la FAQ</h2>
                 <div className="space-y-2 mb-6">
                    {settings.faq.map(item => (
                        <div key={item.id} className="border p-3 rounded-md flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{item.question}</p>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.answer}</p>
                            </div>
                            <button onClick={() => removeFaq(item.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Supprimer</button>
                        </div>
                    ))}
                 </div>
                 <div className="space-y-3 border-t pt-4">
                    <h3 className="font-semibold">Ajouter une nouvelle question</h3>
                     <input type="text" placeholder="Question" value={newFaq.question} onChange={e => setNewFaq({...newFaq, question: e.target.value})} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                     <textarea placeholder="Réponse" value={newFaq.answer} onChange={e => setNewFaq({...newFaq, answer: e.target.value})} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                     <button onClick={addFaq} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Ajouter à la FAQ</button>
                 </div>
            </div>
        </div>
    );
};


export default AdminPage;
