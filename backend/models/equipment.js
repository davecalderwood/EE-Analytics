const mongoose = require('mongoose');

// Define the character schema
const equipmentSchema = mongoose.Schema({
    equipmentGUID: { type: String, required: true },
    equipmentName: { type: String, required: true },
    equipmentTier: { type: String, required: true },
    imagePath: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Export the model
module.exports = mongoose.model('Equipment', equipmentSchema);
