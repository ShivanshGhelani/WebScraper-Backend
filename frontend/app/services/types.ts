export interface MetaInfo {
  content: string;
  content_length: number;
}

export interface HeadingInfo {
  content: string;
  count: number;
}

export interface PageAnalysis {
  url: string;
  meta_title: MetaInfo;
  meta_description: MetaInfo;
  external_links: string[];
  external_domains: string[];
  social_links: string[];
  headings: {
    [key: string]: HeadingInfo[];
  };
  heading_counts: {
    [key: string]: number;
  };
}

export interface WebsiteAnalysis {
  domain: string;
  total_pages: number;
  analyzed_pages: number;
  pages: PageAnalysis[];
}

export interface WebsiteAnalyzeRequest {
  domain: string;
  max_pages_to_count?: number;
  max_pages_to_analyze?: number;
}

export interface SinglePageAnalyzeRequest {
  url: string;
}

export interface ApiError {
  detail: string;
  status: number;
}
