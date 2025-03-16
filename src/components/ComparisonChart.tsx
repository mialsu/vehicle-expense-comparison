import { Card, Table } from 'react-bootstrap';
import { ExpenseCalculation } from '../types';

interface ComparisonChartProps {
  vehicle1Name: string;
  vehicle2Name: string;
  vehicle3Name?: string;
  calculation1: ExpenseCalculation;
  calculation2: ExpenseCalculation;
  calculation3?: ExpenseCalculation;
  ownershipPeriod1: number;
  ownershipPeriod2: number;
  ownershipPeriod3?: number;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  vehicle1Name,
  vehicle2Name,
  vehicle3Name,
  calculation1,
  calculation2,
  calculation3,
  ownershipPeriod1,
  ownershipPeriod2,
  ownershipPeriod3
}) => {
  // Determine which vehicle is cheapest overall
  let cheapestVehicle = vehicle1Name;
  let cheapestCost = calculation1.netCost;
  let relevantOwnershipPeriod = ownershipPeriod1;
  
  if (calculation2.netCost < cheapestCost) {
    cheapestVehicle = vehicle2Name;
    cheapestCost = calculation2.netCost;
    relevantOwnershipPeriod = ownershipPeriod2;
  }
  
  if (calculation3 && vehicle3Name && ownershipPeriod3 && calculation3.netCost < cheapestCost) {
    cheapestVehicle = vehicle3Name;
    cheapestCost = calculation3.netCost;
    relevantOwnershipPeriod = ownershipPeriod3;
  }
  
  // Calculate savings compared to the most expensive option
  const mostExpensiveCost = Math.max(
    calculation1.netCost, 
    calculation2.netCost, 
    calculation3 ? calculation3.netCost : 0
  );
  
  const savingsAmount = mostExpensiveCost - cheapestCost;
  
  return (
    <Card className="mb-4">
      <Card.Header as="h5" className="text-primary-dark">Vehicle Comparison</Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Expense Category</th>
              <th>{vehicle1Name}</th>
              <th>{vehicle2Name}</th>
              {vehicle3Name && <th>{vehicle3Name}</th>}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Purchase Price</td>
              <td>{formatCurrency(calculation1.purchaseCost)}</td>
              <td>{formatCurrency(calculation2.purchaseCost)}</td>
              {calculation3 && <td>{formatCurrency(calculation3.purchaseCost)}</td>}
            </tr>
            <tr>
              <td>Fuel</td>
              <td>{formatCurrency(calculation1.fuelCost)}</td>
              <td>{formatCurrency(calculation2.fuelCost)}</td>
              {calculation3 && <td>{formatCurrency(calculation3.fuelCost)}</td>}
            </tr>
            <tr>
              <td>Maintenance</td>
              <td>{formatCurrency(calculation1.maintenanceCost)}</td>
              <td>{formatCurrency(calculation2.maintenanceCost)}</td>
              {calculation3 && <td>{formatCurrency(calculation3.maintenanceCost)}</td>}
            </tr>
            <tr>
              <td>Insurance</td>
              <td>{formatCurrency(calculation1.insuranceCost)}</td>
              <td>{formatCurrency(calculation2.insuranceCost)}</td>
              {calculation3 && <td>{formatCurrency(calculation3.insuranceCost)}</td>}
            </tr>
            <tr>
              <td>Tax</td>
              <td>{formatCurrency(calculation1.taxCost)}</td>
              <td>{formatCurrency(calculation2.taxCost)}</td>
              {calculation3 && <td>{formatCurrency(calculation3.taxCost)}</td>}
            </tr>
            <tr>
              <td>Financing</td>
              <td>{calculation1.financingCost ? formatCurrency(calculation1.financingCost) : 'N/A'}</td>
              <td>{calculation2.financingCost ? formatCurrency(calculation2.financingCost) : 'N/A'}</td>
              {calculation3 && <td>{calculation3.financingCost ? formatCurrency(calculation3.financingCost) : 'N/A'}</td>}
            </tr>
            <tr className="table-info">
              <td><strong>Total Cost</strong></td>
              <td><strong>{formatCurrency(calculation1.totalCost)}</strong></td>
              <td><strong>{formatCurrency(calculation2.totalCost)}</strong></td>
              {calculation3 && <td><strong>{formatCurrency(calculation3.totalCost)}</strong></td>}
            </tr>
            <tr className="table-success">
              <td><strong>Residual Value</strong></td>
              <td><strong>{formatCurrency(calculation1.residualValue)}</strong></td>
              <td><strong>{formatCurrency(calculation2.residualValue)}</strong></td>
              {calculation3 && <td><strong>{formatCurrency(calculation3.residualValue)}</strong></td>}
            </tr>
            <tr className="table-primary">
              <td><strong>Net Cost</strong></td>
              <td><strong>{formatCurrency(calculation1.netCost)}</strong></td>
              <td><strong>{formatCurrency(calculation2.netCost)}</strong></td>
              {calculation3 && <td><strong>{formatCurrency(calculation3.netCost)}</strong></td>}
            </tr>
            <tr>
              <td>Cost per Year</td>
              <td>{formatCurrency(calculation1.costPerYear)}</td>
              <td>{formatCurrency(calculation2.costPerYear)}</td>
              {calculation3 && <td>{formatCurrency(calculation3.costPerYear)}</td>}
            </tr>
            <tr>
              <td>Cost per Month</td>
              <td>{formatCurrency(calculation1.costPerMonth)}</td>
              <td>{formatCurrency(calculation2.costPerMonth)}</td>
              {calculation3 && <td>{formatCurrency(calculation3.costPerMonth)}</td>}
            </tr>
          </tbody>
        </Table>

        <div className="mt-4 alert alert-info">
          <h6>Summary:</h6>
          <p>
            <strong>{cheapestVehicle}</strong> is the most economical option, saving you up to <strong>{formatCurrency(savingsAmount)}</strong> over 
            the ownership period ({relevantOwnershipPeriod} years).
          </p>
          <p>
            Monthly savings: <strong>{formatCurrency(savingsAmount / (relevantOwnershipPeriod * 12))}</strong> compared to the most expensive option.
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ComparisonChart; 