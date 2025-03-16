import { useState } from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Vehicle, ExpenseCalculation } from '../types';
import VehicleModal from './VehicleModal';
import { formatCurrency } from '../utils/formatters';

interface VehicleListProps {
  vehicles: (Vehicle | null)[];
  calculations: (ExpenseCalculation | null)[];
  onAddVehicle: (vehicle: Vehicle) => void;
  onEditVehicle: (index: number, vehicle: Vehicle) => void;
  onRemoveVehicle: (index: number) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  calculations,
  onAddVehicle,
  onEditVehicle,
  onRemoveVehicle
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);

  const handleAddVehicle = () => {
    setEditingIndex(null);
    setEditingVehicle(undefined);
    setShowModal(true);
  };

  const handleEditVehicle = (index: number) => {
    if (vehicles[index]) {
      setEditingIndex(index);
      setEditingVehicle(vehicles[index] as Vehicle);
      setShowModal(true);
    }
  };

  const handleSaveVehicle = (vehicle: Vehicle) => {
    if (editingIndex !== null) {
      onEditVehicle(editingIndex, vehicle);
    } else {
      onAddVehicle(vehicle);
    }
    setShowModal(false);
  };

  const handleRemoveVehicle = (index: number) => {
    onRemoveVehicle(index);
  };

  // Get badge color based on payment method
  const getPaymentBadgeColor = (paymentMethod: string) => {
    switch(paymentMethod) {
      case 'cash': return 'tertiary';
      case 'loan': return 'secondary';
      case 'lease': return 'primary';
      default: return 'secondary';
    }
  };

  // Count non-null vehicles
  const vehicleCount = vehicles.filter(v => v !== null).length;
  const canAddMore = vehicleCount < 3;

  return (
    <>
      <Row className="mb-4">
        {vehicles.map((vehicle, index) => 
          vehicle && (
            <Col key={vehicle.id} md={4} className="mb-3">
              <Card className="vehicle-card position-relative">
                {/* Edit button positioned to overlap the top left border */}
                <div className="position-absolute top-0 start-0" style={{ transform: 'translateY(-50%) translateX(-20%)' }}>
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                    style={{ width: '38px', height: '38px' }}
                    onClick={() => handleEditVehicle(index)}
                    title="Edit vehicle"
                  >
                    <i className="bi bi-pencil-fill" style={{ color: '#0d3b66' }}></i>
                  </Button>
                </div>
                
                {/* Delete button positioned to overlap the top right border */}
                <div className="position-absolute top-0 end-0" style={{ transform: 'translateY(-50%) translateX(20%)' }}>
                  <Button 
                    variant="light" 
                    size="sm"
                    className="rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                    style={{ width: '38px', height: '38px' }}
                    onClick={() => handleRemoveVehicle(index)}
                    title="Remove vehicle"
                  >
                    <i className="bi bi-trash-fill text-danger"></i>
                  </Button>
                </div>
                
                <Card.Header>
                  <div className="text-center">
                    <h5 className="mb-0">{vehicle.name}</h5>
                    <Badge bg={getPaymentBadgeColor(vehicle.paymentMethod)} text="dark">
                      {vehicle.paymentMethod.charAt(0).toUpperCase() + vehicle.paymentMethod.slice(1)}
                    </Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  {vehicle.paymentMethod !== 'lease' && (
                    <p><strong>Purchase Price:</strong> {formatCurrency(vehicle.purchasePrice)}</p>
                  )}
                  
                  {vehicle.paymentMethod === 'lease' && (
                    <>
                      <p><strong>Monthly Lease:</strong> {formatCurrency(vehicle.leaseMonthlyPayment || 0)}</p>
                      <p><strong>Lease Term:</strong> {vehicle.leaseTermMonths || 36} months</p>
                    </>
                  )}
                  
                  <p>
                    <strong>Fuel:</strong> {vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)}, {' '}
                    {vehicle.fuelType === 'electric' 
                      ? `${vehicle.fuelEfficiency} kWh/100km` 
                      : `${vehicle.fuelEfficiency} L/100km`}
                  </p>
                  
                  <p><strong>Ownership Period:</strong> {vehicle.ownershipPeriod} years</p>
                  
                  {calculations[index] && (
                    <>
                      <hr />
                      <p><strong>Total Cost:</strong> {formatCurrency(calculations[index]!.totalCost)}</p>
                      <p><strong>Net Cost:</strong> {formatCurrency(calculations[index]!.netCost)}</p>
                      <p><strong>Monthly Cost:</strong> {formatCurrency(calculations[index]!.costPerMonth)}</p>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Col>
          )
        )}

        {canAddMore && (
          <Col md={4} className="mb-3">
            <Card className="h-100 d-flex justify-content-center align-items-center add-vehicle-card">
              <Button 
                className="add-vehicle-btn p-3"
                onClick={handleAddVehicle}
              >
                <i className="bi bi-plus-lg"></i> Add Vehicle
              </Button>
            </Card>
          </Col>
        )}
      </Row>

      <VehicleModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSaveVehicle}
        initialVehicle={editingVehicle}
        title={editingIndex !== null ? 'Edit Vehicle' : 'Add Vehicle'}
      />
    </>
  );
};

export default VehicleList; 