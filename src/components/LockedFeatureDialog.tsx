import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LockedFeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
  description: string;
}

export const LockedFeatureDialog = ({
  open,
  onOpenChange,
  featureName,
  description,
}: LockedFeatureDialogProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-primary/20">
        <div className="flex flex-col items-center text-center py-6">
          {/* Lock Icon with Premium Styling */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Lock className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>

          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {featureName} Locked
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 w-full space-y-3">
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate("/auth");
              }}
              className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90"
              size="lg"
            >
              Sign up to unlock
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              className="w-full"
            >
              Maybe later
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Join formme to access all premium features
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
