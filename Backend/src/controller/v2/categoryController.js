const category_model = require('../../models/v2/categoryModel.js');
const logger = require('../../config/logger.js');

const GetCorporateCategory = async (req, res) => {
    try {
        const categories = await category_model.getCorporateCategories();
        return res.json({
            success: true,
            categories
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
const getClosureTime = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!categoryId || isNaN(Number(categoryId))) {
            return res.status(400).json({ message: 'Invalid category ID' });
        }

        const result = await category_model.getClosureTimeByCategoryId(categoryId);
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        res.json({ closure_time: result[0].closure_time });
    } catch (error) {
        console.error('Error fetching closure time:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports= {GetCorporateCategory,getClosureTime};
