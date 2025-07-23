import { useSearchParams, Navigate } from 'react-router';
import { useState } from 'react';
import type { WebsiteAnalysis, PageAnalysis } from '~/services/types';
import TableView from '~/components/TableView';

type ResultsPageProps = {
  analysis: WebsiteAnalysis | PageAnalysis;
  type: 'site' | 'page';
};

type ViewMode = 'cards' | 'table';

function MetaInfoCard({ title, content, contentLength }: { title: string; content: string; contentLength: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
        {title}
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{content}</p>
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4V3M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Length: {contentLength} characters
      </div>
    </div>
  );
}

function HeadingsSection({ headings, counts }: { headings: Record<string, Array<{ content: string; count: number }>>, counts: Record<string, number> }) {
  const headingColors = {
    'h1': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'h2': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'h3': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'h4': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'h5': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'h6': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        Headings Structure
      </h3>
      <div className="space-y-4">
        {Object.entries(headings).map(([level, headingList]) => (
          <div key={level} className="border-l-4 border-blue-200 dark:border-blue-800 pl-4">
            <div className="flex items-center mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${headingColors[level as keyof typeof headingColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                {level.toUpperCase()}
              </span>
              <span className="ml-3 text-gray-600 dark:text-gray-400 text-sm">
                {counts[level] || 0} found
              </span>
            </div>
            <ul className="space-y-2">
              {headingList.map((heading, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {heading.content} 
                    {heading.count > 1 && (
                      <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        {heading.count}x
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinksSection({ 
  external_links, 
  external_domains, 
  social_links 
}: { 
  external_links: string[],
  external_domains: string[],
  social_links: string[] 
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
        <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Links Analysis
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            External Domains ({external_domains.length})
          </h4>
          <div className="max-h-48 overflow-y-auto">
            <ul className="space-y-2">
              {external_domains.map((domain, index) => (
                <li key={index} className="flex items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{domain}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            Social Links ({social_links.length})
          </h4>
          <div className="max-h-48 overflow-y-auto">
            <ul className="space-y-2">
              {social_links.map((link, index) => (
                <li key={index} className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="text-sm truncate">{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const stateParam = searchParams.get('state');
  
  if (!stateParam) {
    return <Navigate to="/" replace />;
  }

  let analysis: ResultsPageProps['analysis'];
  let type: ResultsPageProps['type'];
  
  try {
    const data = JSON.parse(decodeURIComponent(stateParam));
    analysis = data.analysis;
    type = data.type;
  } catch {
    return <Navigate to="/" replace />;
  }

  // If table view is selected, render the table component
  if (viewMode === 'table') {
    return <TableView analysis={analysis} type={type} onBackToCards={() => setViewMode('cards')} />;
  }

  if ('pages' in analysis) {
    // Website analysis
    const websiteAnalysis = analysis as WebsiteAnalysis;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Website Analysis Results
              </h1>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {websiteAnalysis.domain}
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-6 py-3 inline-block border border-gray-200 dark:border-gray-700 mb-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Analyzed <span className="font-semibold text-blue-600 dark:text-blue-400">{websiteAnalysis.analyzed_pages}</span> of{' '}
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{websiteAnalysis.total_pages}</span> pages
                </p>
              </div>
              
              {/* View Toggle */}
              <div className="flex justify-center">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Cards View
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Table View
                  </button>
                </div>
              </div>
            </div>
            
            {/* Pages */}
            <div className="space-y-12">
              {websiteAnalysis.pages.map((page, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-8">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                    Page {index + 1}: {page.url}
                  </h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div>
                      <MetaInfoCard 
                        title="Meta Title"
                        content={page.meta_title.content}
                        contentLength={page.meta_title.content_length}
                      />
                      <MetaInfoCard 
                        title="Meta Description"
                        content={page.meta_description.content}
                        contentLength={page.meta_description.content_length}
                      />
                    </div>
                    <div>
                      <HeadingsSection headings={page.headings} counts={page.heading_counts} />
                    </div>
                  </div>
                  <LinksSection 
                    external_links={page.external_links}
                    external_domains={page.external_domains}
                    social_links={page.social_links}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // Single page analysis
    const pageAnalysis = analysis as PageAnalysis;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Page Analysis Results
              </h1>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 break-all mb-4">
                {pageAnalysis.url}
              </h2>
              
              {/* View Toggle */}
              <div className="flex justify-center">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Cards View
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'table'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Table View
                  </button>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              <div>
                <MetaInfoCard 
                  title="Meta Title"
                  content={pageAnalysis.meta_title.content}
                  contentLength={pageAnalysis.meta_title.content_length}
                />
                <MetaInfoCard 
                  title="Meta Description"
                  content={pageAnalysis.meta_description.content}
                  contentLength={pageAnalysis.meta_description.content_length}
                />
              </div>
              <div>
                <HeadingsSection headings={pageAnalysis.headings} counts={pageAnalysis.heading_counts} />
              </div>
            </div>
            <LinksSection 
              external_links={pageAnalysis.external_links}
              external_domains={pageAnalysis.external_domains}
              social_links={pageAnalysis.social_links}
            />
          </div>
        </div>
      </div>
    );
  }
}
