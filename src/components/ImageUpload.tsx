// Enhanced image upload component with drag & drop, progress, and preview
'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useFileUpload, UploadProgress } from '@/hooks/useFileUpload';

interface ImageUploadProps {
  onUpload: (result: { url: string; publicId?: string }) => void;
  onError?: (error: string) => void;
  currentImageUrl?: string;
  folder?: string;
  maxFileSize?: number;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
}

export default function ImageUpload({
  onUpload,
  onError,
  currentImageUrl,
  folder = 'dashboard',
  maxFileSize = 10 * 1024 * 1024, // 10MB
  className = '',
  disabled = false,
  multiple = false
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, uploading, progress, error, clearError } = useFileUpload({
    maxFileSize,
    folder,
    onProgress: (progress: UploadProgress) => {
      console.log(`Upload progress: ${progress.percentage}%`);
    }
  });

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const file = fileArray[0]; // Take first file for single upload
    
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      clearError();
      const result = await uploadFile(file);
      onUpload(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      onError?.(errorMessage);
      setPreviewUrl(currentImageUrl || null); // Reset preview on error
    }
  }, [uploadFile, onUpload, onError, clearError, currentImageUrl]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const triggerFileInput = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const removeImage = useCallback(() => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={`image-upload-container ${className}`}>
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
      >
        {previewUrl ? (
          <div className="image-preview">            <Image
              src={previewUrl}
              alt="Preview"
              width={400}
              height={300}
              className="preview-image"
            />
            {!uploading && (
              <button
                type="button"
                className="remove-button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                disabled={disabled}
              >
                ×
              </button>
            )}
            {uploading && (
              <div className="upload-overlay">
                <div className="upload-progress">                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress?.percentage || 0}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {progress?.percentage || 0}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="upload-placeholder">
            {uploading ? (
              <div className="uploading-state">
                <div className="spinner" />
                <p>Uploading...</p>
                {progress && (                    <div className="progress-info">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${progress.percentage}%` }}
                        />
                    </div>
                    <span>{progress.percentage}%</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="upload-icon">📁</div>
                <p>
                  {isDragOver
                    ? 'Drop image here'
                    : 'Drag and drop an image here, or click to select'
                  }
                </p>
                <button
                  type="button"
                  className="upload-button"
                  disabled={disabled}
                >
                  Choose Image
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleInputChange}
        className="hidden-file-input"
        disabled={disabled}
        multiple={multiple}
        aria-label="Upload image"
      />

      <style jsx>{`
        .hidden-file-input {
          display: none;
        }

        .image-upload-container {
          width: 100%;
          margin-bottom: 1rem;
        }        .upload-area {
          border: 2px dashed #22c55e;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(34, 197, 94, 0.02);
          position: relative;
        }

        .upload-area:hover:not(.disabled) {
          border-color: #ef4444;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(239, 68, 68, 0.05));
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.15);
        }

        .upload-area.drag-over {
          border-color: #ef4444;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(239, 68, 68, 0.1));
          transform: scale(1.02);
        }

        .upload-area.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .image-preview {
          position: relative;
          display: inline-block;
        }        .preview-image {
          max-width: 100%;
          max-height: 300px;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.15);
        }

        .remove-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .remove-button:hover {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }        .upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        .upload-progress {
          text-align: center;
          color: white;
        }        .progress-bar {
          width: 200px;
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #ef4444);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .upload-placeholder {
          padding: 2rem;
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .upload-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 1rem;
        }

        .upload-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .uploading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          background: #ffe6e6;
          color: #d00;
          padding: 0.75rem;
          border-radius: 4px;
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
        }

        .progress-info .progress-bar {
          flex: 1;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
