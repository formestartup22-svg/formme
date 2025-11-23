import React, { useState, useEffect, useRef, Suspense, startTransition } from 'react';
import { useStudioState } from '@/hooks/useStudioState';
import { usePatternUpload } from '@/hooks/usePatternUpload';
import { useCanvasButtons } from '@/hooks/useCanvasButtons';
import { useElementContext } from '@/context/ElementContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';
import StudioSidebar from './StudioSidebar';
import StudioCanvas from './StudioCanvas';
import StudioPanel from './StudioPanel';
import SketchUploader from './SketchUploader';
import UpgradeDialog from './UpgradeDialog';
import RealisticPreviewOutput from './RealisticPreviewOutput';
import BackModeToggle from './BackModeToggle';
import StudioTextPanel from '../TextPanel';
import { useActiveSubTool } from '@/hooks/useActiveSubTool';
import FloatingElementsToolbar from './FloatingElementsToolbar';
import DrawingOptionsPanel from './DrawingOptionsPanel';
import TopToolbar from './TopToolbar';
import VectorStudio from './VectorStudio';

interface ProStudioLayoutProps {
  isProfessional?: boolean;
}

const ProStudioLayout = ({ isProfessional = false }: ProStudioLayoutProps) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTool, setActiveTool] = useState<string | null>('templates'); // Default to templates
  const [penColor, setPenColor] = useState('#000000');
  const [penSize, setPenSize] = useState(2);
  const [selectedTemplate, setSelectedTemplate] = useState('crew-neck-basic-male'); // Default to male template
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [realisticOutput, setRealisticOutput] = useState<any>(null);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const isInitialMount = useRef(true);

  const effectiveActiveTool = activeTool || 'templates';

  const { subTool } = useActiveSubTool();

  const {
    colors,
    patterns,
    uploadedPatterns,
    selectedFabric,
    fabric,
    isBackMode,
    updateColor,
    updatePattern,
    updateUploadedPattern,
    setSelectedFabric,
    toggleBackMode
  } = useStudioState();

  const patternUploadHook = usePatternUpload();
  const { uploadedPatterns: availablePatterns, getPatternById, updatePatternCrop } = patternUploadHook;

  // Initialize button functionality
  const {
    buttons,
    selectedButtonId,
    addButtonAtCenter,
    updateButtonPosition,
    updateButtonScale,
    deleteButton,
    selectButton,
  } = useCanvasButtons();

  const {
    canvasElements: elements,
    addCanvasElement,
    updateCanvasElement,
    deleteElement,
    selectElement,
    selectedElementId,
  } = useElementContext();

  const selectedElement = elements.find(el => el.id === selectedElementId);
  const selectedTextElement = selectedElement?.type === 'text' ? selectedElement : null;

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    // Do not auto-switch tools on template change
  }, [selectedTemplate]);

  const handlePatternDrop = (part: 'body' | 'sleeves' | 'collar', patternId: string) => {
    const patternData = getPatternById(patternId);
    if (patternData) {
      updateUploadedPattern(part, patternId);
    }
  };

  const handlePatternUpdate = (patternId: string, cropData: any) => {
    updatePatternCrop(patternId, cropData);
  };

  const handleSketchProcessed = (svgData: string) => {
    console.log('Sketch processed:', svgData);
    toast.success('Sketch converted to SVG and applied to design!');
  };

  const handleUpgradePrompt = () => {
    setShowUpgradeDialog(true);
  };

  const handleButtonPlacement = (style: 'round' | 'square' | 'oval', size: 'small' | 'medium' | 'large') => {
    console.log('🔍 ProStudioLayout: Button placement requested:', style, size);
    const newButtonId = addButtonAtCenter(style, size);
    console.log('🔍 ProStudioLayout: Button added with ID:', newButtonId);
    toast.success(`${size.charAt(0).toUpperCase() + size.slice(1)} ${style} button added!`);
  };

  const handleButtonClick = (buttonId: string) => {
    console.log('🔍 ProStudioLayout: Button clicked:', buttonId);
    selectButton(buttonId);
  };

  const handleButtonDelete = (buttonId: string) => {
    console.log('🔍 ProStudioLayout: Button deleted:', buttonId);
    deleteButton(buttonId);
    toast.success('Button deleted!');
  };

  const handleButtonDrag = (buttonId: string, newPosition: { x: number; y: number }) => {
    console.log('🔍 ProStudioLayout: Button dragged:', buttonId, newPosition);
    updateButtonPosition(buttonId, newPosition);
  };

  const handleButtonResize = (buttonId: string, scale: number) => {
    console.log('🔍 ProStudioLayout: Button resized:', buttonId, scale);
    updateButtonScale(buttonId, scale);
    toast.success('Button resized!');
  };

  const uploadToImgBB = async (base64: string): Promise<string> => {
    const form = new FormData();
    form.append("image", base64.split(',')[1]); // remove data:image prefix
    const res = await fetch(`https://api.imgbb.com/1/upload?key=2f941a8489b3c5a156e0f86a1ada2103`, {
      method: "POST",
      body: form
    });
  
    const data = await res.json();
    return data.data.url;
  };

  const TEST_KEY = '36e0388e948c569b8ca2534f0dd434f1';
  const handleRealisticConversion = async () => {
    if (!TEST_KEY) {
      setShowApiInput(true);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Preparing image...');
    
    // Show the RealisticPreviewOutput component when generation starts
    if (!realisticOutput) {
      setRealisticOutput({});
    }
  
    const node = document.getElementById("garment-preview");
    if (!node) {
      toast.error("Garment preview not found");
      setIsGenerating(false);
      return;
    }
  
    try {
      // 1️⃣ Convert SVG to PNG and upload
      setGenerationProgress(10);
      setGenerationStatus('Converting design to image...');
      
      const dataUrl = await toPng(node, {
        cacheBust: true,
        filter: (node) => {
          // Safely check for <link> tag and its href
          if (node.tagName === 'LINK') {
            const link = node as HTMLLinkElement;
            return !link.href.includes('fonts.googleapis.com');
          }
          return true;
        }
      });
      
      setGenerationProgress(25);
      setGenerationStatus('Uploading image...');
      
      const imageUrl = await uploadToImgBB(dataUrl);
  
      // 2️⃣ Prepare request to KieAI
      setGenerationProgress(40);
      setGenerationStatus('Submitting to AI generator...');
      
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Authorization", `Bearer ${TEST_KEY}`);
  
      const raw = JSON.stringify({
        filesUrl: [imageUrl],
        prompt: "Render this on a mannequin, should look realistic with cotton fabric and front side of the mannequin",
        size: "1:1",
        isEnhance: false,
        uploadCn: false,
        nVariants: 1
      });
  
      const response = await fetch("https://kieai.erweima.ai/api/v1/gpt4o-image/generate", {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      });
  
      const result = await response.json();
      const taskId = result?.data?.taskId;

      console.warn('what is the task id', taskId);
      if (!taskId) {
        toast.error("Task creation failed");
        setIsGenerating(false);
        return;
      }
  
      setGenerationProgress(50);
      setGenerationStatus('AI is generating your realistic preview...');
      toast.success("Task submitted, generating realistic preview...");
  
      // 3️⃣ Poll for result
      let pollCount = 0;
      const maxPolls = 60; // Maximum 2 minutes of polling
      
      while (pollCount < maxPolls) {
        await new Promise((r) => setTimeout(r, 2000)); // wait 2s
        pollCount++;
        
        // Update progress during polling (50% to 90%)
        const pollProgress = 50 + (pollCount / maxPolls) * 40;
        setGenerationProgress(Math.min(90, pollProgress));
      
        const pollRes = await fetch(
          `https://kieai.erweima.ai/api/v1/gpt4o-image/record-info?taskId=${taskId}`,
          {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
          }
        );
      
        const pollData = await pollRes.json();
        console.warn('🌀 Polling status:', pollData?.data?.status, 'progress:', pollData?.data?.progress);
      
        const status = pollData?.data?.status;
        console.warn('what is the poll Data', pollData);
        if (status === "SUCCESS") {
          setGenerationProgress(95);
          setGenerationStatus('Finalizing image...');
          
          const resultUrl = pollData?.data?.response?.resultUrls?.[0];
    
          console.warn('what is the result url', resultUrl);
          if (!resultUrl) {
            toast.error("Result URL not found.");
            break;
          }
      
          // Get direct download URL
          const downloadRes = await fetch("https://kieai.erweima.ai/api/v1/gpt4o-image/download-url", {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({
              taskId: taskId,
              url: resultUrl
            }),
            redirect: 'follow'
          });
      
          const downloadData = await downloadRes.json();
          const finalImageUrl = downloadData?.data;
          console.warn('what is the download data', downloadData);
          console.warn('what is the final image url', finalImageUrl);
          if (finalImageUrl) {
            setGenerationProgress(100);
            setGenerationStatus('Complete!');
            setRealisticOutput(finalImageUrl);
            console.warn('what is realistic output', realisticOutput);
            toast.success("Realistic preview generated successfully!");
          } else {
            toast.error("Download URL failed.");
          }
          break;
        }
      
        if (
          status === "GENERATE_FAILED" ||
          status === "CREATE_TASK_FAILED" ||
          status === "FAILED" ||
          status === "CANCELLED"
        ) {
          toast.error(`Image generation failed. Status: ${status}`);
          break;
        }
      
        // else: keep polling
      }
      
      if (pollCount >= maxPolls) {
        toast.error("Generation timed out. Please try again.");
      }
    } catch (err) {
      console.error("Error during generation:", err);
      toast.error("Failed to generate realistic preview");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStatus('');
    }
  };

  const handleCloseOutput = () => {
    setRealisticOutput(null);
    setIsFullWidth(false);
  };

  const handleToggleFullWidth = () => {
    setIsFullWidth(!isFullWidth);
  };

  const handleZoomChange = (zoom: number) => {
    setZoomLevel(Math.max(20, Math.min(180, zoom))); // Clamp between 20 and 180
  };

  const renderToolPanel = () => {
    if (effectiveActiveTool === 'sketch' && isProfessional) {
      return (
        <div className="h-full">
          <SketchUploader onSketchProcessed={handleSketchProcessed} />
        </div>
      );
    }
    
    return (
      <StudioPanel
        activeTool={effectiveActiveTool}
        colors={colors}
        patterns={patterns}
        uploadedPatterns={uploadedPatterns}
        selectedFabric={selectedFabric}
        selectedTemplate={selectedTemplate}
        onColorChange={updateColor}
        onPatternChange={updatePattern}
        onUploadedPatternChange={updateUploadedPattern}
        onFabricChange={setSelectedFabric}
        onTemplateChange={setSelectedTemplate}
        penColor={penColor}
        penSize={penSize}
        onPenColorChange={setPenColor}
        onPenSizeChange={setPenSize}
        onToolChange={setActiveTool}
        availablePatterns={availablePatterns}
        getPatternById={getPatternById}
        patternUploadHook={patternUploadHook}
        isProfessional={isProfessional}
      />
    );
  };

  const getToolTitle = () => {
    switch (effectiveActiveTool) {
      case 'templates': return 'Design Templates';
      case 'colors': return 'Color Palette';
      case 'patterns': return 'Patterns & Upload';
      case 'elements': return 'Elements';
      case 'sketch': return 'AI Sketch Converter';
      case 'buttons': return 'Button Elements';
      case 'upload': return 'Upload Assets';
      case 'text': return 'Text Tool';
      default: return 'Design Tools';
    }
  };

  const getToolDescription = () => {
    switch (effectiveActiveTool) {
      case 'templates': return 'Choose from various garment templates';
      case 'colors': return 'Customize colors and fabric types';
      case 'patterns': return 'Apply patterns and upload your own';
      case 'elements': return 'Draw, add shapes, and other elements';
      case 'sketch': return 'Convert hand-drawn sketches to SVG';
      case 'buttons': return 'Add interactive button elements';
      case 'upload': return 'Upload images and assets';
      case 'text': return 'Add and customize text on your design';
      default: return 'Customize your design';
    }
  };

  // ADJUST WIDTH of CANVA PANEL to 300px for more canvas space
  const TOOL_PANEL_WIDTH = 300;

  const showMainPanel = effectiveActiveTool && effectiveActiveTool !== 'elements';

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header removed per design — canvas-first layout */}

      {/* Loading Overlay for AI Real Generation */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-border">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Generating AI Real Preview</h3>
                <p className="text-muted-foreground">{generationStatus}</p>
              </div>
              <div className="space-y-2">
                <Progress value={generationProgress} className="w-full h-2" />
                <p className="text-sm text-muted-foreground">{generationProgress}% complete</p>
              </div>
              <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                <p className="font-medium mb-1">This may take 1-2 minutes</p>
                <p>Our AI is creating a realistic mannequin view of your design</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Key Input Modal */}
      {showApiInput && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4 border border-border">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Enter API Key</h3>
            <Label htmlFor="apikey">API Key</Label>
            <Input
              id="apikey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setShowApiInput(false);
                  if (apiKey) handleRealisticConversion();
                }}
                disabled={!apiKey}
              >
                Continue
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowApiInput(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main layout with left-side toolbars */}
      <div className="flex flex-1 overflow-hidden">
        {/* Vertical style toolbar far left */}
        <StudioSidebar
          activeTool={activeTool}
          onToolChange={(toolId) => {
            if (toolId === 'sketch-svg' && !isProfessional) {
              handleUpgradePrompt();
            } else {
              setActiveTool(toolId);
            }
          }}
          onConvertToRealistic={handleRealisticConversion}
        />

        {/* Main Canva-style tool panel (NARROWER WIDTH) */}
        {showMainPanel && (
          <div className={`
              min-w-[${TOOL_PANEL_WIDTH}px] max-w-[${TOOL_PANEL_WIDTH + 40}px] w-[${TOOL_PANEL_WIDTH}px]
              bg-card shadow-[0_6px_24px_0_rgba(0,0,0,0.09)] rounded-2xl border border-border
              flex flex-col h-full z-30 mx-3 my-6 transition-all duration-200
          `}>
            {/* Panel header, search bar */}
            <div className="px-6 pt-6 pb-2 border-b border-border bg-card rounded-t-2xl">
              {/* Search bar - visually similar to Canva, not functional */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder={`Search ${getToolTitle()}...`}
                  disabled
                  className="w-full px-3 py-2 text-sm bg-muted rounded-lg border border-border placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/40 cursor-not-allowed"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground tracking-tight">{getToolTitle()}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getToolDescription()}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTool(null)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                  tabIndex={0}
                  aria-label="Close panel"
                >
                  ✕
                </Button>
              </div>
            </div>
            {/* Panel content */}
            <div className="flex-1 overflow-y-auto p-4 bg-card rounded-b-2xl custom-panel-scrollbar">
              {effectiveActiveTool === "text" ? (
                <StudioTextPanel />
              ) : (
                renderToolPanel()
              )}
            </div>
          </div>
        )}

        {/* Canva-style canvas COLUMN, centered horizontally and vertically */}
        <div className={`
          flex flex-1 items-center justify-center relative
          p-7 pl-0 h-full transition-[padding] duration-300
        `}>
          {activeTool === 'elements' && subTool !== 'vector' && <FloatingElementsToolbar />}
          {activeTool === 'elements' && subTool !== 'vector' && (
            <DrawingOptionsPanel
              penColor={penColor}
              onPenColorChange={setPenColor}
              penSize={penSize}
              onPenSizeChange={setPenSize}
            />
          )}
          {selectedTemplate && (
            <TopToolbar
              onShowColors={() => setActiveTool('colors')}
              onShowFabrics={() => setActiveTool('colors')}
              isBackMode={isBackMode}
              onToggle={toggleBackMode}
              selectedElement={selectedElement}
              onUpdateElement={updateCanvasElement}
            />
          )}
          <div className="h-full w-full flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Vector Drawing Studio */}
              {activeTool === 'elements' && subTool === 'vector' ? (
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading Vector Studio...</p>
                    </div>
                  </div>
                }>
                  <VectorStudio className="w-full h-full" />
                </Suspense>
              ) : (
                /* Regular Studio Canvas */
                <StudioCanvas
                  zoomLevel={zoomLevel}
                  activeTool={activeTool}
                  penColor={penColor}
                  penSize={penSize}
                  colors={colors}
                  patterns={patterns}
                  uploadedPatterns={uploadedPatterns}
                  fabric={fabric}
                  selectedTemplate={selectedTemplate}
                  isBackMode={isBackMode}
                  onPatternDrop={handlePatternDrop}
                  getPatternById={getPatternById}
                  availablePatterns={availablePatterns}
                  onPatternUpdate={handlePatternUpdate}
                  onButtonPlacement={handleButtonPlacement}
                  buttons={buttons}
                  selectedButtonId={selectedButtonId}
                  onButtonClick={handleButtonClick}
                  onButtonDelete={handleButtonDelete}
                  onButtonDrag={handleButtonDrag}
                  onButtonResize={handleButtonResize}
                  onZoomChange={handleZoomChange}
                  elements={elements}
                  onElementAdd={addCanvasElement}
                  onElementUpdate={updateCanvasElement}
                  onElementDelete={deleteElement}
                  onElementSelect={selectElement}
                  selectedElementId={selectedElementId}
                />
              )}
            </div>
          </div>
        </div>

        {/* Realistic Preview Output overlay (unchanged) */}
        {realisticOutput && (
          <RealisticPreviewOutput
            output={realisticOutput}
            isFullWidth={isFullWidth}
            onClose={handleCloseOutput}
            onToggleFullWidth={handleToggleFullWidth}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            generationStatus={generationStatus}
          />
        )}
      </div>

      {/* Upgrade Dialog */}
      <UpgradeDialog 
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
      />
    </div>
  );
};

export default ProStudioLayout;
