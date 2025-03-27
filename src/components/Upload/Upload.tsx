'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  message?: string;
}

const StandaloneMinioUploader = ({ onImageUpload }: { onImageUpload: (uploadedUrl: string) => void }) => {
  const { data: session } = useSession();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(files[0]);
    setError(null);
    setUploadedUrl(null);
    setUploadSuccessMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    // Check if user is authenticated with a token
    if (!session?.user?.accessToken) {
      setError('You need to be logged in to upload files');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Send the file to the server with authorization token
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`
        },
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (!data.success || !data.fileUrl) {
        throw new Error(data.message || 'Upload failed');
      }

      onImageUpload(data.fileUrl);

      setUploadSuccessMessage("อัปโหลดรูปภาพสำเร็จ!");
      setUploadedUrl(data.fileUrl);
      
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded p-4">
      <h2 className="text-xl font-bold mb-4">File Uploader</h2>
      
      <div className="mb-3">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full"
          disabled={uploading}
        />
      </div>

      {preview && (
        <div className="mb-3">
          <h3 className="text-sm font-medium mb-1">Preview:</h3>
          <img
            src={preview}
            alt="Preview"
            className="max-h-40 max-w-full object-contain"
          />
        </div>
      )}

      {error && (
        <div className="text-red-500 mb-3">{error}</div>
      )}

      {uploadSuccessMessage && (
        <div className="text-green-500 mb-3">{uploadSuccessMessage}</div>
      )}

      {uploadedUrl && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded">
          <h3 className="text-sm font-medium text-green-800 mb-1">Upload Successful!</h3>
          <p className="text-xs text-green-700 break-all">
            URL: {uploadedUrl}
          </p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className={`py-2 px-4 rounded ${
          !selectedFile || uploading
            ? 'bg-gray-400'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white`}
      >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
    </div>
  );
};

export default StandaloneMinioUploader;