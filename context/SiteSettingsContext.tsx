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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const loadedSettings = await db.getSettings();
                setSettings(loadedSettings);
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const updateSettings = async (newSettings: SiteSettings) => {
        setSettings(newSettings);
        try {
            await db.updateSettings(newSettings);
        } catch (error) {
            console.error('Failed to update settings:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center text-red-600">
                    <p>Erreur de chargement des paramètres</p>
                </div>
            </div>
        );
    }

    return (
        <SiteSettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};
