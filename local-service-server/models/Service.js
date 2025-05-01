const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs").promises; // Using promises version for better async handling

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Service name is required"],
    trim: true,
    maxlength: [100, "Service name cannot exceed 100 characters"]
  },
  description: {
    type: String,
    required: [true, "Service description is required"],
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  image: {
    type: String,
    required: [true, "Service image is required"],
    validate: {
      validator: function(v) {
        // Basic validation for image filenames
        return /^[a-zA-Z0-9\-_]+\.(jpg|jpeg|png|gif)$/.test(v);
      },
      message: props => `${props.value} is not a valid image filename!`
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
serviceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware to delete associated image when service is deleted
serviceSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    if (this.image) {
      const imagePath = path.join(__dirname, '../uploads', this.image);
      
      try {
        await fs.access(imagePath); // Check if file exists
        await fs.unlink(imagePath); // Delete the file
        console.log(`Successfully deleted image: ${this.image}`);
      } catch (err) {
        if (err.code !== 'ENOENT') { // Ignore "file not found" errors
          console.error(`Error deleting image ${this.image}:`, err);
        }
      }
    }
    next();
  } catch (err) {
    console.error('Error in pre-delete hook:', err);
    next(err);
  }
});

// Static method for cleaning up orphaned images
serviceSchema.statics.cleanupOrphanedImages = async function() {
  try {
    const usedImages = await this.distinct('image');
    const uploadDir = path.join(__dirname, '../uploads');
    const files = await fs.readdir(uploadDir);
    
    for (const file of files) {
      if (!usedImages.includes(file)) {
        const filePath = path.join(uploadDir, file);
        await fs.unlink(filePath);
        console.log(`Cleaned up orphaned image: ${file}`);
      }
    }
  } catch (err) {
    console.error('Error in image cleanup:', err);
  }
};

// Indexes for better query performance
serviceSchema.index({ name: 1 });
serviceSchema.index({ createdAt: -1 });

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;