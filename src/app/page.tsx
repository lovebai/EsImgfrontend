'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { uploadFiles } from '@/lib/api';

export default function HomePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<{[key: string]: string}>({}); // Track copy status for each field
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Upload files to the backend through proxy
      const response = await uploadFiles(selectedFiles);
      setUploadedFiles(response);
      setSelectedFiles([]);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // 显示成功消息
      if (response.length > 0) {
        // 可以添加一个成功提示，比如使用一个状态或toast组件
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadError(error.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearUploadedFiles = () => {
    setUploadedFiles([]);
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(prev => ({...prev, [fieldId]: 'copied'}));
      // 2秒后清除状态
      setTimeout(() => {
        setCopyStatus(prev => {
          const newStatus = {...prev};
          delete newStatus[fieldId];
          return newStatus;
        });
      }, 2000);
    } catch (err) {
      setCopyStatus(prev => ({...prev, [fieldId]: 'copy failed'}));
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">EsImg</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Easy Image Hosting Service</p>
          </div>
        </div>
        
        {/* File Selection */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Images
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          
          {uploadError && (
            <div className="text-red-500 text-sm mb-4">
              {uploadError}
            </div>
          )}
          
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selected Files ({selectedFiles.length})
              </h2>
              <ul className="border rounded divide-y">
                {selectedFiles.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="p-2 flex justify-between">
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={clearSelectedFiles}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
                >
                  Clear
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Uploaded Files
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    try {
                      const directLinks = uploadedFiles.map(file => file.directLink).join('\n');
                      await navigator.clipboard.writeText(directLinks);
                      setCopyStatus(prev => ({...prev, 'batch-direct': 'Copied!'}));
                      setTimeout(() => {
                        setCopyStatus(prev => {
                          const newStatus = {...prev};
                          delete newStatus['batch-direct'];
                          return newStatus;
                        });
                      }, 2000);
                    } catch (err) {
                      setCopyStatus(prev => ({...prev, 'batch-direct': 'Copy failed'}));
                      console.error('Failed to copy: ', err);
                    }
                  }}
                  className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none"
                >
                  {copyStatus['batch-direct'] || 'Copy all direct links'}
                </button>
                <button
                  onClick={async () => {
                    try {
                      const markdownLinks = uploadedFiles.map(file => file.markdown).join('\n');
                      await navigator.clipboard.writeText(markdownLinks);
                      setCopyStatus(prev => ({...prev, 'batch-markdown': 'Copied!'}));
                      setTimeout(() => {
                        setCopyStatus(prev => {
                          const newStatus = {...prev};
                          delete newStatus['batch-markdown'];
                          return newStatus;
                        });
                      }, 2000);
                    } catch (err) {
                      setCopyStatus(prev => ({...prev, 'batch-markdown': 'Copy failed'}));
                      console.error('Failed to copy: ', err);
                    }
                  }}
                  className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none"
                >
                  {copyStatus['batch-markdown'] || 'Copy all Markdown'}
                </button>
                <button
                  onClick={clearUploadedFiles}
                  className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={`${file.filename}-${index}`} className="border rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{file.filename}</h3>
                  </div>
                  <div className="p-3">
                    <img 
                      src={file.url} 
                      alt={file.filename} 
                      className="w-full h-48 object-contain bg-gray-100"
                    />
                    <div className="mt-3 space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Direct Link
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={file.directLink}
                            readOnly
                            className="flex-1 min-w-0 block w-full px-3 py-2 text-sm border border-gray-300 rounded-l-md shadow-sm bg-gray-50"
                          />
                          <button
                            onClick={() => copyToClipboard(file.directLink, `${file.filename}-direct`)}
                            className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-500 hover:bg-gray-100"
                          >
                            {copyStatus[`${file.filename}-direct`] || 'Copy'}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Markdown
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={file.markdown}
                            readOnly
                            className="flex-1 min-w-0 block w-full px-3 py-2 text-sm border border-gray-300 rounded-l-md shadow-sm bg-gray-50"
                          />
                          <button
                            onClick={() => copyToClipboard(file.markdown, `${file.filename}-markdown`)}
                            className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-500 hover:bg-gray-100"
                          >
                            {copyStatus[`${file.filename}-markdown`] || 'Copy'}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          BBS
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={file.bbs}
                            readOnly
                            className="flex-1 min-w-0 block w-full px-3 py-2 text-sm border border-gray-300 rounded-l-md shadow-sm bg-gray-50"
                          />
                          <button
                            onClick={() => copyToClipboard(file.bbs, `${file.filename}-bbs`)}
                            className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-500 hover:bg-gray-100"
                          >
                            {copyStatus[`${file.filename}-bbs`] || 'Copy'}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          HTML
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={file.html}
                            readOnly
                            className="flex-1 min-w-0 block w-full px-3 py-2 text-sm border border-gray-300 rounded-l-md shadow-sm bg-gray-50"
                          />
                          <button
                            onClick={() => copyToClipboard(file.html, `${file.filename}-html`)}
                            className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-500 hover:bg-gray-100"
                          >
                            {copyStatus[`${file.filename}-html`] || 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </>
  );
}