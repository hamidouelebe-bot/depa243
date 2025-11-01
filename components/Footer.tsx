import React, { useContext } from 'react';
import { SiteSettingsContext } from '../context/SiteSettingsContext';

interface FooterProps {
    onNavigate: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useContext(SiteSettingsContext);

  if (!settings) return null;
  
  return (
    <footer className="bg-white mt-12 border-t">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
         <div className="flex justify-center space-x-6 mb-4">
            <button onClick={() => onNavigate('home')} className="hover:text-blue-600 hover:underline">Techniciens</button>
            <button onClick={() => onNavigate('faq')} className="hover:text-blue-600 hover:underline">FAQ</button>
            <button onClick={() => onNavigate('register')} className="hover:text-blue-600 hover:underline">Devenir Technicien</button>
         </div>
        <p>{settings.footerText}</p>
      </div>
    </footer>
  );
};

export default Footer;
