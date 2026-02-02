import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Lot, SecurityHolding, StockSplit } from '../types';

/**
 * Export lot-wise analysis data to CSV format
 */
export function exportToCSV(
  holdings: Record<string, SecurityHolding>,
  stockSplits: StockSplit[]
): void {
  const holdingsArray = Object.values(holdings).sort((a, b) =>
    a.security.localeCompare(b.security)
  );

  const rows: string[] = [];
  
  // Header row
  rows.push([
    'Security',
    'Buy Date',
    'Buy Price',
    'Original Buy Price',
    'Quantity',
    'Original Quantity',
    'Remaining',
    'Total Cost',
    'Sell Date',
    'Sell Price',
    'Sell Quantity',
    'Sell Gain/Loss',
    'Sell Gain/Loss %',
    'Total Realized G/L',
    'Current Price',
    'Unrealized G/L',
    'Stock Split Ratio',
  ].join(','));

  // Data rows
  for (const holding of holdingsArray) {
    const securitySplits = stockSplits
      .filter(split => split.security === holding.security)
      .sort((a, b) => new Date(a.splitDateTime).getTime() - new Date(b.splitDateTime).getTime());
    
    const splitInfo = securitySplits.length > 0
      ? securitySplits.map(s => `${s.splitDate} (${s.ratio}:1)`).join('; ')
      : '';

    for (const lot of holding.lots) {
      const totalRealizedGainLoss = lot.sellOrders.reduce(
        (sum, sell) => sum + sell.gainLoss,
        0
      );
      const currentPrice = holding.currentPrice;
      const unrealizedGainLoss =
        currentPrice && lot.remainingQuantity > 0
          ? lot.remainingQuantity * (currentPrice - lot.buyPrice)
          : null;

      if (lot.sellOrders.length > 0) {
        // One row per sell order
        for (const sell of lot.sellOrders) {
          rows.push([
            holding.security,
            lot.buyDate,
            lot.buyPrice.toFixed(2),
            lot.originalBuyPrice?.toFixed(2) || '',
            lot.quantity.toFixed(0),
            lot.originalQuantity?.toFixed(0) || '',
            lot.remainingQuantity.toFixed(0),
            lot.totalCost.toFixed(2),
            sell.sellDate,
            sell.sellPrice.toFixed(2),
            sell.quantity.toFixed(0),
            sell.gainLoss.toFixed(2),
            sell.gainLossPercent.toFixed(2) + '%',
            totalRealizedGainLoss.toFixed(2),
            currentPrice?.toFixed(2) || '',
            unrealizedGainLoss?.toFixed(2) || '',
            lot.splitRatio?.toFixed(2) || '',
          ].map(field => `"${field}"`).join(','));
        }
      } else {
        // One row for unsold lot
        rows.push([
          holding.security,
          lot.buyDate,
          lot.buyPrice.toFixed(2),
          lot.originalBuyPrice?.toFixed(2) || '',
          lot.quantity.toFixed(0),
          lot.originalQuantity?.toFixed(0) || '',
          lot.remainingQuantity.toFixed(0),
          lot.totalCost.toFixed(2),
          '',
          '',
          '',
          '',
          '',
          '0.00',
          currentPrice?.toFixed(2) || '',
          unrealizedGainLoss?.toFixed(2) || '',
          lot.splitRatio?.toFixed(2) || '',
        ].map(field => `"${field}"`).join(','));
      }
    }
  }

  // Create CSV content
  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `portfolio-lot-analysis-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export lot-wise analysis data to Markdown format
 */
export function exportToMarkdown(
  holdings: Record<string, SecurityHolding>,
  stockSplits: StockSplit[]
): void {
  const holdingsArray = Object.values(holdings).sort((a, b) =>
    a.security.localeCompare(b.security)
  );

  const lines: string[] = [];
  
  lines.push('# Stock Portfolio - Lot-wise Gain/Loss Analysis');
  lines.push('');
  lines.push(`Generated on: ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const holding of holdingsArray) {
    lines.push(`## ${holding.security}`);
    lines.push('');

    // Stock splits info
    const securitySplits = stockSplits
      .filter(split => split.security === holding.security)
      .sort((a, b) => new Date(a.splitDateTime).getTime() - new Date(b.splitDateTime).getTime());
    
    if (securitySplits.length > 0) {
      lines.push('### Stock Splits Applied');
      lines.push('');
      lines.push('| Date | Ratio |');
      lines.push('|------|-------|');
      for (const split of securitySplits) {
        lines.push(`| ${split.splitDate} | ${split.ratio}:1 |`);
      }
      lines.push('');
    }

    // Holdings summary
    lines.push('### Holdings Summary');
    lines.push('');
    lines.push(`- **Total Quantity:** ${holding.totalQuantity.toFixed(0)}`);
    lines.push(`- **Average Buy Price:** ${holding.averageBuyPrice.toFixed(2)}`);
    lines.push(`- **Total Cost:** ${holding.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    if (holding.currentPrice) {
      lines.push(`- **Current Price:** ${holding.currentPrice.toFixed(2)}`);
      lines.push(`- **Market Value:** ${holding.marketValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      lines.push(`- **Unrealized G/L:** ${holding.unrealizedGainLoss !== undefined && holding.unrealizedGainLoss >= 0 ? '+' : ''}${holding.unrealizedGainLoss?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${holding.unrealizedGainLossPercent !== undefined && holding.unrealizedGainLossPercent >= 0 ? '+' : ''}${holding.unrealizedGainLossPercent?.toFixed(2)}%)`);
    }
    lines.push('');

    // Lots table
    lines.push('### Lot Details');
    lines.push('');
    lines.push('| Buy Date | Buy Price | Quantity | Remaining | Total Cost | Sell Details | Realized G/L | Unrealized G/L |');
    lines.push('|----------|-----------|----------|-----------|------------|--------------|--------------|----------------|');

    for (const lot of holding.lots) {
      const totalRealizedGainLoss = lot.sellOrders.reduce(
        (sum, sell) => sum + sell.gainLoss,
        0
      );
      const currentPrice = holding.currentPrice;
      const unrealizedGainLoss =
        currentPrice && lot.remainingQuantity > 0
          ? lot.remainingQuantity * (currentPrice - lot.buyPrice)
          : null;

      const buyPriceStr = lot.originalBuyPrice && lot.originalBuyPrice !== lot.buyPrice
        ? `${lot.buyPrice.toFixed(2)} (was ${lot.originalBuyPrice.toFixed(2)})`
        : lot.buyPrice.toFixed(2);
      
      const qtyStr = lot.originalQuantity && lot.originalQuantity !== lot.quantity
        ? `${lot.quantity.toFixed(0)} (was ${lot.originalQuantity})`
        : lot.quantity.toFixed(0);

      const splitInfo = lot.splitRatio && lot.splitRatio !== 1
        ? ` ${lot.splitRatio.toFixed(2)}x split`
        : '';

      let sellDetails = 'Not sold';
      if (lot.sellOrders.length > 0) {
        sellDetails = lot.sellOrders.map(sell => 
          `${sell.quantity} @ ${sell.sellPrice.toFixed(2)} on ${sell.sellDate} (${sell.gainLoss >= 0 ? '+' : ''}${sell.gainLoss.toFixed(2)}, ${sell.gainLossPercent >= 0 ? '+' : ''}${sell.gainLossPercent.toFixed(2)}%)`
        ).join('; ');
      }

      const realizedStr = totalRealizedGainLoss !== 0
        ? `${totalRealizedGainLoss >= 0 ? '+' : ''}${totalRealizedGainLoss.toFixed(2)}`
        : '-';

      const unrealizedStr = unrealizedGainLoss !== null
        ? `${unrealizedGainLoss >= 0 ? '+' : ''}${unrealizedGainLoss.toFixed(2)}`
        : '-';

      lines.push([
        lot.buyDate + splitInfo,
        buyPriceStr,
        qtyStr,
        lot.remainingQuantity > 0 ? lot.remainingQuantity.toFixed(0) : 'Sold',
        lot.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        sellDetails,
        realizedStr,
        unrealizedStr,
      ].join(' | '));
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Create markdown file
  const markdownContent = lines.join('\n');
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `portfolio-lot-analysis-${new Date().toISOString().split('T')[0]}.md`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export lot-wise analysis data to PDF format
 */
export function exportToPDF(
  holdings: Record<string, SecurityHolding>,
  stockSplits: StockSplit[]
): void {
  const holdingsArray = Object.values(holdings).sort((a, b) =>
    a.security.localeCompare(b.security)
  );

  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Title
  doc.setFontSize(18);
  doc.text('Stock Portfolio - Lot-wise Gain/Loss Analysis', margin, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 15;

  for (const holding of holdingsArray) {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Security header
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 255);
    doc.text(holding.security, margin, yPosition);
    yPosition += 8;

    // Stock splits
    const securitySplits = stockSplits
      .filter(split => split.security === holding.security)
      .sort((a, b) => new Date(a.splitDateTime).getTime() - new Date(b.splitDateTime).getTime());
    
    if (securitySplits.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text('Stock Splits Applied:', margin, yPosition);
      yPosition += 6;
      
      const splitData = securitySplits.map(split => [
        split.splitDate,
        `${split.ratio}:1`
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Ratio']],
        body: splitData,
        theme: 'grid',
        styles: { fontSize: 9 },
        margin: { left: margin },
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 8;
    }

    // Holdings summary
    doc.setFontSize(10);
    doc.text(`Total Quantity: ${holding.totalQuantity.toFixed(0)}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Average Buy Price: ${holding.averageBuyPrice.toFixed(2)}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Total Cost: ${holding.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin, yPosition);
    yPosition += 5;
    
    if (holding.currentPrice) {
      doc.text(`Current Price: ${holding.currentPrice.toFixed(2)}`, margin, yPosition);
      yPosition += 5;
      doc.text(`Market Value: ${holding.marketValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 5;
      const unrealizedColor = holding.unrealizedGainLoss && holding.unrealizedGainLoss >= 0 ? [0, 128, 0] : [255, 0, 0];
      doc.setTextColor(unrealizedColor[0], unrealizedColor[1], unrealizedColor[2]);
      doc.text(
        `Unrealized G/L: ${holding.unrealizedGainLoss !== undefined && holding.unrealizedGainLoss >= 0 ? '+' : ''}${holding.unrealizedGainLoss?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${holding.unrealizedGainLossPercent !== undefined && holding.unrealizedGainLossPercent >= 0 ? '+' : ''}${holding.unrealizedGainLossPercent?.toFixed(2)}%)`,
        margin,
        yPosition
      );
      doc.setTextColor(0, 0, 0);
      yPosition += 8;
    } else {
      yPosition += 8;
    }

    // Lots table
    const tableData: any[] = [];
    
    for (const lot of holding.lots) {
      const totalRealizedGainLoss = lot.sellOrders.reduce(
        (sum, sell) => sum + sell.gainLoss,
        0
      );
      const currentPrice = holding.currentPrice;
      const unrealizedGainLoss =
        currentPrice && lot.remainingQuantity > 0
          ? lot.remainingQuantity * (currentPrice - lot.buyPrice)
          : null;

      const buyPriceStr = lot.originalBuyPrice && lot.originalBuyPrice !== lot.buyPrice
        ? `${lot.buyPrice.toFixed(2)} (was ${lot.originalBuyPrice.toFixed(2)})`
        : lot.buyPrice.toFixed(2);
      
      const qtyStr = lot.originalQuantity && lot.originalQuantity !== lot.quantity
        ? `${lot.quantity.toFixed(0)} (was ${lot.originalQuantity})`
        : lot.quantity.toFixed(0);

      const splitInfo = lot.splitRatio && lot.splitRatio !== 1
        ? ` ${lot.splitRatio.toFixed(2)}x`
        : '';

      let sellDetails = 'Not sold';
      if (lot.sellOrders.length > 0) {
        sellDetails = lot.sellOrders.map(sell => 
          `${sell.quantity} @ ${sell.sellPrice.toFixed(2)} (${sell.gainLoss >= 0 ? '+' : ''}${sell.gainLoss.toFixed(2)})`
        ).join('; ');
      }

      const realizedStr = totalRealizedGainLoss !== 0
        ? `${totalRealizedGainLoss >= 0 ? '+' : ''}${totalRealizedGainLoss.toFixed(2)}`
        : '-';

      const unrealizedStr = unrealizedGainLoss !== null
        ? `${unrealizedGainLoss >= 0 ? '+' : ''}${unrealizedGainLoss.toFixed(2)}`
        : '-';

      tableData.push([
        lot.buyDate + splitInfo,
        buyPriceStr,
        qtyStr,
        lot.remainingQuantity > 0 ? lot.remainingQuantity.toFixed(0) : 'Sold',
        lot.totalCost.toFixed(2),
        sellDetails.substring(0, 50) + (sellDetails.length > 50 ? '...' : ''),
        realizedStr,
        unrealizedStr,
      ]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['Buy Date', 'Buy Price', 'Quantity', 'Remaining', 'Total Cost', 'Sell Details', 'Realized G/L', 'Unrealized G/L']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fontSize: 9, fontStyle: 'bold' },
      margin: { left: margin },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 40 },
        6: { cellWidth: 25 },
        7: { cellWidth: 25 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Save PDF
  doc.save(`portfolio-lot-analysis-${new Date().toISOString().split('T')[0]}.pdf`);
}
