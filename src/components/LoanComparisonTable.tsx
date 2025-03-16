import { Table, Card } from 'react-bootstrap';
import { Vehicle, LoanCalculation } from '../types';
import { formatCurrency } from '../utils/formatters';

interface LoanComparisonTableProps {
  vehicles: (Vehicle | null)[];
  loanCalculations: (LoanCalculation | null)[];
}

const LoanComparisonTable: React.FC<LoanComparisonTableProps> = ({ 
  vehicles, 
  loanCalculations 
}) => {
  // Filter to only include vehicles with loan payment method
  const vehiclesWithLoans = vehicles
    .map((vehicle, index) => ({
      vehicle,
      calculation: loanCalculations[index],
      index
    }))
    .filter(item => 
      item.vehicle !== null && 
      item.vehicle.paymentMethod === 'loan' && 
      item.calculation !== null
    );

  // If no vehicles with loans, don't render the component
  if (vehiclesWithLoans.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <Card.Header as="h5" className="text-primary-dark">Loan Comparison</Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Loan Details</th>
                {vehiclesWithLoans.map(item => (
                  <th key={item.vehicle!.id}>{item.vehicle!.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Loan Amount Section */}
              <tr className="table-light">
                <td colSpan={vehiclesWithLoans.length + 1}><strong>Loan Amount</strong></td>
              </tr>
              <tr>
                <td>Loan Amount</td>
                {vehiclesWithLoans.map(item => (
                  <td key={`loan-amount-${item.vehicle!.id}`}>
                    {formatCurrency(item.vehicle!.loanAmount)}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Loan Term</td>
                {vehiclesWithLoans.map(item => (
                  <td key={`loan-term-${item.vehicle!.id}`}>
                    {item.vehicle!.ownershipPeriod} years ({item.vehicle!.ownershipPeriod * 12} months)
                  </td>
                ))}
              </tr>

              {/* Interest Rate Section */}
              <tr className="table-light">
                <td colSpan={vehiclesWithLoans.length + 1}><strong>Interest & Fees</strong></td>
              </tr>
              <tr>
                <td>Nominal Interest Rate</td>
                {vehiclesWithLoans.map(item => (
                  <td key={`nominal-rate-${item.vehicle!.id}`}>
                    {item.vehicle!.loanInterestRate?.toFixed(2) || '0.00'}%
                  </td>
                ))}
              </tr>
              <tr>
                <td>Effective Interest Rate (APR)</td>
                {vehiclesWithLoans.map(item => (
                  <td key={`effective-rate-${item.vehicle!.id}`}>
                    <strong>{item.calculation!.effectiveInterestRate.toFixed(2)}%</strong>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Monthly Fee</td>
                {vehiclesWithLoans.map(item => (
                  <td key={`monthly-fee-${item.vehicle!.id}`}>
                    {formatCurrency(item.vehicle!.loanMonthlyFee || 0)}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Start Fee</td>
                {vehiclesWithLoans.map(item => (
                  <td key={`start-fee-${item.vehicle!.id}`}>
                    {formatCurrency(item.vehicle!.loanStartFee || 0)}
                  </td>
                ))}
              </tr>

              {/* Payment Section */}
              <tr className="table-light">
                <td colSpan={vehiclesWithLoans.length + 1}><strong>Payment Details</strong></td>
              </tr>
              <tr>
                <td>Monthly Payment (Principal + Interest)</td>
                {vehiclesWithLoans.map(item => (
                  <td key={`monthly-payment-${item.vehicle!.id}`}>
                    {formatCurrency(item.calculation!.monthlyPayment)}
                  </td>
                ))}
              </tr>
              <tr>
                <td>Total Monthly Payment (incl. Fee)</td>
                {vehiclesWithLoans.map(item => (
                  <td key={`total-monthly-${item.vehicle!.id}`}>
                    <strong>{formatCurrency(item.calculation!.monthlyPayment + (item.vehicle!.loanMonthlyFee || 0))}</strong>
                  </td>
                ))}
              </tr>

              {/* Total Cost Section */}
              <tr className="table-light">
                <td colSpan={vehiclesWithLoans.length + 1}><strong>Total Cost</strong></td>
              </tr>
              <tr>
                <td>Total Loan Expenses (Interest + Fees)</td>
                {vehiclesWithLoans.map(item => (
                  <td key={`total-interest-${item.vehicle!.id}`}>
                    {formatCurrency(item.calculation!.totalInterest)}
                  </td>
                ))}
              </tr>
              <tr className="table-info">
                <td><strong>Total Repayment</strong></td>
                {vehiclesWithLoans.map(item => (
                  <td key={`total-repayment-${item.vehicle!.id}`}>
                    <strong>{formatCurrency(item.calculation!.totalPayment)}</strong>
                  </td>
                ))}
              </tr>
              <tr>
                <td>Difference from Loan Amount</td>
                {vehiclesWithLoans.map(item => (
                  <td key={`difference-${item.vehicle!.id}`}>
                    {formatCurrency(item.calculation!.totalPayment - item.vehicle!.loanAmount)}
                    <br />
                    <small className="text-muted">
                      ({((item.calculation!.totalPayment / item.vehicle!.loanAmount - 1) * 100).toFixed(1)}%)
                    </small>
                  </td>
                ))}
              </tr>
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LoanComparisonTable; 