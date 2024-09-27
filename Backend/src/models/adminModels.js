const { DB_COMMANDS} = require('../utils/queries.js');
const client = require('../config/dbConfig.js');
const { cli } = require('winston/lib/winston/config/index.js');
const getAllCustomers = async () => {
    return client.query(DB_COMMANDS.GET_ALL_CUSTOMERS);
  }
  
  const getCustomerById = async (userId) => {
    return client.query(DB_COMMANDS.GET_CUSTOMER_BY_ID, [userId]);
  }
  const deleteCustomerById = async (userId) => {
    return client.query(DB_COMMANDS.DELETE_CUSTOMER, [userId]);
  }

  // const updateUser = async (id, fields, values) => {
  //   let query = DB_COMMANDS.UPDATE_USER + ' ' + fields.join(', ') + ' WHERE customer_id = $' + (fields.length + 1);
  //   return client.query(query, [...values, id]);
  // }

  const updateUser = async (fields, values) => {
    const query = `
        UPDATE customer
        SET ${fields.join(', ')}
        WHERE customer_id = $${fields.length + 1}
    `;

    try {
        const result = await client.query(query, values);
        return result;
    } catch (err) {
        throw err;
    }
};
  const getAllEventOrders = async () => {
    return client.query(DB_COMMANDS.GET_ALL_EVENT_ORDER);
  }
  const getAllCorporateOrders = async () => {
    return client.query(DB_COMMANDS.GET_ALL_CORPORATE_ORDER);
  }
  const  getAllItems = async () => {
    return client.query(DB_COMMANDS.GET_ALL_ITEMS);
  }

 
  const getAllpayments=async ()=>{
    return client.query(DB_COMMANDS.GET_ALL_PAYMENTS)
  }

  const deleteCorporateOrderById =async (userId)=>{
    return client.query(DB_COMMANDS.DELETE_CORPORATE_ORDER, [userId]);

    
  }

  const deleteEventOrderById =async (userId)=>{
    return client.query(DB_COMMANDS.DELETE_EVENT_ORDER, [userId]);

  }
  

  const deleteCorporateOrderByOrderId =async (corporateOrder_id)=>{
    return client.query(DB_COMMANDS.DELETE_CORPORATE_ORDER_BY_ID, [corporateOrder_id]);

    
  }
  const deleteEventOrderByOrderId =async (eventOrder_id)=>{
    return client.query(DB_COMMANDS.DELETE_EVENT_ORDER_BY_ID, [eventOrder_id]);

    
  }


  const updateStatus = async (orderId, status) => {
    try {
      const result = await client.query(DB_COMMANDS.UPDATE_EVENT_STATUS,
        [status, orderId]
      );
  
      if (result.rows.length === 0) {
        return null;
      }
  
      return result.rows[0];
    } catch (error) {
      console.error('Error in updateStatus model:', error);
      throw error;
    }
  };
const updateCorporateorderStatus =async (orderId, status) => {
  try {
    const result = await client.query(DB_COMMANDS.UPDATE_CORPORATE_STATUS,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error in updateStatus model:', error);
    throw error;
  }
};

const getAllCategory=async () => {
  return client.query(DB_COMMANDS.GET_ALL_CORPORATE_CATEGORIES);
}


  // Update isdeactivated status by customer_id
  const  toggleDeactivation = async (customerId, isdeactivated) => {
    const query = 'UPDATE customer SET isdeactivated = $1 WHERE customer_id = $2 RETURNING *';
    const values = [isdeactivated, customerId];

    try {
      const result = await client.query(query, values);
      return result.rows[0]; // Return the updated customer
    } catch (err) {
      throw new Error('Error toggling customer deactivation: ' + err.message);
    }
  }

  const getTotalCustomers = async () => {
    const result = await client.query(DB_COMMANDS.GET_ALL_CUSTOMERS);
    return result.rows.length;
  };
  
  const getCorporateOrders = async () => {
    const result = await client.query(DB_COMMANDS.GET_ALL_CORPORATE_ORDER);
    return result.rows.length;
  };
  
  const getEventOrders = async () => {
    const result = await client.query(DB_COMMANDS.GET_ALL_EVENT_ORDER);
    return result.rows.length;
  };


 
  const findAdminByCustomerId=async (customer_generated_id) => {
    try{
    const query = 'SELECT * FROM admin WHERE customer_generated_id = $1';
  const result=await  client.query(query,[customer_generated_id]);
  console.log("answer",result.rows[0])
  
    return result.rows[0];
    }
    catch(err){
      return err;
    }
}
 


module.exports = {
  
findAdminByCustomerId,
  getTotalCustomers,
  getEventOrders,
  getCorporateOrders,
    getAllCustomers,
    getCustomerById,
    deleteCustomerById,
    updateUser,
    getAllCorporateOrders,
    getAllEventOrders,
    getAllItems,
    getAllpayments,
    deleteCorporateOrderById, deleteEventOrderById ,
    deleteCorporateOrderByOrderId,
    deleteEventOrderByOrderId,
    updateStatus,updateCorporateorderStatus,getAllCategory,
    toggleDeactivation,
   
    
}