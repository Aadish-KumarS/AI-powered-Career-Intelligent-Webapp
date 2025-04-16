import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    MODEL_PROVIDER_URL = os.getenv("MODEL_PROVIDER_URL")
    MODEL_NAME = os.getenv("MODEL_NAME")

settings = Settings()
