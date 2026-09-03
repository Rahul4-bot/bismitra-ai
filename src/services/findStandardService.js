/**
 * Client-side Service for Find My Standard feature.
 * Communicates strictly with POST /api/find-standard.
 * Contains NO API keys, NO model endpoints, and NO server secrets.
 */

export async function findStandard(productDescription) {
  const description = (productDescription || '').trim();
  if (!description) {
    return {
      ok: false,
      errorCode: 'empty',
      message: 'Please enter a product name or description.'
    };
  }

  try {
    const response = await fetch('/api/find-standard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productDescription: description })
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to communicate with /api/find-standard:', error);
    return {
      ok: false,
      errorCode: 'network',
      message: 'Unable to analyze the product right now. Please try again in a moment.'
    };
  }
}
