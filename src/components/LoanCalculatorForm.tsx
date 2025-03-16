import { useState, FormEvent } from 'react';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { LoanDetails } from '../types';

interface LoanCalculatorFormProps {
  onCalculate: (loanDetails: LoanDetails) => void;
  initialLoanDetails?: LoanDetails;
}

const defaultLoanDetails: LoanDetails = {
  loanAmount: 20000,
  interestRate: 3.5,
  loanTermMonths: 60,
  monthlyPayment: 0,
  monthlyFee: 0,
  startFee: 200
};

const LoanCalculatorForm: React.FC<LoanCalculatorFormProps> = ({ 
  onCalculate, 
  initialLoanDetails 
}) => {
  const [loanDetails, setLoanDetails] = useState<LoanDetails>(
    initialLoanDetails || defaultLoanDetails
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoanDetails(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onCalculate(loanDetails);
  };

  return (
    <Card className="mb-4">
      <Card.Header as="h5">Car Loan Calculator</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Loan Amount (€)</Form.Label>
                <Form.Control
                  type="number"
                  name="loanAmount"
                  value={loanDetails.loanAmount}
                  onChange={handleChange}
                  min="1000"
                  step="1000"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Annual Interest Rate (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="interestRate"
                  value={loanDetails.interestRate}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Loan Term (months)</Form.Label>
                <Form.Control
                  type="number"
                  name="loanTermMonths"
                  value={loanDetails.loanTermMonths}
                  onChange={handleChange}
                  min="1"
                  max="360"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Monthly Fee (€)</Form.Label>
                <Form.Control
                  type="number"
                  name="monthlyFee"
                  value={loanDetails.monthlyFee}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Start Fee (€)</Form.Label>
                <Form.Control
                  type="number"
                  name="startFee"
                  value={loanDetails.startFee}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" type="submit">
            Calculate Loan
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default LoanCalculatorForm; 