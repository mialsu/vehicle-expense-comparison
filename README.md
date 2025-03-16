# Vehicle Expense Comparison

A web application for comparing the total cost of ownership between different vehicles, taking into account purchase price, fuel costs, maintenance, insurance, taxes, and financing options.

## Features

- Compare up to three vehicles side by side
- Support for different payment methods:
  - Cash purchase
  - Loan financing with customizable terms and fees
  - Leasing with monthly payments
- Calculate expenses for:
  - Purchase/financing costs
  - Fuel consumption (gasoline, diesel, electric, hybrid)
  - Maintenance
  - Insurance
  - Taxes
- Visualize expenses with interactive charts:
  - Cumulative expenses over time
  - Total expenses by category
- Export comparison data to Excel or PDF
- Customizable fuel prices and annual distance
- Separate ownership period from loan/lease terms

## Screenshots

(Add screenshots here)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vehicle-expense-comparison.git
cd vehicle-expense-comparison
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Technologies Used

- React
- TypeScript
- Vite
- React Bootstrap
- Recharts for data visualization
- ExcelJS for Excel export
- jsPDF for PDF export

## Usage

1. Add vehicles using the "Add Vehicle" card
2. Enter vehicle details including:
   - Name
   - Fuel type and consumption
   - Annual costs (maintenance, insurance, tax)
   - Purchase price and payment method
   - Loan or lease details if applicable
3. Adjust fuel prices and annual distance as needed
4. View the comparison results in the table and charts
5. Export the comparison to Excel or PDF if desired

## License

MIT

## Author

Your Name
