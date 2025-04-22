import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
from typing import List, Dict, Any, Optional
import time
from functools import wraps

def rate_limit(seconds: int = 1):
    """Simple rate limiting decorator"""
    def decorator(func):
        last_called = 0
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            nonlocal last_called
            elapsed = time.time() - last_called
            if elapsed < seconds:
                time.sleep(seconds - elapsed)
            result = func(*args, **kwargs)
            last_called = time.time()
            return result
        return wrapper
    return decorator

class ExamScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    @rate_limit(seconds=2)
    def scrape_nta_exams(self) -> List[Dict[str, Any]]:
        """Scrape upcoming exams from NTA website."""
        url = "https://nta.ac.in/"
        exams = []
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find exam notifications (this will vary based on the actual HTML structure)
            notification_section = soup.find('div', {'class': 'notification-section'})
            if not notification_section:
                # Try alternative areas where exam info might be found
                notification_section = soup.find('div', {'id': 'examNotifications'})
            
            if notification_section:
                notification_items = notification_section.find_all('div', {'class': 'notification-item'})
                
                for item in notification_items:
                    title_element = item.find('h4') or item.find('strong') or item.find('a')
                    date_element = item.find('span', {'class': 'date'})
                    
                    if title_element:
                        title = title_element.text.strip()
                        
                        # Extract dates using regex if available
                        date_text = date_element.text.strip() if date_element else ""
                        exam_date = self._extract_date(date_text) if date_text else None
                        
                        # Extract link if available
                        link_element = item.find('a', href=True)
                        link = link_element['href'] if link_element else ""
                        if link and not link.startswith('http'):
                            link = f"https://nta.ac.in/{link}"
                        
                        exams.append({
                            "title": title,
                            "source": "NTA",
                            "exam_date": exam_date,
                            "link": link,
                            "details": date_text,
                            "last_updated": datetime.now().isoformat()
                        })
            
            return exams
        
        except Exception as e:
            print(f"Error scraping NTA exams: {str(e)}")
            return []
    
    @rate_limit(seconds=2)
    def scrape_upsc_exams(self) -> List[Dict[str, Any]]:
        """Scrape upcoming exams from UPSC website."""
        url = "https://upsc.gov.in/examinations/active-examinations"
        exams = []
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            print(soup.prettify()[:3000])  
            # Find the exam tables
            exam_tables = soup.find_all('table')
            
            for table in exam_tables:
                rows = table.find_all('tr')
                
                # Skip header row
                for row in rows[1:]:
                    cells = row.find_all('td')
                    if len(cells) >= 3:
                        exam_name = cells[0].text.strip()
                        notification_date = cells[1].text.strip()
                        
                        # Extract link if available
                        link_element = cells[0].find('a', href=True)
                        link = link_element['href'] if link_element else ""
                        if link and not link.startswith('http'):
                            link = f"https://upsc.gov.in/{link}"
                        
                        exams.append({
                            "title": exam_name,
                            "source": "UPSC",
                            "notification_date": notification_date,
                            "link": link,
                            "last_updated": datetime.now().isoformat()
                        })
            
            return exams
        
        except Exception as e:
            print(f"Error scraping UPSC exams: {str(e)}")
            return []
    
    @rate_limit(seconds=2)
    def scrape_aws_certifications(self) -> List[Dict[str, Any]]:
        """Scrape AWS certification information."""
        url = "https://aws.amazon.com/certification/"
        certifications = []
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find certification cards/sections (adjust selectors as needed)
            cert_sections = soup.find_all('div', {'class': 'certification-card'})
            
            for section in cert_sections:
                title_element = section.find('h3') or section.find('h2')
                desc_element = section.find('p', {'class': 'description'})
                
                if title_element:
                    title = title_element.text.strip()
                    description = desc_element.text.strip() if desc_element else ""
                    
                    # Extract link if available
                    link_element = section.find('a', href=True)
                    link = link_element['href'] if link_element else ""
                    if link and not link.startswith('http'):
                        link = f"https://aws.amazon.com{link}"
                    
                    certifications.append({
                        "title": title,
                        "source": "AWS Certification",
                        "description": description,
                        "link": link,
                        "type": "certification",  # To differentiate from exams
                        "last_updated": datetime.now().isoformat()
                    })
            
            return certifications
        
        except Exception as e:
            print(f"Error scraping AWS certifications: {str(e)}")
            return []
    
    def _extract_date(self, text: str) -> Optional[str]:
        """Extract date from text using regex patterns."""
        date_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',  # DD/MM/YYYY or DD-MM-YYYY
            r'(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\.,]?\s+\d{2,4})'  # 21st January, 2023
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None