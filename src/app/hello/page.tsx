// In your page.tsx
import StandaloneMinioUploader from "@/components/Upload/Upload"

export default function YourPage() {
  const photoPath = '/images/2025_03_51d1c1f3-0e9d-4761-b459-a39d0a8d624d.jpg';

  console.log(`${process.env.NEXT_PUBLIC_S3_URL}${photoPath}`);
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Image</h1>
      <img
        src={`${process.env.NEXT_PUBLIC_S3_URL}${photoPath}`} />
      <StandaloneMinioUploader />
    </div>
  );
}