'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/shared/Button';

interface QRDisplayProps {
  token: string;
}

export function QRDisplay({ token }: QRDisplayProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center p-4 border rounded-lg bg-white shadow-sm max-w-sm">
      <h3 className="text-lg font-semibold mb-2">Guardian Access QR Code</h3>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Scan this code from the login page to access your pet's file and make appointments.
      </p>
      
      <div className="p-4 bg-white border-2 border-gray-100 rounded-xl mb-4 print:border-none print:shadow-none">
        <QRCodeCanvas 
          value={token}
          size={200}
          level="H" // High error correction
          includeMargin={true}
        />
      </div>

      <Button onClick={handlePrint} variant="secondary" className="w-full print:hidden">
        Print QR Code
      </Button>
    </div>
  );
}
