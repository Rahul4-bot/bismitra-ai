/**
 * Client service for Product Journey verification.
 * Calls POST /api/verify-product only — no API keys in the browser.
 */

export async function verifyProductIdentifier(scanValue, selectedRecordId = null) {
  const value = (scanValue || '').trim();
  if (!value) {
    return {
      ok: false,
      errorCode: 'empty',
      message: 'Please scan a QR code or enter a product identifier.',
      candidates: [],
      journey: null
    };
  }

  try {
    const response = await fetch('/api/verify-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanValue: value, selectedRecordId })
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to communicate with /api/verify-product:', error);
    return {
      ok: false,
      errorCode: 'network',
      message: 'Unable to retrieve BIS information right now. Please try again or enter the product identifier manually.',
      candidates: [],
      journey: null
    };
  }
}
