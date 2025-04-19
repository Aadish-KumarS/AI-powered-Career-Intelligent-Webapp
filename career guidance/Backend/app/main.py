from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import router  
from app.api.v1.career_routes import career_routes


app = FastAPI(
    title="AI Career Recommender",
    version="1.0.0",
    description="An AI-powered career guidance system that suggests personalized career paths based on user inputs.",
    contact={
        "name": "AI Career Support",
        "email": "support@aicareer.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)

app.include_router(router, prefix="/api/v1")

app.include_router(career_routes, prefix="/generator", tags=["Career Intelligence"])
