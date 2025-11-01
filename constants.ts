import { SiteSettings } from './types';

const defaultCommunes = [
  "Lubumbashi",
  "Kamalondo",
  "Kampemba",
  "Katuba",
  "Kenya",
  "Ruashi",
  "Annexe",
];

const defaultSkills = [
  "Plomberie", // Plumbing
  "Électricité", // Electricity
  "Menuiserie", // Carpentry
  "Peinture", // Painting
  "Maçonnerie", // Masonry
  "Climatisation", // Air Conditioning
  "Réparation d'appareils", // Appliance Repair
  "Jardinage", // Gardening
  "Soudure", // Welding
  "Carrelage", // Tiling
];

const defaultAppName = "Lubumbashi Handy-Pro Connect";

export const defaultSettings: SiteSettings = {
    logo: null,
    banners: {
        top: null,
        sidebar: null,
        listing: null,
        bottom: null,
    },
    faq: [
        {
            id: 1,
            question: "Combien de temps faut-il pour que mon profil soit approuvé ?",
            answer: "Après votre inscription, votre profil est examiné par notre équipe administrative. Ce processus peut prendre jusqu'à 72 heures. Vous serez notifié par email une fois que votre profil sera approuvé et visible sur le site."
        },
        {
            id: 11,
            question: "Puis-je laisser un avis sur un technicien ?",
            answer: "Oui ! Nous encourageons les utilisateurs à partager leur expérience pour aider la communauté. Sur la page de profil de chaque technicien, vous pouvez laisser une note de 1 à 5 étoiles et un commentaire. Tous les avis sont soumis à une modération avant d'être publiés pour garantir un environnement sûr et respectueux pour tous."
        },
        {
            id: 2,
            question: "Quel est l’objectif de ce portail ?",
            answer: "Le portail permet aux travailleurs techniques de rendre visibles leurs compétences et d’être contactés directement par des ménages, entreprises ou institutions à la recherche de prestataires dans la ville de Lubumbashi."
        },
        {
            id: 3,
            question: "Qui peut s’inscrire ?",
            answer: "Toute personne exerçant un métier technique, artisanal ou de service : plombier, électricien, menuisier, peintre, agent d’entretien, technicien en froid, mécanicien, etc.\n👉 Que vous soyez indépendant, salarié ou en recherche de missions, vous êtes le bienvenu."
        },
        {
            id: 4,
            question: "L’enregistrement est-il payant ?",
            answer: "Non ✅ L’inscription est totally gratuite.\nAucun frais ne sera demandé pour créer votre profil ou apparaître sur la plateforme."
        },
        {
            id: 5,
            question: "Comment s’inscrire ?",
            answer: "Il suffit de remplir le formulaire en ligne avec vos informations :\n\n• Nom complet\n• Numéros de contact\n• Commune\n• Compétences techniques\n• Brève description de votre expérience\n\nL’inscription ne prend que quelques minutes."
        },
        {
            id: 6,
            question: "Que se passe-t-il après l’inscription ?",
            answer: "Votre profil est ajouté à la base des travailleurs techniques de Lubumbashi. Les particuliers ou entreprises peuvent vous contacter directement selon vos compétences et votre localisation."
        },
        {
            id: 7,
            question: "Comment trouver un technicien ?",
            answer: "Les utilisateurs peuvent consulter la base de données ou recevoir des recommandations selon la commune et le type de service recherché (plomberie, électricité, peinture, etc.)."
        },
        {
            id: 8,
            question: "Le site garantit-il la qualité des services ?",
            answer: "❗ Non. Le portail ne garantit ni la qualité ni la bonne exécution des travaux.\nChaque utilisateur doit vérifier lui-même les compétences et la fiabilité du technicien avant tout engagement."
        },
        {
            id: 9,
            question: "Comment vérifier qu’un technicien est qualifié ?",
            answer: "Avant de confier un travail, demandez :\n\n• une preuve d’expérience ou de formation,\n• des photos de réalisations précédentes,\n• des références d’anciens clients.\n\n⚠️ Le site encourage la prudence et le dialogue direct avant tout paiement."
        },
        {
            id: 10,
            question: "Que faire en cas de problème ou de litige ?",
            answer: "Le site n’intervient pas dans les transactions entre utilisateurs et techniciens. En cas de désaccord, les deux parties doivent régler le différend à l’amiable.\nVous pouvez toutefois signaler un profil douteux à l’équipe de modération pour vérification."
        }
    ],
    communes: defaultCommunes,
    skills: defaultSkills,
    appName: defaultAppName,
    footerText: `© ${new Date().getFullYear()} ${defaultAppName}. Tous droits réservés.`,
};
