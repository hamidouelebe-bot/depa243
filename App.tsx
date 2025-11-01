import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PublicListingPage from './components/pages/PublicListingPage';
import RegistrationPage from './components/pages/RegistrationPage';
import AdminPage from './components/pages/AdminPage';
import TechnicianProfilePage from './components/pages/TechnicianProfilePage';
import LoginPage from './components/pages/LoginPage';
import TechnicianDashboardPage from './components/pages/TechnicianDashboardPage';
import FAQPage from './components/pages/FAQPage';
import { AuthenticatedUser, UserRole } from './types';
import { SiteSettingsProvider } from './context/SiteSettingsContext';

type View = 'home' | 'profile' | 'register' | 'login' | 'admin' | 'dashboard' | 'reg_success' | 'update_success' | 'faq';

interface AppState {
    currentView: View;
    selectedTechnicianId?: string;
}

const RegistrationSuccess: React.FC<{ onNavigate: (view: View) => void }> = ({ onNavigate }) => (
    <div className="text-center py-20 px-4">
        <h2 className="text-3xl font-bold text-green-600">Inscription réussie !</h2>
        <p className="mt-4 text-lg text-gray-700">Votre profil a été soumis et est maintenant en attente d'approbation par un administrateur.</p>
        <p className="text-gray-600">Vous serez averti une fois votre profil activé.</p>
        <button onClick={() => onNavigate('home')} className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700">
            Retour à l'accueil
        </button>
    </div>
);

const ProfileUpdateSuccess: React.FC<{ onNavigate: (view: View, id: string) => void, id?: string }> = ({ onNavigate, id }) => (
    <div className="text-center py-20 px-4">
        <h2 className="text-3xl font-bold text-green-600">Profil mis à jour !</h2>
        <p className="mt-4 text-lg text-gray-700">Vos modifications ont été enregistrées et votre profil est de nouveau en attente d'approbation.</p>
        <button onClick={() => onNavigate('dashboard', id || '')} className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700">
            Retour au tableau de bord
        </button>
    </div>
);


const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>({ currentView: 'home' });
    const [user, setUser] = useState<AuthenticatedUser | null>(null);

    const handleNavigate = (view: string, id?: string) => {
        setAppState({ currentView: view as View, selectedTechnicianId: id });
    };

    const handleLogin = (loggedInUser: AuthenticatedUser) => {
        setUser(loggedInUser);
        if (loggedInUser.role === UserRole.ADMIN || loggedInUser.role === UserRole.EDITOR) {
            handleNavigate('admin');
        } else if (loggedInUser.role === UserRole.TECHNICIAN) {
            handleNavigate('dashboard', loggedInUser.id);
        } else {
             handleNavigate('home');
        }
    };
    
    const handleLogout = () => {
        setUser(null);
        handleNavigate('home');
    }

    const renderView = () => {
        switch (appState.currentView) {
            case 'home':
                return <PublicListingPage onViewProfile={(id) => handleNavigate('profile', id)} />;
            case 'profile':
                if (appState.selectedTechnicianId) {
                    return <TechnicianProfilePage technicianId={appState.selectedTechnicianId} onBack={() => handleNavigate('home')} />;
                }
                return <PublicListingPage onViewProfile={(id) => handleNavigate('profile', id)} />;
            case 'register':
                return <RegistrationPage onRegistrationSuccess={() => handleNavigate('reg_success')} />;
            case 'reg_success':
                return <RegistrationSuccess onNavigate={(v) => handleNavigate(v)}/>
            case 'update_success':
                 return <ProfileUpdateSuccess onNavigate={handleNavigate} id={appState.selectedTechnicianId} />
            case 'login':
                return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => handleNavigate('register')} />;
            case 'admin':
                return user?.role === UserRole.ADMIN || user?.role === UserRole.EDITOR ? <AdminPage user={user} /> : <LoginPage onLogin={handleLogin} onNavigateToRegister={() => handleNavigate('register')} />;
            case 'dashboard':
                 if (user?.role === UserRole.TECHNICIAN && appState.selectedTechnicianId) {
                    return <TechnicianDashboardPage technicianId={appState.selectedTechnicianId} onProfileUpdate={() => handleNavigate('update_success', appState.selectedTechnicianId)} />;
                }
                return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => handleNavigate('register')} />;
            case 'faq':
                return <FAQPage />;
            default:
                return <PublicListingPage onViewProfile={(id) => handleNavigate('profile', id)} />;
        }
    };

    return (
        <SiteSettingsProvider>
            <div className="flex flex-col min-h-screen">
                <Header user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
                <div className="flex-grow">
                    {renderView()}
                </div>
                <Footer onNavigate={handleNavigate} />
            </div>
        </SiteSettingsProvider>
    );
};

export default App;
