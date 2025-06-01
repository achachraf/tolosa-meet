import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { EventService } from '../services/eventService';

const userService = new UserService();
const eventService = new EventService();

export class UserController {
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
            const updates = req.body;
            const user = await userService.updateUser(req.user!.uid, updates);

            res.json({
                success: true,
                user
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
                message: 'Account deletion initiated. You have 30 days to recover your account.'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Admin-only methods
    async getDashboardStats(req: Request, res: Response) {
        try {
            const stats = await userService.getDashboardStats();

            res.json({
                success: true,
                stats
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async getAllUsers(req: Request, res: Response) {
        try {
            const { limit = '50', offset = '0' } = req.query;
            const users = await userService.getAllUsers(
                parseInt(limit as string),
                parseInt(offset as string)
            );

            res.json({
                success: true,
                users
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    async promoteToAdmin(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            await userService.setAdminStatus(userId, true);

            res.json({
                success: true,
                message: 'User promoted to admin'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    async demoteFromAdmin(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            await userService.setAdminStatus(userId, false);
            res.json({
                success: true,
                message: 'User demoted from admin'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    async revokeAdmin(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            await userService.setAdminStatus(userId, false);

            res.json({
                success: true,
                message: 'Admin privileges revoked'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    async suspendUser(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const { reason } = req.body;

            await userService.suspendUser(userId, reason);

            res.json({
                success: true,
                message: 'User suspended'
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}
