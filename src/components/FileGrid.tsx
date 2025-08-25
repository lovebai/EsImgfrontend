'use client';

import FileItem from '@/components/FileItem';

interface FileInfo {
  name: string;
  size: number;
  is_dir: boolean;
  mod_time: string;
  url: string;
}

interface FileGridProps {
  files: FileInfo[];
  onNavigateToDirectory: (dirname: string) => void;
  onOpenRenameModal: (filename: string) => void;
  onDeleteFile: (filename: string, isDir: boolean) => void;
  copyStatus: { [key: string]: string };
  onCopyLink: (url: string, filename: string, setCopyStatus: (status: { [key: string]: string }) => void) => void;
  setCopyStatus: (status: { [key: string]: string }) => void;
}

export default function FileGrid({ 
  files, 
  onNavigateToDirectory,
  onOpenRenameModal,
  onDeleteFile,
  copyStatus,
  onCopyLink,
  setCopyStatus
}: FileGridProps) {
  if (!files || files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No files or directories found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
      {files.map((file, index) => (
        <FileItem
          key={`${file.name}-${index}`}
          file={file}
          onNavigateToDirectory={onNavigateToDirectory}
          onOpenRenameModal={onOpenRenameModal}
          onDeleteFile={onDeleteFile}
          copyStatus={copyStatus}
          onCopyLink={onCopyLink}
          setCopyStatus={setCopyStatus}
        />
      ))}
    </div>
  );
}