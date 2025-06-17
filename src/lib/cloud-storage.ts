// Cloud storage providers for production deployment
// Currently using local storage, but ready for cloud providers

export interface CloudUploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export interface CloudStorageConfig {
  provider: 'cloudinary' | 'aws' | 'azure' | 'local';
}

// Placeholder functions for cloud storage
// These will throw errors until proper cloud storage is configured

export const uploadToCloudinary = async () => {
  throw new Error('Cloudinary not configured. Using local storage instead.');
};

export const deleteFromCloudinary = async () => {
  throw new Error('Cloudinary not configured.');
};

export const uploadToAWS = async () => {
  throw new Error('AWS S3 not configured. Using local storage instead.');
};

export const deleteFromAWS = async () => {
  throw new Error('AWS S3 not configured.');
};

export const uploadToAzure = async () => {
  throw new Error('Azure Blob Storage not configured. Using local storage instead.');
};

export const deleteFromAzure = async () => {
  throw new Error('Azure Blob Storage not configured.');
};

// Factory function for cloud storage service
export const createCloudStorage = (config: CloudStorageConfig) => {
  switch (config.provider) {
    case 'cloudinary':
      return {
        upload: uploadToCloudinary,
        delete: deleteFromCloudinary,
      };
    case 'aws':
      return {
        upload: uploadToAWS,
        delete: deleteFromAWS,
      };
    case 'azure':
      return {
        upload: uploadToAzure,
        delete: deleteFromAzure,
      };
    default:
      throw new Error('Using local storage - no cloud provider configured');
  }
};
