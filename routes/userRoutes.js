import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getUserById,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getUserMessages,
  sendMessage,
  getMessagesWithUser,
  getUnreadCount,
  markMessageAsRead,
  profilePicsUpdate,
} from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/me', authMiddleware, getMyProfile);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               department:
 *                 type: string
 *               level:
 *                 type: string
 *               bio:
 *                 type: string
 *               whatsappNum:
 *                 type: string
 *               address:
 *                 type: string
 *               privacy:
 *                 type: object
 *                 properties:
 *                   showEmail:
 *                     type: boolean
 *                   showWhatsapp:
 *                     type: boolean
 *                   showAddress:
 *                     type: boolean
 *                   showDepartment:
 *                     type: boolean
 *                   showLevel:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/me', authMiddleware, updateMyProfile);

// update profile
router.put('/profile-pic', authMiddleware, profilePicsUpdate);

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change logged-in user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized or incorrect password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/change-password', authMiddleware, changePassword);

/**
 * @swagger
 * /users/wishlists:
 *   get:
 *     summary: Get logged-in user's wishlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/wishlists', authMiddleware, getWishlist);

/**
 * @swagger
 * /users/add-wishlist:
 *   post:
 *     summary: Add a product to user's wishlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Added to wishlist
 *       400:
 *         description: Product already in wishlist
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/add-wishlist', authMiddleware, addToWishlist);

/**
 * @swagger
 * /users/remove-wishlist/{productId}:
 *   delete:
 *     summary: Remove a product from user's wishlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Removed from wishlist
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/remove-wishlist/:productId', authMiddleware, removeFromWishlist);


router.post('/message/send', authMiddleware, sendMessage);
router.get('/messages/me', authMiddleware, getUserMessages);
router.get('/messages/with/:userId', authMiddleware, getMessagesWithUser);
router.get("/messages/unread-count", authMiddleware, getUnreadCount);
router.patch('/messages/:id/read', authMiddleware, markMessageAsRead);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user's public profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Public user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicUser'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getUserById);

export default router;