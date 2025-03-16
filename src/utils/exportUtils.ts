import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Vehicle, ExpenseCalculation } from '../types';
import { formatCurrency } from './formatters';

// Helper function to prepare data for export
const prepareComparisonData = (
  vehicles: Vehicle[], 
  calculations: ExpenseCalculation[]
) => {
  // Ensure vehicles and calculations arrays match
  if (vehicles.length !== calculations.length) {
    throw new Error('Vehicles and calculations arrays must have the same length');
  }

  // Create headers
  const headers = [
    'Expense Category',
    ...vehicles.map(v => v.name)
  ];

  // Create rows for each expense category
  const rows = [
    ['Purchase Price', ...vehicles.map((_, i) => calculations[i].purchaseCost)],
    ['Fuel Cost', ...vehicles.map((_, i) => calculations[i].fuelCost)],
    ['Maintenance Cost', ...vehicles.map((_, i) => calculations[i].maintenanceCost)],
    ['Insurance Cost', ...vehicles.map((_, i) => calculations[i].insuranceCost)],
    ['Tax Cost', ...vehicles.map((_, i) => calculations[i].taxCost)],
    ['Financing Cost', ...vehicles.map((_, i) => calculations[i].financingCost || 0)],
    ['Total Cost', ...vehicles.map((_, i) => calculations[i].totalCost)],
    ['Residual Value', ...vehicles.map((_, i) => calculations[i].residualValue)],
    ['Net Cost', ...vehicles.map((_, i) => calculations[i].netCost)],
    ['Cost per Year', ...vehicles.map((_, i) => calculations[i].costPerYear)],
    ['Cost per Month', ...vehicles.map((_, i) => calculations[i].costPerMonth)]
  ];

  // Add vehicle details
  const vehicleDetailsRows = [
    ['Vehicle Details', ...vehicles.map(() => '')],
    ['Fuel Type', ...vehicles.map(v => v.fuelType)],
    ['Fuel Efficiency', ...vehicles.map(v => 
      v.fuelType === 'electric' 
        ? `${v.fuelEfficiency} kWh/100km` 
        : `${v.fuelEfficiency} L/100km`
    )],
    ['Ownership Period', ...vehicles.map(v => `${v.ownershipPeriod} years`)],
    ['Payment Method', ...vehicles.map(v => v.paymentMethod)]
  ];

  return {
    headers,
    rows,
    vehicleDetailsRows
  };
};

// Export to Excel
export const exportToExcel = (
  vehicles: Vehicle[], 
  calculations: ExpenseCalculation[]
) => {
  const { headers, rows, vehicleDetailsRows } = prepareComparisonData(vehicles, calculations);
  
  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet([
    headers,
    ...rows,
    [''], // Empty row as separator
    ...vehicleDetailsRows
  ]);

  // Set column widths
  const colWidths = [
    { wch: 20 }, // Expense Category
    ...vehicles.map(() => ({ wch: 15 })) // Vehicle columns
  ];
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Comparison');

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file
  saveAs(blob, 'vehicle-expense-comparison.xlsx');
};

// Export to PDF
export const exportToPDF = (
  vehicles: Vehicle[], 
  calculations: ExpenseCalculation[]
) => {
  const { headers, rows, vehicleDetailsRows } = prepareComparisonData(vehicles, calculations);
  
  // Format currency values for PDF
  const formattedRows = rows.map(row => [
    row[0],
    ...row.slice(1).map(value => typeof value === 'number' ? formatCurrency(value) : value)
  ]);

  // Create PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Vehicle Expense Comparison', 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);
  
  // Add expense comparison table
  doc.setFontSize(12);
  doc.text('Expense Comparison', 14, 35);
  
  autoTable(doc, {
    head: [headers],
    body: formattedRows,
    startY: 38,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [13, 59, 102], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 40 }
    }
  });
  
  // Add vehicle details table
  // Get the Y position after the first table
  const tableHeight = doc.lastAutoTable?.finalY || 150;
  doc.text('Vehicle Details', 14, tableHeight + 10);
  
  autoTable(doc, {
    head: [['Detail', ...vehicles.map(v => v.name)]],
    body: vehicleDetailsRows.slice(1), // Skip the header row
    startY: tableHeight + 13,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [13, 59, 102], textColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 40 }
    }
  });
  
  // Save PDF
  doc.save('vehicle-expense-comparison.pdf');
}; 