import httpx
import os
from dotenv import load_dotenv
import json

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

async def get_llm_response(prompt: str):
    try:
        print("🔍 Prompt:", prompt)
        
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "HTTP-Referer": "http://localhost:8001/",
                    "X-Title": "Career Guide AI",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "mistralai/mistral-7b-instruct",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7
                }
            )

        res.raise_for_status()
        data = res.json()
        print("✅ LLM raw response:", data)

        if "choices" not in data:
            raise ValueError(f"Unexpected response format: {data}")

        # Extract the content from the LLM response
        llm_response = data["choices"][0]["message"]["content"]

        # Attempt to parse the LLM response string into a valid Python dictionary
        try:
            parsed_response = json.loads(llm_response)  # Convert string to dict
        except json.JSONDecodeError as e:
            raise RuntimeError(f"Failed to parse LLM JSON: {e}")

        return parsed_response
    
    except Exception as e:
        raise RuntimeError(f"LLM API call failed: {str(e)}")
