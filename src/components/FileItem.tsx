'use client';

import { useState } from 'react';

interface FileInfo {
  name: string;
  size: number;
  is_dir: boolean;
  mod_time: string;
  url: string;
}

interface FileItemProps {
  file: FileInfo;
  onNavigateToDirectory: (dirname: string) => void;
  onOpenRenameModal: (filename: string) => void;
  onDeleteFile: (filename: string, isDir: boolean) => void;
  copyStatus: { [key: string]: string };
  onCopyLink: (url: string, filename: string, setCopyStatus: (status: { [key: string]: string }) => void) => void;
  setCopyStatus: (status: { [key: string]: string }) => void;
}

export default function FileItem({ 
  file,
  onNavigateToDirectory,
  onOpenRenameModal,
  onDeleteFile,
  copyStatus,
  onCopyLink,
  setCopyStatus
}: FileItemProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center">
        {file.is_dir ? (
          // Directory icon
          <button 
            onClick={() => onNavigateToDirectory(file.name)}
            className="flex-shrink-0 h-16 w-16 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
        ) : (
          // File image
          <img 
            src={file.url} 
            alt={file.name} 
            className="h-16 w-16 object-cover rounded-md mb-2"
          />
        )}
        <div className="text-center w-full">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {file.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {file.is_dir ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Directory
              </span>
            ) : (
              <div className="truncate">
                <div>{(file.size / 1024).toFixed(1)} KB</div>
                <div className="hidden sm:block">{new Date(file.mod_time).toLocaleDateString()}</div>
              </div>
            )}
          </div>
          <div className="flex justify-center space-x-2 mt-2">
            {!file.is_dir && (
              <button 
                onClick={() => onCopyLink(file.url, file.name, setCopyStatus)}
                className="text-xs text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {copyStatus[file.name] || '复制链接'}
              </button>
            )}
            <button 
              onClick={() => onOpenRenameModal(file.name)}
              className="text-xs text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
            >
              重命名
            </button>
            <button 
              onClick={() => onDeleteFile(file.name, file.is_dir)}
              className="text-xs text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}