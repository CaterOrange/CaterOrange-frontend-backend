const category_model = require('../models/categoryModels');
const logger = require('../config/logger.js');

const GetCorporateCategory = async (req, res) => {
    try {
        console.log('hii')
        const categories = await category_model.getCorporateCategories();
        return res.json({
            success: true,
            categories
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports= {GetCorporateCategory};

