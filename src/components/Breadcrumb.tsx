'use client';

interface BreadcrumbProps {
  currentPath: string;
  onNavigateToRoot: () => void;
  onNavigateToPath: (path: string) => void;
}

export default function Breadcrumb({ 
  currentPath, 
  onNavigateToRoot,
  onNavigateToPath
}: BreadcrumbProps) {
  return (
    <div className="mb-4">
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button 
              onClick={onNavigateToRoot}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Home
            </button>
          </li>
          {currentPath !== '/' && currentPath.split('/').filter(part => part !== '').map((part, index, array) => (
            <li key={index} className="inline-flex items-center">
              <svg className="w-3 h-3 mx-1 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
              {index === array.length - 1 ? (
                <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400 md:ml-2">
                  {part}
                </span>
              ) : (
                <button 
                  onClick={() => {
                    const pathParts = array.slice(0, index + 1);
                    onNavigateToPath('/' + pathParts.join('/'));
                  }}
                  className="ml-1 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 md:ml-2"
                >
                  {part}
                </button>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}