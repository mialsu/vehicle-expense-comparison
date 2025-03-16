import { Button, ButtonGroup } from 'react-bootstrap';
import { Vehicle, ExpenseCalculation } from '../types';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

interface ExportButtonsProps {
  vehicles: Vehicle[];
  calculations: ExpenseCalculation[];
  className?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ 
  vehicles, 
  calculations,
  className = ''
}) => {
  // Don't render if there are no vehicles or calculations
  if (vehicles.length === 0 || calculations.length === 0) {
    return null;
  }

  const handleExportToExcel = () => {
    exportToExcel(vehicles, calculations);
  };

  const handleExportToPDF = () => {
    exportToPDF(vehicles, calculations);
  };

  return (
    <ButtonGroup className={className}>
      <Button 
        variant="outline-primary" 
        onClick={handleExportToExcel}
        title="Export to Excel"
      >
        <i className="bi bi-file-earmark-excel me-2"></i>
        Excel
      </Button>
      <Button 
        variant="outline-primary" 
        onClick={handleExportToPDF}
        title="Export to PDF"
      >
        <i className="bi bi-file-earmark-pdf me-2"></i>
        PDF
      </Button>
    </ButtonGroup>
  );
};

export default ExportButtons; 