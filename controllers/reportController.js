import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const reportUser = async (req, res) => {
  try {
    const { reportedUserId, reason } = req.body;

    if (!reportedUserId || !reason) {
      return res.status(400).json({ message: 'Please provide a reason and user to report.' });
    }

    const report = await prisma.report.create({
      data: {
        reporter: { connect: { id: req.user.id } },
        reportedUser: { connect: { id: reportedUserId } },
        reason,
      },
    });

    res.status(201).json({ message: 'User reported successfully.', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit report.', error: error.message });
  }
};