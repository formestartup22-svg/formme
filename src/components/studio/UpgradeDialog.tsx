
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Crown, Zap, FileImage } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeDialog = ({ isOpen, onClose }: UpgradeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-semibold">Upgrade to Professional</DialogTitle>
            <p className="text-gray-600">
              Unlock AI-powered sketch conversion and advanced design tools
            </p>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="border-2 border-pink-200 bg-pink-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                  <FileImage className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-pink-900">AI Sketch Converter</h4>
                  <p className="text-sm text-pink-700">Transform hand-drawn sketches into crisp SVG patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Professional features include:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>AI-powered sketch to SVG conversion</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Advanced design automation</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Crown className="w-4 h-4 text-purple-500" />
                <span>Team collaboration suite</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Link to="/studio-selection" className="flex-1">
              <Button 
                className="w-full bg-[#2d4a37] hover:bg-[#1f3329] text-white"
                onClick={onClose}
              >
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeDialog;
