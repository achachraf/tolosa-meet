export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  address: string;
  image: string;
  category: string;
  organizer: string;
  attendees: number;
  maxAttendees: number | null;
  price: number | null;
  isJoined: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: '1', name: 'Technologie', icon: 'laptop' },
  { id: '2', name: 'Culture', icon: 'theater' },
  { id: '3', name: 'Sport', icon: 'volleyball' },
  { id: '4', name: 'Gastronomie', icon: 'restaurant' },
  { id: '5', name: 'Musique', icon: 'music-note' },
  { id: '6', name: 'Art', icon: 'palette' },
  { id: '7', name: 'Business', icon: 'briefcase' },
  { id: '8', name: 'Nature', icon: 'tree' },
];

export const events: Event[] = [
  {
    id: '1',
    title: 'Meetup des développeurs Toulouse',
    description: "Rejoignez-nous pour échanger sur les dernières technologies web et mobile. Présentations de projets locaux et discussions autour de l'écosystème tech toulousain.",
    date: '2025-04-25',
    time: '19:00',
    location: 'La Mêlée Numérique',
    address: '27 Rue d\'Aubuisson, 31000 Toulouse',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
    category: 'Technologie',
    organizer: 'Communauté Tech Toulouse',
    attendees: 42,
    maxAttendees: 75,
    price: 0,
    isJoined: false,
  },
  {
    id: '2',
    title: 'Dégustation de vins du Sud-Ouest',
    description: 'Une soirée conviviale pour découvrir les vins de la région toulousaine. Dégustation commentée par un sommelier et accompagnée de tapas locales.',
    date: '2025-04-28',
    time: '20:00',
    location: 'N°5 Wine Bar',
    address: '5 Rue de la Bourse, 31000 Toulouse',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop',
    category: 'Gastronomie',
    organizer: 'Les Amis du Vin',
    attendees: 18,
    maxAttendees: 20,
    price: 15,
    isJoined: false,
  },
  {
    id: '3',
    title: 'Concert Jazz à la Daurade',
    description: 'Profitez d\'une soirée jazz en plein air au bord de la Garonne. Un quartet local jouera des standards et compositions originales.',
    date: '2025-05-02',
    time: '21:00',
    location: 'Place de la Daurade',
    address: 'Place de la Daurade, 31000 Toulouse',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop',
    category: 'Musique',
    organizer: 'Toulouse Jazz Club',
    attendees: 87,
    maxAttendees: null,
    price: 0,
    isJoined: true,
  },
  {
    id: '4',
    title: 'Atelier peinture au Jardin des Plantes',
    description: 'Venez peindre en plein air au Jardin des Plantes. Tous niveaux acceptés, matériel fourni, conseils d\'un artiste professionnel.',
    date: '2025-04-30',
    time: '14:00',
    location: 'Jardin des Plantes',
    address: '35 Allées Jules Guesde, 31000 Toulouse',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop',
    category: 'Art',
    organizer: 'Arts en Plein Air',
    attendees: 12,
    maxAttendees: 25,
    price: 8,
    isJoined: false,
  },
  {
    id: '5',
    title: 'Café des entrepreneurs',
    description: 'Networking pour entrepreneurs et porteurs de projets toulousains. Présentez votre startup en 2 minutes et rencontrez de potentiels partenaires.',
    date: '2025-05-05',
    time: '08:30',
    location: 'Ekito',
    address: '15 Rue Gabriel Péri, 31000 Toulouse',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop',
    category: 'Business',
    organizer: 'Toulouse Entrepreneurs',
    attendees: 31,
    maxAttendees: 40,
    price: 5,
    isJoined: false,
  },
  {
    id: '6',
    title: 'Sortie canoë sur la Garonne',
    description: 'Balade en canoë sur la Garonne avec découverte du patrimoine toulousain vu du fleuve. Guide inclus et équipement fourni.',
    date: '2025-05-08',
    time: '10:00',
    location: 'Port de la Daurade',
    address: 'Quai de la Daurade, 31000 Toulouse',
    image: 'https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800&auto=format&fit=crop',
    category: 'Sport',
    organizer: 'Toulouse Nautique',
    attendees: 9,
    maxAttendees: 15,
    price: 25,
    isJoined: false,
  },
  {
    id: '7',
    title: 'Visite des hôtels particuliers toulousains',
    description: 'Parcours guidé à la découverte de l\'architecture Renaissance des hôtels particuliers du centre historique de Toulouse.',
    date: '2025-05-03',
    time: '15:00',
    location: 'Office de Tourisme',
    address: 'Square Charles de Gaulle, 31000 Toulouse',
    image: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=800&auto=format&fit=crop',
    category: 'Culture',
    organizer: 'Guide Toulouse Patrimoine',
    attendees: 22,
    maxAttendees: 30,
    price: 12,
    isJoined: false,
  },
  {
    id: '8',
    title: 'Randonnée à la forêt de Bouconne',
    description: 'Randonnée de niveau facile dans la plus grande forêt de l\'agglomération toulousaine. Observation de la faune et flore locale.',
    date: '2025-05-10',
    time: '09:00',
    location: 'Forêt de Bouconne',
    address: 'Montaigut-sur-Save, 31530',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop',
    category: 'Nature',
    organizer: 'Club Randonnée Toulouse',
    attendees: 16,
    maxAttendees: 25,
    price: 0,
    isJoined: true,
  },
];