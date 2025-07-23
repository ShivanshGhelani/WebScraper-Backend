export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">About Website Analyzer</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3 dark:text-white">Overview</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Website Analyzer is a powerful tool that helps you analyze websites and individual web pages. 
              It provides detailed insights about meta information, heading structure, and link analysis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 dark:text-white">Features</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Full website analysis</li>
              <li>Single page analysis</li>
              <li>Meta information extraction</li>
              <li>Heading structure analysis</li>
              <li>External and social links detection</li>
              <li>Detailed analytics and statistics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 dark:text-white">How to Use</h2>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <p>To analyze a website or page:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Choose between full website or single page analysis</li>
                <li>Enter the domain or URL you want to analyze</li>
                <li>Click the analyze button and wait for the results</li>
                <li>Review the detailed analysis report</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
