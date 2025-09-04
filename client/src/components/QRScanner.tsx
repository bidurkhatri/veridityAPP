import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, X, Flashlight, RotateCcw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation, type Language } from '@/lib/i18n';
import jsQR from 'jsqr';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  language?: Language;
}

export function QRScanner({ isOpen, onClose, onScanSuccess, language = 'en' }: QRScannerProps) {
  const { toast } = useToast();
  const { t } = useTranslation(language);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout>();

  // Start camera and scanning
  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setHasPermission(true);
        startQRDetection();
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setError(err?.message || 'Camera access denied');
      setHasPermission(false);
      setIsScanning(false);
      
      toast({
        title: "Camera Access Required",
        description: "Please allow camera access to scan QR codes",
        variant: "destructive"
      });
    }
  };

  // Stop camera and scanning
  const stopScanning = () => {
    setIsScanning(false);
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // QR code detection loop
  const startQRDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    scanIntervalRef.current = setInterval(() => {
      detectQRCode();
    }, 100); // Check every 100ms for responsive scanning
  };

  // Detect QR code in video frame
  const detectQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.readyState !== 4) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Attempt QR code detection
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (qrCode?.data) {
      console.log('QR Code detected:', qrCode.data);
      stopScanning();
      onScanSuccess(qrCode.data);
      onClose();
      
      toast({
        title: "QR Code Scanned",
        description: "Successfully read QR code data"
      });
    }
  };

  // Toggle camera facing mode
  const switchCamera = () => {
    stopScanning();
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    setTimeout(startScanning, 100);
  };

  // Toggle flashlight (if supported)
  const toggleTorch = async () => {
    try {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.();
        
        if (capabilities?.torch) {
          await track.applyConstraints({
            advanced: [{ torch: !torchEnabled } as any]
          });
          setTorchEnabled(!torchEnabled);
        } else {
          toast({
            title: "Flashlight Not Available",
            description: "Your device doesn't support camera flash control"
          });
        }
      }
    } catch (error) {
      console.error('Torch toggle failed:', error);
    }
  };

  // Handle permissions and start scanning when opened
  useEffect(() => {
    if (isOpen && !isScanning) {
      startScanning();
    } else if (!isOpen && isScanning) {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, facingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Camera className="mr-2 h-5 w-5" />
              {t('qr.scanner')}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              data-testid="button-close-scanner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-center text-destructive text-sm">
                <AlertCircle className="mr-2 h-4 w-4" />
                {error}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={startScanning} 
                className="mt-2"
                data-testid="button-retry-camera"
              >
                Try Again
              </Button>
            </div>
          )}

          {hasPermission === false && (
            <div className="text-center space-y-3">
              <div className="text-muted-foreground text-sm">
                Camera permission is required to scan QR codes
              </div>
              <Button onClick={startScanning} data-testid="button-enable-camera">
                Enable Camera
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg bg-black"
                autoPlay
                playsInline
                muted
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 rounded-lg border-2 border-primary/50">
                <div className="absolute inset-4 border-2 border-primary rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-primary rounded-br-lg"></div>
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={switchCamera}
                  data-testid="button-switch-camera"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleTorch}
                  className={torchEnabled ? 'bg-yellow-500' : ''}
                  data-testid="button-toggle-torch"
                >
                  <Flashlight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />

          <div className="text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="secondary">
                {facingMode === 'environment' ? 'Back Camera' : 'Front Camera'}
              </Badge>
              {isScanning && (
                <Badge variant="outline" className="animate-pulse">
                  Scanning...
                </Badge>
              )}
            </div>
            <p className="mt-2">Position QR code within the frame to scan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}