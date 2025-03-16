import { useState, ChangeEvent, useEffect } from 'react';
import { Form, Card, Row, Col } from 'react-bootstrap';
import { FuelPrices } from '../types';

interface FuelPriceSettingsProps {
  fuelPrices: FuelPrices;
  onFuelPricesChange: (prices: FuelPrices) => void;
}

// Extended type to allow empty string values during editing
interface EditableFuelPrices {
  gasoline: number | string;
  diesel: number | string;
  electricity: number | string;
}

const FuelPriceSettings: React.FC<FuelPriceSettingsProps> = ({ fuelPrices, onFuelPricesChange }) => {
  const [prices, setPrices] = useState<EditableFuelPrices>({
    gasoline: fuelPrices.gasoline,
    diesel: fuelPrices.diesel,
    electricity: fuelPrices.electricity
  });

  // Update local state when props change
  useEffect(() => {
    setPrices({
      gasoline: fuelPrices.gasoline,
      diesel: fuelPrices.diesel,
      electricity: fuelPrices.electricity
    });
  }, [fuelPrices]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Allow empty string during editing
    const newValue = value === '' ? '' : Number(value);
    
    const newPrices = {
      ...prices,
      [name]: newValue
    };
    
    setPrices(newPrices);
    
    // Convert empty strings to 0 before updating parent state
    const validPrices: FuelPrices = {
      gasoline: typeof newPrices.gasoline === 'string' ? 0 : newPrices.gasoline,
      diesel: typeof newPrices.diesel === 'string' ? 0 : newPrices.diesel,
      electricity: typeof newPrices.electricity === 'string' ? 0 : newPrices.electricity
    };
    
    onFuelPricesChange(validPrices); // Update parent state immediately
  };

  return (
    <Card className="mb-4">
      <Card.Header as="h5" className="text-primary-dark">Fuel Price Settings</Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Gasoline (€/L)</Form.Label>
                <Form.Control
                  type="number"
                  name="gasoline"
                  value={prices.gasoline}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Diesel oil (€/L)</Form.Label>
                <Form.Control
                  type="number"
                  name="diesel"
                  value={prices.diesel}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Electricity (€/kWh)</Form.Label>
                <Form.Control
                  type="number"
                  name="electricity"
                  value={prices.electricity}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FuelPriceSettings; 