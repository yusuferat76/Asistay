import { SplitSummary, ReceiptItem } from '../types/bill';

/**
 * Escape CSV string fields according to RFC4180
 */
function escapeCSV(val: string | number): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV string from receipt split summary and item details
 */
export function generateReceiptCSV(
  summary: SplitSummary,
  restaurantName: string,
  currency: string,
  items: ReceiptItem[]
): string {
  const lines: string[] = [];

  // Metadata Section
  lines.push(`FATURA & PAYLAŞIM ÖZETİ`);
  lines.push(`İşletme Adı,${escapeCSV(restaurantName)}`);
  lines.push(`Tarih,${escapeCSV(new Date().toLocaleDateString('tr-TR'))}`);
  lines.push(`Para Birimi,${escapeCSV(currency)}`);
  lines.push(`Ara Toplam,${escapeCSV(summary.totalSubtotal.toFixed(2))}`);
  lines.push(`KDV / Vergi,${escapeCSV(summary.totalTax.toFixed(2))}`);
  lines.push(`Bahşiş,${escapeCSV(summary.totalTip.toFixed(2))}`);
  lines.push(`Genel Toplam,${escapeCSV(summary.grandTotal.toFixed(2))}`);
  lines.push('');

  // Itemized List Section
  lines.push('HARCAMA KALEMLERİ DETAYI');
  lines.push('Kalem Adı,Kategori,Adet,Birim Fiyat,Toplam Tutar,Paylaşan Kişiler');
  items.forEach(item => {
    const totalItemPrice = item.price * item.quantity;
    const assigned = item.assignedTo.length > 0 ? item.assignedTo.join('; ') : 'Atanmadı';
    lines.push(
      `${escapeCSV(item.name)},${escapeCSV(item.category || 'Genel')},${item.quantity},${item.price.toFixed(2)},${totalItemPrice.toFixed(2)},${escapeCSV(assigned)}`
    );
  });
  lines.push('');

  // Participant Balance Breakdown Section
  lines.push('KİŞİ BAZLI ÖDEME YÜKÜMLÜLÜKLERİ');
  lines.push('Kişi Adı,Yemek Payı,Vergi Payı,Bahşiş Payı,Ödenecek Toplam Tutar,Genel Toplama Oranı (%)');
  summary.participantsShares.forEach(share => {
    lines.push(
      `${escapeCSV(share.participantName)},${share.subtotal.toFixed(2)},${share.taxShare.toFixed(2)},${share.tipShare.toFixed(2)},${share.total.toFixed(2)},%${share.percentOfBill.toFixed(1)}`
    );
  });

  if (summary.unassignedSubtotal > 0) {
    lines.push(
      `Paylaştırılmamış Kalemler,${summary.unassignedSubtotal.toFixed(2)},${summary.unassignedTax.toFixed(2)},${summary.unassignedTip.toFixed(2)},${summary.unassignedTotal.toFixed(2)},%${((summary.unassignedTotal / summary.grandTotal) * 100).toFixed(1)}`
    );
  }

  return lines.join('\n');
}

/**
 * Trigger CSV file download in browser
 */
