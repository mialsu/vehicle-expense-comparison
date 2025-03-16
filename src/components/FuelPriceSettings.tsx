import { useState, ChangeEvent, useEffect } from 'react';
import { Form, Card, Row, Col } from 'react-bootstrap';
import { FuelPrices } from '../types';

interface FuelPriceSettingsProps {
  fuelPrices: FuelPrices;
  onFuelPricesChange: (prices: FuelPrices) => void;
}

const FuelPriceSettings: React.FC<FuelPriceSettingsProps> = ({ fuelPrices, onFuelPricesChange }) => {
  const [prices, setPrices] = useState<FuelPrices>(fuelPrices);

  // Update local state when props change
  useEffect(() => {
    setPrices(fuelPrices);
  }, [fuelPrices]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newPrices = {
      ...prices,
      [name]: Number(value)
    };
    setPrices(newPrices);
    onFuelPricesChange(newPrices); // Update parent state immediately
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