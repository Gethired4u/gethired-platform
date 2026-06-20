from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ["GROQ_API_KEY"],
    base_url=os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1"),
)

response = client.responses.create(
    input="Explain the importance of fast language models",
    model=os.getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
)
print(response.output_text)
