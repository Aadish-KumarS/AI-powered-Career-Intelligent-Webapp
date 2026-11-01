import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    # OpenRouter uses this stable OpenAI-compatible endpoint. Keeping it as a
    # default removes an unnecessary configuration failure while still letting
    # deployments override the provider URL explicitly.
    MODEL_PROVIDER_URL = os.getenv("MODEL_PROVIDER_URL", "https://openrouter.ai/api/v1/chat/completions")
    MODEL_NAME = os.getenv("MODEL_NAME")

settings = Settings()
