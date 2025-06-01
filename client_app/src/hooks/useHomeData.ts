import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { apiService } from '../services/apiService';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    geoPoint: { latitude: number; longitude: number };
    address: string;
  };
  capacity: number;
  startTime: string;
  endTime: string;
  organizerUid: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export interface Category {
  slug: string;
  nameFr: string;
  nameEn: string;
}

export const useEvents = (activeCategory: string) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      const response = await apiService.getEvents(
        activeCategory === 'all' ? undefined : activeCategory
      );
      if (response.success) {
        setEvents((response.data as any).events);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Erreur', 'Impossible de charger les événements');
    }
  };

  useEffect(() => {
    loadEvents();
  }, [activeCategory]);

  return { events, loading, setLoading, loadEvents };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories((response.data as any).categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return { categories, loadCategories };
};

export const useUserEvents = () => {
  const [userEvents, setUserEvents] = useState<string[]>([]);

  const loadUserEvents = async () => {
    try {
      const response = await apiService.getUserEvents('attending');
      if (response.success) {
        setUserEvents((response.data as any).events.map((e: Event) => e.id));
      }
    } catch (error) {
      console.error('Error loading user events:', error);
    }
  };

  useEffect(() => {
    loadUserEvents();
  }, []);

  return { userEvents, loadUserEvents };
};
