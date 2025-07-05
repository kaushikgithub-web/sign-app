import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  PenTool, 
  Type, 
  Upload, 
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { SignatureField } from '@/types';

interface SignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // @ts-ignore
  onComplete: (signatureData: { imageData?: string; value?: string; type: string }) => void;
  // @ts-ignore
  field: SignatureField | null;
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  open,
  onOpenChange,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFont, setSelectedFont] = useState('cursive');

  const fonts = [
    { name: 'cursive', label: 'Cursive', style: 'font-serif italic' },
    { name: 'script', label: 'Script', style: 'font-mono' },
    { name: 'elegant', label: 'Elegant', style: 'font-serif' },
  ];

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = (type: string) => {
    let signatureData: { imageData?: string; value?: string; type: string } = { type };

    if (type === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        signatureData.imageData = canvas.toDataURL();
      }
    } else if (type === 'type') {
      signatureData.value = typedSignature;
      signatureData.imageData = generateTextSignature(typedSignature, selectedFont);
    } else if (type === 'upload' && uploadedImage) {
      signatureData.imageData = uploadedImage;
    }

    onComplete(signatureData);
  };

  const generateTextSignature = (text: string, font: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.font = `32px ${font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    
    return canvas.toDataURL();
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Signature</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="draw" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="type" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Type
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-2 block">
                  Draw your signature below:
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="w-full h-32 bg-white border rounded cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" onClick={clearCanvas}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={() => handleComplete('draw')}>
                      <Check className="h-4 w-4 mr-2" />
                      Add Signature
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="type" className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="signature-text">Type your signature:</Label>
                  <Input
                    id="signature-text"
                    placeholder="Enter your full name"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Choose a font:</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {fonts.map((font) => (
                      <Card
                        key={font.name}
                        className={`cursor-pointer transition-colors ${
                          selectedFont === font.name
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedFont(font.name)}
                      >
                        <CardContent className="p-4">
                          <div className={`text-2xl ${font.style}`}>
                            {typedSignature || 'Your Name Here'}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{font.label}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <div></div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleComplete('type')}
                      disabled={!typedSignature.trim()}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Add Signature
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Upload signature image:
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="signature-upload"
                    />
                    <label
                      htmlFor="signature-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG up to 2MB
                      </span>
                    </label>
                  </div>
                </div>

                {uploadedImage && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block">Preview:</Label>
                    <div className="border rounded-lg p-4 bg-white">
                      <img
                        src={uploadedImage}
                        alt="Signature preview"
                        className="max-h-32 mx-auto"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <div></div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleComplete('upload')}
                      disabled={!uploadedImage}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Add Signature
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;