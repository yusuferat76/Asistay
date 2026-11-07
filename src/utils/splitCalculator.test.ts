import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSplitSummary } from './splitCalculator.ts';
import { ReceiptItem } from '../types/bill.ts';

test('calculateSplitSummary allocates individual and shared items with proportional tax & tip', () => {
  const items: ReceiptItem[] = [
    { id: '1', name: 'Nachos', price: 10.00, quantity: 1, assignedTo: ['Dhruv'] },
    { id: '2', name: 'Pizza', price: 20.00, quantity: 1, assignedTo: ['Sarah', 'Sue'] },
    { id: '3', name: 'Dessert', price: 10.00, quantity: 1, assignedTo: [] }, // unassigned
  ];

  const totalTax = 4.00; // 10% of $40 total items
  const totalTip = 8.00; // 20% of $40 total items
  const participants = ['Dhruv', 'Sarah', 'Sue'];

  const summary = calculateSplitSummary(items, totalTax, totalTip, participants);

  assert.equal(summary.totalSubtotal, 40.00);
  assert.equal(summary.assignedSubtotal, 30.00);
  assert.equal(summary.unassignedSubtotal, 10.00);
  assert.equal(summary.grandTotal, 52.00);

  // Dhruv: has $10 Nachos (25% of the total $40 bill)
  const dhruv = summary.participantsShares.find((p) => p.participantName === 'Dhruv')!;
  assert.equal(dhruv.subtotal, 10.00);
  assert.equal(dhruv.taxShare, 1.00); // 25% of $4
  assert.equal(dhruv.tipShare, 2.00); // 25% of $8
  assert.equal(dhruv.total, 13.00);

  // Sarah: has half of $20 Pizza = $10 (25% of total bill)
  const sarah = summary.participantsShares.find((p) => p.participantName === 'Sarah')!;
  assert.equal(sarah.subtotal, 10.00);
  assert.equal(sarah.taxShare, 1.00);
  assert.equal(sarah.tipShare, 2.00);
  assert.equal(sarah.total, 13.00);

  // Sue: has half of $20 Pizza = $10 (25% of total bill)
  const sue = summary.participantsShares.find((p) => p.participantName === 'Sue')!;
  assert.equal(sue.subtotal, 10.00);
  assert.equal(sue.taxShare, 1.00);
  assert.equal(sue.tipShare, 2.00);
  assert.equal(sue.total, 13.00);

  // Unassigned item ($10 = 25% of total bill):
  assert.equal(summary.unassignedTax, 1.00);
  assert.equal(summary.unassignedTip, 2.00);
  assert.equal(summary.unassignedTotal, 13.00);

  // Sum of individual totals + unassigned = grand total (13 + 13 + 13 + 13 = 52)
  const sumOfShares = dhruv.total + sarah.total + sue.total + summary.unassignedTotal;
  assert.equal(sumOfShares, summary.grandTotal);
});
