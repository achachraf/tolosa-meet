import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';

const categoryService = new CategoryService();

export class CategoryController {
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await categoryService.getCategories();
      
      res.json({
        success: true,
        categories
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const category = req.body;
      await categoryService.createCategory(category);
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const updates = req.body;
      
      await categoryService.updateCategory(slug, updates);
      
      res.json({
        success: true,
        message: 'Category updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      await categoryService.deleteCategory(slug);
      
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}
