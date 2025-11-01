import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../services/database';
import { SiteSettings } from '../types';

interface SiteSettingsContextType {
    settings: SiteSettings | null;
    updateSettings: (newSettings: SiteSettings) => void;
}

export const SiteSettingsContext = createContext<SiteSettingsContextType>({
    settings: null,
    updateSettings: () => {},
});

export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        const loadedSettings = db.getSettings();
        setSettings(loadedSettings);
    }, []);

    const updateSettings = (newSettings: SiteSettings) => {
        setSettings(newSettings);
        db.setSettings(newSettings);
    };

    if (!settings) {
        return null;
    }

    return (
        <SiteSettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};
