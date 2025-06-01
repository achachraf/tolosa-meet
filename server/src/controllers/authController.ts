import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { SignUpRequest, SignInRequest, UpdateProfileRequest } from '../types';

const userService = new UserService();

export class AuthController {
  async signUp(req: Request, res: Response) {
    try {
      console.log('Received sign-up request:', req.body);
      const userData: SignUpRequest = req.body;
      const result = await userService.createUser(userData);
      
      res.status(201).json({
        success: true,
        user: result.user,
        token: result.token
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async signIn(req: Request, res: Response) {
    try {
      const { email, password }: SignInRequest = req.body;
      const result = await userService.authenticateUser(email, password);
      
      res.json({
        success: true,
        user: result.user,
        token: result.token
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(req.user!.uid);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        user
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const updates: UpdateProfileRequest = req.body;
      const updatedUser = await userService.updateUser(req.user!.uid, updates);
      
      res.json({
        success: true,
        user: updatedUser
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      await userService.deleteUser(req.user!.uid);
      
      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}
