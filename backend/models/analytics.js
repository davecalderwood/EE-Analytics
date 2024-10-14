const mongoose = require('mongoose');

const weaponUpgradeSchema = mongoose.Schema({
    upgradeTreeName: { type: String, required: true },
    upgradeTreeLevel: { type: Number, required: true }
});

const characterSchema = mongoose.Schema({
    characterName: { type: String, required: true },
    characterGUID: { type: String, required: true },
    weaponUpgrades: [weaponUpgradeSchema] // An array of weapon upgrades
});

const equipmentSchema = mongoose.Schema({
    moduleGUID: { type: String, required: true },
    moduleName: { type: String, required: true }
});

const analyticsSchema = mongoose.Schema({
    charactersUsed: [characterSchema], // An array of characters used in the session
    worldName: { type: String, required: true },
    timeSurvived: { type: Number, required: true }, // Duration as a number (seconds, milliseconds, etc.)
    successfullyExtracted: { type: Boolean, required: true },
    scrapCount: { type: Number, required: true },
    levelReached: { type: Number, required: true },
    equipmentUsed: [equipmentSchema], // Updated to use equipmentSchema
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
