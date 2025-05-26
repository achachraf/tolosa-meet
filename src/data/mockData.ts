import firestore from '@react-native-firebase/firestore';

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

export const fetchEvents = async (): Promise<Event[]> => {
  const eventsCollection = await firestore().collection('events').get();
  return eventsCollection.docs.map(doc => doc.data() as Event);
};
