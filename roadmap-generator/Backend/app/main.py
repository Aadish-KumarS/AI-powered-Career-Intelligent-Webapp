from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import json
import httpx
import time

load_dotenv()

app = FastAPI()

# ✅ CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 Request model
class RoadmapRequest(BaseModel):
    goal: str

# 📄 Load API Key and model from env
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3-8b-8192")

# 🚀 Main route
@app.post("/generate-roadmap")
async def generate_roadmap(req: RoadmapRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Missing GROQ_API_KEY in .env")

    prompt = f"""
      You are an intelligent AI assistant designed to create personalized, structured career learning roadmaps.

      🎯 Goal: Generate a detailed, step-by-step **career roadmap** for becoming a {req.goal}.

      🧠 Your output must follow this exact JSON structure:
      {{
        "title": "Roadmap Title",
        "description": "A brief summary of the roadmap and its purpose",
        "nodes": [
          {{
            "id": "1",
            "title": "Stage/Topic Name",
            "description": "What the user should focus on in this stage",
            "prerequisites": []  // Use stage IDs like "1", "2", etc.
          }},
          ...
        ],
        "edges": [
          {{ "source": "1", "target": "2" }},
          ...
        ]
      }}

      📌 Guidelines:
      - Use simple string-based IDs like "1", "2", "3" for `id`, `source`, and `target`.
      - Keep `nodes` ordered logically from beginner to advanced.
      - Each `node` represents a **learning stage**, not just a topic — think in terms of progression.
      - Each `prerequisite` in a node should refer to another `id` that must be completed first (or leave it empty).
      - Ensure that each stage is **detailed but concise**.
      - Use industry-standard tools, skills, and concepts relevant to the role.
      - Avoid vague language like “learn basics”; be specific (e.g., “Learn HTML tags and CSS Flexbox”).
      - The roadmap must be suitable for visual tools like React Flow.

      ⚠️ IMPORTANT:
      Your final response **must be a valid JSON object only** — no explanation, no markdown, no extra text. Just the JSON content. Make sure it's complete and properly formatted.
      """


    try:
        start_time = time.time()

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": LLM_MODEL,
            "messages": [
                {"role": "system", "content": "You are an expert roadmap generator."},
                {"role": "user", "content": prompt}
            ]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )

        elapsed = time.time() - start_time
        print(f"⚡ LLM response took {elapsed:.2f} seconds")

        response.raise_for_status()
        result = response.json()
        content = result["choices"][0]["message"]["content"]

        # 🧼 Clean and extract valid JSON
        start_idx = content.find("{")
        end_idx = content.rfind("}") + 1

        if start_idx != -1 and end_idx > start_idx:
            try:
                roadmap_json = json.loads(content[start_idx:end_idx])
                return roadmap_json
            except json.JSONDecodeError:
                return {
                    "error": "JSONDecodeError",
                    "message": "Failed to parse JSON from LLM response.",
                    "raw": content
                }
        else:
            return {
                "error": "MissingJSON",
                "message": "Could not extract valid JSON from LLM response.",
                "raw": content
            }

    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"HTTP error: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
