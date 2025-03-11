const logger = require('../../config/logger');
const jwt = require('jsonwebtoken');
const admin_model = require('../../models/v2/vendorModel');
const JWT_SECRET = process.env.SECRET_KEY;
const Mixpanel = require('mixpanel');

// Initialize Mixpanel
const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);

const { v2: cloudinary } = require('cloudinary');

cloudinary.config({ 
    cloud_name: 'dimuwrwxw', 
    api_key: '888367322417257', 
    api_secret: 'xXByzVUNWdJ__uExTTGlomF5iDM' 
  });
  

const getTodayCorporateOrders = async (req, res) => {
    try {
        const orders = await admin_model.getTodayCorporateOrders();
        
        if (!orders || orders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No corporate orders found for today'
            });
        }
        
        return res.json({
            success: true,
            message: 'Successfully retrieved today\'s corporate orders',
            orders: orders
        });
    } catch (error) {
        logger.error(`Error in getTodayCorporateOrders: ${error.message}`);
        
        return res.status(500).json({ 
            success: false, 
            message: 'An error occurred while retrieving today\'s corporate orders',
            error: error.message 
        });
    }
};


const updateCorporateOrderMedia = async (req, res) => {
    try {
        const { corporateOrderGeneratedId, categoryId } = req.params;
        
        // Verify the order exists
        const orderCheck = await admin_model.getCorporateOrderDetails(corporateOrderGeneratedId, categoryId);
        
        if (!orderCheck) {
            return res.status(404).json({ 
                success: false, 
                message: 'No matching record found for the provided category and order ID' 
            });
        }

        // Get existing media
        let existingMedia = orderCheck.media || { items: [] };
        if (typeof existingMedia === 'string') {
            try {
                existingMedia = JSON.parse(existingMedia);
            } catch (e) {
                existingMedia = { items: [] };
            }
        }
        
        if (!existingMedia.items) {
            existingMedia.items = [];
        }

        // Process media uploads to Cloudinary
        let newMediaItems = [];
        
        // Handle file uploads
        if (req.files && req.files.media) {
            const mediaFiles = Array.isArray(req.files.media) ? req.files.media : [req.files.media];
            
            for (const file of mediaFiles) {
                const tag = req.body.tags && Array.isArray(req.body.tags) 
                    ? req.body.tags[mediaFiles.indexOf(file)] 
                    : (req.body.tag || 'untagged');
                
                const isVideo = file.mimetype.startsWith('video/');
                const uploadOptions = {
                    folder: 'corporate_order_media',
                    resource_type: isVideo ? 'video' : 'image',
                    tags: [tag]
                };
                
                // Add transformations only for images
                if (!isVideo) {
                    uploadOptions.transformation = {
                        width: 500,
                        height: 1000,
                        quality: 'auto',
                        fetch_format: 'auto'
                    };
                } else {
                    // Video specific options
                    uploadOptions.eager = [
                        { width: 480, height: 270, crop: "pad" }
                    ];
                }
                
                try {
                    const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, uploadOptions);
                    
                    newMediaItems.push({
                        url: uploadResult.secure_url,
                        tag: tag,
                        type: isVideo ? 'video' : 'image',
                        public_id: uploadResult.public_id,
                        created_at: new Date().toISOString()
                    });
                } catch (error) {
                    logger.error(`Error uploading to Cloudinary: ${error.message}`);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error uploading media to Cloudinary',
                        error: error.message
                    });
                }
            }
        }
        // If URLs are provided in the request body
        else if (req.body.media) {
            const mediaItems = Array.isArray(req.body.media) ? req.body.media : [req.body.media];
            const tags = req.body.tags || [];
            
            for (let i = 0; i < mediaItems.length; i++) {
                const mediaItem = mediaItems[i];
                const tag = tags[i] || (req.body.tag || 'untagged');
                
                // Determine if URL points to a video based on extension or mimetype
                const isVideo = typeof mediaItem === 'string' ? 
                    /\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(mediaItem) : 
                    (mediaItem.type && mediaItem.type.startsWith('video/'));
                
                const uploadOptions = {
                    folder: 'corporate_order_media',
                    resource_type: isVideo ? 'video' : 'image',
                    tags: [tag]
                };
                
                // Add transformations only for images
                if (!isVideo) {
                    uploadOptions.transformation = {
                        width: 500,
                        height: 1000,
                        quality: 'auto',
                        fetch_format: 'auto'
                    };
                } else {
                    // Video specific options
                    uploadOptions.eager = [
                        { width: 480, height: 270, crop: "pad" }
                    ];
                }
                
                try {
                    const url = typeof mediaItem === 'string' ? mediaItem : mediaItem.url;
                    const uploadResult = await cloudinary.uploader.upload(url, uploadOptions);
                    
                    newMediaItems.push({
                        url: uploadResult.secure_url,
                        tag: tag,
                        type: isVideo ? 'video' : 'image',
                        public_id: uploadResult.public_id,
                        created_at: new Date().toISOString()
                    });
                } catch (error) {
                    logger.error(`Error uploading to Cloudinary: ${error.message}`);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error uploading media to Cloudinary',
                        error: error.message
                    });
                }
            }
        }

        // Combine existing and new media items
        const combinedItems = [...existingMedia.items, ...newMediaItems];
        const mediaJson = JSON.stringify({ items: combinedItems });

        // Update the database using admin model
        const result = await admin_model.updateCorporateOrderMedia(
            corporateOrderGeneratedId,
            categoryId,
            mediaJson
        );
        
        if (!result) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to update media for order' 
            });
        }

        // Fetch the complete order to return using admin model
        const orderResult = await admin_model.getCorporateOrderWithCustomerDetails(corporateOrderGeneratedId);
        
        if (!orderResult) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found after update' 
            });
        }

        // Initialize user identifier for tracking
        let user_id = 'unknown_user';
        try {
            if (req.verified_data && req.verified_data.id) {
                user_id = req.verified_data.id;
            }
        } catch (e) {
            // If verified_data is not defined, user_id remains 'unknown_user'
        }

        // Track event in Mixpanel
        mixpanel.track('Corporate Order Media Updated', {
            distinct_id: user_id,
            order_id: corporateOrderGeneratedId,
            category_id: categoryId,
            media_count: newMediaItems.length,
            total_media_count: combinedItems.length,
            media_types: newMediaItems.map(item => item.type),
            media_tags: newMediaItems.map(item => item.tag)
        });
        
        return res.json({
            success: true,
            message: 'Corporate order media updated successfully',
            order: orderResult
        });
        
    } catch (error) {
        logger.error(`Error in updateCorporateOrderMedia: ${error.message}`);
        
        // Initialize user identifier for tracking
        let user_id = 'unknown_user';
        try {
            if (req.verified_data && req.verified_data.id) {
                user_id = req.verified_data.id;
            }
        } catch (e) {
            // If verified_data is not defined, user_id remains 'unknown_user'
        }

        mixpanel.track('Corporate Order Media Update Error', {
            distinct_id: user_id,
            error_message: error.message
        });
        
        return res.status(500).json({ 
            success: false, 
            message: 'An error occurred while updating corporate order media',
            error: error.message 
        });
    }
};


