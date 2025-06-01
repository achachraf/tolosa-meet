export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  joinedAt: Date;
  isAdmin?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    geoPoint: {
      latitude: number;
      longitude: number;
    };
    address: string;
  };
  capacity: number; // 0 = unlimited
  startTime: Date;
  endTime: Date;
  organizerUid: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'cancelled';
}

export interface Attendee {
  uid: string;
  status: 'going' | 'waitlist' | 'declined';
  joinedAt: Date;
}

export interface Category {
  slug: string;
  nameFr: string;
  nameEn: string;
}

export interface AuthTokenPayload {
  uid: string;
  email: string;
  isAdmin?: boolean;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  category: string;
  location: {
    geoPoint: {
      latitude: number;
      longitude: number;
    };
    address: string;
  };
  capacity: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: 'active' | 'cancelled';
}

export interface SignUpRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
}
