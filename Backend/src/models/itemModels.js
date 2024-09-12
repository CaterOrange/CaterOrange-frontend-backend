const { createLogger } = require("winston");
const client = require("../config/dbConfig");
const { DB_COMMANDS } = require("../utils/queries");
const logger = require("../config/logger");

const additems= async(items)=>{
     
    try{
        console.log(items);
    const {name,cost} = items;
    const result = await client.query(DB_COMMANDS.ADDiTEMS,[name,cost]);
    logger.info('Items added Successfully');
   }catch(err){
    logger.error('Items failed to add',err.message);
   }

}
const deleteitems=async(id)=>{
    try{
        
        await client.query(DB_COMMANDS.DELETEITEM,[id]);
        logger.info('Items deleted Successfully');
    }catch(err){
        logger.error('Failed to delete Item',err.message);
    }
}
const updateitems=async(id,item)=>{
    try{
        const {name,cost}=item;
        await client.query(DB_COMMANDS.UPDATEITEM,[name,cost,id]);
        logger.info('Item updated Successfully');
    }catch(err){
        logger.error('Failed to updated Item',err.message);
    }
}

module.exports={
    additems,
    deleteitems,
    updateitems
}