const Analytics = require('../models/analytics');

// CREATE a new analytic input
exports.createAnalytics = (req, res, next) => {
    // Log the incoming body
    //console.log(req.body);

    // Create analyticsData object with the full content
    const analyticsData = new Analytics({
        content: JSON.stringify(req.body),  // Storing the entire body as a string
        creator: req.userData.userId,
        charactersUsed: req.body.charactersUsed, // Ensure you're assigning charactersUsed properly
        worldName: req.body.worldName,         // Add other relevant properties
        timeSurvived: req.body.timeSurvived,
        successfullyExtracted: req.body.successfullyExtracted,
        scrapCount: req.body.scrapCount,
        levelReached: req.body.levelReached,
        equipmentUsed: req.body.equipmentUsed   // If you want to store equipmentUsed as well
    });

    // Log the analyticsData object to check its contents
    //console.log(analyticsData);

    // Save to the database
    analyticsData.save()
        .then(createdAnalytics => {
            console.log(createdAnalytics);
            res.status(201).json({
                message: 'Analytics data added successfully',
                analytics: {
                    id: createdAnalytics._id,
                    content: createdAnalytics.content
                }
            });
        })
        .catch(error => {
            console.error('Error saving analytics data:', error); // Log the error for debugging
            res.status(500).json({
                message: 'Creating the analytics data failed!'
            });
        });
};

// UPDATE an existing analytic input
exports.updateAnalytics = (req, res, next) => {
    const analyticsData = new Analytics({
        _id: req.body.id,
        title: req.body.title,
        content: JSON.stringify(req.body.content), // Convert content to JSON string
        creator: req.userData.userId
    });

    Analytics.updateOne({ _id: req.params.id, creator: req.userData.userId }, analyticsData).then(result => {
        if (result.matchedCount > 0) {
            res.status(200).json({ message: 'Update Successful' });
        } else {
            res.status(401).json({ message: 'User not Authorized' });
        }
    }).catch(error => {
        res.status(500).json({
            message: 'Updating the analytics data failed!'
        });
    });
}

// GET all analytics
exports.getAnalytics = (req, res, next) => {
    const pageSize = +req.query.pageSize;
    const currentPage = +req.query.page;
    const analyticsQuery = Analytics.find();
    let fetchedAnalytics;

    if (pageSize && currentPage) {
        analyticsQuery
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize);
    }

    analyticsQuery
        .then(documents => {
            fetchedAnalytics = documents;
            return Analytics.countDocuments();
        })
        .then(count => {
            res.status(200).json({
                message: 'Analytics data fetched successfully',
                analytics: fetchedAnalytics,
                maxAnalytics: count
            });
        }).catch(error => {
            res.status(500).json({
                message: 'Fetching analytics data failed!'
            });
        });
}

// GET one analytic input
exports.getOneAnalytics = (req, res, next) => {
    Analytics.findById(req.params.id).then(analytics => {
        if (analytics) {
            res.status(200).json(analytics);
        } else {
            res.status(404).json({ message: 'Analytics data not found!' });
        }
    }).catch(error => {
        res.status(500).json({ message: 'Fetching analytics data failed!' });
        console.log(error);
    });
}

// DELETE an existing analytic
exports.deleteAnalytics = (req, res, next) => {
    Analytics.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Delete Successful' });
        } else {
            res.status(401).json({ message: 'User not Authorized' });
        }
    }).catch(error => {
        res.status(500).json({
            message: 'Deleting the analytics data failed!'
        });
    });
}
