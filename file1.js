const fs = require("fs");


function readCSV(filePath) {
  const data = fs.readFileSync(filePath, "utf8");
  const rows = data.trim().split("\n");
  const headers = rows[0].split(",");
  const salesData = rows.slice(1).map((row) => {
    const values = row.split(",");
    const record = {};
    headers.forEach((header, index) => {
      record[header.trim()] = values[index].trim();
    });
    return record;
  });
  return salesData;
}


function analyzeSales(salesData) {
  const totalSales = { overall: 0 };
  const monthWiseSales = {};
  const monthWisePopularItem = {};
  const monthWiseRevenueItem = {};
  const mostPopularItemStats = {};

  salesData.forEach((sale) => {
    const month = sale["Month"];
    const item = sale["Item"];
    const quantity = parseInt(sale["Quantity"], 10);
    const price = parseFloat(sale["Price"]);
    const revenue = quantity * price;


    totalSales.overall += revenue;


    if (!monthWiseSales[month]) {
      monthWiseSales[month] = { total: 0, items: {}, revenues: {} };
    }
    monthWiseSales[month].total += revenue;


    if (!monthWiseSales[month].items[item]) {
      monthWiseSales[month].items[item] = 0;
    }
    if (!monthWiseSales[month].revenues[item]) {
      monthWiseSales[month].revenues[item] = 0;
    }
    monthWiseSales[month].items[item] += quantity;
    monthWiseSales[month].revenues[item] += revenue;
  });


  for (const month in monthWiseSales) {
    const { items, revenues } = monthWiseSales[month];


    let maxQuantity = 0;
    let mostPopularItem = "";
    for (const item in items) {
      if (items[item] > maxQuantity) {
        maxQuantity = items[item];
        mostPopularItem = item;
      }
    }
    monthWisePopularItem[month] = mostPopularItem;


    const quantities = [];
    salesData.forEach((sale) => {
      if (sale["Month"] === month && sale["Item"] === mostPopularItem) {
        quantities.push(parseInt(sale["Quantity"], 10));
      }
    });
    const total = quantities.reduce((acc, val) => acc + val, 0);
    mostPopularItemStats[month] = {
      min: Math.min(...quantities),
      max: Math.max(...quantities),
      avg: (total / quantities.length).toFixed(2),
    };


    let maxRevenue = 0;
    let mostRevenueItem = "";
    for (const item in revenues) {
      if (revenues[item] > maxRevenue) {
        maxRevenue = revenues[item];
        mostRevenueItem = item;
      }
    }
    monthWiseRevenueItem[month] = mostRevenueItem;
  }

  return {
    totalSales,
    monthWiseSales,
    monthWisePopularItem,
    monthWiseRevenueItem,
    mostPopularItemStats,
  };
}


const filePath = "sales-data.csv";
const salesData = readCSV(filePath);
const results = analyzeSales(salesData);

// Display results
console.log("Total Sales of the Store:", results.totalSales.overall);
console.log("\nMonth-wise Sales Totals:");
console.log(results.monthWiseSales);

console.log("\nMost Popular Item in Each Month:");
console.log(results.monthWisePopularItem);

console.log("\nItems Generating Most Revenue in Each Month:");
console.log(results.monthWiseRevenueItem);

console.log("\nMin, Max, and Average Orders of the Most Popular Item in Each Month:");
console.log(results.mostPopularItemStats);