const bulkUpdateCorporateOrderMedia = async (req, res) => {
    try {
        const { categoryId } = req.params;
        let corporateOrderIds = [];
        
        console.log('Request body:', req.body);
        
        // Check for array notation from form data first (corporateOrderIds[])
        if (req.body['corporateOrderIds[]']) {
            corporateOrderIds = Array.isArray(req.body['corporateOrderIds[]']) 
                ? req.body['corporateOrderIds[]'] 
                : [req.body['corporateOrderIds[]']];
        } 
        // Fall back to req.body.corporateOrderIds if the array notation isn't present
        else if (req.body.corporateOrderIds) {
            // Handle the case where corporateOrderIds might be a JSON string
            if (typeof req.body.corporateOrderIds === 'string') {
                try {
                    corporateOrderIds = JSON.parse(req.body.corporateOrderIds);
                } catch (error) {
                    // If it's not valid JSON but has commas, try to split it
                    if (req.body.corporateOrderIds.includes(',')) {
                        corporateOrderIds = req.body.corporateOrderIds.split(',').map(id => id.trim());
                    } else {
                        // If it's a single value, convert to array
                        corporateOrderIds = [req.body.corporateOrderIds];
                    }
                }
            } else if (Array.isArray(req.body.corporateOrderIds)) {
                corporateOrderIds = req.body.corporateOrderIds;
            }
        }
        
        console.log('Processed order IDs:', corporateOrderIds);
        
        // Check if we have valid order IDs
        if (!corporateOrderIds || !Array.isArray(corporateOrderIds) || corporateOrderIds.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide an array of corporate order IDs' 
            });
        }
        
        // No need to convert alphanumeric IDs to numbers
        // Just ensure they're all strings and non-empty
        corporateOrderIds = corporateOrderIds.map(id => {
            if (id === null || id === undefined || id === '') {
                throw new Error(`Empty or invalid order ID found`);
            }
            return String(id).trim(); // Ensure ID is a string and trim whitespace
        });

        console.log('Validated order IDs:', corporateOrderIds);
        
        // Track results for each order
        const results = {
            success: [],
            failed: []
        };
        
        // Process media uploads to Cloudinary once
        let mediaItems = [];
        
        // Handle file uploads
        if (req.files && req.files.media) {
            const mediaFiles = Array.isArray(req.files.media) ? req.files.media : [req.files.media];
            
            for (const file of mediaFiles) {
                const tag = req.body.tags && Array.isArray(req.body.tags) 
                    ? req.body.tags[mediaFiles.indexOf(file)] 
                    : (req.body.tag || 'untagged');
                
                const isVideo = file.mimetype.startsWith('video/');
                const uploadOptions = {
                    folder: 'corporate_order_media',
                    resource_type: isVideo ? 'video' : 'image',
                    tags: [tag, 'bulk_upload']
                };
                
                // Add transformations only for images
                if (!isVideo) {
                    uploadOptions.transformation = {
                        width: 500,
                        height: 1000,
                        quality: 'auto',
                        fetch_format: 'auto'
                    };
                } else {
                    // Video specific options
                    uploadOptions.eager = [
                        { width: 480, height: 270, crop: "pad" }
                    ];
                }
                
                try {
                    const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, uploadOptions);
                    
                    mediaItems.push({
                        url: uploadResult.secure_url,
                        tag: tag,
                        type: isVideo ? 'video' : 'image',
                        public_id: uploadResult.public_id,
                        created_at: new Date().toISOString()
                    });
                } catch (error) {
                    logger.error(`Error uploading to Cloudinary: ${error.message}`);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error uploading media to Cloudinary',
                        error: error.message
                    });
                }
            }
        }
        // If URLs are provided in the request body
        else if (req.body.media) {
            const mediaUrls = Array.isArray(req.body.media) ? req.body.media : [req.body.media];
            const tags = req.body.tags || [];
            
            for (let i = 0; i < mediaUrls.length; i++) {
                const mediaUrl = mediaUrls[i];
                const tag = tags[i] || (req.body.tag || 'untagged');
                
                // Determine if URL points to a video based on extension
                const isVideo = /\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(mediaUrl);
                
                const uploadOptions = {
                    folder: 'corporate_order_media',
                    resource_type: isVideo ? 'video' : 'image',
                    tags: [tag, 'bulk_upload']
                };
                
                // Add transformations only for images
                if (!isVideo) {
                    uploadOptions.transformation = {
                        width: 500,
                        height: 1000,
                        quality: 'auto',
                        fetch_format: 'auto'
                    };
                } else {
                    // Video specific options
                    uploadOptions.eager = [
                        { width: 480, height: 270, crop: "pad" }
                    ];
                }
                
                try {
                    const uploadResult = await cloudinary.uploader.upload(mediaUrl, uploadOptions);
                    
                    mediaItems.push({
                        url: uploadResult.secure_url,
                        tag: tag,
                        type: isVideo ? 'video' : 'image',
                        public_id: uploadResult.public_id,
                        created_at: new Date().toISOString()
                    });
                } catch (error) {
                    logger.error(`Error uploading to Cloudinary: ${error.message}`);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error uploading media to Cloudinary',
                        error: error.message
                    });
                }
            }
        }
        
        if (mediaItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No media files provided for upload'
            });
        }
        
        // Process each corporate order ID
        for (const corporateOrderId of corporateOrderIds) {
            try {
                // Verify the order exists
                const orderCheck = await admin_model.getCorporateOrderDetails(corporateOrderId, categoryId);
                
                if (!orderCheck) {
                    results.failed.push({
                        corporateOrderId,
                        reason: 'Order not found or category does not match'
                    });
                    continue;
                }
                
                // Get existing media
                let existingMedia = orderCheck.media || { items: [] };
                if (typeof existingMedia === 'string') {
                    try {
                        existingMedia = JSON.parse(existingMedia);
                    } catch (e) {
                        existingMedia = { items: [] };
                    }
                }
                
                if (!existingMedia.items) {
                    existingMedia.items = [];
                }
                
                // Combine existing and new media items
                const combinedItems = [...existingMedia.items, ...mediaItems];
                const mediaJson = JSON.stringify({ items: combinedItems });
                
                // Update the database using admin model
                const result = await admin_model.updateCorporateOrderMedia(
                    corporateOrderId,
                    categoryId,
                    mediaJson
                );
                
                if (!result) {
                    results.failed.push({
                        corporateOrderId,
                        reason: 'Failed to update media for order'
                    });
                } else {
                    results.success.push({
                        corporateOrderId,
                        mediaCount: combinedItems.length
                    });
                }
                
            } catch (error) {
                logger.error(`Error updating order ${corporateOrderId}: ${error.message}`);
                results.failed.push({
                    corporateOrderId,
                    reason: error.message
                });
            }
        }
    
        return res.json({
            success: true,
            message: `Processed ${results.success.length} orders successfully, ${results.failed.length} orders failed`,
            results: results
        });
        
    } catch (error) {
        logger.error(`Error in bulkUpdateCorporateOrderMedia: ${error.message}`);
        
        return res.status(500).json({ 
            success: false, 
            message: 'An error occurred while bulk updating corporate order media',
            error: error.message
        });
    }
};


