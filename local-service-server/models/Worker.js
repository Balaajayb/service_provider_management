const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Worker name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, "Service is required"]
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
    maxlength: [500, "Address cannot exceed 500 characters"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
workerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Worker = mongoose.model("Worker", workerSchema);

module.exports = Worker;