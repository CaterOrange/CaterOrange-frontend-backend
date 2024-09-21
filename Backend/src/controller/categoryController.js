const category_model = require('../models/categoryModels');
const logger = require('../config/logger.js');

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
const getcategorynameById= async(req, res)=>{
    const { categoryId }= req.body;

    try{
       const categoryname= await category_model.getcategoryname(categoryId);
       return res.json({
           success: true,
           categoryname
         });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
 }
module.exports= {
    GetCorporateCategory,
    getcategorynameById
};

