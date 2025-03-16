export interface Vehicle {
  id: string;
  name: string;
  purchasePrice: number;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  fuelEfficiency: number; // L/100km for gas/diesel, kWh/100km for electric
  annualMaintenance: number;
  annualInsurance: number;
  annualTax: number;
  ownershipPeriod: number; // years
  paymentMethod: 'cash' | 'loan' | 'lease';
  cashPayment: number; // Amount paid in cash (if any)
  loanAmount: number; // Amount financed through loan (if any)
  loanTermMonths?: number; // Loan repayment period in months
  loanInterestRate?: number; // Annual interest rate in percentage
  loanMonthlyFee?: number; // Monthly fee for loan
  loanStartFee?: number; // Start fee for loan
  leaseMonthlyPayment?: number; // Monthly lease payment
  leaseTermMonths?: number; // Lease term in months
}

export interface ExpenseCalculation {
  totalCost: number;
  purchaseCost: number;
  fuelCost: number;
  maintenanceCost: number;
  insuranceCost: number;
  taxCost: number;
  residualValue: number;
  netCost: number;
  costPerYear: number;
  costPerMonth: number;
  financingCost?: number; // Optional financing cost if using a loan or lease
}

export interface FuelPrices {
  gasoline: number; // per liter
  diesel: number; // per liter
  electricity: number; // per kWh
}

export interface LoanDetails {
  loanAmount: number;
  interestRate: number; // Annual interest rate in percentage
  loanTermMonths: number;
  monthlyPayment: number;
  monthlyFee: number;
  startFee: number;
}

export interface LoanCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  effectiveInterestRate: number; // Annual percentage rate (APR)
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    monthlyFee?: number;
    remainingBalance: number;
  }>;
} 