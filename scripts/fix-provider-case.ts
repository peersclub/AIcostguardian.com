import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find all API keys with uppercase providers
  const keys = await prisma.apiKey.findMany({
    where: {
      OR: [
        { provider: 'OPENAI' },
        { provider: 'CLAUDE' },
        { provider: 'GEMINI' },
        { provider: 'GROK' },
        { provider: 'PERPLEXITY' },
        { provider: 'COHERE' },
        { provider: 'MISTRAL' }
      ]
    }
  });
  
  console.log('Found', keys.length, 'keys with uppercase providers');
  
  // Update them to lowercase
  for (const key of keys) {
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { provider: key.provider.toLowerCase() }
    });
    console.log('Updated', key.provider, 'to', key.provider.toLowerCase());
  }
  
  console.log('✅ All providers updated to lowercase');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });