import React, { useContext } from 'react';
import { AuthenticatedUser, UserRole } from '../types';
import { SiteSettingsContext } from '../context/SiteSettingsContext';

interface HeaderProps {
  user: AuthenticatedUser | null;
  onNavigate: (view: string, id?: string) => void;
  onLogout: () => void;
}

const DefaultLogo: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.471-2.471a.563.563 0 01.8 0l1.285 1.285a.563.563 0 010 .8l-2.471 2.471m-2.94-2.94l-2.471 2.471a.563.563 0 01-.8 0l-1.285-1.285a.563.563 0 010-.8l2.471-2.471m5.88-5.88l-2.471-2.471a.563.563 0 00-.8 0L6.828 8.172a.563.563 0 000 .8l1.285 1.285a.563.563 0 00.8 0l5.88-5.88z" />
  </svg>
);

const LoginIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);

const LogoutIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-3 0l-3-3m0 0l3-3m-3 3H15" />
    </svg>
);

const RegisterIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogout }) => {
  const { settings } = useContext(SiteSettingsContext);

  if (!settings) return null;

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button onClick={() => onNavigate('home')} className="flex items-center space-x-2 flex-shrink-0">
              {settings.logo ? <img src={settings.logo} alt="Logo" className="h-8 w-auto" /> : <DefaultLogo />}
              <span className="text-xl font-bold text-blue-600 hidden sm:inline">{settings.appName}</span>
            </button>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <button onClick={() => onNavigate('home')} className="text-gray-600 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Techniciens
              </button>
               <button onClick={() => onNavigate('faq')} className="text-gray-600 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                FAQ
              </button>
              {user?.role === UserRole.ADMIN && (
                 <button onClick={() => onNavigate('admin')} className="text-gray-600 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Admin
                </button>
              )}
               {user?.role === UserRole.TECHNICIAN && (
                 <button onClick={() => onNavigate('dashboard', user.id)} className="text-gray-600 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Mon Profil
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center">
             {user ? (
               <button
                  onClick={onLogout}
                  className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 flex items-center space-x-2"
                >
                  <LogoutIcon />
                  <span>Déconnexion</span>
                </button>
             ) : (
                <>
                <button
                  onClick={() => onNavigate('login')}
                  className="hidden md:flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium mr-2"
                >
                  <LoginIcon />
                  <span>Connexion</span>
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-2"
                >
                  <RegisterIcon />
                  <span>S'inscrire</span>
                </button>
                </>
             )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
