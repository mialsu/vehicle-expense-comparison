import { useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Vehicle, ExpenseCalculation } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ExpenseChartsProps {
  vehicles: Vehicle[];
  calculations: ExpenseCalculation[];
}

// Define colors for consistent chart rendering
const CHART_COLORS = [
  '#8884d8', // purple
  '#82ca9d', // green
  '#ffc658', // yellow
];

interface YearData {
  year: number;
  [vehicleName: string]: number;
}

interface CategoryData {
  category: string;
  [vehicleName: string]: string | number;
}

const ExpenseCharts: React.FC<ExpenseChartsProps> = ({ vehicles, calculations }) => {
  const [chartType, setChartType] = useState<'cumulative' | 'total'>('cumulative');

  // Ensure we have matching vehicles and calculations
  const validVehiclesWithCalculations = vehicles
    .map((vehicle, index) => ({
      vehicle,
      calculation: index < calculations.length ? calculations[index] : null
    }))
    .filter((item): item is { vehicle: Vehicle; calculation: ExpenseCalculation } => 
      item.calculation !== null
    );

  // Prepare data for cumulative expenses chart
  const prepareCumulativeData = () => {
    if (validVehiclesWithCalculations.length === 0) {
      return [{ year: 0 }];
    }

    const maxYears = Math.max(...validVehiclesWithCalculations.map(item => item.vehicle.ownershipPeriod));
    const data: YearData[] = [];

    for (let year = 0; year <= maxYears; year++) {
      const yearData: YearData = { year };

      validVehiclesWithCalculations.forEach(item => {
        const { vehicle, calculation } = item;
        if (year <= vehicle.ownershipPeriod) {
          // Calculate cumulative cost up to this year
          const yearlyNetCost = calculation.netCost / vehicle.ownershipPeriod;
          const cumulativeCost = year === 0 ? 0 : yearlyNetCost * year;
          yearData[vehicle.name] = Math.round(cumulativeCost);
        }
      });

      data.push(yearData);
    }

    return data;
  };

  // Prepare data for total expenses chart
  const prepareTotalData = () => {
    if (validVehiclesWithCalculations.length === 0) {
      return [{ category: 'No Data' }];
    }

    const expenseCategories = [
      'Purchase',
      'Fuel',
      'Maintenance',
      'Insurance',
      'Tax',
      'Financing',
      'Residual Value'
    ];

    return expenseCategories.map(category => {
      const categoryData: CategoryData = { category };

      validVehiclesWithCalculations.forEach(item => {
        const { vehicle, calculation } = item;
        let value = 0;

        switch (category) {
          case 'Purchase':
            value = calculation.purchaseCost;
            break;
          case 'Fuel':
            value = calculation.fuelCost;
            break;
          case 'Maintenance':
            value = calculation.maintenanceCost;
            break;
          case 'Insurance':
            value = calculation.insuranceCost;
            break;
          case 'Tax':
            value = calculation.taxCost;
            break;
          case 'Financing':
            value = calculation.financingCost || 0;
            break;
          case 'Residual Value':
            value = -calculation.residualValue; // Negative because it reduces total cost
            break;
        }

        categoryData[vehicle.name] = Math.round(value);
      });

      return categoryData;
    });
  };

  const cumulativeData = prepareCumulativeData();
  const totalData = prepareTotalData();

  const handleChartTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChartType(e.target.value as 'cumulative' | 'total');
  };

  // Custom tooltip formatter for currency values
  const currencyTooltipFormatter = (value: number) => formatCurrency(value);

  // If we don't have any valid data, show a message
  if (validVehiclesWithCalculations.length === 0) {
    return (
      <Card className="mb-4">
        <Card.Header as="h5" className="text-primary-dark">Expense Charts</Card.Header>
        <Card.Body>
          <p className="text-center">No complete vehicle data available for charting.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header as="h5" className="text-primary-dark">Expense Charts</Card.Header>
      <Card.Body>
        <div className="mb-3">
          <Form>
            <div className="d-flex justify-content-center mb-4">
              <Form.Check
                inline
                type="radio"
                id="chart-cumulative"
                label="Cumulative Expenses Over Time"
                name="chartType"
                value="cumulative"
                checked={chartType === 'cumulative'}
                onChange={handleChartTypeChange}
                className="me-4"
              />
              <Form.Check
                inline
                type="radio"
                id="chart-total"
                label="Total Expenses by Category"
                name="chartType"
                value="total"
                checked={chartType === 'total'}
                onChange={handleChartTypeChange}
              />
            </div>
          </Form>
        </div>

        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            {chartType === 'cumulative' ? (
              <LineChart
                data={cumulativeData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="year" 
                  label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }} 
                />
                <YAxis 
                  tickFormatter={currencyTooltipFormatter}
                />
                <Tooltip formatter={currencyTooltipFormatter} />
                <Legend />
                {validVehiclesWithCalculations.map((item, index) => (
                  <Line
                    key={item.vehicle.id}
                    type="monotone"
                    dataKey={item.vehicle.name}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart
                data={totalData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis 
                  tickFormatter={currencyTooltipFormatter}
                />
                <Tooltip formatter={currencyTooltipFormatter} />
                <Legend />
                {validVehiclesWithCalculations.map((item, index) => (
                  <Bar
                    key={item.vehicle.id}
                    dataKey={item.vehicle.name}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ExpenseCharts; 