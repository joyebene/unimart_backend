import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { reportUser } from '../controllers/reportController.js';

const router = express.Router();

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Report a user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportedUserId
 *               - reason
 *             properties:
 *               reportedUserId:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       201:
 *         description: User reported successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, reportUser);

export default router;