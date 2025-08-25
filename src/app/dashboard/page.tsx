'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { getFiles, deleteFile, createDirectory, adminUploadFiles, renameFile } from '@/lib/api';
import { FileListResponse } from '@/lib/api';
import Pagination from '@/components/Pagination';
import FileGrid from '@/components/FileGrid';
import Breadcrumb from '@/components/Breadcrumb';

export default function DashboardPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateDirModal, setShowCreateDirModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{name: string, isDir: boolean} | null>(null);
  const [newDirName, setNewDirName] = useState('');
  const [createDirError, setCreateDirError] = useState<string | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [oldFilename, setOldFilename] = useState('');
  const [newFilename, setNewFilename] = useState('');
  const [currentPath, setCurrentPath] = useState('/'); // Track current directory path
  const [copyStatus, setCopyStatus] = useState<{[key: string]: string}>({}); // Track copy status for each file
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalFiles: 0,
    perPage: 20
  }); // Pagination state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Load files if authenticated
    loadFiles(currentPath, 1); // Reset to first page when path changes
    setPagination(prev => ({...prev, currentPage: 1}));
  }, [isAuthenticated, router, currentPath]);

  const loadFiles = async (path: string = '/', page: number = 1) => {
    try {
      setIsLoading(true);
      // Fetch files from the backend for the specified path and page
      const filesData: FileListResponse = await getFiles(path, page);
      setFiles(filesData.files);
      setPagination({
        currentPage: filesData.pagination.current_page,
        totalPages: filesData.pagination.total_pages,
        totalFiles: filesData.pagination.total_files,
        perPage: filesData.pagination.per_page
      });
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      // Upload files to the backend with current path using the API service
      await adminUploadFiles(selectedFiles, currentPath);
      
      // Refresh the file list after successful upload
      await loadFiles(currentPath);
      setSelectedFiles([]);
      setShowUploadModal(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateDirectory = async () => {
    if (!newDirName.trim()) {
      setCreateDirError('Directory name is required');
      return;
    }

    try {
      setCreateDirError(null);
      
      // Create directory via API service with current path
      const success = await createDirectory(newDirName, currentPath);
      
      if (success) {
        // Close modal and reset form
        setShowCreateDirModal(false);
        setNewDirName('');
        
        // Refresh file list to show the new directory
        await loadFiles(currentPath);
        
        // Show success message
        console.log('Directory created successfully');
      }
    } catch (error) {
      console.error('Create directory failed:', error);
      setCreateDirError('Failed to create directory. Please try again.');
    }
  };

  const handleRenameFile = async () => {
    if (!oldFilename.trim() || !newFilename.trim()) {
      setRenameError('Both old and new filenames are required');
      return;
    }

    if (oldFilename === newFilename) {
      setRenameError('New filename must be different from old filename');
      return;
    }

    try {
      setRenameError(null);
      
      // Rename file or directory via API service with current path
      const result = await renameFile(oldFilename, newFilename, currentPath);
      
      if (result.success && result.file) {
        // Close modal and reset form
        setShowRenameModal(false);
        setOldFilename('');
        setNewFilename('');
        
        // Refresh file list to show the renamed file/directory
        await loadFiles(currentPath);
        
        // Show success message
        console.log('File or directory renamed successfully');
      }
    } catch (error) {
      console.error('Rename file failed:', error);
      setRenameError('Failed to rename file or directory. Please try again.');
    }
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (filename: string, isDir: boolean = false) => {
    // 设置要删除的文件信息并显示确认弹窗
    setFileToDelete({ name: filename, isDir });
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;

    try {
      const result = await deleteFile(fileToDelete.name, currentPath);
      if (result.success) {
        setFiles(files.filter(file => file.name !== fileToDelete.name));
      }
      // 关闭确认弹窗并清除文件信息
      setShowDeleteConfirmModal(false);
      setFileToDelete(null);
    } catch (error) {
      console.error('Failed to delete file:', error);
      // 关闭确认弹窗并清除文件信息
      setShowDeleteConfirmModal(false);
      setFileToDelete(null);
    }
  };

  const cancelDeleteFile = () => {
    // 关闭确认弹窗并清除文件信息
    setShowDeleteConfirmModal(false);
    setFileToDelete(null);
  };

  const handleOpenRenameModal = (filename: string) => {
    setOldFilename(filename);
    setNewFilename(filename);
    setShowRenameModal(true);
  };

  const handleNavigateToDirectory = (dirname: string) => {
    // Navigate to the selected directory
    const newPath = currentPath === '/' ? `/${dirname}` : `${currentPath}/${dirname}`;
    setCurrentPath(newPath);
  };

  const handleNavigateUp = () => {
    // Navigate up one level
    if (currentPath === '/') return;
    
    const pathParts = currentPath.split('/').filter(part => part !== '');
    pathParts.pop(); // Remove last part
    
    if (pathParts.length === 0) {
      setCurrentPath('/');
    } else {
      setCurrentPath('/' + pathParts.join('/'));
    }
  };

  // Pagination functions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadFiles(currentPath, page);
    }
  };

  const goToPreviousPage = () => {
    if (pagination.currentPage > 1) {
      loadFiles(currentPath, pagination.currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      loadFiles(currentPath, pagination.currentPage + 1);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Don't render anything while checking authentication
  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">EasyImg Admin</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Breadcrumb Navigation */}
          <Breadcrumb 
            currentPath={currentPath}
            onNavigateToRoot={() => setCurrentPath('/')}
            onNavigateToPath={(path) => setCurrentPath(path)}
          />

          {/* File Management Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">File Management</h2>
            {currentPath !== '/' && (
              <button
                onClick={handleNavigateUp}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
              >
                Up
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <FileGrid 
                files={files}
                onNavigateToDirectory={handleNavigateToDirectory}
                onOpenRenameModal={handleOpenRenameModal}
                onDeleteFile={handleDeleteFile}
                copyStatus={copyStatus}
                onCopyLink={async (url, filename, setCopyStatusCallback) => {
                  try {
                    await navigator.clipboard.writeText(url);
                    setCopyStatus(prev => ({...prev, [filename]: '已复制!'}));
                    // 2秒后清除状态
                    setTimeout(() => {
                      setCopyStatus(prev => {
                        const newStatus = {...prev};
                        delete newStatus[filename];
                        return newStatus;
                      });
                    }, 2000);
                  } catch (err) {
                    setCopyStatus(prev => ({...prev, [filename]: '复制失败'}));
                    console.error('Failed to copy: ', err);
                  }
                }}
                setCopyStatus={setCopyStatus}
              />
            </div>
          )}
          
          <Pagination 
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalFiles={pagination.totalFiles}
            perPage={pagination.perPage}
            onPageChange={(page) => loadFiles(currentPath, page)}
          />
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        <button
          onClick={() => setShowCreateDirModal(true)}
          className="flex items-center justify-center h-14 w-14 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 focus:outline-none"
          title="Create Directory"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
        </button>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none"
          title="Upload Files"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Files to {currentPath}</h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  clearSelectedFiles();
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
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
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Selected Files ({selectedFiles.length})
                </h4>
                <ul className="border rounded divide-y max-h-40 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <li key={`${file.name}-${index}`} className="p-2 flex justify-between">
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  clearSelectedFiles();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Directory Modal */}
      {showCreateDirModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create Directory in {currentPath}</h3>
              <button 
                onClick={() => {
                  setShowCreateDirModal(false);
                  setNewDirName('');
                  setCreateDirError(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Directory Name
              </label>
              <input
                type="text"
                value={newDirName}
                onChange={(e) => setNewDirName(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter directory name"
              />
            </div>
            
            {createDirError && (
              <div className="text-red-500 text-sm mb-4">
                {createDirError}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateDirModal(false);
                  setNewDirName('');
                  setCreateDirError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDirectory}
                disabled={!newDirName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none disabled:opacity-50"
              >
                Create Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Rename File or Directory</h3>
              <button 
                onClick={() => {
                  setShowRenameModal(false);
                  setOldFilename('');
                  setNewFilename('');
                  setRenameError(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Name
              </label>
              <input
                type="text"
                value={oldFilename}
                disabled
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100 dark:bg-gray-700"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Name
              </label>
              <input
                type="text"
                value={newFilename}
                onChange={(e) => setNewFilename(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter new name"
              />
            </div>
            
            {renameError && (
              <div className="text-red-500 text-sm mb-4">
                {renameError}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setOldFilename('');
                  setNewFilename('');
                  setRenameError(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameFile}
                disabled={!oldFilename.trim() || !newFilename.trim() || oldFilename === newFilename}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded hover:bg-yellow-700 focus:outline-none disabled:opacity-50"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
              <button 
                onClick={cancelDeleteFile}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete the {fileToDelete?.isDir ? 'directory' : 'file'} <strong>"{fileToDelete?.name}"</strong>? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelDeleteFile}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
