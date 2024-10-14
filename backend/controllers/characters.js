const Character = require('../models/character');

// Create a new character
exports.createCharacter = (req, res, next) => {
    const imageURL = req.protocol + '://' + req.get('host');
    const character = new Character({
        characterGUID: req.body.characterGUID,
        characterName: req.body.characterName,
        weaponName: req.body.weaponName,
        primaryWeapon: req.body.primaryWeapon,
        color: req.body.color,
        imagePath: imageURL + '/images/' + req.file.filename, // Assuming file upload handling
        creator: req.userData.userId
    });

    character.save()
        .then(createdCharacter => {
            res.status(201).json({
                message: 'Character added successfully',
                character: {
                    id: createdCharacter._id,
                    characterGUID: createdCharacter.characterGUID,
                    characterName: createdCharacter.characterName,
                    weaponName: createdCharacter.weaponName,
                    primaryWeapon: createdCharacter.primaryWeapon,
                    color: createdCharacter.color,
                    imagePath: createdCharacter.imagePath
                }
            });
        })
        .catch(error => {
            res.status(500).json({
                message: 'Creating the character failed!',
                error: error
            });
        });
};

// Update an existing character
exports.updateCharacter = (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const imageURL = req.protocol + '://' + req.get('host');
        imagePath = imageURL + '/images/' + req.file.filename;
    }

    const character = new Character({
        _id: req.body.id,
        characterGUID: req.body.characterGUID,
        characterName: req.body.characterName,
        weaponName: req.body.weaponName,
        primaryWeapon: req.body.primaryWeapon,
        color: req.body.color,
        imagePath: imagePath,
        creator: req.userData.userId
    });

    Character.updateOne({ _id: req.params.id, creator: req.userData.userId }, character)
        .then(result => {
            if (result.matchedCount > 0) {
                res.status(200).json({ message: 'Update Successful' });
            } else {
                res.status(401).json({ message: 'User not Authorized' });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: 'Updating the character failed!',
                error: error
            });
        });
};

// Retrieve all characters with pagination
exports.getCharacters = (req, res, next) => {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    const characterQuery = Character.find();
    let fetchedCharacters;

    if (pageSize && currentPage) {
        characterQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }

    characterQuery
        .then(documents => {
            fetchedCharacters = documents;
            return Character.countDocuments();
        })
        .then(count => {
            res.status(200).json({
                message: 'Characters fetched successfully',
                characters: fetchedCharacters,
                maxCharacters: count
            });
        })
        .catch(error => {
            res.status(500).json({
                message: 'Fetching characters failed!',
                error: error
            });
        });
};

// Retrieve a single character by ID
exports.getOneCharacter = (req, res, next) => {
    Character.findById(req.params.id)
        .then(character => {
            if (character) {
                res.status(200).json(character);
            } else {
                res.status(404).json({ message: 'Character not found!' });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: 'Fetching character failed!',
                error: error
            });
        });
};

// Delete a character
exports.deleteCharacter = (req, res, next) => {
    Character.deleteOne({ _id: req.params.id, creator: req.userData.userId })
        .then(result => {
            if (result.deletedCount > 0) {
                res.status(200).json({ message: 'Delete Successful' });
            } else {
                res.status(401).json({ message: 'User not Authorized' });
            }
        })
        .catch(error => {
            res.status(500).json({
                message: 'Deleting the character failed!',
                error: error
            });
        });
};
