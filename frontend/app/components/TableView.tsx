import React, { useState, useMemo } from 'react';
import type { WebsiteAnalysis, PageAnalysis } from '~/services/types';

interface TableViewProps {
  analysis: WebsiteAnalysis | PageAnalysis;
  type: 'site' | 'page';
  onBackToCards?: () => void;
}

interface TableRow {
  srNo: number;
  url: string;
  metaTitle: string;
  metaTitleLength: number;
  metaDescription: string;
  metaDescLength: number;
  h1Count: number;
  h1Content: string;
  h2Count: number;
  h2Content: string;
  h3Count: number;
  h3Content: string;
  h4Count: number;
  h4Content: string;
  h5Count: number;
  h5Content: string;
  h6Count: number;
  h6Content: string;
  externalLinksCount: number;
  externalLinks: string;
  externalDomainsCount: number;
  externalDomains: string;
  socialLinksCount: number;
  socialLinks: string;
}

export default function TableView({ analysis, type, onBackToCards }: TableViewProps) {
  const [sortColumn, setSortColumn] = useState<keyof TableRow>('srNo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const tableData = useMemo(() => {
    const pages = 'pages' in analysis ? analysis.pages : [analysis];
    
    return pages.map((page, index) => {
      const getHeadingContent = (level: string) => {
        const headings = page.headings[level] || [];
        return headings.map(h => h.content).join(' | ');
      };

      return {
        srNo: index + 1,
        url: page.url,
        metaTitle: page.meta_title.content,
        metaTitleLength: page.meta_title.content_length,
        metaDescription: page.meta_description.content,
        metaDescLength: page.meta_description.content_length,
        h1Count: page.heading_counts.h1 || 0,
        h1Content: getHeadingContent('h1'),
        h2Count: page.heading_counts.h2 || 0,
        h2Content: getHeadingContent('h2'),
        h3Count: page.heading_counts.h3 || 0,
        h3Content: getHeadingContent('h3'),
        h4Count: page.heading_counts.h4 || 0,
        h4Content: getHeadingContent('h4'),
        h5Count: page.heading_counts.h5 || 0,
        h5Content: getHeadingContent('h5'),
        h6Count: page.heading_counts.h6 || 0,
        h6Content: getHeadingContent('h6'),
        externalLinksCount: page.external_links.length,
        externalLinks: page.external_links.join(' | '),
        externalDomainsCount: page.external_domains.length,
        externalDomains: page.external_domains.join(' | '),
        socialLinksCount: page.social_links.length,
        socialLinks: page.social_links.join(' | '),
      };
    });
  }, [analysis]);

  const filteredData = useMemo(() => {
    return tableData.filter(row =>
      Object.values(row).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [tableData, searchTerm]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = aValue.toString().toLowerCase();
      const bStr = bValue.toString().toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleSort = (column: keyof TableRow) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Sr No', 'URL', 'Meta Title', 'Title Length', 'Meta Description', 'Desc Length',
      'H1 Count', 'H1 Content', 'H2 Count', 'H2 Content', 'H3 Count', 'H3 Content',
      'H4 Count', 'H4 Content', 'H5 Count', 'H5 Content', 'H6 Count', 'H6 Content',
      'External Links Count', 'External Links', 'External Domains Count', 'External Domains',
      'Social Links Count', 'Social Links'
    ];

    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => [
        row.srNo, `"${row.url}"`, `"${row.metaTitle}"`, row.metaTitleLength,
        `"${row.metaDescription}"`, row.metaDescLength,
        row.h1Count, `"${row.h1Content}"`, row.h2Count, `"${row.h2Content}"`,
        row.h3Count, `"${row.h3Content}"`, row.h4Count, `"${row.h4Content}"`,
        row.h5Count, `"${row.h5Content}"`, row.h6Count, `"${row.h6Content}"`,
        row.externalLinksCount, `"${row.externalLinks}"`,
        row.externalDomainsCount, `"${row.externalDomains}"`,
        row.socialLinksCount, `"${row.socialLinks}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `website-analysis-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIcon = ({ column }: { column: keyof TableRow }) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {type === 'site' ? 'Website Analysis Table' : 'Page Analysis Table'}
            </h1>
            {'domain' in analysis && (
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {analysis.domain}
              </h2>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value={10}>10 rows</option>
                  <option value={25}>25 rows</option>
                  <option value={50}>50 rows</option>
                  <option value={100}>100 rows</option>
                </select>
              </div>
              <div className="flex gap-2">
                {onBackToCards && (
                  <button
                    onClick={onBackToCards}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Cards View
                  </button>
                )}
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {[
                      { key: 'srNo', label: 'Sr No', width: 'w-16' },
                      { key: 'url', label: 'URL', width: 'w-64' },
                      { key: 'metaTitle', label: 'Meta Title', width: 'w-64' },
                      { key: 'metaTitleLength', label: 'Title Length', width: 'w-24' },
                      { key: 'metaDescription', label: 'Meta Description', width: 'w-64' },
                      { key: 'metaDescLength', label: 'Desc Length', width: 'w-24' },
                      { key: 'h1Count', label: 'H1 Count', width: 'w-20' },
                      { key: 'h1Content', label: 'H1 Content', width: 'w-48' },
                      { key: 'h2Count', label: 'H2 Count', width: 'w-20' },
                      { key: 'h2Content', label: 'H2 Content', width: 'w-48' },
                      { key: 'h3Count', label: 'H3 Count', width: 'w-20' },
                      { key: 'h3Content', label: 'H3 Content', width: 'w-48' },
                      { key: 'h4Count', label: 'H4 Count', width: 'w-20' },
                      { key: 'h4Content', label: 'H4 Content', width: 'w-48' },
                      { key: 'h5Count', label: 'H5 Count', width: 'w-20' },
                      { key: 'h5Content', label: 'H5 Content', width: 'w-48' },
                      { key: 'h6Count', label: 'H6 Count', width: 'w-20' },
                      { key: 'h6Content', label: 'H6 Content', width: 'w-48' },
                      { key: 'externalLinksCount', label: 'Ext Links Count', width: 'w-24' },
                      { key: 'externalLinks', label: 'External Links', width: 'w-64' },
                      { key: 'externalDomainsCount', label: 'Ext Domains Count', width: 'w-24' },
                      { key: 'externalDomains', label: 'External Domains', width: 'w-64' },
                      { key: 'socialLinksCount', label: 'Social Count', width: 'w-24' },
                      { key: 'socialLinks', label: 'Social Links', width: 'w-64' },
                    ].map(({ key, label, width }) => (
                      <th
                        key={key}
                        onClick={() => handleSort(key as keyof TableRow)}
                        className={`${width} px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                      >
                        <div className="flex items-center">
                          {label}
                          <SortIcon column={key as keyof TableRow} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {row.srNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={row.url}>
                        <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          {row.url}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={row.metaTitle}>
                        {row.metaTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.metaTitleLength}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={row.metaDescription}>
                        {row.metaDescription}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.metaDescLength}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.h1Count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-48 truncate" title={row.h1Content}>
                        {row.h1Content}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.h2Count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-48 truncate" title={row.h2Content}>
                        {row.h2Content}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.h3Count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-48 truncate" title={row.h3Content}>
                        {row.h3Content}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.h4Count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-48 truncate" title={row.h4Content}>
                        {row.h4Content}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.h5Count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-48 truncate" title={row.h5Content}>
                        {row.h5Content}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.h6Count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-48 truncate" title={row.h6Content}>
                        {row.h6Content}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.externalLinksCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={row.externalLinks}>
                        {row.externalLinks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.externalDomainsCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={row.externalDomains}>
                        {row.externalDomains}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {row.socialLinksCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={row.socialLinks}>
                        {row.socialLinks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-6 py-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
