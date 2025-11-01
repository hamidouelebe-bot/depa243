
import React, { useState, useEffect, useMemo } from 'react';
import { technicianService } from '../../services/technicianService';
import { reviewService } from '../../services/reviewService';
import { Technician, Review, RegistrationStatus } from '../../types';
import StarRating from '../StarRating';

// Helper component for individual stat cards
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow flex items-center">
        <div className="bg-blue-100 text-blue-600 rounded-full h-12 w-12 flex items-center justify-center">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

// Helper component for displaying bar chart like lists
const DistributionList: React.FC<{ title: string; data: { label: string; count: number }[] }> = ({ title, data }) => {
    const maxCount = Math.max(...data.map(d => d.count), 0);
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="space-y-3">
                {data.map(({ label, count }) => (
                    <div key={label}>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{label}</span>
                            <span>{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const DashboardPage: React.FC = () => {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [techs, revs] = await Promise.all([
                technicianService.getAll(),
                reviewService.getAll()
            ]);
            setTechnicians(techs);
            setReviews(revs);
            setLoading(false);
        };
        fetchData();
    }, []);

    const stats = useMemo(() => {
        const approvedReviews = reviews.filter(r => r.status === 'APPROVED');
        
        // Technicians by Status
        const techniciansByStatus = technicians.reduce((acc, tech) => {
            acc[tech.registration_status] = (acc[tech.registration_status] || 0) + 1;
            return acc;
        }, {} as Record<RegistrationStatus, number>);

        // Technicians by Commune
        const techniciansByCommune = technicians.reduce((acc, tech) => {
            acc[tech.commune] = (acc[tech.commune] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Technicians by Skill
        const techniciansBySkill = technicians.reduce((acc, tech) => {
            tech.skills.forEach(skill => {
                acc[skill] = (acc[skill] || 0) + 1;
            });
            return acc;
        }, {} as Record<string, number>);

        // Top Rated Technicians
        const ratingsByTechnician: Record<string, { total: number; count: number }> = {};
        approvedReviews.forEach(review => {
            if (!ratingsByTechnician[review.technicianId]) {
                ratingsByTechnician[review.technicianId] = { total: 0, count: 0 };
            }
            ratingsByTechnician[review.technicianId].total += review.rating;
            ratingsByTechnician[review.technicianId].count++;
        });

        const topRatedTechnicians = Object.entries(ratingsByTechnician)
            .map(([techId, { total, count }]) => ({
                id: techId,
                name: technicians.find(t => t.id === techId)?.full_name || 'Inconnu',
                average: count > 0 ? total / count : 0,
                count: count
            }))
            .sort((a, b) => b.average - a.average || b.count - a.count)
            .slice(0, 5);

        return {
            totalTechnicians: technicians.length,
            approvedTechnicians: technicians.filter(t => t.registration_status === RegistrationStatus.APPROVED).length,
            totalReviews: reviews.length,
            averageRating: approvedReviews.length > 0
                ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length)
                : null,
            techniciansByStatus: Object.entries(techniciansByStatus).map(([label, count]) => ({label, count})),
            techniciansByCommune: Object.entries(techniciansByCommune).map(([label, count]) => ({label, count})).sort((a,b) => Number(b.count) - Number(a.count)),
            techniciansBySkill: Object.entries(techniciansBySkill).map(([label, count]) => ({label, count})).sort((a,b) => Number(b.count) - Number(a.count)),
            topRatedTechnicians,
            popularSkills: Object.entries(techniciansBySkill).map(([label, count]) => ({label, count})).sort((a,b) => Number(b.count) - Number(a.count)).slice(0, 5)
        };
    }, [technicians, reviews]);

    if (loading) return <p>Chargement des statistiques...</p>;

    return (
        <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Techniciens Inscrits" value={stats.totalTechnicians} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard title="Profils Approuvés" value={stats.approvedTechnicians} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Avis Totaux" value={stats.totalReviews} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} />
                <StatCard title="Note Moyenne" value={stats.averageRating !== null ? stats.averageRating.toFixed(2) : 'N/A'} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
            </div>

            {/* Distributions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DistributionList title="Techniciens par Statut" data={stats.techniciansByStatus} />
                <DistributionList title="Techniciens par Commune" data={stats.techniciansByCommune} />
                <DistributionList title="Techniciens par Compétence" data={stats.techniciansBySkill} />
            </div>

             {/* Rankings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Techniciens Mieux Notés</h3>
                    <ul className="space-y-4">
                        {stats.topRatedTechnicians.map(tech => (
                            <li key={tech.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800">{tech.name}</p>
                                    <p className="text-sm text-gray-500">{tech.count} avis</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-bold text-gray-700 mr-2">{tech.average.toFixed(1)}</span>
                                    <StarRating rating={tech.average} size="sm" />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Compétences Populaires</h3>
                     <ul className="space-y-2">
                         {stats.popularSkills.map(skill => (
                            <li key={skill.label} className="flex justify-between items-center text-sm text-gray-700">
                                <span>{skill.label}</span>
                                <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{skill.count}</span>
                            </li>
                         ))}
                     </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
