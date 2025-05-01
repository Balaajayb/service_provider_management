const Worker = require("../models/Worker");
const Service = require("../models/Service");

// Get all workers with service details
exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().populate('service', 'name').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: workers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get services for dropdown
exports.getServicesForDropdown = async (req, res) => {
  try {
    const services = await Service.find({}, 'name');
    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single worker
exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('service', 'name');
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found"
      });
    }
    res.status(200).json({
      success: true,
      data: worker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new worker
exports.createWorker = async (req, res) => {
  try {
    // Verify service exists
    const serviceExists = await Service.findById(req.body.service);
    if (!serviceExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid service selected"
      });
    }

    const worker = new Worker(req.body);
    await worker.save();
    
    // Populate service name in response
    const newWorker = await Worker.findById(worker._id).populate('service', 'name');
    
    res.status(201).json({
      success: true,
      data: newWorker
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update worker
exports.updateWorker = async (req, res) => {
  try {
    // Verify service exists if being updated
    if (req.body.service) {
      const serviceExists = await Service.findById(req.body.service);
      if (!serviceExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid service selected"
        });
      }
    }

    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('service', 'name');

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found"
      });
    }
    res.status(200).json({
      success: true,
      data: worker
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete worker
exports.deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found"
      });
    }
    res.status(200).json({
      success: true,
      data: worker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};