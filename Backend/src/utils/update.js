const client = require("../config/dbConfig");

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
            if (record.product_name) {  // Only insert records with product_name
                await client.query(
                    `INSERT INTO event_products 
                    (product_id_from_csv, product_name, image, category_name, price_category, isdual, unit_1, price_per_unit1, min_unit1_per_plate, unit_2, price_per_unit2, min_unit2_per_plate)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    ON CONFLICT (product_id_from_csv) DO UPDATE 
                    SET product_name = EXCLUDED.product_name,
                        image = EXCLUDED.image,
                        category_name = EXCLUDED.category_name,
                        price_category = EXCLUDED.price_category,
                        isdual = EXCLUDED.isdual,
                        unit_1 = EXCLUDED.unit_1,
                        price_per_unit1 = EXCLUDED.price_per_unit1,
                        min_unit1_per_plate = EXCLUDED.min_unit1_per_plate,
                        unit_2 = EXCLUDED.unit_2,
                        price_per_unit2 = EXCLUDED.price_per_unit2,
                        min_unit2_per_plate = EXCLUDED.min_unit2_per_plate`,
                    [
                        record.product_id_from_csv,
                        record.product_name,
                        record.image,
                        record.category_name,
                        record.price_category,
                        record.isdual,
                        record.unit_1,
                        parseFloat(record.price_per_unit1) || null,
                        parseInt(record.min_unit1_per_plate, 10) || null,
                        record.unit_2,
                        parseFloat(record.price_per_unit2) || null,
                        parseInt(record.min_unit2_per_plate, 10) || null
                    ]
                );
            }
        }

        console.log('Data inserted successfully');
    } catch (error) {
        console.error('Error fetching or inserting CSV data:', error);
    } finally {
        await client.end();
    }
}

// Helper function to parse CSV data
function parseCSV(data) {
    const rows = data.split('\n').slice(1); // Skip header row

    return rows.map(row => {
        // Split by commas and trim spaces from the resulting fields
        const [
            product_id_from_csv, product_name, image, category_name,
            price_category, isdual, unit_1, price_per_unit1, min_unit1_per_plate,
            unit_2, price_per_unit2, min_unit2_per_plate
        ] = row.split(',');

        return {
            product_id_from_csv: product_id_from_csv.trim() || null,  
            product_name: product_name.trim() || null,
            image: image.trim() || null,
            category_name: category_name.trim() || null,
            price_category: price_category.trim() || null,
            isdual: isdual.trim() === 'TRUE',  // Convert 'TRUE'/'FALSE' to boolean
            unit_1: unit_1.trim() || null,
            price_per_unit1: parseFloat(price_per_unit1.trim()) || null,  // Handle empty or non-numeric values as null
            min_unit1_per_plate: parseInt(min_unit1_per_plate.trim(), 10) || null,  // Handle NaN as null
            unit_2: unit_2 ? unit_2.trim() : null,
            price_per_unit2: price_per_unit2 ? parseFloat(price_per_unit2.trim()) || null : null,
            min_unit2_per_plate: min_unit2_per_plate ? parseInt(min_unit2_per_plate.trim(), 10) || null : null
        };
    });
}

module.exports = {
    fetchAndInsertCSVData,
};