const updateCorporateOrderDeliveryStatus = async (req, res) => {
    try {
        const { corporateOrderGeneratedId, categoryId } = req.params;
        const { deliveryStatus } = req.body;
        
        if (!deliveryStatus) {
            return res.status(400).json({ 
                success: false, 
                message: 'Delivery status is required' 
            });
        }
        
        // Verify the order exists
        const orderCheck = await admin_model.getCorporateOrderDetails(corporateOrderGeneratedId, categoryId);
        
        if (!orderCheck) {
            return res.status(404).json({ 
                success: false, 
                message: 'No matching record found for the provided category and order ID' 
            });
        }

        // Update the database using admin model
        const result = await admin_model.updateSingleCorporateOrderDeliveryStatus(
            corporateOrderGeneratedId,
            categoryId,
            deliveryStatus
        );
        
        if (!result) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to update delivery status for order' 
            });
        }

        // Fetch the complete order to return using admin model
        const orderResult = await admin_model.getCorporateOrderWithCustomerDetails(corporateOrderGeneratedId);
        
        if (!orderResult) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found after update' 
            });
        }

        
        mixpanel.track('Corporate Order Delivery Status Updated', {
            order_id: corporateOrderGeneratedId,
            category_id: categoryId,
            new_status: deliveryStatus,
            previous_status: orderCheck.delivery_status
        });
        
        return res.json({
            success: true,
            message: 'Corporate order delivery status updated successfully',
            order: orderResult
        });
        
    } catch (error) {
        logger.error(`Error in updateCorporateOrderDeliveryStatus: ${error.message}`);

        mixpanel.track('Corporate Order Delivery Status Update Error', {
            error_message: error.message
        });
        
        return res.status(500).json({ 
            success: false, 
            message: 'An error occurred while updating corporate order delivery status',
            error: error.message 
        });
    }
};



