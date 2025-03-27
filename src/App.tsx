import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Tabs, Tab } from 'react-bootstrap';

import VehicleList from './components/VehicleList';
import ExpenseResults from './components/ExpenseResults';
import ComparisonChart from './components/ComparisonChart';
import FuelPriceSettings from './components/FuelPriceSettings';
import LoanComparisonTable from './components/LoanComparisonTable';
import ExpenseCharts from './components/ExpenseCharts';
import ExportButtons from './components/ExportButtons';

import { Vehicle, FuelPrices, ExpenseCalculation, LoanDetails, LoanCalculation } from './types';
import { calculateVehicleExpenses } from './utils/expenseCalculator';
import { calculateLoan } from './utils/loanCalculator';

const defaultFuelPrices: FuelPrices = {
  gasoline: 1.8,
  diesel: 1.8,
  electricity: 0.15
};

function App() {
  const [vehicles, setVehicles] = useState<(Vehicle | null)[]>([null, null, null, null, null]);
  const [fuelPrices, setFuelPrices] = useState<FuelPrices>(defaultFuelPrices);
  const [annualDistance, setAnnualDistance] = useState<number>(15000);
  const [calculations, setCalculations] = useState<(ExpenseCalculation | null)[]>([null, null, null, null, null]);
  const [loanCalculations, setLoanCalculations] = useState<(LoanCalculation | null)[]>([null, null, null, null, null]);

  // Calculate expenses whenever vehicles, fuel prices, or annual distance changes
  useEffect(() => {
    const newCalculations = [...calculations];
    const newLoanCalculations = [...loanCalculations];

    vehicles.forEach((vehicle, index) => {
      if (vehicle) {
        // Calculate loan if applicable
        if (vehicle.paymentMethod === 'loan' && vehicle.loanAmount > 0) {
          const loanDetails: LoanDetails = {
            loanAmount: vehicle.loanAmount,
            interestRate: vehicle.loanInterestRate || 0,
            loanTermMonths: vehicle.loanTermMonths || (vehicle.ownershipPeriod * 12), // Use specific loan term or default to ownership period
            monthlyPayment: 0, // Will be calculated
            monthlyFee: vehicle.loanMonthlyFee || 0,
            startFee: vehicle.loanStartFee || 0
          };
          
          newLoanCalculations[index] = calculateLoan(loanDetails);
        } else {
          newLoanCalculations[index] = null;
        }
        
        // Calculate vehicle expenses (passing loan calculation if available)
        newCalculations[index] = calculateVehicleExpenses(
          vehicle, 
          fuelPrices, 
          annualDistance,
          newLoanCalculations[index]
        );
      } else {
        newCalculations[index] = null;
        newLoanCalculations[index] = null;
      }
    });

    setCalculations(newCalculations);
    setLoanCalculations(newLoanCalculations);
  }, [vehicles, fuelPrices, annualDistance]);

  const handleAddVehicle = (vehicle: Vehicle) => {
    const index = vehicles.findIndex(v => v === null);
    if (index !== -1) {
      const newVehicles = [...vehicles];
      newVehicles[index] = vehicle;
      setVehicles(newVehicles);
    }
  };

  const handleEditVehicle = (index: number, vehicle: Vehicle) => {
    const newVehicles = [...vehicles];
    newVehicles[index] = vehicle;
    setVehicles(newVehicles);
  };

  const handleRemoveVehicle = (index: number) => {
    const newVehicles = [...vehicles];
    newVehicles[index] = null;
    setVehicles(newVehicles);
  };

  // Filter out null vehicles and calculations for display
  const validVehicles = vehicles.filter((v): v is Vehicle => v !== null);
  const validCalculations = calculations.filter((c): c is ExpenseCalculation => c !== null);
  
  // For charts, we need to ensure the arrays match up
  const chartVehicles = validVehicles.filter((_, i) => validCalculations[i] !== undefined);
  const chartCalculations = validCalculations.filter((_, i) => validVehicles[i] !== undefined);

  // Count non-null vehicles
  const vehicleCount = vehicles.filter(v => v !== null).length;

  return (
    <>
      <header className="py-3 mb-4 app-header" >
        <Container>
          <div className="d-flex flex-wrap justify-content-center">
            <span className="d-flex align-items-center mb-md-0 me-md-auto text-white fs-4">
              <i className="bi bi-car-front me-2 text-primary-dark"></i>
              <span className="fw-bold text-primary-dark">Vehicle Expense Comparison</span>
            </span>
          </div>
        </Container>
      </header>

      <Container className="py-4 mb-4 text-center">
        <Row>
          <p>
            Have you ever wondered which vehicle is the most economical and had the pain to compare the expenses of different vehicles and payment methods?
          </p>
          <p>
            Just add the vehicles you are interested in and compare them. You can also add a loan to the vehicles and compare the expenses with and without a loan or lease.
          </p>
        </Row>
      </Container>
      
      <Container className="py-4 mb-4">
        <Row className="mb-4">
          <Col md={6}>
            <FuelPriceSettings 
              fuelPrices={fuelPrices}
              onFuelPricesChange={setFuelPrices}
            />
          </Col>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header as="h5" className="text-primary-dark">Annual Distance</Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <label htmlFor="annualDistance" className="form-label">Annual Distance (km)</label>
                  <input
                    type="range"
                    className="form-range"
                    id="annualDistance"
                    min="5000"
                    max="50000"
                    step="1000"
                    value={annualDistance}
                    onChange={(e) => setAnnualDistance(Number(e.target.value))}
                  />
                  <div className="d-flex justify-content-between">
                    <span>5,000 km</span>
                    <span className="fw-bold">{annualDistance.toLocaleString()} km</span>
                    <span>50,000 km</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <VehicleList 
              vehicles={vehicles}
              calculations={calculations}
              onAddVehicle={handleAddVehicle}
              onEditVehicle={handleEditVehicle}
              onRemoveVehicle={handleRemoveVehicle}
            />
          </Col>
        </Row>

        {vehicleCount === 0 ? (
          <Alert variant="info">
            Please add at least one vehicle to see expense calculations.
          </Alert>
        ) : vehicleCount === 1 ? (
          validVehicles[0] && validCalculations[0] && (
            <>
              <ExpenseResults 
                vehicleName={validVehicles[0].name} 
                calculation={validCalculations[0]} 
              />
              {validVehicles[0].paymentMethod === 'loan' && (
                <LoanComparisonTable
                  vehicles={vehicles}
                  loanCalculations={loanCalculations}
                />
              )}
            </>
          )
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3>Comparison</h3>
              <ExportButtons 
                vehicles={validVehicles}
                calculations={validCalculations}
              />
            </div>
            
            <Tabs defaultActiveKey="table" id="comparison-tabs" className="mb-3">
              <Tab eventKey="table" title="Comparison Table">
                <ComparisonChart 
                  vehicle1Name={validVehicles[0]?.name || ''}
                  vehicle2Name={validVehicles[1]?.name || ''}
                  vehicle3Name={validVehicles.length > 2 ? validVehicles[2]?.name : undefined}
                  vehicle4Name={validVehicles.length > 3 ? validVehicles[3]?.name : undefined}
                  vehicle5Name={validVehicles.length > 4 ? validVehicles[4]?.name : undefined}
                  calculation1={validCalculations[0] || {} as ExpenseCalculation}
                  calculation2={validCalculations[1] || {} as ExpenseCalculation}
                  calculation3={validVehicles.length > 2 && validCalculations[2] ? validCalculations[2] : undefined}
                  calculation4={validVehicles.length > 3 && validCalculations[3] ? validCalculations[3] : undefined}
                  calculation5={validVehicles.length > 4 && validCalculations[4] ? validCalculations[4] : undefined}
                  ownershipPeriod1={validVehicles[0]?.ownershipPeriod || 0}
                  ownershipPeriod2={validVehicles[1]?.ownershipPeriod || 0}
                  ownershipPeriod3={validVehicles.length > 2 ? validVehicles[2]?.ownershipPeriod : undefined}
                  ownershipPeriod4={validVehicles.length > 3 ? validVehicles[3]?.ownershipPeriod : undefined}
                  ownershipPeriod5={validVehicles.length > 4 ? validVehicles[4]?.ownershipPeriod : undefined}
                />
              </Tab>
              <Tab eventKey="charts" title="Expense Charts">
                <ExpenseCharts 
                  vehicles={chartVehicles}
                  calculations={chartCalculations}
                />
              </Tab>
            </Tabs>
            
            {/* Show loan comparison table if any vehicle has a loan payment method */}
            {validVehicles.some(v => v.paymentMethod === 'loan') && (
              <LoanComparisonTable
                vehicles={vehicles}
                loanCalculations={loanCalculations}
              />
            )}
          </>
        )}
      </Container>
    </>
  );
}

export default App;