export function downloadReceiptCSV(
  summary: SplitSummary,
  restaurantName: string,
  currency: string,
  items: ReceiptItem[]
): void {
  const csvContent = generateReceiptCSV(summary, restaurantName, currency, items);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `${safeName}_paylasim_ozeti.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate Printable PDF HTML structure and trigger download / print window
 */
export function downloadReceiptPDF(
  summary: SplitSummary,
  restaurantName: string,
  currency: string,
  items: ReceiptItem[]
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Açılır pencere engellendi. Lütfen izin verin.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <title>${restaurantName} - Fatura Paylaşım Raporu</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #ffffff;
          color: #0f172a;
          margin: 0;
          padding: 32px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .title {
          font-size: 24px;
          font-weight: 800;
          color: #1e3a8a;
          margin: 0;
        }
        .subtitle {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }
        .badge {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 700;
          font-size: 12px;
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid #bfdbfe;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
        }
        .card-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }
        .card-val {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-top: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
          font-size: 13px;
        }
        th {
          background: #f1f5f9;
          color: #334155;
          text-align: left;
          padding: 10px 12px;
          font-weight: 700;
          border-bottom: 2px solid #cbd5e1;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        .person-row {
          font-weight: 700;
          background: #fafafa;
        }
        .footer {
          margin-top: 40px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">${restaurantName}</h1>
          <div class="subtitle">Sınırsız Asistan SplitWise Raporu • ${dateStr}</div>
        </div>
        <div class="badge">EKSİKSİZ PAYLAŞIM TABLOSU</div>
      </div>

      <div class="summary-cards">
        <div class="card">
          <div class="card-label">Ara Toplam</div>
          <div class="card-val">${currency}${summary.totalSubtotal.toFixed(2)}</div>
        </div>
        <div class="card">
          <div class="card-label">Vergi / KDV</div>
          <div class="card-val">${currency}${summary.totalTax.toFixed(2)}</div>
        </div>
        <div class="card">
          <div class="card-label">Bahşiş</div>
          <div class="card-val">${currency}${summary.totalTip.toFixed(2)}</div>
        </div>
        <div class="card" style="border-color: #2563eb; background: #eff6ff;">
          <div class="card-label" style="color: #1d4ed8;">Genel Toplam</div>
          <div class="card-val" style="color: #1e40af;">${currency}${summary.grandTotal.toFixed(2)}</div>
        </div>
      </div>

      <h3 style="font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 12px;">Kişi Bazlı Borç / Ödeme Tablosu</h3>
      <table>
        <thead>
          <tr>
            <th>Kişi</th>
            <th>Yemek Payı</th>
            <th>Vergi Oranı</th>
            <th>Bahşiş Oranı</th>
            <th>Ödenecek Toplam</th>
            <th>Oran</th>
          </tr>
        </thead>
        <tbody>
          ${summary.participantsShares.map(share => `
            <tr class="person-row">
              <td><strong>${share.participantName}</strong></td>
              <td>${currency}${share.subtotal.toFixed(2)}</td>
              <td>${currency}${share.taxShare.toFixed(2)}</td>
              <td>${currency}${share.tipShare.toFixed(2)}</td>
              <td style="color: #2563eb;"><strong>${currency}${share.total.toFixed(2)}</strong></td>
              <td>%${share.percentOfBill.toFixed(1)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h3 style="font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 12px;">Fatura Kalemleri</h3>
      <table>
        <thead>
          <tr>
            <th>Kalem Adı</th>
            <th>Kategori</th>
            <th>Adet</th>
            <th>Fiyat</th>
            <th>Toplam</th>
            <th>Atanan Kişiler</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td>${item.category || 'Genel'}</td>
              <td>${item.quantity}</td>
              <td>${currency}${item.price.toFixed(2)}</td>
              <td>${currency}${(item.price * item.quantity).toFixed(2)}</td>
              <td>${item.assignedTo.length > 0 ? item.assignedTo.join(', ') : '<em style="color:#94a3b8">Atanmadı</em>'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        ⚡ Sınırsız Asistan • Işık Hızında Yerel Fatura & Hesap Paylaşım Motoru
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Share via System-Native Web Share API (Android / iOS / Modern Desktop)
 */
export async function shareSplitNative(
  summary: SplitSummary,
  restaurantName: string,
  currency: string,
  items: ReceiptItem[]
): Promise<boolean> {
  const csvContent = generateReceiptCSV(summary, restaurantName, currency, items);
  const textSummary = [
    `🧾 ${restaurantName} - Fatura Paylaşımı`,
    `----------------------------------------`,
    ...summary.participantsShares.map(
      p => `• ${p.participantName}: ${currency}${p.total.toFixed(2)}`
    ),
    `----------------------------------------`,
    `TOPLAM: ${currency}${summary.grandTotal.toFixed(2)}`,
    `⚡ Sınırsız Asistan ile hesaplandı.`,
  ].join('\n');

  const safeName = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '_');

  if (navigator.share) {
    try {
      const csvFile = new File([csvContent], `${safeName}_split.csv`, {
        type: 'text/csv',
      });

      // Try sharing file first if supported
      if (navigator.canShare && navigator.canShare({ files: [csvFile] })) {
        await navigator.share({
          title: `${restaurantName} Paylaşım Özeti`,
          text: textSummary,
          files: [csvFile],
        });
        return true;
      } else {
        // Fallback to sharing text payload via native sheet
        await navigator.share({
          title: `${restaurantName} Paylaşım Özeti`,
          text: textSummary,
        });
        return true;
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Native share failed:', err);
      }
    }
  }

  // Fallback if Web Share API is unavailable
  await navigator.clipboard.writeText(textSummary);
  return false;
}
