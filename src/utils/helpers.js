export const getWeaponType = title => {
    if (!title) return null
    const parts = title?.split('|')
    const weaponType = parts?.length > 0 ? parts[0]?.trim() : null

    // Remove any non-utf characters
    return weaponType?.replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '') || null
}

/**
 * Convert fiat currency amount to internal currency
 * @param {number} amount - Amount in fiat currency
 * @param {number} exchangeRate - Exchange rate from EUR to internal currency
 * @param {string} [currencyCode='EUR'] - Currency code
 * @param {number} [currencyValue=1] - Currency value relative to EUR
 * @returns {number} Amount in internal currency
 */
export const fiatToInternalCurrency = (amount, exchangeRate, currencyCode = 'EUR', currencyValue = 1) => {
    if (!amount || !exchangeRate) return amount;

    // If currency is EUR, just divide by exchange rate
    if (currencyCode === 'EUR') {
        return parseFloat((amount / exchangeRate).toFixed(2));
    }

    // Convert to EUR first (all currency values are relative to EUR)
    const amountInEur = amount / currencyValue;

    // Convert EUR to internal currency
    return parseFloat((amountInEur / exchangeRate).toFixed(2));
}

/**
 * Convert internal currency to fiat currency amount
 * @param {number} internalAmount - Amount in internal currency
 * @param {number} exchangeRate - Exchange rate from EUR to internal currency
 * @param {string} [currencyCode='EUR'] - Currency code
 * @param {number} [currencyValue=1] - Currency value relative to EUR
 * @returns {number} Amount in fiat currency
 */
export const internalCurrencyToFiat = (internalAmount, exchangeRate, currencyCode = 'EUR', currencyValue = 1) => {
    if (!internalAmount || !exchangeRate) return internalAmount;

    // First convert to EUR
    const amountInEur = internalAmount * exchangeRate;

    // If currency is EUR, return the EUR amount
    if (currencyCode === 'EUR') {
        return parseFloat(amountInEur.toFixed(2));
    }

    // Convert from EUR to the target currency
    return parseFloat((amountInEur * currencyValue).toFixed(2));
}