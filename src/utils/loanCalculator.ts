import { LoanDetails, LoanCalculation } from '../types';

export const calculateLoan = (loanDetails: LoanDetails): LoanCalculation => {
  const { loanAmount, interestRate, loanTermMonths, startFee, monthlyFee } = loanDetails;
  
  // Calculate monthly interest rate (convert annual percentage to monthly decimal)
  const monthlyInterestRate = interestRate / 100 / 12;
  
  // Calculate the effective loan amount (actual amount received after deducting the start fee)
  const effectiveLoanAmount = loanAmount - startFee;
  
  // Calculate monthly payment using the loan formula (principal + interest only)
  // If interest rate is 0, simply divide the loan amount by the term
  let baseMonthlyPayment = 0;
  if (interestRate === 0) {
    baseMonthlyPayment = loanAmount / loanTermMonths;
  } else {
    baseMonthlyPayment = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths)) / 
                     (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);
  }
  
  // Total monthly payment including fees
  const totalMonthlyPayment = baseMonthlyPayment + monthlyFee;
  
  // Calculate total payment over the loan term (including all monthly payments and the start fee)
  const totalPayment = (totalMonthlyPayment * loanTermMonths) + startFee;
  
  // Calculate total interest paid (without fees)
  const baseInterest = (baseMonthlyPayment * loanTermMonths) - loanAmount;
  
  // Calculate total cost of fees
  const totalFees = startFee + (monthlyFee * loanTermMonths);
  
  // Calculate total interest including fees
  const totalInterest = baseInterest + totalFees;
  
  // Calculate effective interest rate (APR) using the method from the Python example
  // Function to calculate the APR equation (present value of payments minus effective loan amount)
  const aprFunction = (rate: number): number => {
    const monthlyRate = rate / 12;
    let presentValue = 0;
    
    // Sum of present values of all monthly payments
    for (let month = 1; month <= loanTermMonths; month++) {
      presentValue += totalMonthlyPayment / Math.pow(1 + monthlyRate, month);
    }
    
    // The equation should equal zero when we find the correct rate
    return presentValue - effectiveLoanAmount;
  };
  
  // Find the effective annual rate using Newton's method (similar to fsolve in Python)
  let currentRate = interestRate / 100; // Start with nominal rate as initial guess
  let iterations = 0;
  const maxIterations = 50;
  const tolerance = 0.0001;
  
  while (iterations < maxIterations) {
    const currentValue = aprFunction(currentRate);
    
    // If we're close enough to zero, we've found the rate
    if (Math.abs(currentValue) < tolerance) {
      break;
    }
    
    // Calculate derivative numerically for Newton's method
    const h = 0.0001;
    const derivative = (aprFunction(currentRate + h) - currentValue) / h;
    
    // Newton's method update
    const nextRate = currentRate - currentValue / derivative;
    
    // Check if we've converged
    if (Math.abs(nextRate - currentRate) < tolerance) {
      currentRate = nextRate;
      break;
    }
    
    currentRate = nextRate;
    iterations++;
  }
  
  // Convert to percentage
  const effectiveInterestRate = currentRate * 100;
  
  // Generate amortization schedule
  const amortizationSchedule = [];
  let remainingBalance = loanAmount;
  
  for (let month = 1; month <= loanTermMonths; month++) {
    // Calculate interest for this month
    const interestPayment = remainingBalance * monthlyInterestRate;
    
    // Calculate principal for this month
    const principalPayment = baseMonthlyPayment - interestPayment;
    
    // Update remaining balance
    remainingBalance -= principalPayment;
    
    // Add to schedule
    amortizationSchedule.push({
      month,
      payment: totalMonthlyPayment, // Include monthly fee in payment
      principal: principalPayment,
      interest: interestPayment,
      monthlyFee: monthlyFee,
      remainingBalance: Math.max(0, remainingBalance) // Ensure we don't go below 0 due to rounding
    });
  }
  
  return {
    monthlyPayment: totalMonthlyPayment,
    totalPayment,
    totalInterest,
    effectiveInterestRate,
    amortizationSchedule
  };
}; 