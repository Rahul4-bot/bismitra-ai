/**
 * Client-side Chat Service for BISMITRA AI
 * Communicates strictly with the secure backend endpoint POST /api/chat.
 * Contains NO API keys, NO model endpoints, and NO server secrets.
 */

export async function sendChatMessage(queryText) {
  const query = (queryText || '').trim();
  if (!query) {
    return {
      id: 'msg-' + Date.now(),
      sender: 'bismitra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "Please enter a valid question regarding Indian Standards, BIS certification, Hallmarking, CRS, or testing laboratories.",
      sources: []
    };
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to communicate with /api/chat backend:', error);
    return {
      id: 'msg-' + Date.now(),
      sender: 'bismitra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### System Communication Notice\n\nUnable to reach the BISMITRA AI knowledge engine at this moment. Please check your network connection or verify that the local dev server is running.\n\n*Error details: ${error.message}*`,
      sources: [],
      confidence: "low",
      suggestedActions: [
        { label: 'Try Again', payloadText: query }
      ]
    };
  }
}
