import { ReceiptItem, PersonShare, SplitSummary, ItemShare } from '../types/bill';

export const PARTICIPANT_COLORS = [
  { name: 'emerald', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/40', badge: 'bg-emerald-500 text-white', hex: '#10b981' },
  { name: 'violet', bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/40', badge: 'bg-violet-500 text-white', hex: '#8b5cf6' },
  { name: 'amber', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-500 text-white', hex: '#f59e0b' },
  { name: 'cyan', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/40', badge: 'bg-cyan-500 text-white', hex: '#06b6d4' },
  { name: 'rose', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/40', badge: 'bg-rose-500 text-white', hex: '#f43f5e' },
  { name: 'indigo', bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/40', badge: 'bg-indigo-500 text-white', hex: '#6366f1' },
  { name: 'fuchsia', bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400', border: 'border-fuchsia-500/40', badge: 'bg-fuchsia-500 text-white', hex: '#d946ef' },
  { name: 'teal', bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/40', badge: 'bg-teal-500 text-white', hex: '#14b8a6' },
  { name: 'orange', bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/40', badge: 'bg-orange-500 text-white', hex: '#f97316' },
  { name: 'sky', bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/40', badge: 'bg-sky-500 text-white', hex: '#0284c7' },
];

export function getParticipantColor(index: number) {
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}

export function round(value: number, decimals: number = 2): number {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

/**
 * Calculates exact proportional shares for each participant.
 * Tax and Tip are allocated proportionally to each participant's item subtotal.
 */
export function calculateSplitSummary(
  items: ReceiptItem[],
  totalTax: number,
  totalTip: number,
  knownParticipants: string[]
): SplitSummary {
  const personItemsMap: Record<string, ItemShare[]> = {};
  const unassignedItems: ReceiptItem[] = [];

  // Initialize map for all known participants so everyone is represented even if 0 items yet
  knownParticipants.forEach((p) => {
    personItemsMap[p] = [];
  });

  let totalItemsSubtotal = 0;
  let assignedSubtotal = 0;
  let unassignedSubtotal = 0;
  let assignedItemsCount = 0;

  for (const item of items) {
    totalItemsSubtotal += item.price;
    const assignees = item.assignedTo || [];

    if (assignees.length === 0) {
      unassignedItems.push(item);
      unassignedSubtotal += item.price;
    } else {
      assignedItemsCount++;
      assignedSubtotal += item.price;
      const shareFraction = 1 / assignees.length;
      const shareAmount = round(item.price * shareFraction);

      assignees.forEach((personName) => {
        if (!personItemsMap[personName]) {
          personItemsMap[personName] = [];
        }
        personItemsMap[personName].push({
          itemId: item.id,
          itemName: item.name,
          itemPrice: item.price,
          shareFraction,
          shareAmount,
          totalCoSharedWith: assignees.filter((a) => a !== personName),
        });
      });
    }
  }

  // Use the larger of sum of items or zero to avoid divide-by-zero
  const effectiveTotalSubtotal = totalItemsSubtotal > 0 ? totalItemsSubtotal : 1;

  const participantsShares: PersonShare[] = Object.keys(personItemsMap).map((personName) => {
    const pItems = personItemsMap[personName] || [];
    const personSubtotal = round(pItems.reduce((acc, it) => acc + it.shareAmount, 0));

    // Proportional tax and tip based on person's share of the receipt subtotal
    const taxShare = totalItemsSubtotal > 0 ? round((personSubtotal / effectiveTotalSubtotal) * totalTax) : 0;
    const tipShare = totalItemsSubtotal > 0 ? round((personSubtotal / effectiveTotalSubtotal) * totalTip) : 0;
    const total = round(personSubtotal + taxShare + tipShare);

    const percentOfAssigned = assignedSubtotal > 0 ? round((personSubtotal / assignedSubtotal) * 100, 1) : 0;
    const percentOfBill = totalItemsSubtotal > 0 ? round((personSubtotal / effectiveTotalSubtotal) * 100, 1) : 0;

    return {
      participantName: personName,
      items: pItems,
      subtotal: personSubtotal,
      taxShare,
      tipShare,
      total,
      percentOfAssigned,
      percentOfBill,
    };
  });

  // Calculate unassigned tax & tip
  const unassignedTax = totalItemsSubtotal > 0 ? round((unassignedSubtotal / effectiveTotalSubtotal) * totalTax) : 0;
  const unassignedTip = totalItemsSubtotal > 0 ? round((unassignedSubtotal / effectiveTotalSubtotal) * totalTip) : 0;
  const unassignedTotal = round(unassignedSubtotal + unassignedTax + unassignedTip);

  const grandTotal = round(totalItemsSubtotal + totalTax + totalTip);

  return {
    participantsShares,
    assignedSubtotal: round(assignedSubtotal),
    unassignedSubtotal: round(unassignedSubtotal),
    totalSubtotal: round(totalItemsSubtotal),
    assignedItemsCount,
    totalItemsCount: items.length,
    totalTax: round(totalTax),
    totalTip: round(totalTip),
    grandTotal,
    unassignedItems,
    unassignedTax,
    unassignedTip,
    unassignedTotal,
  };
}

/**
 * Generates formatted text to easily copy/paste into Venmo, WhatsApp, or messages
 */
export function generateShareableSummary(
  summary: SplitSummary,
  restaurantName: string,
  currency: string = '$'
): string {
  const lines: string[] = [];
  lines.push(`🧾 Bill Split Breakdown for ${restaurantName}`);
  lines.push(`Total: ${currency}${summary.grandTotal.toFixed(2)} (Subtotal: ${currency}${summary.totalSubtotal.toFixed(2)} | Tax: ${currency}${summary.totalTax.toFixed(2)} | Tip: ${currency}${summary.totalTip.toFixed(2)})`);
  lines.push('----------------------------------------');

  summary.participantsShares
    .filter((p) => p.total > 0)
    .forEach((p) => {
      lines.push(`👤 ${p.participantName}: ${currency}${p.total.toFixed(2)} total`);
      lines.push(`   • Items (${currency}${p.subtotal.toFixed(2)}): ${p.items.map((i) => i.shareFraction < 1 ? `${i.itemName} (½)` : i.itemName).join(', ')}`);
      lines.push(`   • Tax: ${currency}${p.taxShare.toFixed(2)} | Tip: ${currency}${p.tipShare.toFixed(2)}`);
    });

  if (summary.unassignedSubtotal > 0) {
    lines.push('----------------------------------------');
    lines.push(`⚠️ Unassigned items: ${currency}${summary.unassignedTotal.toFixed(2)} (${summary.unassignedItems.length} items remaining)`);
  }

  lines.push('----------------------------------------');
  lines.push('Calculated with SplitWise AI ✨');
  return lines.join('\n');
}
