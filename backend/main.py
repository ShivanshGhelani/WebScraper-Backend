#!/usr/bin/env python3
"""
Website Analyzer Backend
Can be run as both a FastAPI server and a command-line script
"""

import sys
import json
import argparse
from typing import Optional

# Server mode imports (only imported when running as server)
try:
    from fastapi import FastAPI, Query
    from fastapi.middleware.cors import CORSMiddleware
    SERVER_MODE_AVAILABLE = True
except ImportError:
    SERVER_MODE_AVAILABLE = False

# Core functionality imports
from api.v1.models import WebsiteAnalyzeRequest, WebsiteAnalysis, SinglePageAnalyzeRequest
from api.v1.services.website_scraper import WebsiteScraperService

# Initialize FastAPI app for Vercel (must be at module level)
if SERVER_MODE_AVAILABLE:
    app = FastAPI()
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    async def read_root():
        return {"message": "Welcome to the Website Analyzer API!"}

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
        analysis = scraper.analyze_website()
        return analysis

def analyze_website_cli(url: str, max_pages: int = 10, depth: str = "detailed"):
    """Command-line interface for website analysis"""
    try:
        # Create scraper service
        scraper = WebsiteScraperService(
            url,
            max_pages_to_count=500,
            max_pages_to_analyze=max_pages,
            is_single_page=False
        )
        
        # Perform analysis
        analysis = scraper.analyze_website()
        
        # Convert to dict if it's a Pydantic model
        if hasattr(analysis, 'dict'):
            result = analysis.dict()
        else:
            result = analysis
            
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def analyze_single_page_cli(url: str, extract_content: str = "html"):
    """Command-line interface for single page analysis"""
    try:
        # Create scraper service for single page
        scraper = WebsiteScraperService(
            url,
            is_single_page=True
        )
        
        # Perform analysis
        analysis = scraper.analyze_website()
        
        # Convert to dict if it's a Pydantic model
        if hasattr(analysis, 'dict'):
            result = analysis.dict()
        else:
            result = analysis
            
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def main():
    """Main function for command-line execution"""
    parser = argparse.ArgumentParser(description='Website Analyzer Backend')
    parser.add_argument('--mode', choices=['server', 'analyze-website', 'analyze-page'], 
                       required=True, help='Operation mode')
    parser.add_argument('--url', help='URL to analyze')
    parser.add_argument('--max-pages', type=int, default=10, 
                       help='Maximum pages to analyze (website mode)')
    parser.add_argument('--depth', default='detailed', 
                       choices=['basic', 'detailed', 'comprehensive'],
                       help='Analysis depth (website mode)')
    parser.add_argument('--extract-content', default='html',
                       choices=['text', 'html', 'both'],
                       help='Content extraction type (page mode)')
    parser.add_argument('--input-file', help='Input JSON file with parameters')
    parser.add_argument('--output-file', help='Output JSON file for results')
    
    args = parser.parse_args()
    
    # Handle file-based input
    if args.input_file:
        try:
            with open(args.input_file, 'r') as f:
                input_data = json.load(f)
                
            # Override command line args with file data
            if 'url' in input_data:
                args.url = input_data['url']
            if 'max_pages' in input_data:
                args.max_pages = input_data['max_pages']
            if 'depth' in input_data:
                args.depth = input_data['depth']
            if 'extract_content' in input_data:
                args.extract_content = input_data['extract_content']
                
        except Exception as e:
            result = {"success": False, "error": f"Failed to read input file: {str(e)}"}
            print(json.dumps(result))
            return
    
    # Process based on mode
    if args.mode == 'server':
        if not SERVER_MODE_AVAILABLE:
            print(json.dumps({"success": False, "error": "FastAPI not available for server mode"}))
            return
            
        # Run as FastAPI server
        run_server()
        
    elif args.mode == 'analyze-website':
        if not args.url:
            result = {"success": False, "error": "URL is required for website analysis"}
        else:
            result = analyze_website_cli(args.url, args.max_pages, args.depth)
            
    elif args.mode == 'analyze-page':
        if not args.url:
            result = {"success": False, "error": "URL is required for page analysis"}
        else:
            result = analyze_single_page_cli(args.url, args.extract_content)
    
    # Output results
    if args.mode != 'server':
        if args.output_file:
            try:
                with open(args.output_file, 'w') as f:
                    json.dump(result, f, indent=2)
            except Exception as e:
                print(json.dumps({"success": False, "error": f"Failed to write output file: {str(e)}"}))
        else:
            print(json.dumps(result, indent=2))

def run_server():
    """Run as FastAPI server for local development"""
    if not SERVER_MODE_AVAILABLE:
        raise ImportError("FastAPI dependencies not available")
        
    # Start the server
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    main()

