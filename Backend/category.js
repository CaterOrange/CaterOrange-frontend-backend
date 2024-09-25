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
            if (record.category_name) {  // Only insert records with ProductName
                await client.query(
                   
                   ` INSERT INTO corporate_category (category_name,category_description, category_price, category_media) VALUES
                   ($1,$2, $3,$4)
                   ON CONFLICT (category_id_from_csv) DO UPDATE
                   SET 
                        category_name = EXCLUDED.category_name,
                        category_description = EXCLUDED.category_description,
                        category_price = EXCLUDED.category_price,
                        category_media = EXCLUDED.category_media,
                       `,
                    [
                        record.category_id_from_csv,
                        record.category_name,
                        record.category_description,
                        record.category_price,
                        record.category_media,
     
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
            category_id_from_csv, category_name,
            category_description,category_price, category_media
        ] = row.split(',');

        return {
            category_id_from_csv: category_id_from_csv.trim() || null,  
            category_name: category_name.trim() || null,
            category_description: category_description.trim() || null,
            category_description:category_description.trim() === 'TRUE',  // Convert 'TRUE'/'FALSE' to boolean
            category_price: category_price.trim() || null,
            category_media: category_media.trim() || null,  // Handle empty or non-numeric values as null
           
        };

    });
}


module.exports = {
    fetchAndInsertCSVData,
};