"use client";

import { useState } from 'react';
import { X, Camera, CameraOff } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const [error, setError] = useState<string>('');

  const handleScan = (result: any) => {
    if (result) {
      console.log('QR detected:', result[0]?.rawValue);
      onScan(result[0]?.rawValue);
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error);
    setError('Scanner error occurred');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Content */}
        <div className="p-4">
          {error ? (
            // Error State
            <div className="text-center py-8">
              <CameraOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Scanner Error</h4>
              <p className="text-gray-600 mb-4 text-sm">{error}</p>
              <button
                onClick={() => setError('')}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            // QR Scanner
            <div className="relative">
              <div className="w-full h-64 bg-black rounded-lg overflow-hidden">
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  constraints={{
                    facingMode: 'environment',
                    aspectRatio: 1
                  }}
                  styles={{
                    container: {
                      width: '100%',
                      height: '100%'
                    }
                  }}
                />

                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white rounded-lg relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-white animate-pulse"></div>
                  </div>
                </div>

                {/* Status */}
                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                  <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm inline-block">
                    Scanning for QR code...
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!error && (
          <div className="px-4 pb-4">
            <p className="text-center text-gray-600 text-sm">
              Point the camera at a QR code to scan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}