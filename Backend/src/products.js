const client = require("./config/dbconfig");

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
                    (product_id_from_csv, ProductName, Image, category_name, price_category, isdual, Units, PriceperUnit, MinUnitsperPlate, Units2, PriceperUnits2,  MinUnits2perPlate)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    ON CONFLICT (product_id_from_csv) DO UPDATE 
                    SET ProductName = EXCLUDED.ProductName,
                        Image = EXCLUDED.Image,
                        category_name = EXCLUDED.category_name,
                        price_category = EXCLUDED.price_category,
                        isdual = EXCLUDED.isdual,
                        Units = EXCLUDED.Units,
                        PriceperUnit = EXCLUDED.PriceperUnit,
                        MinUnitsperPlate = EXCLUDED.MinUnitsperPlate,
                        Units2 = EXCLUDED.Units2,
                        PriceperUnits2 = EXCLUDED.PriceperUnits2,
                         MinUnits2perPlate = EXCLUDED. MinUnits2perPlate`,
                    [
                        record.product_id_from_csv,
                        record.ProductName,
                        record.Image,
                        record.category_name,
                        record.price_category,
                        record.isdual,
                        record.Units,
                        parseFloat(record.PriceperUnit) || null,
                        parseInt(record.MinUnitsperPlate, 10) || null,
                        record.Units2,
                        parseFloat(record.PriceperUnits2) || null,
                        parseInt(record. MinUnits2perPlate, 10) || null
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
        // Split by commas and trim spaces from the resulting fields
        const [
            product_id_from_csv, ProductName, Image, category_name,
            price_category, isdual, Units, PriceperUnit, MinUnitsperPlate,
            Units2, PriceperUnits2,  MinUnits2perPlate
        ] = row.split(',');

        return {
            product_id_from_csv: product_id_from_csv.trim() || null,  
            ProductName: ProductName.trim() || null,
            Image: Image.trim() || null,
            category_name: category_name.trim() || null,
            price_category: price_category.trim() || null,
            isdual: isdual.trim() === 'TRUE',  // Convert 'TRUE'/'FALSE' to boolean
            Units: Units.trim() || null,
            PriceperUnit: parseFloat(PriceperUnit.trim()) || null,  // Handle empty or non-numeric values as null
            MinUnitsperPlate: parseInt(MinUnitsperPlate.trim(), 10) || null,  // Handle NaN as null
            Units2: Units2 ? Units2.trim() : null,
            PriceperUnits2: PriceperUnits2 ? parseFloat(PriceperUnits2.trim()) || null : null,
            MinUnits2perPlate:  MinUnits2perPlate ? parseInt( MinUnits2perPlate.trim(), 10) || null : null
        };

    });
}

module.exports = {
    fetchAndInsertCSVData,
};