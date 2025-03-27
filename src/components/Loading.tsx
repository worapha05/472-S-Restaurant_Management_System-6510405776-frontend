'use client';

import React from 'react';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = 'กำลังโหลด...' }: LoadingProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
      <div className="flex flex-col items-center p-6 rounded-xl bg-white shadow-lg">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
        </div>
        <p className="mt-4 text-primary font-medium">{message}</p>
      </div>
    </div>
  );
}