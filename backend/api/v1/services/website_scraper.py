import requests
from bs4 import BeautifulSoup, XMLParsedAsHTMLWarning
from urllib.parse import urljoin, urlparse, urlunparse
from typing import Dict, List, Tuple, Optional
import re
import warnings
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Filter XML parsing warning
warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

class WebsiteScraperService:
    def __init__(self, url: str, max_pages_to_count: int = 500, max_pages_to_analyze: int = 20, is_single_page: bool = False):
        # Always ensure proper URL format
        self.domain = url if url.startswith(('http://', 'https://')) else f'https://{url}'
        parsed_url = urlparse(self.domain)
        self.base_domain = parsed_url.netloc
        
        # For single page analysis, we need to preserve the full path
        if is_single_page:
            # Keep the full URL including path, query params, etc.
            self.domain = urlunparse((
                parsed_url.scheme,
                parsed_url.netloc,
                parsed_url.path,
                parsed_url.params,
                parsed_url.query,
                parsed_url.fragment
            ))
            
        self.visited_urls = set()
        self.session = self._create_session()
        self.max_pages_to_count = max_pages_to_count
        self.max_pages_to_analyze = max_pages_to_analyze
        self.is_single_page = is_single_page

    def _create_session(self) -> requests.Session:
        """Create a session with retry strategy and proper headers"""
        session = requests.Session()
        
        # Configure retry strategy
        retry_strategy = Retry(
            total=2,  # Reduced from 3 to 2 retries
            backoff_factor=0.3,  # Reduced from 0.5 to 0.3
            status_forcelist=[500, 502, 503, 504],  # HTTP status codes to retry on
        )
        
        # Mount the retry adapter to both HTTP & HTTPS
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Set common headers
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        })
        
        return session

    def _parse_content(self, content: str, content_type: Optional[str] = None) -> BeautifulSoup:
        """
        Parse content using the appropriate parser based on content type
        """
        # Default to lxml for better compatibility
        parser = 'lxml'
        
        if content_type:
            content_type = content_type.lower()
            if 'xml' in content_type:
                # Use XML parser for XML content
                return BeautifulSoup(content, features='xml')
        
        try:
            return BeautifulSoup(content, parser)
        except Exception as e:
            logger.warning(f"Failed to parse with {parser}, falling back to html.parser: {str(e)}")
            return BeautifulSoup(content, 'html.parser')

    def _make_request(self, url: str) -> Optional[requests.Response]:
        """Make a request with error handling"""
        try:
            response = self.session.get(url, timeout=15)  # Increased timeout for e-commerce pages
            
            # Handle common e-commerce platform redirects
            if response.history:
                # If we were redirected, use the final URL
                final_url = response.url
                if final_url != url:
                    logger.info(f"Redirected from {url} to {final_url}")
            
            response.raise_for_status()
            return response
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                logger.error(f"Page not found (404): {url}")
            elif e.response.status_code == 403:
                logger.error(f"Access forbidden (403) - Website may be blocking automated access: {url}")
            elif e.response.status_code == 429:
                logger.error(f"Too many requests (429) - Rate limited by the website: {url}")
            else:
                logger.error(f"HTTP error {e.response.status_code} requesting {url}: {str(e)}")
            return None
            
        except requests.exceptions.Timeout:
            logger.error(f"Request timed out for {url}")
            return None
            
        except requests.exceptions.TooManyRedirects:
            logger.error(f"Too many redirects for {url}")
            return None
            
        except requests.RequestException as e:
            logger.error(f"Error requesting {url}: {str(e)}")
            return None

    def _normalize_url(self, url: str) -> str:
        """Normalize URL by removing fragments, query parameters, and handling index pages"""
        parsed = urlparse(url)
        # Clean up the path
        path = parsed.path if parsed.path else '/'
        # Treat /index.html (or .htm, .php, etc) as equivalent to /
        path = re.sub(r'/(?:index|default)\.(html?|php|asp|aspx)$', '/', path, flags=re.IGNORECASE)
        # Remove query parameters and fragments, normalize path
        normalized = urlunparse((
            parsed.scheme,
            parsed.netloc,
            path,
            '',  # params
            '',  # query
            ''   # fragment
        ))
        return normalized.rstrip('/')

    def _is_social_link(self, url: str) -> bool:
        """Check if a URL is a social media link"""
        social_domains = {
            'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com',
            'youtube.com', 'pinterest.com', 'tiktok.com', 'github.com'
        }
        parsed_url = urlparse(url)
        return any(domain in parsed_url.netloc for domain in social_domains)

    def _extract_links_from_html(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract and normalize all links from HTML content"""
        links = []
        for anchor in soup.find_all('a', href=True):
            href = anchor['href']
            try:
                absolute_url = urljoin(base_url, href)
                # Skip mailto, tel, javascript links and non-HTML file extensions
                parsed_url = urlparse(absolute_url)
                path = parsed_url.path.lower()
                excluded_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.pdf', '.mp4', '.webm', 
                                    '.mp3', '.wav', '.css', '.js', '.ico', '.svg', '.woff', '.woff2')
                if (not absolute_url.startswith(('mailto:', 'tel:', 'javascript:')) and 
                    not path.endswith(excluded_extensions)):
                    links.append(absolute_url)
            except Exception as e:
                logger.warning(f"Error processing link {href}: {str(e)}")
        return links

    def _analyze_page(self, url: str) -> Optional[Dict]:
        """Analyze a single page and extract relevant information"""
        response = self._make_request(url)
        if not response:
            return None

        # Check if content type is HTML
        content_type = response.headers.get('content-type', '').lower()
        if not ('text/html' in content_type or 'application/xhtml+xml' in content_type):
            return None

        try:
            soup = self._parse_content(response.text, content_type)
            
            # Extract meta information
            meta_title = soup.find('title')
            meta_description = soup.find('meta', {'name': 'description'})
            
            # Extract headings
            headings = {}
            heading_counts = {}
            for level in range(1, 7):
                tag = f'h{level}'
                elements = soup.find_all(tag)
                if elements:
                    headings[tag] = [{'content': h.get_text(strip=True), 'count': 1} for h in elements]
                    heading_counts[tag] = len(elements)
            
            # Extract links
            all_links = self._extract_links_from_html(soup, url)
            external_links = []
            external_domains = set()
            social_links = []
            
            for link in all_links:
                try:
                    parsed_link = urlparse(link)
                    if parsed_link.netloc and parsed_link.netloc != self.base_domain:
                        if self._is_social_link(link):
                            social_links.append(link)
                        else:
                            external_links.append(link)
                            external_domains.add(parsed_link.netloc)
                except Exception as e:
                    logger.warning(f"Error processing link {link}: {str(e)}")
            
            return {
                'url': url,
                'meta_title': {
                    'content': meta_title.get_text(strip=True) if meta_title else '',
                    'content_length': len(meta_title.get_text(strip=True)) if meta_title else 0
                },
                'meta_description': {
                    'content': meta_description['content'] if meta_description else '',
                    'content_length': len(meta_description['content']) if meta_description else 0
                },
                'external_links': list(set(external_links)),
                'external_domains': list(external_domains),
                'social_links': list(set(social_links)),
                'headings': headings,
                'heading_counts': heading_counts
            }
        except Exception as e:
            logger.error(f"Error analyzing page {url}: {str(e)}")
            return None

    def analyze_website(self) -> Dict:
        """Analyze website or single page based on initialization parameters"""
        try:
            if self.is_single_page:
                page_analysis = self._analyze_page(self.domain)
                if not page_analysis:
                    raise Exception(f"Failed to analyze page: {self.domain}")
                return page_analysis

            # For full website analysis
            to_visit = {self.domain}
            visited = set()
            analyzed_pages = []
            total_pages = 0
            
            # Use configurable limit for page counting
            while to_visit and total_pages < self.max_pages_to_count:
                try:
                    current_url = to_visit.pop()
                    normalized_url = self._normalize_url(current_url)
                    if normalized_url in visited:
                        continue
                    
                    response = self._make_request(current_url)
                    if not response:
                        continue

                    visited.add(normalized_url)
                    total_pages += 1
                    
                    # Only analyze if within the analysis limit
                    if len(analyzed_pages) < self.max_pages_to_analyze:
                        page_analysis = self._analyze_page(current_url)
                        if page_analysis:
                            analyzed_pages.append(page_analysis)
                    
                    # Continue crawling if we haven't hit the analysis limit
                    if len(analyzed_pages) < self.max_pages_to_analyze:
                        soup = self._parse_content(response.text, response.headers.get('content-type'))
                        extracted_links = self._extract_links_from_html(soup, current_url)
                        
                        for link in extracted_links:
                            parsed_link = urlparse(link)
                            normalized_link = self._normalize_url(link)
                            
                            if (parsed_link.netloc == self.base_domain and 
                                normalized_link not in visited and 
                                normalized_link not in to_visit):
                                to_visit.add(normalized_link)
                
                except Exception as e:
                    logger.error(f"Error processing {current_url}: {str(e)}")
                    continue
            
            return {
                'domain': self.base_domain,
                'total_pages': total_pages,
                'analyzed_pages': len(analyzed_pages),
                'pages': analyzed_pages
            }
            
        finally:
            # Clean up session
            self.session.close()
