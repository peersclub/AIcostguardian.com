import anthropic
import os

# Make sure to set your API key
api_key = os.environ.get("ANTHROPIC_API_KEY", "your-api-key-here")

client = anthropic.Anthropic(api_key=api_key)

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    messages=[{"role": "user", "content": "Hello Claude! Can you help me code?"}]
)

print(message.content[0].text)
