import type { 
  SecurityHolding, 
  SecurityRecommendation, 
  ActionPriceRange
} from '../types';

/**
 * Exports portfolio data in a structured format optimized for AI analysis
 * Returns JSON string that can be uploaded to ChatGPT, Claude, or other AI agents
 */
export function exportAIMetadata(
  holdings: Record<string, SecurityHolding>,
  recommendations: Record<string, SecurityRecommendation>,
  actionRanges: Record<string, ActionPriceRange>,
  totalPortfolioValue?: number
): string {
  const holdingsArray = Object.values(holdings).sort((a, b) =>
    a.security.localeCompare(b.security)
  );

  const metadata = {
    exportDate: new Date().toISOString(),
    portfolioSummary: {
      totalSecurities: holdingsArray.length,
      totalPortfolioValue: totalPortfolioValue || holdingsArray.reduce((sum, h) => sum + (h.marketValue || 0), 0),
      totalCost: holdingsArray.reduce((sum, h) => sum + h.totalCost, 0),
      totalUnrealizedGainLoss: holdingsArray.reduce((sum, h) => sum + (h.unrealizedGainLoss || 0), 0),
      securitiesWithRecommendations: Object.keys(recommendations).length,
    },
    securities: holdingsArray.map(holding => {
      const recommendation = recommendations[holding.security];
      const actionRange = actionRanges[holding.security];
      
      // Calculate realized gain/loss from lots
      const realizedGainLoss = holding.lots.reduce((sum, lot) => {
        return sum + lot.sellOrders.reduce((s, sell) => s + sell.gainLoss, 0);
      }, 0);

      return {
        security: holding.security,
        currentPosition: {
          quantity: holding.totalQuantity,
          averageBuyPrice: holding.averageBuyPrice,
          totalCost: holding.totalCost,
          currentPrice: holding.currentPrice,
          marketValue: holding.marketValue,
          unrealizedGainLoss: holding.unrealizedGainLoss,
          unrealizedGainLossPercent: holding.unrealizedGainLossPercent,
          realizedGainLoss: realizedGainLoss,
        },
        actionPriceRanges: actionRange ? {
          breakEvenSellPrice: actionRange.breakEvenSellPrice,
          accumulateSlowly: actionRange.accumulateSlowly,
          strongAddZone: actionRange.strongAddZone,
          reEvaluateIfWeak: actionRange.reEvaluateIfWeak,
          pauseBuys: actionRange.pauseBuys,
          trimSmallPortion: actionRange.trimSmallPortion,
          trailingStop: actionRange.trailingStop,
          investmentPercentage: actionRange.investmentPercentage,
        } : null,
        recommendation: recommendation ? {
          action: recommendation.recommendation,
          confidence: recommendation.confidence,
          reason: recommendation.reason,
          targetZones: recommendation.targetZones,
        } : null,
        lotDetails: holding.lots.map(lot => {
          const currentPrice = holding.currentPrice;
          const unrealizedGainLoss =
            currentPrice && lot.remainingQuantity > 0
              ? lot.remainingQuantity * (currentPrice - lot.buyPrice)
              : null;
          const totalRealizedGainLoss = lot.sellOrders.reduce(
            (sum, sell) => sum + sell.gainLoss,
            0
          );

          return {
            buyDate: lot.buyDate,
            buyPrice: lot.buyPrice,
            originalBuyPrice: lot.originalBuyPrice,
            quantity: lot.quantity,
            originalQuantity: lot.originalQuantity,
            remainingQuantity: lot.remainingQuantity,
            totalCost: lot.totalCost,
            splitRatio: lot.splitRatio,
            sellOrders: lot.sellOrders.map(sell => ({
              sellDate: sell.sellDate,
              sellPrice: sell.sellPrice,
              quantity: sell.quantity,
              gainLoss: sell.gainLoss,
              gainLossPercent: sell.gainLossPercent,
            })),
            realizedGainLoss: totalRealizedGainLoss,
            unrealizedGainLoss: unrealizedGainLoss,
          };
        }),
      };
    }),
  };

  return JSON.stringify(metadata, null, 2);
}

/**
 * Exports portfolio data as a formatted Markdown document for AI analysis
 */
export function exportAIMarkdown(
  holdings: Record<string, SecurityHolding>,
  recommendations: Record<string, SecurityRecommendation>,
  actionRanges: Record<string, ActionPriceRange>,
  totalPortfolioValue?: number
): string {
  const holdingsArray = Object.values(holdings).sort((a, b) =>
    a.security.localeCompare(b.security)
  );

  const totalValue = totalPortfolioValue || holdingsArray.reduce((sum, h) => sum + (h.marketValue || 0), 0);
  const totalCost = holdingsArray.reduce((sum, h) => sum + h.totalCost, 0);
  const totalUnrealized = holdingsArray.reduce((sum, h) => sum + (h.unrealizedGainLoss || 0), 0);

  const lines: string[] = [];
  
  lines.push('# Stock Portfolio Analysis for AI Agent');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toLocaleString()}`);
  lines.push('');
  lines.push('## Portfolio Summary');
  lines.push('');
  lines.push(`- **Total Securities:** ${holdingsArray.length}`);
  lines.push(`- **Total Portfolio Value:** ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  lines.push(`- **Total Cost Basis:** ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  lines.push(`- **Total Unrealized Gain/Loss:** ${totalUnrealized >= 0 ? '+' : ''}${totalUnrealized.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  lines.push(`- **Return %:** ${totalCost > 0 ? ((totalUnrealized / totalCost) * 100).toFixed(2) : 0}%`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Group by recommendation
  const byRecommendation: Record<string, typeof holdingsArray> = {
    BUY_NEW: [],
    ADD_ACCUMULATE: [],
    HOLD: [],
    TRIM: [],
    EXIT: [],
    STRONG_STOP_TAKE_PROFIT: [],
    NO_RECOMMENDATION: [],
  };

  holdingsArray.forEach(holding => {
    const rec = recommendations[holding.security];
    if (rec) {
      byRecommendation[rec.recommendation].push(holding);
    } else {
      byRecommendation.NO_RECOMMENDATION.push(holding);
    }
  });

  // Priority recommendations first
  const priorityOrder = ['EXIT', 'STRONG_STOP_TAKE_PROFIT', 'TRIM', 'BUY_NEW', 'ADD_ACCUMULATE', 'HOLD', 'NO_RECOMMENDATION'];
  
  for (const recType of priorityOrder) {
    const securities = byRecommendation[recType];
    if (securities.length === 0) continue;

    lines.push(`## ${recType.replace(/_/g, ' ')} (${securities.length} securities)`);
    lines.push('');

    for (const holding of securities) {
      const recommendation = recommendations[holding.security];
      const actionRange = actionRanges[holding.security];

      lines.push(`### ${holding.security}`);
      lines.push('');

      // Current Position
      lines.push('**Current Position:**');
      lines.push(`- Quantity: ${holding.totalQuantity.toFixed(0)}`);
      lines.push(`- Average Buy Price: ${holding.averageBuyPrice.toFixed(2)}`);
      lines.push(`- Total Cost: ${holding.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      if (holding.currentPrice) {
        lines.push(`- Current Price: ${holding.currentPrice.toFixed(2)}`);
        lines.push(`- Market Value: ${holding.marketValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        if (holding.unrealizedGainLoss !== undefined) {
          const sign = holding.unrealizedGainLoss >= 0 ? '+' : '';
          lines.push(`- Unrealized G/L: ${sign}${holding.unrealizedGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${sign}${holding.unrealizedGainLossPercent?.toFixed(2)}%)`);
        }
      }
      lines.push('');

      // Lot Details - This is the key information for AI analysis
      if (holding.lots.length > 0) {
        lines.push('**Lot Details (Transaction History):**');
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
      }

      // Action Price Ranges
      if (actionRange) {
        lines.push('**Action Price Ranges:**');
        if (actionRange.strongAddZone) lines.push(`- Strong Add Zone: ${actionRange.strongAddZone}`);
        if (actionRange.accumulateSlowly) lines.push(`- Accumulate Slowly: ${actionRange.accumulateSlowly}`);
        if (actionRange.pauseBuys) lines.push(`- Pause Buys: ${actionRange.pauseBuys}`);
        if (actionRange.trimSmallPortion) lines.push(`- Trim Small Portion: ${actionRange.trimSmallPortion}`);
        if (actionRange.reEvaluateIfWeak) lines.push(`- Re-evaluate if Market Weak: ${actionRange.reEvaluateIfWeak}`);
        if (actionRange.trailingStop) lines.push(`- Trailing Stop (SELL if below): ${actionRange.trailingStop.toFixed(2)}`);
        lines.push('');
      }

      // Recommendation
      if (recommendation) {
        lines.push(`**Recommendation:** ${recommendation.recommendation.replace(/_/g, ' ')}`);
        lines.push(`- **Confidence:** ${recommendation.confidence}`);
        lines.push(`- **Reason:** ${recommendation.reason}`);
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }
  }

  // Add analysis prompt
  lines.push('## Analysis Request');
  lines.push('');
  lines.push('Please analyze this portfolio and provide:');
  lines.push('');
  lines.push('1. **Overall Assessment:** Evaluate the portfolio health and risk level');
  lines.push('2. **Action Recommendations:** Review each security recommendation and provide detailed reasoning');
  lines.push('3. **Risk Management:** Identify any high-risk positions or concentration issues');
  lines.push('4. **Optimization Suggestions:** Recommend portfolio adjustments for better risk-adjusted returns');
  lines.push('5. **Market Context:** Consider current market conditions and provide strategic advice');
  lines.push('');

  return lines.join('\n');
}

/**
 * Exports portfolio data specifically for AI to generate Action Price Ranges CSV
 * This export includes detailed instructions and examples for the AI to create the CSV
 */
export function exportAIMetadataForActionRanges(
  holdings: Record<string, SecurityHolding>,
  totalPortfolioValue?: number
): string {
  const holdingsArray = Object.values(holdings).sort((a, b) =>
    a.security.localeCompare(b.security)
  );

  const totalValue = totalPortfolioValue || holdingsArray.reduce((sum, h) => sum + (h.marketValue || 0), 0);
  const totalCost = holdingsArray.reduce((sum, h) => sum + h.totalCost, 0);

  const metadata = {
    exportDate: new Date().toISOString(),
    purpose: "Generate Action Price Ranges CSV for portfolio management",
    instructions: {
      task: "Based on the portfolio data below, generate a CSV file with Action Price Ranges for each security. The CSV should follow the exact format specified.",
      csvFormat: {
        headers: "Company Code,Quantity,Avg Price,B.E.S Price,Last,Change,% Change,Accumulate Slowly,Strong Add Zone,Re-evaluate if Market Weak,Pause Buys,Trim Small Portion,Investment_Percentage,Time,Trailing Stop (SELL if below)",
        description: {
          "Company Code": "Security symbol (e.g., ACL.N0000)",
          "Quantity": "Current holding quantity",
          "Avg Price": "Average buy price from currentPosition.averageBuyPrice",
          "B.E.S Price": "Break-even sell price (usually avg price + 1-2% buffer for commissions)",
          "Last": "Current/last price from currentPosition.currentPrice",
          "Change": "Price change amount (can be 0 if not available)",
          "% Change": "Price change percentage (can be 0 if not available)",
          "Accumulate Slowly": "Price range for gradual accumulation (format: '245–250' or 'Below 230')",
          "Strong Add Zone": "Best price range for aggressive buying (format: '235–240')",
          "Re-evaluate if Market Weak": "Price threshold to reconsider position (format: 'Below 230')",
          "Pause Buys": "Price range where buying should pause (format: '260–270')",
          "Trim Small Portion": "Price level to start taking profits (format: '280+')",
          "Investment_Percentage": "Percentage of portfolio in this security (calculate from marketValue/totalPortfolioValue)",
          "Time": "Current timestamp (format: HH:MM:SS.microseconds)",
          "Trailing Stop (SELL if below)": "Stop loss price level (number only, no text)"
        },
        priceRangeFormats: [
          "Range format: '245–250' (use en-dash or hyphen between numbers)",
          "Above threshold: '280+' (use plus sign)",
          "Below threshold: 'Below 230' (use 'Below' prefix)",
          "Single value: '250' (just the number)"
        ],
        calculationGuidelines: {
          "Strong Add Zone": "If unrealizedGainLossPercent > 0: 10-20% below current price. If loss: near support levels (5-10% below avg price)",
          "Accumulate Slowly": "5-10% below current price, good entry zone for adding",
          "Pause Buys": "10-15% above current price, consider pausing new purchases",
          "Trim Small Portion": "20-30% above current price, take partial profits",
          "Re-evaluate if Market Weak": "15-25% below current price, critical support level",
          "Trailing Stop": "If profit: 5-10% below current price. If loss: at break-even or 2-3% below avg price"
        }
      },
      outputFormat: "Return ONLY the CSV content with header row and one row per security. Do not include any explanations or markdown formatting, just the raw CSV."
    },
    portfolioSummary: {
      totalSecurities: holdingsArray.length,
      totalPortfolioValue: totalValue,
      totalCost: totalCost,
      totalUnrealizedGainLoss: holdingsArray.reduce((sum, h) => sum + (h.unrealizedGainLoss || 0), 0),
    },
    securities: holdingsArray.map(holding => {
      const realizedGainLoss = holding.lots.reduce((sum, lot) => {
        return sum + lot.sellOrders.reduce((s, sell) => s + sell.gainLoss, 0);
      }, 0);

      const investmentPercentage = totalValue > 0
        ? ((holding.marketValue || holding.totalCost) / totalValue * 100)
        : 0;

      return {
        security: holding.security,
        currentPosition: {
          quantity: holding.totalQuantity,
          averageBuyPrice: holding.averageBuyPrice,
          totalCost: holding.totalCost,
          currentPrice: holding.currentPrice,
          marketValue: holding.marketValue,
          unrealizedGainLoss: holding.unrealizedGainLoss,
          unrealizedGainLossPercent: holding.unrealizedGainLossPercent,
          realizedGainLoss: realizedGainLoss,
        },
        priceHistory: holding.lots.map(lot => ({
          buyDate: lot.buyDate,
          buyPrice: lot.buyPrice,
          quantity: lot.quantity,
        })),
        investmentPercentage: investmentPercentage,
        // Helper calculations for AI
        breakEvenSellPrice: holding.averageBuyPrice * 1.01, // 1% buffer for commissions
        suggestedZones: {
          strongAddZone: holding.currentPrice && holding.unrealizedGainLossPercent && holding.unrealizedGainLossPercent > 0
            ? `${(holding.currentPrice * 0.85).toFixed(2)}–${(holding.currentPrice * 0.90).toFixed(2)}`
            : holding.currentPrice
              ? `${(holding.averageBuyPrice * 0.90).toFixed(2)}–${(holding.averageBuyPrice * 0.95).toFixed(2)}`
              : undefined,
          accumulateSlowly: holding.currentPrice
            ? `${(holding.currentPrice * 0.90).toFixed(2)}–${(holding.currentPrice * 0.95).toFixed(2)}`
            : undefined,
          pauseBuys: holding.currentPrice
            ? `${(holding.currentPrice * 1.10).toFixed(2)}–${(holding.currentPrice * 1.15).toFixed(2)}`
            : undefined,
          trimSmallPortion: holding.currentPrice
            ? `${(holding.currentPrice * 1.20).toFixed(2)}+`
            : undefined,
          trailingStop: holding.currentPrice && holding.unrealizedGainLossPercent && holding.unrealizedGainLossPercent > 0
            ? holding.currentPrice * 0.90
            : holding.averageBuyPrice * 0.98,
        }
      };
    }),
    exampleCSVRow: "ACL.N0000,380,73.74,74.56,107.00,1.75,1.66,95-100,85-90,Below 80,115-120,130+,5.80%,13:29:03.301165,95",
  };

  return JSON.stringify(metadata, null, 2);
}
