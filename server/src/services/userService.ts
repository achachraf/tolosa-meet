import { db } from '../config/firebase';
import { User, SignUpRequest, UpdateProfileRequest } from '../types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export class UserService {
  private usersCollection = db.collection('users');

  async createUser(userData: SignUpRequest): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUserQuery = await this.usersCollection.where('email', '==', userData.email).get();
    if (!existingUserQuery.empty) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user document
    const userDoc = this.usersCollection.doc();
    const user: User = {
      uid: userDoc.id,
      email: userData.email,
      displayName: userData.displayName,
      joinedAt: new Date(),
      isAdmin: false
    };

    // Store user with hashed password
    await userDoc.set({
      ...user,
      hashedPassword
    });

    // Generate JWT token
    const token = jwt.sign(
      { uid: user.uid, email: user.email, isAdmin: user.isAdmin },
      config.jwtSecret as jwt.Secret,
      { expiresIn: config.jwtExpire as jwt.SignOptions['expiresIn'] }
    );

    return { user, token };
  }

  async authenticateUser(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user by email
    const userQuery = await this.usersCollection.where('email', '==', email).get();
    if (userQuery.empty) {
      throw new Error('Invalid credentials');
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.hashedPassword);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const user: User = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      bio: userData.bio,
      joinedAt: userData.joinedAt.toDate(),
      isAdmin: userData.isAdmin || false
    };

    // Generate JWT token
    const token = jwt.sign(
      { uid: user.uid, email: user.email, isAdmin: user.isAdmin },
      config.jwtSecret as jwt.Secret,
      { expiresIn: config.jwtExpire as jwt.SignOptions['expiresIn']}
    );

    return { user, token };
  }

  async getUserById(uid: string): Promise<User | null> {
    const userDoc = await this.usersCollection.doc(uid).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data()!;
    return {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      bio: userData.bio,
      joinedAt: userData.joinedAt.toDate(),
      isAdmin: userData.isAdmin || false
    };
  }

  async updateUser(uid: string, updates: UpdateProfileRequest): Promise<User> {
    const userRef = this.usersCollection.doc(uid);
    
    await userRef.update({
      ...updates,
      updatedAt: new Date()
    });

    const updatedUser = await this.getUserById(uid);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }

    return updatedUser;
  }

  async deleteUser(uid: string): Promise<void> {
    // In a real implementation, this would be a soft delete with GDPR compliance
    // For now, we'll just mark the user as deleted
    await this.usersCollection.doc(uid).update({
      deleted: true,
      deletedAt: new Date()
    });
  }

  // Admin-only methods
  async getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    const snapshot = await this.usersCollection
      .where('deleted', '!=', true)
      .orderBy('joinedAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        bio: data.bio,
        joinedAt: data.joinedAt.toDate(),
        isAdmin: data.isAdmin || false
      };
    });
  }

  async setAdminStatus(uid: string, isAdmin: boolean): Promise<void> {
    const userRef = this.usersCollection.doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    await userRef.update({
      isAdmin,
      updatedAt: new Date()
    });
  }

  async suspendUser(uid: string, reason: string): Promise<void> {
    const userRef = this.usersCollection.doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    await userRef.update({
      suspended: true,
      suspensionReason: reason,
      suspendedAt: new Date(),
      updatedAt: new Date()
    });
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalEvents: number;
    flaggedEvents: number;
    suspendedUsers: number;
    pendingReports: number;
  }> {
    try {
      // Get total users count
      const usersSnapshot = await this.usersCollection.get();
      const totalUsers = usersSnapshot.size;

      // Get suspended users count
      const suspendedUsersSnapshot = await this.usersCollection
        .where('suspended', '==', true)
        .get();
      const suspendedUsers = suspendedUsersSnapshot.size;

      // Get total events count
      const eventsSnapshot = await db.collection('events').get();
      const totalEvents = eventsSnapshot.size;

      // Get flagged events count (events with reports)
      const flaggedEventsSnapshot = await db.collection('events')
        .where('flagged', '==', true)
        .get();
      const flaggedEvents = flaggedEventsSnapshot.size;

      // Get pending reports count
      const reportsSnapshot = await db.collection('reports')
        .where('status', '==', 'pending')
        .get();
      const pendingReports = reportsSnapshot.size;

      return {
        totalUsers,
        totalEvents,
        flaggedEvents,
        suspendedUsers,
        pendingReports
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }
}
