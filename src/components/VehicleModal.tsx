import { useState, useEffect, FormEvent } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { Vehicle, LoanDetails } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { calculateLoan } from '../utils/loanCalculator';

interface VehicleModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (vehicle: Vehicle) => void;
  initialVehicle?: Vehicle;
  title: string;
}

const defaultVehicle: Vehicle = {
  id: '',
  name: '',
  purchasePrice: 0,
  fuelType: 'gasoline',
  fuelEfficiency: 0,
  annualMaintenance: 0,
  annualInsurance: 0,
  annualTax: 0,
  ownershipPeriod: 5,
  paymentMethod: 'cash',
  cashPayment: 0,
  loanAmount: 0
};

const VehicleModal: React.FC<VehicleModalProps> = ({ 
  show, 
  onHide, 
  onSave, 
  initialVehicle, 
  title 
}) => {
  const [vehicle, setVehicle] = useState<Vehicle>({ ...defaultVehicle, id: uuidv4() });
  const [loanInterestRate, setLoanInterestRate] = useState<number>(3.5);
  const [loanMonthlyFee, setLoanMonthlyFee] = useState<number>(0);
  const [loanStartFee, setLoanStartFee] = useState<number>(200);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(36);
  const [leaseMonthlyPayment, setLeaseMonthlyPayment] = useState<number>(0);
  const [leaseTermMonths, setLeaseTermMonths] = useState<number>(36);

  useEffect(() => {
    if (initialVehicle) {
      setVehicle(initialVehicle);
      
      // Initialize loan details from the vehicle being edited
      if (initialVehicle.loanInterestRate !== undefined) {
        setLoanInterestRate(initialVehicle.loanInterestRate);
      } else {
        setLoanInterestRate(3.5); // Default value
      }
      
      if (initialVehicle.loanMonthlyFee !== undefined) {
        setLoanMonthlyFee(initialVehicle.loanMonthlyFee);
      } else {
        setLoanMonthlyFee(0); // Default value
      }
      
      if (initialVehicle.loanStartFee !== undefined) {
        setLoanStartFee(initialVehicle.loanStartFee);
      } else {
        setLoanStartFee(200); // Default value
      }

      if (initialVehicle.loanTermMonths !== undefined) {
        setLoanTermMonths(initialVehicle.loanTermMonths);
      } else {
        setLoanTermMonths(36); // Default value
      }

      // Initialize lease details from the vehicle being edited
      if (initialVehicle.leaseMonthlyPayment !== undefined) {
        setLeaseMonthlyPayment(initialVehicle.leaseMonthlyPayment);
      } else {
        setLeaseMonthlyPayment(0); // Default value
      }

      if (initialVehicle.leaseTermMonths !== undefined) {
        setLeaseTermMonths(initialVehicle.leaseTermMonths);
      } else {
        setLeaseTermMonths(36); // Default value
      }
    } else {
      setVehicle({ ...defaultVehicle, id: uuidv4() });
      // Reset to default values when adding a new vehicle
      setLoanInterestRate(3.5);
      setLoanMonthlyFee(0);
      setLoanStartFee(200);
      setLoanTermMonths(36);
      setLeaseMonthlyPayment(0);
      setLeaseTermMonths(36);
    }
  }, [initialVehicle, show]);

  // Update loan amount when purchase price or cash payment changes
  useEffect(() => {
    if (vehicle.paymentMethod === 'loan') {
      const loanAmount = Math.max(0, vehicle.purchasePrice - vehicle.cashPayment);
      setVehicle(prev => ({
        ...prev,
        loanAmount
      }));
    }
  }, [vehicle.purchasePrice, vehicle.cashPayment, vehicle.paymentMethod]);

  // Update lease term months when ownership period changes
  useEffect(() => {
    if (vehicle.paymentMethod === 'lease') {
      // Set lease term to match ownership period in months
      const leaseTermMonths = vehicle.ownershipPeriod * 12;
      setLeaseTermMonths(leaseTermMonths);
    }
  }, [vehicle.ownershipPeriod, vehicle.paymentMethod]);

  // @ts-ignore - Using any type for form event handling
  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    
    if (name === 'paymentMethod') {
      // When switching payment method
      setVehicle(prev => ({
        ...prev,
        paymentMethod: value as 'cash' | 'loan' | 'lease',
        // Reset values based on new payment method
        cashPayment: value === 'cash' ? prev.purchasePrice : 0,
        loanAmount: value === 'loan' ? prev.purchasePrice : 0,
        // If switching to lease, set purchase price to 0
        purchasePrice: value === 'lease' ? 0 : prev.purchasePrice
      }));
      
      // If switching to lease, update lease term months based on ownership period
      if (value === 'lease') {
        setLeaseTermMonths(vehicle.ownershipPeriod * 12);
      }
    } else {
      setVehicle(prev => ({
        ...prev,
        [name]: name === 'name' || name === 'fuelType' || name === 'paymentMethod' 
          ? value 
          : Number(value)
      }));
    }
  };

  const handleLoanDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    
    switch(name) {
      case 'loanInterestRate':
        setLoanInterestRate(numValue);
        break;
      case 'loanMonthlyFee':
        setLoanMonthlyFee(numValue);
        break;
      case 'loanStartFee':
        setLoanStartFee(numValue);
        break;
      case 'loanTermMonths':
        setLoanTermMonths(numValue);
        break;
    }
  };

  const handleLeaseDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    
    switch(name) {
      case 'leaseMonthlyPayment':
        setLeaseMonthlyPayment(numValue);
        break;
      case 'leaseTermMonths':
        setLeaseTermMonths(numValue);
        break;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Create a copy of the vehicle with updated payment details
    const updatedVehicle = { ...vehicle };
    
    if (updatedVehicle.paymentMethod === 'loan') {
      // Add loan details to the vehicle object
      updatedVehicle.loanInterestRate = loanInterestRate;
      updatedVehicle.loanMonthlyFee = loanMonthlyFee;
      updatedVehicle.loanStartFee = loanStartFee;
      updatedVehicle.loanTermMonths = loanTermMonths;
      
      // Create loan details for calculation
      const loanDetails: LoanDetails = {
        loanAmount: updatedVehicle.loanAmount,
        interestRate: loanInterestRate,
        loanTermMonths: loanTermMonths,
        monthlyPayment: 0, // Will be calculated
        monthlyFee: loanMonthlyFee,
        startFee: loanStartFee
      };
      
      // Calculate loan to get monthly payment
      const loanCalculation = calculateLoan(loanDetails);
      
      // Update loan details with calculated monthly payment
      loanDetails.monthlyPayment = loanCalculation.monthlyPayment;
      
      // Clear lease details
      updatedVehicle.leaseMonthlyPayment = undefined;
      updatedVehicle.leaseTermMonths = undefined;
    } else if (updatedVehicle.paymentMethod === 'lease') {
      // Add lease details to the vehicle object
      updatedVehicle.leaseMonthlyPayment = leaseMonthlyPayment;
      updatedVehicle.leaseTermMonths = leaseTermMonths;
      
      // Clear loan details
      updatedVehicle.loanInterestRate = undefined;
      updatedVehicle.loanMonthlyFee = undefined;
      updatedVehicle.loanStartFee = undefined;
      updatedVehicle.loanTermMonths = undefined;
      updatedVehicle.loanAmount = 0;
      updatedVehicle.cashPayment = 0;
    } else {
      // Clear loan and lease details if using cash payment
      updatedVehicle.loanInterestRate = undefined;
      updatedVehicle.loanMonthlyFee = undefined;
      updatedVehicle.loanStartFee = undefined;
      updatedVehicle.loanTermMonths = undefined;
      updatedVehicle.leaseMonthlyPayment = undefined;
      updatedVehicle.leaseTermMonths = undefined;
    }
    
    onSave(updatedVehicle);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h5>Vehicle Information</h5>
            <hr />
            <Form.Group className="mb-3">
              <Form.Label>Vehicle Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={vehicle.name}
                onChange={handleChange}
                placeholder="e.g., Toyota Corolla 2023"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fuel Type</Form.Label>
                  <Form.Select 
                    name="fuelType" 
                    value={vehicle.fuelType} 
                    onChange={handleChange}
                    required
                  >
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {vehicle.fuelType === 'electric' 
                      ? 'Energy Consumption (kWh/100km)' 
                      : 'Fuel Consumption (L/100km)'}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="fuelEfficiency"
                    value={vehicle.fuelEfficiency}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Annual Maintenance (€)</Form.Label>
                  <Form.Control
                    type="number"
                    name="annualMaintenance"
                    value={vehicle.annualMaintenance}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Annual Insurance (€)</Form.Label>
                  <Form.Control
                    type="number"
                    name="annualInsurance"
                    value={vehicle.annualInsurance}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Annual Tax (€)</Form.Label>
                  <Form.Control
                    type="number"
                    name="annualTax"
                    value={vehicle.annualTax}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ownership Period (years)</Form.Label>
                  <Form.Control
                    type="number"
                    name="ownershipPeriod"
                    value={vehicle.ownershipPeriod}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Residual Value</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.paymentMethod === 'lease' ? 'Not applicable for leasing' : 'Calculated as 10% depreciation per year'}
                    disabled
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    {vehicle.paymentMethod === 'lease' 
                      ? 'No residual value in leasing - you return the vehicle at the end of the lease term' 
                      : 'Vehicle value decreases by 10% each year from the previous year\'s value'}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="mb-3">
            <h5>Payment Information</h5>
            <hr />
            <Row>
              {vehicle.paymentMethod !== 'lease' && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Purchase Price (€)</Form.Label>
                    <Form.Control
                      type="number"
                      name="purchasePrice"
                      value={vehicle.purchasePrice}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </Form.Group>
                </Col>
              )}
              <Col md={vehicle.paymentMethod !== 'lease' ? 6 : 12}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select 
                    name="paymentMethod" 
                    value={vehicle.paymentMethod} 
                    onChange={handleChange}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="loan">Loan</option>
                    <option value="lease">Lease</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {vehicle.paymentMethod === 'loan' && (
              <>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Cash Payment (Down Payment) (€)</Form.Label>
                      <Form.Control
                        type="number"
                        name="cashPayment"
                        value={vehicle.cashPayment}
                        onChange={handleChange}
                        min="0"
                        max={vehicle.purchasePrice}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Loan Amount (€)</Form.Label>
                      <Form.Control
                        type="number"
                        value={vehicle.loanAmount}
                        readOnly
                        disabled
                      />
                      <Form.Text className="text-muted">
                        Automatically calculated as Purchase Price - Cash Payment
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Interest Rate (%)</Form.Label>
                      <Form.Control
                        type="number"
                        name="loanInterestRate"
                        value={loanInterestRate}
                        onChange={handleLoanDetailChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Monthly Fee (€)</Form.Label>
                      <Form.Control
                        type="number"
                        name="loanMonthlyFee"
                        value={loanMonthlyFee}
                        onChange={handleLoanDetailChange}
                        min="0"
                        step="0.1"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Fee (€)</Form.Label>
                      <Form.Control
                        type="number"
                        name="loanStartFee"
                        value={loanStartFee}
                        onChange={handleLoanDetailChange}
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Loan Term (months)</Form.Label>
                      <Form.Control
                        type="number"
                        name="loanTermMonths"
                        value={loanTermMonths}
                        onChange={handleLoanDetailChange}
                        min="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}

            {vehicle.paymentMethod === 'lease' && (
              <>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Monthly Payment (€)</Form.Label>
                      <Form.Control
                        type="number"
                        name="leaseMonthlyPayment"
                        value={leaseMonthlyPayment}
                        onChange={handleLeaseDetailChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Lease Term (months)</Form.Label>
                      <Form.Control
                        type="text"
                        value={`${leaseTermMonths} (based on ownership period)`}
                        readOnly
                        disabled
                      />
                      <Form.Text className="text-muted">
                        Lease term is automatically set to match the ownership period
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Vehicle
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default VehicleModal; 