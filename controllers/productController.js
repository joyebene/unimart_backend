import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, imageUrl, location, availability } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ message: 'Title, Price, and Category are required.' });
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        imageUrl,
        category,
        location,
        availability,
        seller: { connect: { id: req.user.id } },
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create product.' });
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { seller: true },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { seller: true },
    });

    if (!product) return res.status(404).json({ message: 'Product not found.' });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error getting product.' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (only owner)
export const updateProduct = async (req, res) => {
  try {
    const { title, description, price, category, imageUrl, location, availability } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { seller: true },
    });

    if (!product) return res.status(404).json({ message: 'Product not found.' });

    if (product.seller.id !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this product.' });
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        title: title || product.title,
        description: description || product.description,
        price: price || product.price,
        category: category || product.category,
        imageUrl: imageUrl || product.imageUrl,
        location: location || product.location,
        availability: availability || product.availability,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product.' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (only owner)
export const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { seller: true },
    });

    if (!product) return res.status(404).json({ message: 'Product not found.' });

    if (product.seller.id !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this product.' });
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product.' });
  }
};