const mongoose = require('mongoose');

// Define the character schema
const characterSchema = mongoose.Schema({
    characterGUID: { type: String, required: true },
    characterName: { type: String, required: true },
    weaponName: { type: String, required: true },
    primaryWeapon: { type: Boolean, required: true },
    color: { type: String, required: true },
    imagePath: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Export the model
module.exports = mongoose.model('Character', characterSchema);
