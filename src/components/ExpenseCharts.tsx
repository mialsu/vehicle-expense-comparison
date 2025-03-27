import { useState } from 'react';
import { Card, Form } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
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
  '#ff8042', // orange
  '#0088FE', // blue
];

interface YearData {
  year: number;
  [key: string]: number | string;
}

interface CategoryData {
  category: string;
  [key: string]: string | number;
}

// Create a mapping between vehicle ID and display name
interface VehicleMapping {
  id: string;
  name: string;
  color: string;
}

// Create a custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <p className="label" style={{ margin: 0 }}>{`Year: ${label}`}</p>
      {payload.map((entry, index) => {
        // Extract the vehicle ID from the dataKey (format: "id_VEHICLE_ID")
        const idMatch = entry.dataKey?.toString().match(/^id_(.+)$/);
        if (idMatch) {
          const vehicleId = idMatch[1];
          // Find the vehicle name from the payload data
          const vehicleName = entry.payload[`name_${vehicleId}`];
          return (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {`${vehicleName}: ${formatCurrency(entry.value as number)}`}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
};

// Create a custom tooltip component for the bar chart
const CategoryTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <p className="label" style={{ margin: 0, fontWeight: 'bold' }}>{`${label}`}</p>
      {payload.map((entry, index) => {
        // Extract the vehicle ID from the dataKey (format: "id_VEHICLE_ID")
        const idMatch = entry.dataKey?.toString().match(/^id_(.+)$/);
        if (idMatch) {
          const vehicleId = idMatch[1];
          // Find the vehicle name from the payload data
          const vehicleName = entry.payload[`name_${vehicleId}`];
          return (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {`${vehicleName}: ${formatCurrency(entry.value as number)}`}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
};

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

  // Create a mapping of vehicle IDs to names and colors
  const vehicleMappings: VehicleMapping[] = validVehiclesWithCalculations.map((item, index) => ({
    id: item.vehicle.id,
    name: item.vehicle.name,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

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
          // Use vehicle ID as the key instead of name
          yearData[`id_${vehicle.id}`] = Math.round(cumulativeCost);
          // Also store the vehicle name for tooltip display
          yearData[`name_${vehicle.id}`] = vehicle.name;
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

        // Use vehicle ID as the key instead of name
        categoryData[`id_${vehicle.id}`] = Math.round(value);
        // Also store the vehicle name for tooltip display
        categoryData[`name_${vehicle.id}`] = vehicle.name;
      });

      return categoryData;
    });
  };

  const cumulativeData = prepareCumulativeData();
  const totalData = prepareTotalData();

  const handleChartTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChartType(e.target.value as 'cumulative' | 'total');
  };

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
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value, entry) => {
                  // Find the vehicle mapping by color
                  const mapping = vehicleMappings.find(m => m.color === entry.color);
                  return mapping ? mapping.name : value;
                }} />
                {vehicleMappings.map((mapping) => (
                  <Line
                    key={mapping.id}
                    type="monotone"
                    dataKey={`id_${mapping.id}`}
                    stroke={mapping.color}
                    name={mapping.name} // Use the name directly for better accessibility
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
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CategoryTooltip />} />
                <Legend formatter={(value, entry) => {
                  // Find the vehicle mapping by color
                  const mapping = vehicleMappings.find(m => m.color === entry.color);
                  return mapping ? mapping.name : value;
                }} />
                {vehicleMappings.map((mapping) => (
                  <Bar
                    key={mapping.id}
                    dataKey={`id_${mapping.id}`}
                    fill={mapping.color}
                    name={mapping.name} // Use the name directly for better accessibility
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