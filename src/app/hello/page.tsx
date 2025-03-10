'use client';  // Add this directive at the top of the file

import { useState, JSX } from 'react';

export default function HelloPage(): JSX.Element {
  // Direct URL to the image in your MinIO bucket
  const imageUrl: string = 'http://localhost:9000/photos/IMG_1463.JPG';
  const [imageError, setImageError] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Function to upload file to MinIO
  const uploadToMinIO = async (file: File) => {
    const minioUrl = "http://localhost:9000/photos/"; // MinIO bucket URL
    const timestamp = Date.now(); // Get current time
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''; // Get extension
    const fileName = `${timestamp}.${fileExtension}`; // Rename file with timestamp

    const response = await fetch(`${minioUrl}${fileName}`, {
        method: "PUT",
        body: file,
        headers: {
            "Content-Type": file.type, // Set correct MIME type
            "Authorization": "Basic " + btoa("minioadmin:minioadmin"), // MinIO credentials (if needed)
        },
    });

    if (response.ok) {
        console.log("✅ Upload successful!");
        return `${minioUrl}${fileName}`; // Return public URL
    } else {
        console.error("❌ Upload failed", await response.text());
        throw new Error('Upload failed');
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]); // Store the selected file
    }
  };

  // Handle the file upload on button click
  const handleUpload = async () => {
    if (selectedFile) {
      try {
        const uploadedUrl = await uploadToMinIO(selectedFile);
        console.log("Uploaded File URL:", uploadedUrl);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    } else {
      console.error("No file selected");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-3xl font-bold underline p-4 justify-center flex mb-4">
        minIO DB Test
      </div>

      <div>
        {!imageError ? (
          <img 
            src={imageUrl} 
            alt="Uploaded Image" 
            className="max-w-md h-auto rounded-lg shadow-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <p className="text-red-500">Failed to load image from MinIO</p>
        )}
      </div>
    </div>
  );
}