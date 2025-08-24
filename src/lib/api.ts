// API service for communicating with the backend through proxy
const API_BASE_URL = '/api';

export interface UploadResponse {
  filename: string;
  url: string;
  type: string;
  size: number;
  directLink: string;
  markdown: string;
  bbs: string;
  html: string;
}

export interface AdminUploadResponse {
  message: string;
  file: {
    name: string;
    size: number;
    is_dir: boolean;
    mod_time: string;
    url: string;
    directLink: string;
    markdown: string;
    bbs: string;
    html: string;
  };
}

export interface FileInfo {
  name: string;
  size: number;
  is_dir: boolean;
  mod_time: string;
  url: string;
}

export interface FileListResponse {
  path: string;
  files: FileInfo[];
}

// Public upload files to the server (for homepage/anonymous users)
export async function uploadFiles(files: File[]): Promise<UploadResponse[]> {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    // 检查响应状态
    if (!response.ok) {
      throw new Error(data.message || `Upload failed with status ${response.status}`);
    }
    
    // 检查业务状态码
    if (data.code !== 200 && data.code !== 207) {
      throw new Error(data.message || 'Upload failed');
    }
    
    // Transform the backend response to match our expected format
    const results = data.results || [];
    return results
      .filter((result: any) => result.status === 'success') // 只处理成功的文件
      .map((result: any) => ({
        filename: result.filename,
        url: result.url,
        directLink: result.url,
        markdown: `![${result.filename}](${result.url})`,
        bbs: `[img]${result.url}[/img]`,
        html: `<img src="${result.url}" alt="${result.filename}" />`,
        size: result.size,
        type: result.type
      }));
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Admin upload files to the server (for authenticated users)
export async function adminUploadFiles(files: File[], path: string = '/'): Promise<AdminUploadResponse[]> {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('file', file); // Note: admin endpoint expects 'file' not 'files'
  });
  
  try {
    const response = await fetch(`${API_BASE_URL}/v1/upload?path=${encodeURIComponent(path)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Admin upload failed with status ${response.status}`);
    }
    
    const data = await response.json();
    // Transform the backend response to match our expected format
    return [{
      message: data.message,
      file: {
        name: data.file.name,
        size: data.file.size,
        is_dir: data.file.is_dir,
        mod_time: data.file.mod_time,
        url: data.file.url,
        directLink: data.file.url,
        markdown: `![${data.file.name}](${data.file.url})`,
        bbs: `[img]${data.file.url}[/img]`,
        html: `<img src="${data.file.url}" alt="${data.file.name}" />`
      }
    }];
  } catch (error) {
    console.error('Admin upload error:', error);
    throw error;
  }
}

// Create a new directory
export async function createDirectory(dirname: string, path: string = '/'): Promise<boolean> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/v1/addfile?dirname=${encodeURIComponent(dirname)}&path=${encodeURIComponent(path)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create directory with status ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Create directory error:', error);
    throw error;
  }
}

// Authenticate user
export async function login(username: string, password: string, turnstileToken?: string): Promise<{token: string, expireAt: number} | null> {
  try {
    const requestBody: any = { username, password };
    if (turnstileToken) {
      requestBody.turnstileToken = turnstileToken;
    }
    
    const response = await fetch(`${API_BASE_URL}/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (data.data && data.data.token) {
      return {
        token: data.data.token,
        expireAt: data.data.expire_at
      };
    }
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Get list of files and directories
export async function getFiles(path: string = '/'): Promise<FileInfo[]> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/v1/filelist?path=${encodeURIComponent(path)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch files with status ${response.status}`);
    }
    
    const data: FileListResponse = await response.json();
    // Return all files and directories (don't filter out directories)
    return data.files;
  } catch (error) {
    console.error('Fetch files error:', error);
    throw error;
  }
}

// Delete a file or directory
export async function deleteFile(filename: string, path: string = '/'): Promise<{success: boolean, isDir?: boolean}> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/v1/delete?filename=${encodeURIComponent(filename)}&path=${encodeURIComponent(path)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      return { success: false };
    }
    
    const data = await response.json();
    return { success: true, isDir: data.is_dir };
  } catch (error) {
    console.error('Delete file error:', error);
    return { success: false };
  }
}

// Rename a file or directory
export async function renameFile(oldFilename: string, newFilename: string, path: string = '/'): Promise<{success: boolean, file?: FileInfo}> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/v1/rename?old_filename=${encodeURIComponent(oldFilename)}&new_filename=${encodeURIComponent(newFilename)}&path=${encodeURIComponent(path)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to rename file or directory');
    }
    
    const data = await response.json();
    return { success: true, file: data.file };
  } catch (error) {
    console.error('Rename file error:', error);
    return { success: false };
  }
}