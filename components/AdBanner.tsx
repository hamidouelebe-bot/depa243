import React, { useContext } from 'react';
import { SiteSettingsContext } from '../context/SiteSettingsContext';

interface AdBannerProps {
  size: 'top' | 'sidebar' | 'listing' | 'bottom';
}

const AdBanner: React.FC<AdBannerProps> = ({ size }) => {
  const { settings } = useContext(SiteSettingsContext);

  if (!settings) return null;

  const sizeClasses = {
    top: 'h-24 w-full md:h-32',
    sidebar: 'h-64 w-full',
    listing: 'h-24 w-full my-4',
    bottom: 'h-24 w-full mt-8'
  };

  const placeholderText = {
      top: 'Top Banner Ad (970x90)',
      sidebar: 'Sidebar Ad (300x250)',
      listing: 'In-Listing Ad (728x90)',
      bottom: 'Bottom Banner Ad (728x90)'
  }

  const bannerImage = settings.banners[size];

  return (
    <div className={`${sizeClasses[size]} bg-gray-300 flex items-center justify-center rounded-lg shadow overflow-hidden`}>
      {bannerImage ? (
         <img src={bannerImage} alt={`${placeholderText[size]}`} className="w-full h-full object-cover" />
      ) : (
        <span className="text-gray-600 font-semibold">{placeholderText[size]}</span>
      )}
    </div>
  );
};

export default AdBanner;
