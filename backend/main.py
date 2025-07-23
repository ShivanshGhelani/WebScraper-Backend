from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.models import WebsiteAnalyzeRequest, WebsiteAnalysis
from api.v1.services.website_scraper import WebsiteScraperService

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Website Analyzer API!"}

from typing import Optional
from fastapi import Query
from api.v1.models import SinglePageAnalyzeRequest

@app.post("/api/v1/analyze", response_model=WebsiteAnalysis)
async def analyze_website(
    request: WebsiteAnalyzeRequest,
    max_pages_to_count: Optional[int] = Query(500, description="Maximum number of pages to count in the website"),
    max_pages_to_analyze: Optional[int] = Query(20, description="Maximum number of pages to analyze in detail")
):
    scraper = WebsiteScraperService(
        request.domain,
        max_pages_to_count=max_pages_to_count,
        max_pages_to_analyze=max_pages_to_analyze,
        is_single_page=False
    )
    analysis = scraper.analyze_website()
    return analysis

@app.post("/api/v1/analyze-page")
async def analyze_single_page(request: SinglePageAnalyzeRequest):
    """Analyze a single page without crawling the entire website"""
    scraper = WebsiteScraperService(
        request.url,
        is_single_page=True
    )
    analysis = scraper.analyze_website()  # This will automatically use single page analysis
    return analysis

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

