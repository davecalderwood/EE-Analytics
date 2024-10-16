const Equipment = require('../models/equipment');

// Create a new equipment
exports.createEquipment = (req, res, next) => {
    const imageURL = req.protocol + '://' + req.get('host');
    const equipment = new Equipment({
        equipmentGUID: req.body.equipmentGUID,
        equipmentName: req.body.equipmentName,
        equipmentTier: req.body.equipmentTier,
        imagePath: imageURL + '/images/' + req.file.filename, // Assuming file upload handling
        creator: req.userData.userId
    });

    equipment.save()
        .then(createdCharacter => {
            res.status(201).json({
                message: 'Equipment added successfully',
                equipment: {
                    id: createdCharacter._id,
                    equipmentGUID: createdCharacter.equipmentGUID,
                    equipmentName: createdCharacter.equipmentName,
                    equipmentTier: createdCharacter.equipmentTier,
                    imagePath: createdCharacter.imagePath
                }
            });
        })
        .catch(error => {
            res.status(500).json({
                message: 'Creating the equipment failed!',
                error: error
            });
        });
};

// Update an existing equipment
exports.updateEquipment = (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const imageURL = req.protocol + '://' + req.get('host');
        imagePath = imageURL + '/images/' + req.file.filename;
    }

    const equipment = new Equipment({
        _id: req.body.id,
        equipmentGUID: req.body.equipmentGUID,
        equipmentName: req.body.equipmentName,
        equipmentTier: req.body.equipmentTier,
        imagePath: imagePath,
        creator: req.userData.userId
    });

    Equipment.updateOne({ _id: req.params.id, creator: req.userData.userId }, equipment)
        .then(result => {
            if (result.matchedCount > 0) {
                res.status(200).json({ message: 'Update Successful' });
            } else {
                res.status(401).json({ message: 'User not Authorized' });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: 'Updating the equipment failed!',
                error: error
            });
        });
};

// Retrieve all equipment with pagination
exports.getEquipment = (req, res, next) => {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    const equipmentQuery = Equipment.find();
    let fetchedEquipment;

    if (pageSize && currentPage) {
        equipmentQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }

    equipmentQuery
        .then(documents => {
            fetchedEquipment = documents;
            return Equipment.countDocuments();
        })
        .then(count => {
            res.status(200).json({
                message: 'Equipment fetched successfully',
                equipment: fetchedEquipment,
                maxCharacters: count
            });
        })
        .catch(error => {
            res.status(500).json({
                message: 'Fetching equipment failed!',
                error: error
            });
        });
};

// Retrieve a single equipment by ID
exports.getOneEquipment = (req, res, next) => {
    Equipment.findById(req.params.id)
        .then(equipment => {
            if (equipment) {
                res.status(200).json(equipment);
            } else {
                res.status(404).json({ message: 'Equipment not found!' });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: 'Fetching equipment failed!',
                error: error
            });
        });
};

// Delete an equipment
exports.deleteEquipment = (req, res, next) => {
    Equipment.deleteOne({ _id: req.params.id, creator: req.userData.userId })
        .then(result => {
            if (result.deletedCount > 0) {
                res.status(200).json({ message: 'Delete Successful' });
            } else {
                res.status(401).json({ message: 'User not Authorized' });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: 'Deleting the equipment failed!',
                error: error
            });
        });
};
