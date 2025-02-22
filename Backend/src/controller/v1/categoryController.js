const category_model = require('../../models/v1/categoryModels.js');
const logger = require('../../config/logger.js');

const GetCorporateCategory = async (req, res) => {
    try {
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

