// Test script for AI chat functionality
const fetch = require('node-fetch');

async function testChat() {
  try {
    // First, test getting available models
    console.log('Testing GET /api/chat to fetch available models...');
    const modelsResponse = await fetch('http://localhost:3000/api/chat');
    const modelsData = await modelsResponse.json();
    console.log('Available models:', JSON.stringify(modelsData, null, 2));
    
    // Test with a simple message
    if (modelsData.models && modelsData.models.length > 0) {
      const firstModel = modelsData.models[0];
      console.log('\nTesting POST /api/chat with model:', firstModel.id);
      
      const chatResponse = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Hello, this is a test',
          model: firstModel.id
        })
      });
      
      const chatData = await chatResponse.json();
      console.log('Chat response:', JSON.stringify(chatData, null, 2));
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testChat();
