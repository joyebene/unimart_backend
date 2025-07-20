import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';


const prisma = new PrismaClient();

// @desc    Get logged-in user profile
// @route   GET /api/users/me
// @access  Private
export const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, fullName: true, email: true, profileUrl: true, isVerified: true, department: true, level: true, bio: true, whatsappNum: true, address: true, privacy: true, createdAt: true, updatedAt: true }
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
};

// @desc    Update logged-in user profile
// @route   PUT /api/users/me
// @access  Private
export const updateMyProfile = async (req, res) => {
  try {
    const { fullName, department, level, bio, whatsappNum, address, email, privacy } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { privacy: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found.' });
   const allowedPrivacyFields = ['showEmail', 'showWhatsapp', 'showAddress', 'showDepartment', 'showLevel'];

const cleanPrivacyData = (privacy) => {
  const result = {};
  allowedPrivacyFields.forEach((key) => {
    if (typeof privacy[key] === 'boolean') {
      result[key] = privacy[key];
    }
  });
  return result;
};

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: req.user.id },
        data: {
          fullName: fullName || user.fullName,
          department: department || user.department,
          level: level || user.level,
          bio: bio || user.bio,
          whatsappNum: whatsappNum || user.whatsappNum,
          address: address || user.address,
          email: email || user.email
        },
      });

      if (privacy) {
  const privacyData = cleanPrivacyData(privacy);

  if (user.privacy) {
    await tx.privacy.update({
      where: { id: user.privacy.id },
      data: privacyData,
    });
  } else {
    await tx.privacy.create({
      data: {
        ...privacyData,
        user: { connect: { id: req.user.id } },
      },
    });
  }
}

    });

    // Refetch the updated user with privacy included
    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { privacy: true },
    });

    res.json({ message: 'Profile updated.', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile.' });
  }
};

export const profilePicsUpdate = async (req, res) => {
  try {
    const { profileUrl } = req.body;  // Now expecting the final Cloudinary URL

    if (!profileUrl) {
      return res.status(400).json({ message: 'No image provided.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { profileUrl },
    });

    res.json({ message: 'Profile picture updated.', user: updatedUser });
  } catch (error) {
    console.error('Profile Pic Update Error:', error);
    res.status(500).json({ message: 'Failed to update profile picture.' });
  }
};



// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect current password.' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password.' });
  }
};

// @desc    Get another student's profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        fullName: true,
        profileUrl: true,
        bio: true,
        createdAt: true,
        email: true,
        whatsappNum: true,
        address: true,
        department: true,
        level: true,
        privacy: {
          select: {
            showEmail: true,
            showWhatsapp: true,
            showAddress: true,
            showDepartment: true,
            showLevel: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: 'Student not found.' });

    const publicProfile = {
      id: user.id,
      fullName: user.fullName,
      bio: user.bio,
      profileUrl: user.profileUrl,
      createdAt: user.createdAt,
      ...(user.privacy?.showEmail && { email: user.email }),
      ...(user.privacy?.showWhatsapp && { whatsappNum: user.whatsappNum }),
      ...(user.privacy?.showAddress && { address: user.address }),
      ...(user.privacy?.showDepartment && { department: user.department }),
      ...(user.privacy?.showLevel && { level: user.level }),
      privacy: user.privacy,  // Optional: include privacy for frontend checks
    };

    res.json(publicProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching profile.' });
  }
};


// @desc    Add product to wishlist
// @route   POST /api/users/add-wishlist
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const existing = await prisma.wishlist.findFirst({
      where: {
        userId: req.user.id,
        productId: productId,
      },
    });

    if (existing) return res.status(400).json({ message: 'Product already in wishlist.' });

    await prisma.wishlist.create({
      data: {
        userId: req.user.id,
        productId: productId,
      },
    });

    res.status(200).json({ message: 'Added to wishlist.' });
  } catch (error) {
    console.error('Add Wishlist Error:', error);
    res.status(500).json({ message: 'Error adding to wishlist.' });
  }
};


// @desc    Remove product from wishlist
// @route   DELETE /api/users/remove-wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const existing = await prisma.wishlist.findFirst({
      where: {
        userId: req.user.id,
        productId: productId,
      },
    });

    if (!existing) return res.status(404).json({ message: 'Product not found in wishlist.' });

    await prisma.wishlist.delete({
      where: { id: existing.id },
    });

    res.status(200).json({ message: 'Removed from wishlist.' });
  } catch (error) {
    console.error('Remove Wishlist Error:', error);
    res.status(500).json({ message: 'Error removing from wishlist.' });
  }
};


// @desc    Get user's wishlist
// @route   GET /api/users/wishlists
// @access  Private
export const getWishlist = async (req, res) => {
  console.log(req.user)
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: { seller: true }, // Include seller if needed for frontend
        },
      },
    });

    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Get Wishlist Error:', error);
    res.status(500).json({ message: 'Error fetching wishlist.' });
  }
};

/**
 * Send a message to another user
 * @route POST /api/messages/send
 */
export const sendMessage = async (req, res) => {
  const { toUserId, content } = req.body;
  console.log(req.body);

  if (!toUserId || !content?.trim()) {
    return res.status(400).json({ message: 'Recipient ID and message content are required.' });
  }

  try {
    const newMessage = await prisma.message.create({
      data: {
        fromUserId: req.user.id,
        toUserId,
        content,
      },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Failed to send message.' });
  }
};

/**
 * Get all messages between logged-in user and another user
 * @route GET /api/messages/:userId
 */
export const getUserMessages = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { toUserId: req.user.id },
          { fromUserId: req.user.id },
        ],
      },
      include: {
        fromUser: { select: { id: true, fullName: true, profileUrl: true } },
        toUser: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Get User Messages Error:', error);
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
};

export const getMessagesWithUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: req.user.id, toUserId: userId },
          { fromUserId: userId, toUserId: req.user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Get Messages With User Error:', error);
    res.status(500).json({ message: 'Failed to fetch messages with user.' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: { toUserId: req.user.id, read: false },
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to get unread count" });
  }
};


export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;  // assuming you have authMiddleware

    // Confirm the message belongs to this user as receiver
    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.toUserId !== userId) {
      return res.status(403).json({ message: 'Not authorized to mark this message' });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { read: true },
    });

    res.json({ success: true, message: 'Message marked as read', data: updated });
  } catch (error) {
    console.error('Mark as Read Error:', error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
};


