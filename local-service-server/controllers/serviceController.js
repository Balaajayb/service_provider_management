const Service = require("../models/Service");
const path = require("path");
const fs = require("fs");

// Add new service
const addService = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        code: "IMAGE_REQUIRED",
        message: "Service image is required"
      });
    }

    const service = new Service({
      name,
      description,
      image: req.file.filename
    });

    await service.save();

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: error.message
    });
  }
};

// Get all services
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: error.message
    });
  }
};

// Get single service
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        code: "SERVICE_NOT_FOUND",
        message: "Service not found"
      });
    }
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: error.message
    });
  }
};

// Update service
const updateService = async (req, res) => {
  try {
    const { name, description } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        code: "SERVICE_NOT_FOUND",
        message: "Service not found"
      });
    }

    service.name = name || service.name;
    service.description = description || service.description;

    if (req.file) {
      // Delete old image
      const oldImagePath = path.join(__dirname, '../uploads', service.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      service.image = req.file.filename;
    }

    await service.save();

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: error.message
    });
  }
};

// Delete service
// Delete service
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        code: "SERVICE_NOT_FOUND",
        message: "Service not found"
      });
    }

    // Delete the associated image file first
    const imagePath = path.join(__dirname, '../uploads', service.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Then delete the database record - using deleteOne() instead of remove()
    await Service.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: error.message
    });
  }
};

// Add to your serviceController.js
const getFeaturedServices = async (req, res) => {
  try {
    const services = await Service.find().limit(5).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: "SERVER_ERROR",
      message: error.message
    });
  }
};

module.exports = {
  addService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getFeaturedServices
};