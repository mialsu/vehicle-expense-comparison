import { Vehicle, ExpenseCalculation, FuelPrices, LoanCalculation } from '../types';

// Annual distance in kilometers
const DEFAULT_ANNUAL_DISTANCE = 15000;

export const calculateVehicleExpenses = (
  vehicle: Vehicle, 
  fuelPrices: FuelPrices,
  annualDistance: number = DEFAULT_ANNUAL_DISTANCE,
  loanCalculation: LoanCalculation | null = null
): ExpenseCalculation => {
  // Calculate fuel cost based on fuel type
  let annualFuelCost = 0;
  
  if (vehicle.fuelType === 'gasoline') {
    // L/100km * km/year * price/L / 100
    annualFuelCost = (vehicle.fuelEfficiency * annualDistance * fuelPrices.gasoline) / 100;
  } else if (vehicle.fuelType === 'diesel') {
    annualFuelCost = (vehicle.fuelEfficiency * annualDistance * fuelPrices.diesel) / 100;
  } else if (vehicle.fuelType === 'electric') {
    annualFuelCost = (vehicle.fuelEfficiency * annualDistance * fuelPrices.electricity) / 100;
  } else if (vehicle.fuelType === 'hybrid') {
    // Simplified calculation for hybrid (assuming 70% gasoline, 30% electric)
    const gasolineCost = (vehicle.fuelEfficiency * 0.7 * annualDistance * fuelPrices.gasoline) / 100;
    const electricCost = (vehicle.fuelEfficiency * 0.3 * annualDistance * fuelPrices.electricity) / 100;
    annualFuelCost = gasolineCost + electricCost;
  }

  // Calculate total costs over ownership period
  const totalFuelCost = annualFuelCost * vehicle.ownershipPeriod;
  const totalMaintenanceCost = vehicle.annualMaintenance * vehicle.ownershipPeriod;
  const totalInsuranceCost = vehicle.annualInsurance * vehicle.ownershipPeriod;
  const totalTaxCost = vehicle.annualTax * vehicle.ownershipPeriod;
  
  // Calculate residual value based on payment method
  let residualValue = 0;
  if (vehicle.paymentMethod !== 'lease') {
    // For cash or loan, calculate residual value with 10% annual depreciation
    residualValue = vehicle.purchasePrice;
    for (let year = 0; year < vehicle.ownershipPeriod; year++) {
      residualValue = residualValue * 0.9; // 10% depreciation each year
    }
  }
  // For lease, residual value is 0 (you don't own the vehicle)
  
  // Calculate financing cost based on payment method
  let financingCost = 0;
  let purchaseCost = vehicle.purchasePrice;
  
  if (vehicle.paymentMethod === 'loan' && loanCalculation) {
    // For loan, use the loan calculation's total interest
    financingCost = loanCalculation.totalInterest;
  } else if (vehicle.paymentMethod === 'lease') {
    // For lease, calculate total lease payments over the ownership period
    const leaseMonthlyPayment = vehicle.leaseMonthlyPayment || 0;
    
    // Calculate total months in the ownership period
    const ownershipMonths = vehicle.ownershipPeriod * 12;
    
    // Calculate total lease payments
    const totalLeasePayments = leaseMonthlyPayment * ownershipMonths;
    
    // For lease, the purchase cost is 0 (you don't buy the vehicle)
    // and the financing cost is the total lease payments
    purchaseCost = 0;
    financingCost = totalLeasePayments;
  }
  
  // Calculate total and net costs
  const totalCost = purchaseCost + totalFuelCost + totalMaintenanceCost + 
                    totalInsuranceCost + totalTaxCost + financingCost;
  const netCost = totalCost - residualValue;
  
  return {
    totalCost,
    purchaseCost,
    fuelCost: totalFuelCost,
    maintenanceCost: totalMaintenanceCost,
    insuranceCost: totalInsuranceCost,
    taxCost: totalTaxCost,
    residualValue,
    netCost,
    costPerYear: netCost / vehicle.ownershipPeriod,
    costPerMonth: netCost / (vehicle.ownershipPeriod * 12),
    financingCost: financingCost > 0 ? financingCost : undefined
  };
}; 