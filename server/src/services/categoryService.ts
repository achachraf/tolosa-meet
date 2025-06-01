import { db } from '../config/firebase';
import { Category } from '../types';

export class CategoryService {
  private categoriesCollection = db.collection('categories');

  async getCategories(): Promise<Category[]> {
    const snapshot = await this.categoriesCollection.orderBy('nameFr').get();
    return snapshot.docs.map(doc => doc.data() as Category);
  }

  async initializeCategories(): Promise<void> {
    const defaultCategories: Category[] = [
      { slug: 'technologie', nameFr: 'Technologie', nameEn: 'Technology' },
      { slug: 'culture', nameFr: 'Culture', nameEn: 'Culture' },
      { slug: 'sport', nameFr: 'Sport', nameEn: 'Sports' },
      { slug: 'gastronomie', nameFr: 'Gastronomie', nameEn: 'Food & Drink' },
      { slug: 'musique', nameFr: 'Musique', nameEn: 'Music' },
      { slug: 'art', nameFr: 'Art', nameEn: 'Art' },
      { slug: 'business', nameFr: 'Business', nameEn: 'Business' },
      { slug: 'nature', nameFr: 'Nature', nameEn: 'Nature' },
    ];

    const batch = db.batch();
    
    for (const category of defaultCategories) {
      const categoryRef = this.categoriesCollection.doc(category.slug);
      const existingCategory = await categoryRef.get();
      
      if (!existingCategory.exists) {
        batch.set(categoryRef, category);
      }
    }

    await batch.commit();
  }

  async createCategory(category: Category): Promise<void> {
    await this.categoriesCollection.doc(category.slug).set(category);
  }

  async updateCategory(slug: string, updates: Partial<Category>): Promise<void> {
    await this.categoriesCollection.doc(slug).update(updates);
  }

  async deleteCategory(slug: string): Promise<void> {
    await this.categoriesCollection.doc(slug).delete();
  }
}
