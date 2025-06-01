import { db } from '../config/firebase';
import { Event, CreateEventRequest, UpdateEventRequest, Attendee } from '../types';
import { ulid } from 'ulid';

export class EventService {
  private eventsCollection = db.collection('events');

  async createEvent(eventData: CreateEventRequest, organizerUid: string): Promise<Event> {
    const eventId = ulid();
    const now = new Date();
    
    const event: Event = {
      id: eventId,
      title: eventData.title,
      description: eventData.description,
      category: eventData.category,
      location: eventData.location,
      capacity: eventData.capacity,
      startTime: new Date(eventData.startTime),
      endTime: new Date(eventData.endTime),
      organizerUid,
      createdAt: now,
      updatedAt: now,
      status: 'active'
    };

    await this.eventsCollection.doc(eventId).set(event);
    return event;
  }

  async getEvents(
    category?: string,
    search?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Event[]> {
    try{

      let query = this.eventsCollection
        .where('status', '==', 'active')
        .where('startTime', '>', new Date())
        .orderBy('startTime', 'asc');
  
      if (category && category !== 'all') {
        query = query.where('category', '==', category);
      }
  
      const snapshot = await query.limit(limit).offset(offset).get();
      
      let events = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Event;
      });
  
      // Apply text search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();
        events = events.filter(event => 
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower)
        );
      }
  
      console.log(`Found ${events.length} events matching criteria: category=${category}, search=${search}`);
      return events;

    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  }

  async getEventById(eventId: string): Promise<Event | null> {
    const eventDoc = await this.eventsCollection.doc(eventId).get();
    if (!eventDoc.exists) {
      return null;
    }

    const data = eventDoc.data()!;
    return {
      ...data,
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Event;
  }

  async updateEvent(
    eventId: string,
    updates: UpdateEventRequest,
    organizerUid: string
  ): Promise<Event> {
    const eventRef = this.eventsCollection.doc(eventId);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data()!;
    if (eventData.organizerUid !== organizerUid) {
      throw new Error('Only the organizer can update this event');
    }

    // Check if event can still be edited (startTime - 1 hour)
    const oneHourBeforeStart = new Date(eventData.startTime.toDate().getTime() - 60 * 60 * 1000);
    if (new Date() > oneHourBeforeStart && updates.status !== 'cancelled') {
      throw new Error('Event cannot be edited within 1 hour of start time');
    }

    const updateData: any = {
      ...updates,
      updatedAt: new Date()
    };

    if (updates.startTime) {
      updateData.startTime = new Date(updates.startTime);
    }
    if (updates.endTime) {
      updateData.endTime = new Date(updates.endTime);
    }

    await eventRef.update(updateData);

    const updatedEvent = await this.getEventById(eventId);
    if (!updatedEvent) {
      throw new Error('Event not found after update');
    }

    return updatedEvent;
  }

  async deleteEvent(eventId: string, organizerUid: string): Promise<void> {
    const eventRef = this.eventsCollection.doc(eventId);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data()!;
    if (eventData.organizerUid !== organizerUid) {
      throw new Error('Only the organizer can delete this event');
    }

    await eventRef.update({
      status: 'cancelled',
      updatedAt: new Date()
    });
  }

  async joinEvent(eventId: string, uid: string): Promise<void> {
    const eventRef = this.eventsCollection.doc(eventId);
    const attendeesRef = eventRef.collection('attendees');
    
    // Check if user is already attending
    const existingAttendee = await attendeesRef.doc(uid).get();
    if (existingAttendee.exists) {
      throw new Error('User already joined this event');
    }

    // Get event to check capacity
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }

    const event = eventDoc.data()!;
    
    // Count current attendees
    const attendeesSnapshot = await attendeesRef.where('status', '==', 'going').get();
    const currentAttendees = attendeesSnapshot.size;

    const attendee: Attendee = {
      uid,
      status: event.capacity > 0 && currentAttendees >= event.capacity ? 'waitlist' : 'going',
      joinedAt: new Date()
    };

    await attendeesRef.doc(uid).set(attendee);
  }

  async leaveEvent(eventId: string, uid: string): Promise<void> {
    const eventRef = this.eventsCollection.doc(eventId);
    const attendeesRef = eventRef.collection('attendees');
    
    const attendeeDoc = await attendeesRef.doc(uid).get();
    if (!attendeeDoc.exists) {
      throw new Error('User is not attending this event');
    }

    await attendeesRef.doc(uid).delete();

    // If user was going, promote someone from waitlist
    const attendeeData = attendeeDoc.data()!;
    if (attendeeData.status === 'going') {
      await this.promoteFromWaitlist(eventId);
    }
  }

  async getEventAttendees(eventId: string): Promise<Attendee[]> {
    const attendeesSnapshot = await this.eventsCollection
      .doc(eventId)
      .collection('attendees')
      .orderBy('joinedAt', 'asc')
      .get();

    return attendeesSnapshot.docs.map(doc => ({
      ...doc.data(),
      joinedAt: doc.data().joinedAt.toDate()
    } as Attendee));
  }

  private async promoteFromWaitlist(eventId: string): Promise<void> {
    const attendeesRef = this.eventsCollection.doc(eventId).collection('attendees');
    
    // Get first person from waitlist
    const waitlistSnapshot = await attendeesRef
      .where('status', '==', 'waitlist')
      .orderBy('joinedAt', 'asc')
      .limit(1)
      .get();

    if (!waitlistSnapshot.empty) {
      const waitlistDoc = waitlistSnapshot.docs[0];
      await waitlistDoc.ref.update({
        status: 'going',
        promotedAt: new Date()
      });
    }
  }

  async getUserEvents(uid: string, type: 'organized' | 'attending' = 'attending'): Promise<Event[]> {
    if (type === 'organized') {
      const snapshot = await this.eventsCollection
        .where('organizerUid', '==', uid)
        .orderBy('startTime', 'desc')
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          startTime: data.startTime.toDate(),
          endTime: data.endTime.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as Event;
      });
    } else {
      // Get events where user is attending
      const eventsQuery = await this.eventsCollection.get();
      const userEvents: Event[] = [];

      for (const eventDoc of eventsQuery.docs) {
        const attendeeDoc = await eventDoc.ref.collection('attendees').doc(uid).get();
        if (attendeeDoc.exists && attendeeDoc.data()!.status === 'going') {
          const data = eventDoc.data();
          userEvents.push({
            ...data,
            startTime: data.startTime.toDate(),
            endTime: data.endTime.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          } as Event);
        }
      }

      return userEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    }
  }

  // Admin-only methods for content moderation
  async adminDeleteEvent(eventId: string, adminUid: string, reason?: string): Promise<void> {
    const eventRef = this.eventsCollection.doc(eventId);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }

    await eventRef.update({
      status: 'cancelled',
      removedBy: adminUid,
      removalReason: reason || 'Removed by admin',
      updatedAt: new Date()
    });
  }

  async getAllEventsForModeration(
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Event[]> {
    let query = this.eventsCollection.orderBy('createdAt', 'desc');

    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.limit(limit).offset(offset).get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        startTime: data.startTime.toDate(),
        endTime: data.endTime.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      } as Event;
    });
  }

  async flagEvent(eventId: string, reporterUid: string, reason: string): Promise<void> {
    const reportsRef = db.collection('reports');
    const reportId = ulid();

    await reportsRef.doc(reportId).set({
      id: reportId,
      eventId,
      reporterUid,
      reason,
      status: 'pending',
      createdAt: new Date()
    });
  }
}
