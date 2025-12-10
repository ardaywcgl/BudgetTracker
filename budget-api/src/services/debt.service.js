// src/services/debt.service.js

// Sabit taksitli kredi (loan) simülasyonu
function simulateLoan({ principal, interestRate, termMonths }) {
  const r = interestRate; // aylık faiz (ör: 0.03)
  const n = termMonths;

  if (r <= 0 || n <= 0) {
    return {
      monthlyPayment: principal / n,
      totalPaid: principal,
      totalInterest: 0,
    };
  }

  const monthlyPayment =
    (principal * r * Math.pow(1 + r, n)) /
    (Math.pow(1 + r, n) - 1);

  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - principal;

  return {
    monthlyPayment,
    totalPaid,
    totalInterest,
  };
}

// Kredi kartı borcu simülasyonu (her ay sabit ödeme yaparsa)
function simulateCreditCard({ balance, monthlyInterestRate, monthlyPayment, maxMonths = 120 }) {
  let month = 0;
  let currentBalance = balance;
  let totalPaid = 0;
  let totalInterest = 0;

  const history = [];

  while (currentBalance > 0 && month < maxMonths) {
    month++;

    const interest = currentBalance * monthlyInterestRate;
    totalInterest += interest;

    let payment = monthlyPayment;
    if (payment > currentBalance + interest) {
      payment = currentBalance + interest;
    }

    currentBalance = currentBalance + interest - payment;
    totalPaid += payment;

    history.push({
      month,
      interest,
      payment,
      remainingBalance: currentBalance,
    });

    if (currentBalance <= 0.01) {
      currentBalance = 0;
      break;
    }
  }

  return {
    months: month,
    totalPaid,
    totalInterest,
    remainingBalance: currentBalance,
    history,
  };
}

module.exports = {
  simulateLoan,
  simulateCreditCard,
};
