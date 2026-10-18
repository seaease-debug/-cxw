import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { logError } from '../utils/logger';

interface QrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const QrCode: React.FC<QrCodeProps> = ({ value, size = 150, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1,
          color: {
            dark: '#0f172a', // 矿物深色调
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) {
            logError('Error generating QR code to canvas:', error);
          }
        }
      );
    }
  }, [value, size]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className} 
      style={{ width: size, height: size }}
    />
  );
};

export default QrCode;
