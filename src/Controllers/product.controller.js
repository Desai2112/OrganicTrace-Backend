import Product from '../Models/Product.js';
import User from '../Models/User.js';
import mongoose from 'mongoose';
import Certificate from '../Models/Certificate.js'; // Adjust the import path as needed
import Tracking from '../Models/Tracking.js';

const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL || 'http://127.0.0.1:8545');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  OrganicCertificationData.address,
  OrganicCertificationData.abi,
  wallet
);

export const createProduct = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        message: "Unauthorized. Please login.",
        success: false,
      });
    }

    const {
      name,
      category,
      harvestDate,
      location,
      quantity,
      price,
      description,
      certifications,
      manufacturingData,
      certificationType,
    } = req.body;

    console.log(req.body);

    // Validate required fields
    if (!name || !category || !harvestDate || !location || !quantity || !price) {
      return res.status(400).json({
        message: "Missing required product fields",
        success: false,
      });
    }

    // Create a new product
    const product = new Product({
      name,
      owner: req.session.userId,
      category,
      registeredBy: req.session.userId,
      harvestDate: new Date(harvestDate),
      location,
      quantity,
      price,
      description: description || '',
      certifications: certifications || [],
      manufacturingData: manufacturingData || {},
    });

    // Save the product to the database
    await product.save();

    // Check if a certificate for the user with the same certification type already exists
    let certificate = await Certificate.findOne({
      entityId: req.session.userId,
      certificationType,
    });

    if (!certificate) {
      // If no certificate exists, create a new one
      certificate = new Certificate({
        entityId: req.session.userId,
        certificationType,
        productId: product._id,
      });
    } else {
      // If a certificate exists, add the product to its products array
      certificate.products.push(product._id);
    }

    // Save the certificate
    await certificate.save();

    // Update the product with the certificate ID
    product.certificateId = certificate._id;
    await product.save();

    // Create an initial tracking record (Harvested)
    const tracking = new Tracking({
      productId: product._id,
      currentStatus: "harvested",
      currentLocation: location,
      userId: req.session.userId,
      timeline: [
        {
          status: "harvested",
          date: new Date(harvestDate),
          location: location,
          notes: "Product harvested at farm."
        }
      ]
    });

    // Save tracking record
    await tracking.save();

    return res.status(201).json({
      message: "Product registered successfully, linked to certification, and tracking initialized.",
      data: {
        product,
        certificate,
        tracking,
      },
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error registering product",
      error: error.message,
      success: false,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        message: "Unauthorized. Please login.",
        success: false
      });
    }

    const { productId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
        success: false
      });
    }

    // Find the product
    const product = await Product.findById(productId);

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false
      });
    }

    // Ensure only the owner can update
    if (product.owner.toString() !== req.session.userId) {
      return res.status(403).json({
        message: "You are not authorized to update this product",
        success: false
      });
    }

    // Fields that can be updated
    const updateFields = [
      'name', 'category', 'location',
      'quantity', 'price', 'description',
      'certifications', 'manufacturingData',
      'status'
    ];

    // Update only provided fields
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // Update harvest date if provided
    if (req.body.harvestDate) {
      product.harvestDate = new Date(req.body.harvestDate);
    }

    // Save updated product
    await product.save();

    res.json({
      message: "Product updated successfully",
      data: product,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating product",
      error: error.message,
      success: false
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        message: "Unauthorized. Please login.",
        success: false
      });
    }

    const { productId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
        success: false
      });
    }

    // Find product with populated owner details
    const product = await Product.findById(productId)
      .populate('owner', 'name email company');

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false
      });
    }

    res.json({
      message: "Product retrieved successfully",
      data: product,
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving product",
      error: error.message,
      success: false
    });
  }
};

export const getUserProducts = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        message: "Unauthorized. Please login.",
        success: false
      });
    }

    // Optional pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find products for the current user
    const products = await Product.find({ owner: req.session.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count total products
    const totalProducts = await Product.countDocuments({ owner: req.session.userId });

    res.json({
      message: "Products retrieved successfully",
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProducts / limit),
          totalProducts
        }
      },
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving products",
      error: error.message,
      success: false
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        message: "Unauthorized. Please login.",
        success: false
      });
    }

    const { productId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID",
        success: false
      });
    }

    // Find the product
    const product = await Product.findById(productId);

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false
      });
    }

    // Ensure only the owner can delete
    if (product.owner.toString() !== req.session.userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this product",
        success: false
      });
    }

    // Delete the product
    await Product.findByIdAndDelete(productId);

    res.json({
      message: "Product deleted successfully",
      success: true
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
      success: false
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('owner', 'name email').sort({
      createdAt:
        -1
    });
    res.json({
      message: "Products retrieved successfully",
      data: products,
      success: true
    });
  }
  catch (error) {
    res.status(500).json({
      message: "Error retrieving products",
      error: error.message,
      success: false
    });
  }
}
