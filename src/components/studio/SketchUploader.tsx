
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Image, Loader2, CheckCircle, AlertCircle, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface SketchUploaderProps {
  onSketchProcessed: (svgData: string) => void;
}

const SketchUploader = ({ onSketchProcessed }: SketchUploaderProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedSketch, setProcessedSketch] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simulate progress updates with more realistic stages
      const stages = [
        { progress: 20, message: 'Analyzing sketch...' },
        { progress: 40, message: 'Detecting edges...' },
        { progress: 60, message: 'Converting to vectors...' },
        { progress: 80, message: 'Optimizing SVG...' },
        { progress: 95, message: 'Finalizing...' }
      ];

      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setProgress(stage.progress);
      }

      // Mock SVG data for demonstration - more sophisticated pattern
      const mockSvgData = `
        <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
          <defs>
            <pattern id="sketchPattern" patternUnits="userSpaceOnUse" width="100" height="100">
              <path d="M20,20 Q50,10 80,20 Q80,50 50,80 Q20,80 20,50 Z" stroke="#2d4a37" fill="none" strokeWidth="2"/>
              <circle cx="30" cy="30" r="3" fill="#2d4a37" opacity="0.6"/>
              <path d="M60,60 L70,70 M70,60 L60,70" stroke="#2d4a37" strokeWidth="1.5"/>
            </pattern>
          </defs>
          <rect width="300" height="300" fill="url(#sketchPattern)" opacity="0.8"/>
          <path d="M50,50 C50,50 100,30 150,50 C200,70 250,50 250,50" stroke="#2d4a37" fill="none" strokeWidth="3"/>
        </svg>
      `;

      setProgress(100);
      setProcessedSketch(mockSvgData);
      onSketchProcessed(mockSvgData);
      toast.success('Sketch converted to SVG successfully!');

    } catch (error) {
      console.error('Error processing sketch:', error);
      toast.error('Failed to process sketch. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [onSketchProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: false
  });

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
          <Wand2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">AI Sketch Converter</h3>
          <p className="text-gray-600">Transform hand-drawn sketches into crisp SVG patterns</p>
        </div>
      </div>

      {/* Upload area */}
      <Card className="border-2 border-dashed border-gray-200 hover:border-pink-300 transition-colors">
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={`p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'bg-pink-50 border-pink-400'
                : 'hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                isDragActive ? 'bg-pink-100' : 'bg-gray-100'
              }`}>
                <Upload size={28} className={isDragActive ? 'text-pink-600' : 'text-gray-600'} />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your sketch here' : 'Upload your hand-drawn sketch'}
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supports JPG, PNG, GIF, BMP (max 10MB)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing indicator */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-900">Converting sketch to SVG...</span>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Loader2 size={16} className="animate-spin text-pink-500" />
              <span>AI is analyzing your sketch and creating vector patterns</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result preview */}
      {processedSketch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle size={20} />
              Conversion Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 border rounded-xl p-6">
              <div 
                dangerouslySetInnerHTML={{ __html: processedSketch }}
                className="w-full h-64 flex items-center justify-center"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => onSketchProcessed(processedSketch)}
                className="bg-[#2d4a37] hover:bg-[#1f3329] text-white"
              >
                Apply to Design
              </Button>
              <Button variant="outline">
                Download SVG
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Pro Tips for Best Results:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use dark ink or pencil on white paper</li>
                <li>• Ensure clear, bold lines</li>
                <li>• Avoid shadows and poor lighting</li>
                <li>• Simple patterns work best</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SketchUploader;
