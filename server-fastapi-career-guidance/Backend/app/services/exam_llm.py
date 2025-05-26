import httpx
import os
import logging
import re
import json

# Set up logging
logger = logging.getLogger(__name__)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Function to fetch exam recommendations based on user input
async def fetch_exam_recommendations(prompt: str):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "X-Title": "exam-recommendation"
    }
    
    payload = {
        "model": "openai/gpt-3.5-turbo",  # Model to be used for AI-powered exam recommendations
        "messages": [
            {"role": "system", "content": "You are an expert career counselor. Always respond with JSON."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "response_format": {"type": "json_object"}  # Request JSON response explicitly
    }
    
    try:
        # Make the HTTP request to the OpenRouter API asynchronously
        async with httpx.AsyncClient() as client:
            logger.info("Making request to OpenRouter API")
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                json=payload, 
                headers=headers,
                timeout=30.0
            )
            
            # Log the response status and part of the content for debugging
            logger.info(f"Response status: {response.status_code}")
            logger.info(f"Response content: {response.text[:200]}...")  # Only print first 200 chars for brevity
            
            # Raise exception for bad responses
            response.raise_for_status()
            result = response.json()
            
            # Extract the raw response content (text)
            if "choices" not in result or not result["choices"]:
                logger.error(f"Unexpected response structure: {result}")
                return "Error: Unexpected API response structure"
                
            content = result["choices"][0]["message"]["content"]
            
            # First try to parse as JSON directly
            return parse_response_to_recommendations(content)
        
    except httpx.RequestError as e:
        logger.error(f"Request error: {str(e)}")
        return f"Error: Unable to connect to API - {str(e)}"
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error: {str(e)}")
        return f"Error: API returned status code {e.response.status_code}"
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return f"Error: {str(e)}"

# Function to parse the response into structured recommendations
def parse_response_to_recommendations(text):
    # First try to parse as JSON
    try:
        data = json.loads(text)
        
        # Check if the response is already in the expected format
        if isinstance(data, list):
            # Just validate each entry has the required fields
            recommendations = []
            for item in data:
                if all(key in item for key in ["exam_name", "why_recommended", "ideal_timeline"]):
                    recommendations.append(item)
            return recommendations
        
        # Check if it's a JSON object with a recommendations key
        elif isinstance(data, dict) and "recommendations" in data:
            return data["recommendations"]
        
        # Handle other JSON formats
        else:
            logger.warning(f"JSON response in unexpected format: {data}")
            return extract_recommendations_from_json(data)
    
    except json.JSONDecodeError:
        # If not JSON, try the regex pattern
        logger.warning("Response is not valid JSON, trying regex parsing")
        return extract_recommendations_with_regex(text)

def extract_recommendations_from_json(data):
    """Extract recommendations from various possible JSON structures"""
    recommendations = []
    
    # Try to handle various possible structures
    if isinstance(data, dict):
        # If there's an "exams" or similar key
        for key in ["exams", "recommendations", "results", "data", "items", "response"]:
            if key in data and isinstance(data[key], list):
                return data[key]
    
    logger.error(f"Could not extract recommendations from JSON: {data}")
    return []

def extract_recommendations_with_regex(text):
    """Extract recommendations using various regex patterns"""
    recommendations = []
    
    # Try multiple patterns to match different formats
    
    # Pattern 1: Original pattern
    pattern1 = r"\d+\.\s+\*\*([^*]+)\*\*\s+-\s+Exam Name:\s+([^*]+)\s+-\s+Why Recommended:\s+([^*]+)\s+-\s+Ideal Timeline:\s+([^*]+)"
    sections = re.findall(pattern1, text)
    
    if sections:
        for section in sections:
            if len(section) == 4:
                title, exam_name, why_recommended, ideal_timeline = section
                recommendations.append({
                    "title": title.strip(),
                    "exam_name": exam_name.strip(),
                    "why_recommended": why_recommended.strip(),
                    "ideal_timeline": ideal_timeline.strip()
                })
        return recommendations
    
    # Pattern 2: Look for JSON-like structures in text
    json_pattern = r"\[\s*{\s*\"exam_name\".*?}\s*\]"
    json_match = re.search(json_pattern, text, re.DOTALL)
    
    if json_match:
        try:
            json_data = json.loads(json_match.group(0))
            return json_data
        except json.JSONDecodeError:
            pass
    
    # Pattern 3: Look for numbered items with key-value pairs
    pattern3 = r"(\d+)\.\s+(.*?):\s+(.*?)(?=\n\d+\.|\Z)"
    matches = re.findall(pattern3, text, re.DOTALL)
    
    if matches:
        current_exam = {}
        for num, key, value in matches:
            key = key.strip().lower().replace(" ", "_")
            if key in ["exam_name", "why_recommended", "ideal_timeline"]:
                current_exam[key] = value.strip()
                
                # If we have all required fields, add to recommendations
                if all(k in current_exam for k in ["exam_name", "why_recommended", "ideal_timeline"]):
                    recommendations.append(current_exam.copy())
                    current_exam = {}
    
    # If all regex patterns fail, log the issue
    if not recommendations:
        logger.error(f"Could not extract recommendations with any regex pattern: {text[:200]}")
    
    return recommendations