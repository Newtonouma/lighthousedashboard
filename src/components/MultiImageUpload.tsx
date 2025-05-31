// Enhanced multiple image upload component with drag & drop, reordering, and individual deletion
'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useFileUpload, UploadProgress, UploadResult } from '@/hooks/useFileUpload';

export interface ImageItem {
  id: string;
  url: string;
  alt: string;
  order: number;
  createdAt?: string;
}

interface MultiImageUploadProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
  onError?: (error: string) => void;
  folder?: string;
  maxFileSize?: number;
  maxImages?: number;
  className?: string;
  disabled?: boolean;
  allowReorder?: boolean;
}

export default function MultiImageUpload({
  images,
  onImagesChange,
  onError,
  folder = 'dashboard',
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxImages = 10,
  className = '',
  disabled = false,
  allowReorder = true
}: MultiImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFiles, uploading, progress, error, clearError } = useFileUpload({
    maxFileSize,
    folder,
    onProgress: (progress: UploadProgress) => {
      console.log(`📸 Upload progress: ${progress.percentage}%`);
    }
  });
  // Handle multiple file selection and upload
  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    if (disabled) return;
    
    const fileArray = Array.from(files);
    const currentImageCount = images?.length || 0;
    
    // Check if adding these files would exceed maxImages
    if (currentImageCount + fileArray.length > maxImages) {
      onError?.(`Cannot upload ${fileArray.length} files. Maximum ${maxImages} images allowed. You currently have ${currentImageCount} images.`);
      return;
    }

    if (fileArray.length === 0) return;

    setIsUploading(true);
    clearError();

    try {
      console.log(`📸 Uploading ${fileArray.length} files to ${folder}:`, fileArray.map(f => f.name));
      
      const results: UploadResult[] = await uploadFiles(fileArray);
        console.log(`📸 Upload completed:`, results);

      const currentImageCount = images?.length || 0;
      // Convert upload results to ImageItem format
      const newImages: ImageItem[] = results.map((result, index) => ({
        id: crypto.randomUUID(),
        url: result.url,
        alt: `Image ${currentImageCount + index + 1}`,
        order: currentImageCount + index,
        createdAt: new Date().toISOString()
      }));

      // Update images array
      const updatedImages = [...(images || []), ...newImages];
      onImagesChange(updatedImages);
      
      console.log(`📸 Added ${newImages.length} new images. Total: ${updatedImages.length}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload images';
      console.error('📸 Upload error:', err);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [images, onImagesChange, uploadFiles, onError, clearError, disabled, maxImages, folder]);

  // Handle drag and drop
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

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);
  // Remove individual image
  const removeImage = useCallback((imageId: string) => {
    if (!images) return;
    const updatedImages = images.filter(img => img.id !== imageId);
    // Reorder remaining images
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      order: index
    }));
    onImagesChange(reorderedImages);
    console.log(`📸 Removed image ${imageId}. Remaining: ${reorderedImages.length}`);
  }, [images, onImagesChange]);

  // Handle image reordering via drag and drop
  const handleImageDragStart = useCallback((e: React.DragEvent, index: number) => {
    if (!allowReorder) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, [allowReorder]);  const handleImageDragOver = useCallback((e: React.DragEvent) => {
    if (!allowReorder || draggedIndex === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, [allowReorder, draggedIndex]);
  const handleImageDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    if (!allowReorder || draggedIndex === null || !images) return;
    e.preventDefault();
    
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    // Remove dragged image and insert at new position
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    // Reorder all images
    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      order: index
    }));
    
    onImagesChange(reorderedImages);
    setDraggedIndex(null);
      console.log(`📸 Reordered images: moved from ${draggedIndex} to ${dropIndex}`);
  }, [allowReorder, draggedIndex, images, onImagesChange]);
  const triggerFileInput = useCallback(() => {
    if (!disabled && (images?.length || 0) < maxImages) {
      fileInputRef.current?.click();
    }
  }, [disabled, images?.length, maxImages]);

  return (
    <div className={`multi-image-upload-container ${className}`}>
      {/* Upload Area */}      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''} ${(images?.length || 0) >= maxImages ? 'max-reached' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
      >
        <div className="upload-content">
          {isUploading || uploading ? (
            <div className="uploading-state">
              <div className="spinner" />
              <p>Uploading images...</p>              {progress && (
                <div className="progress-info">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      data-width={progress.percentage}
                    />
                  </div>
                  <span>{progress.percentage}%</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="upload-icon">🖼️</div>              <p>
                {isDragOver
                  ? 'Drop images here'
                  : (images?.length || 0) >= maxImages
                  ? `Maximum ${maxImages} images reached`                : `Drag and drop images here, or click to select (${images?.length || 0}/${maxImages})`
                }
              </p>              {(images?.length || 0) < maxImages && (
                <div className="upload-actions">
                  <button
                    type="button"
                    className="upload-button"
                    disabled={disabled}
                  >
                    Choose Images
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>      {/* Images Grid */}      {(images?.length || 0) > 0 && (
        <div className="images-grid">
          {(images || [])
            .sort((a, b) => a.order - b.order)
            .map((image, index) => (
            <div
              key={image.id}
              className={`image-item ${allowReorder ? 'draggable' : ''}`}
              draggable={allowReorder && !disabled}
              onDragStart={(e) => handleImageDragStart(e, index)}
              onDragOver={(e) => handleImageDragOver(e)}
              onDrop={(e) => handleImageDrop(e, index)}
            >
              <div className="image-preview">
                <Image
                  src={image.url}
                  alt={image.alt}
                  width={200}
                  height={150}
                  className="preview-image"
                />
                <div className="image-overlay">
                  <button
                    type="button"
                    className="remove-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    disabled={disabled}
                    title="Remove image"
                  >
                    ×
                  </button>
                  {allowReorder && (
                    <div className="drag-handle" title="Drag to reorder">
                      ⋮⋮
                    </div>
                  )}
                </div>
              </div>
              <div className="image-info">
                <span className="image-order">#{image.order + 1}</span>
                {image.createdAt && (
                  <span className="image-date">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleInputChange}
        className="hidden-file-input"
        disabled={disabled}
        multiple        aria-label="Upload images"
      />

      <style jsx>{`
        .multi-image-upload-container {
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
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .upload-area:hover:not(.disabled):not(.max-reached) {
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
        }        .upload-area.max-reached {
          cursor: default;
          border-color: #22c55e;
          background: rgba(34, 197, 94, 0.05);
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .upload-icon {
          font-size: 3rem;
          opacity: 0.7;
          background: linear-gradient(90deg, #22c55e, #ef4444);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .upload-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }        .upload-button {
          background: linear-gradient(90deg, #22c55e, #ef4444);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
        }

        .upload-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
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
        }        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(34, 197, 94, 0.2);
          border-top: 4px solid #22c55e;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 200px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #ef4444);
          transition: width 0.3s ease;
        }

        .progress-fill[data-width="0"] { width: 0%; }
        .progress-fill[data-width="1"] { width: 1%; }
        .progress-fill[data-width="2"] { width: 2%; }
        .progress-fill[data-width="3"] { width: 3%; }
        .progress-fill[data-width="4"] { width: 4%; }
        .progress-fill[data-width="5"] { width: 5%; }
        .progress-fill[data-width="6"] { width: 6%; }
        .progress-fill[data-width="7"] { width: 7%; }
        .progress-fill[data-width="8"] { width: 8%; }
        .progress-fill[data-width="9"] { width: 9%; }
        .progress-fill[data-width="10"] { width: 10%; }
        .progress-fill[data-width="11"] { width: 11%; }
        .progress-fill[data-width="12"] { width: 12%; }
        .progress-fill[data-width="13"] { width: 13%; }
        .progress-fill[data-width="14"] { width: 14%; }
        .progress-fill[data-width="15"] { width: 15%; }
        .progress-fill[data-width="16"] { width: 16%; }
        .progress-fill[data-width="17"] { width: 17%; }
        .progress-fill[data-width="18"] { width: 18%; }
        .progress-fill[data-width="19"] { width: 19%; }
        .progress-fill[data-width="20"] { width: 20%; }
        .progress-fill[data-width="21"] { width: 21%; }
        .progress-fill[data-width="22"] { width: 22%; }
        .progress-fill[data-width="23"] { width: 23%; }
        .progress-fill[data-width="24"] { width: 24%; }
        .progress-fill[data-width="25"] { width: 25%; }
        .progress-fill[data-width="26"] { width: 26%; }
        .progress-fill[data-width="27"] { width: 27%; }
        .progress-fill[data-width="28"] { width: 28%; }
        .progress-fill[data-width="29"] { width: 29%; }
        .progress-fill[data-width="30"] { width: 30%; }
        .progress-fill[data-width="31"] { width: 31%; }
        .progress-fill[data-width="32"] { width: 32%; }
        .progress-fill[data-width="33"] { width: 33%; }
        .progress-fill[data-width="34"] { width: 34%; }
        .progress-fill[data-width="35"] { width: 35%; }
        .progress-fill[data-width="36"] { width: 36%; }
        .progress-fill[data-width="37"] { width: 37%; }
        .progress-fill[data-width="38"] { width: 38%; }
        .progress-fill[data-width="39"] { width: 39%; }
        .progress-fill[data-width="40"] { width: 40%; }
        .progress-fill[data-width="41"] { width: 41%; }
        .progress-fill[data-width="42"] { width: 42%; }
        .progress-fill[data-width="43"] { width: 43%; }
        .progress-fill[data-width="44"] { width: 44%; }
        .progress-fill[data-width="45"] { width: 45%; }
        .progress-fill[data-width="46"] { width: 46%; }
        .progress-fill[data-width="47"] { width: 47%; }
        .progress-fill[data-width="48"] { width: 48%; }
        .progress-fill[data-width="49"] { width: 49%; }
        .progress-fill[data-width="50"] { width: 50%; }
        .progress-fill[data-width="51"] { width: 51%; }
        .progress-fill[data-width="52"] { width: 52%; }
        .progress-fill[data-width="53"] { width: 53%; }
        .progress-fill[data-width="54"] { width: 54%; }
        .progress-fill[data-width="55"] { width: 55%; }
        .progress-fill[data-width="56"] { width: 56%; }
        .progress-fill[data-width="57"] { width: 57%; }
        .progress-fill[data-width="58"] { width: 58%; }
        .progress-fill[data-width="59"] { width: 59%; }
        .progress-fill[data-width="60"] { width: 60%; }
        .progress-fill[data-width="61"] { width: 61%; }
        .progress-fill[data-width="62"] { width: 62%; }
        .progress-fill[data-width="63"] { width: 63%; }
        .progress-fill[data-width="64"] { width: 64%; }
        .progress-fill[data-width="65"] { width: 65%; }
        .progress-fill[data-width="66"] { width: 66%; }
        .progress-fill[data-width="67"] { width: 67%; }
        .progress-fill[data-width="68"] { width: 68%; }
        .progress-fill[data-width="69"] { width: 69%; }
        .progress-fill[data-width="70"] { width: 70%; }
        .progress-fill[data-width="71"] { width: 71%; }
        .progress-fill[data-width="72"] { width: 72%; }
        .progress-fill[data-width="73"] { width: 73%; }
        .progress-fill[data-width="74"] { width: 74%; }
        .progress-fill[data-width="75"] { width: 75%; }
        .progress-fill[data-width="76"] { width: 76%; }
        .progress-fill[data-width="77"] { width: 77%; }
        .progress-fill[data-width="78"] { width: 78%; }
        .progress-fill[data-width="79"] { width: 79%; }
        .progress-fill[data-width="80"] { width: 80%; }
        .progress-fill[data-width="81"] { width: 81%; }
        .progress-fill[data-width="82"] { width: 82%; }
        .progress-fill[data-width="83"] { width: 83%; }
        .progress-fill[data-width="84"] { width: 84%; }
        .progress-fill[data-width="85"] { width: 85%; }
        .progress-fill[data-width="86"] { width: 86%; }
        .progress-fill[data-width="87"] { width: 87%; }
        .progress-fill[data-width="88"] { width: 88%; }
        .progress-fill[data-width="89"] { width: 89%; }
        .progress-fill[data-width="90"] { width: 90%; }
        .progress-fill[data-width="91"] { width: 91%; }
        .progress-fill[data-width="92"] { width: 92%; }
        .progress-fill[data-width="93"] { width: 93%; }
        .progress-fill[data-width="94"] { width: 94%; }
        .progress-fill[data-width="95"] { width: 95%; }
        .progress-fill[data-width="96"] { width: 96%; }
        .progress-fill[data-width="97"] { width: 97%; }
        .progress-fill[data-width="98"] { width: 98%; }
        .progress-fill[data-width="99"] { width: 99%; }
        .progress-fill[data-width="100"] { width: 100%; }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }        .image-item {
          position: relative;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(10,49,10,0.08);
          border: 1px solid rgba(10,49,10,0.1);
          transition: all 0.3s ease;
        }

        .image-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.2);
        }

        .image-item.draggable {
          cursor: move;
        }

        .image-item.draggable:hover {
          cursor: grab;
        }

        .image-item.draggable:active {
          cursor: grabbing;
        }

        .image-preview {
          position: relative;
          width: 100%;
          height: 150px;
          overflow: hidden;
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          gap: 1rem;
        }

        .image-item:hover .image-overlay {
          opacity: 1;
        }        .remove-button {
          background: linear-gradient(90deg, #ef4444, #dc2626);
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }

        .remove-button:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
        }

        .drag-handle {
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 14px;
          cursor: move;
          user-select: none;
        }

        .image-info {
          padding: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: #666;
        }        .image-order {
          font-weight: 600;
          color: #22c55e;
        }

        .image-date {
          font-size: 0.8rem;
        }

        .error-message {
          background: #ffe6e6;
          color: #d00;
          padding: 0.75rem;
          border-radius: 4px;
          margin-top: 1rem;
          font-size: 0.9rem;
        }        .hidden-file-input {
          display: none;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .images-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }

          .upload-area {
            padding: 1rem;
          }

          .upload-actions {
            flex-direction: column;
            width: 100%;
          }          .upload-button {
            width: 100%;
          }

          .gallery-modal {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
