const client = require("./src/config/dbConfig");

async function fetchAndInsertCSVData() {
    try {
        const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRxAxIgSDawONcKYGE9RXHHps27I_uY5OK9kEXHn1cFkNmiSxKfeMa62xfzX3BRhZj_fwzke5hqDvIy/pub?output=csv';

        // Fetch the CSV data
        const response = await fetch(csvUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        // Parse CSV data   
        const data = await response.text();
        const records = parseCSV(data);        
        for (const record of records) {
            if (record.ProductName) {  // Only insert records with ProductName
                await client.query(
                    `INSERT INTO event_products 
                    (productId, ProductName, Image, category_name, price_category, isDual, Plate_Units, PriceperUnit, MinUnitsperPlate, WtOrVol_Units, Price_Per_WtOrVol_Units,  Min_WtOrVol_Units_per_Plate)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    ON CONFLICT (productId) DO UPDATE 
                    SET ProductName = EXCLUDED.ProductName,
                        Image = EXCLUDED.Image,
                        category_name = EXCLUDED.category_name,
                        price_category = EXCLUDED.price_category,
                        isDual = EXCLUDED.isDual,
                        Plate_Units = EXCLUDED.Plate_Units,
                        PriceperUnit = EXCLUDED.PriceperUnit,
                        MinUnitsperPlate = EXCLUDED.MinUnitsperPlate,
                        WtOrVol_Units = EXCLUDED.WtOrVol_Units,
                        Price_Per_WtOrVol_Units = EXCLUDED.Price_Per_WtOrVol_Units,
                        Min_WtOrVol_Units_per_Plate = EXCLUDED.Min_WtOrVol_Units_per_Plate`,
                    [
                        record.productId,
                        record.ProductName,
                        record.Image,
                        record.category_name,
                        record.price_category,
                        record.isDual,
                        record.Plate_Units,
                        parseFloat(record.PriceperUnit) || null,
                        parseInt(record.MinUnitsperPlate, 10) || null,
                        record.WtOrVol_Units,
                        parseFloat(record.Price_Per_WtOrVol_Units) || null,
                        parseInt(record.Min_WtOrVol_Units_per_Plate, 10) || null
                    ]
                );
            }
        }

        console.log('Data inserted successfully');
    } catch (error) {
        console.error('Error fetching or inserting CSV data:', error);
    }
}

// Helper function to parse CSV data
function parseCSV(data) {
    const rows = data.split('\n').slice(1); // Skip header row

    return rows.map(row => {

        const [
            productId, ProductName, Image, category_name,
            price_category, isDual, Plate_Units, PriceperUnit, MinUnitsperPlate,
            WtOrVol_Units,Price_Per_WtOrVol_Units,Min_WtOrVol_Units_per_Plate
        ] = row.split(',');

        return {
            productId: productId.trim() || null,  
            ProductName: ProductName.trim() || null,
            Image: Image.trim() || null,
            category_name: category_name.trim() || null,
            price_category: price_category.trim() || null,
            isDual: isDual.trim() === 'TRUE',  // Convert 'TRUE'/'FALSE' to boolean
            Plate_Units: Plate_Units.trim() || null,
            PriceperUnit: parseFloat(PriceperUnit.trim()) || null,  // Handle empty or non-numeric values as null
            MinUnitsperPlate: parseInt(MinUnitsperPlate.trim(), 10) || null,  // Handle NaN as null
            WtOrVol_Units: WtOrVol_Units ? WtOrVol_Units.trim() : null,
            Price_Per_WtOrVol_Units: Price_Per_WtOrVol_Units? parseFloat(Price_Per_WtOrVol_Units.trim()) || null : null,
            Min_WtOrVol_Units_per_Plate: Min_WtOrVol_Units_per_Plate ? parseInt(Min_WtOrVol_Units_per_Plate.trim(), 10) || null : null
        };

    });
}


module.exports = {
    fetchAndInsertCSVData,
};