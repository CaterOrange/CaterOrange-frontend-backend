// const fs = require('fs'); // Node.js file system module
// const path = require('path'); // For handling file paths

// const filePath = path.join(__dirname, 'data.json'); // Path to save the JSON file

// async function fetchAndSaveCSVData1() {
//     try {
//         const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRxAxIgSDawONcKYGE9RXHHps27I_uY5OK9kEXHn1cFkNmiSxKfeMa62xfzX3BRhZj_fwzke5hqDvIy/pub?output=csv';

//         // Fetch the CSV data
//         const response = await fetch(csvUrl);

//         if (!response.ok) {
//             throw new Error(`Failed to fetch data: ${response.statusText}`);
//         }

//         // Read the CSV data as text
//         const csvText = await response.text();

//         // Convert CSV to JSON
//         const csvLines = csvText.trim().split('\n');
//         const headers = csvLines.shift().split(',');

//         // Convert CSV lines to JSON objects
//         const jsonData = csvLines.map(line => {
//             const values = line.split(',');
//             const obj = {};
//             headers.forEach((header, index) => {
//                 obj[header] = values[index];
//             });
//             return obj;
//         });

//         // Save JSON data to a file
//         fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

//         console.log(`JSON data has been saved to ${filePath}`);

//     } catch (error) {
//         console.error('Error fetching or saving CSV data:', error);
//     }
// }

// // Call the function to fetch, convert, and save the CSV data
// fetchAndSaveCSVData1;


async function fetchAndLogCSVData() {
    try {
      const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRxAxIgSDawONcKYGE9RXHHps27I_uY5OK9kEXHn1cFkNmiSxKfeMa62xfzX3BRhZj_fwzke5hqDvIy/pub?output=csv';
  
      // Fetch the CSV data
      const response = await fetch(csvUrl);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
  
      // Log the raw CSV data as text
      const data = await response.text();
      console.log('CSV Data:', data);
  
    } catch (error) {
      console.error('Error fetching CSV data:', error);
    }
  }
module.exports={
    fetchAndLogCSVData
}
  // Call the function
//fetchAndLogCSVData();