const bulkUpdateCorporateOrderDeliveryStatus = async (req, res) => {
    try {
        let corporateOrderIds = [];
        const { deliveryStatus } = req.body;
        
        console.log('Request body:', req.body);
        
        // Check for array notation from form data first (corporateOrderIds[])
        if (req.body['corporateOrderIds[]']) {
            corporateOrderIds = Array.isArray(req.body['corporateOrderIds[]']) 
                ? req.body['corporateOrderIds[]'] 
                : [req.body['corporateOrderIds[]']];
        } 
        // Fall back to req.body.corporateOrderIds if the array notation isn't present
        else if (req.body.corporateOrderIds) {
            // Handle the case where corporateOrderIds might be a JSON string
            if (typeof req.body.corporateOrderIds === 'string') {
                try {
                    corporateOrderIds = JSON.parse(req.body.corporateOrderIds);
                } catch (error) {
                    // If it's not valid JSON but has commas, try to split it
                    if (req.body.corporateOrderIds.includes(',')) {
                        corporateOrderIds = req.body.corporateOrderIds.split(',').map(id => id.trim());
                    } else {
                        // If it's a single value, convert to array
                        corporateOrderIds = [req.body.corporateOrderIds];
                    }
                }
            } else if (Array.isArray(req.body.corporateOrderIds)) {
                corporateOrderIds = req.body.corporateOrderIds;
            }
        }
        
        console.log('Processed order IDs:', corporateOrderIds);
        
        // Check if we have valid order IDs
        if (!corporateOrderIds || !Array.isArray(corporateOrderIds) || corporateOrderIds.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide an array of corporate order IDs' 
            });
        }
        
        // Validate delivery status
        if (!deliveryStatus) {
            return res.status(400).json({
                success: false,
                message: 'Delivery status is required'
            });
        }
        
        // Ensure all IDs are strings and non-empty
        corporateOrderIds = corporateOrderIds.map(id => {
            if (id === null || id === undefined || id === '') {
                throw new Error(`Empty or invalid order ID found`);
            }
            return String(id).trim(); // Ensure ID is a string and trim whitespace
        });

        console.log('Validated order IDs:', corporateOrderIds);
        
        // Track results for each order
        const results = {
            success: [],
            failed: []
        };
        
        // Process each corporate order ID
        for (const corporateOrderId of corporateOrderIds) {
            try {
                // Verify the order exists
                const orderExists = await admin_model.checkCorporateOrderExists(corporateOrderId);
                
                if (!orderExists) {
                    results.failed.push({
                        corporateOrderId,
                        reason: 'Order not found'
                    });
                    continue;
                }
                
                // Get all category IDs for this order
                const categoryDetails = await admin_model.getCorporateOrderCategoryDetails(corporateOrderId);
                
                if (!categoryDetails || categoryDetails.length === 0) {
                    results.failed.push({
                        corporateOrderId,
                        reason: 'No categories found for this order'
                    });
                    continue;
                }
                
                // Update all categories for this order
                const updateResults = await admin_model.updateAllCategoriesDeliveryStatus(
                    corporateOrderId,
                    deliveryStatus
                );
                
                if (!updateResults || updateResults.length === 0) {
                    results.failed.push({
                        corporateOrderId,
                        reason: 'Failed to update delivery status'
                    });
                } else {
                    results.success.push({
                        corporateOrderId,
                        updatedCategories: updateResults.length,
                        deliveryStatus
                    });
                }
                
            } catch (error) {
                logger.error(`Error updating delivery status for order ${corporateOrderId}: ${error.message}`);
                results.failed.push({
                    corporateOrderId,
                    reason: error.message
                });
            }
        }
    
        return res.json({
            success: true,
            message: `Updated delivery status for ${results.success.length} orders successfully, ${results.failed.length} orders failed`,
            results: results
        });
        
    } catch (error) {
        logger.error(`Error in bulkUpdateCorporateOrderDeliveryStatus: ${error.message}`);
        
        return res.status(500).json({ 
            success: false, 
            message: 'An error occurred while bulk updating delivery status',
            error: error.message
        });
    }
};


module.exports = {
    updateCorporateOrderMedia,
    getTodayCorporateOrders,
    bulkUpdateCorporateOrderMedia,
    updateCorporateOrderDeliveryStatus,
    bulkUpdateCorporateOrderDeliveryStatus
};