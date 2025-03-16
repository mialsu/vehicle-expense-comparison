import { Card, Table } from 'react-bootstrap';
import { ExpenseCalculation } from '../types';

interface ExpenseResultsProps {
  vehicleName: string;
  calculation: ExpenseCalculation;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ExpenseResults: React.FC<ExpenseResultsProps> = ({ vehicleName, calculation }) => {
  return (
    <Card className="mb-4">
      <Card.Header as="h5" className="text-primary-dark">{vehicleName} - Expense Breakdown</Card.Header>
      <Card.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Expense Category</th>
              <th>Total Cost</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Purchase Price</td>
              <td>{formatCurrency(calculation.purchaseCost)}</td>
              <td>{((calculation.purchaseCost / calculation.totalCost) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Fuel</td>
              <td>{formatCurrency(calculation.fuelCost)}</td>
              <td>{((calculation.fuelCost / calculation.totalCost) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Maintenance</td>
              <td>{formatCurrency(calculation.maintenanceCost)}</td>
              <td>{((calculation.maintenanceCost / calculation.totalCost) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Insurance</td>
              <td>{formatCurrency(calculation.insuranceCost)}</td>
              <td>{((calculation.insuranceCost / calculation.totalCost) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td>Tax</td>
              <td>{formatCurrency(calculation.taxCost)}</td>
              <td>{((calculation.taxCost / calculation.totalCost) * 100).toFixed(1)}%</td>
            </tr>
            {calculation.financingCost && (
              <tr>
                <td>Financing Cost</td>
                <td>{formatCurrency(calculation.financingCost)}</td>
                <td>{((calculation.financingCost / calculation.totalCost) * 100).toFixed(1)}%</td>
              </tr>
            )}
            <tr className="table-info">
              <td><strong>Total Cost</strong></td>
              <td><strong>{formatCurrency(calculation.totalCost)}</strong></td>
              <td>100%</td>
            </tr>
            <tr className="table-success">
              <td><strong>Residual Value</strong></td>
              <td><strong>-{formatCurrency(calculation.residualValue)}</strong></td>
              <td>-{((calculation.residualValue / calculation.totalCost) * 100).toFixed(1)}%</td>
            </tr>
            <tr className="table-primary">
              <td><strong>Net Cost</strong></td>
              <td><strong>{formatCurrency(calculation.netCost)}</strong></td>
              <td>{((calculation.netCost / calculation.totalCost) * 100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </Table>

        <div className="mt-4">
          <h6>Cost Breakdown:</h6>
          <p>Cost per Year: <strong>{formatCurrency(calculation.costPerYear)}</strong></p>
          <p>Cost per Month: <strong>{formatCurrency(calculation.costPerMonth)}</strong></p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ExpenseResults; 