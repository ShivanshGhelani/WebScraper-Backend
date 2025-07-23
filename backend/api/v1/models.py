from pydantic import BaseModel, HttpUrl
from typing import Dict, List, Optional

class WebsiteAnalyzeRequest(BaseModel):
    domain: str

class SinglePageAnalyzeRequest(BaseModel):
    url: str  # Complete URL of the page to analyze

class MetaInfo(BaseModel):
    content: str
    content_length: int

class HeadingInfo(BaseModel):
    content: str
    count: int

class PageAnalysis(BaseModel):
    url: str
    meta_title: MetaInfo
    meta_description: MetaInfo
    external_links: List[str]  # Only external links
    external_domains: List[str]
    social_links: List[str]
    headings: Dict[str, List[HeadingInfo]]
    heading_counts: Dict[str, int]

class WebsiteAnalysis(BaseModel):
    domain: str
    total_pages: int
    analyzed_pages: int
    pages: List[PageAnalysis]
