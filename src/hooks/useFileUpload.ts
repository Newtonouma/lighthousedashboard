// Enhanced file upload hook with better error handling and progress
import { useState, useCallback } from 'react';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  provider?: string;
}

export interface UseFileUploadOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
  onProgress?: (progress: UploadProgress) => void;
  folder?: string;
}

export interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<UploadResult>;
  uploadFiles: (files: File[]) => Promise<UploadResult[]>;
  uploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  clearError: () => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    onProgress,
    folder = 'dashboard'
  } = options;

  const validateFile = useCallback((file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }
    
    if (file.size > maxFileSize) {
      return `File too large. Maximum size: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
    }
    
    return null;
  }, [allowedTypes, maxFileSize]);

  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    setError(null);
    setProgress(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      throw new Error(validationError);
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (folder) {
        formData.append('folder', folder);
      }

      const xhr = new XMLHttpRequest();
      
      return new Promise<UploadResult>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progressData = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            setProgress(progressData);
            onProgress?.(progressData);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);            } catch {
              reject(new Error('Invalid response format'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || 'Upload failed'));
            } catch {
              reject(new Error(`Upload failed with status: ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [validateFile, folder, onProgress]);

  const uploadFiles = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadFile(files[i]);
        results.push(result);
      } catch (error) {
        // Continue with other files even if one fails
        console.error(`Failed to upload file ${files[i].name}:`, error);
        throw error; // Re-throw to stop the process
      }
    }
    
    return results;
  }, [uploadFile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadFile,
    uploadFiles,
    uploading,
    progress,
    error,
    clearError
  };
}
