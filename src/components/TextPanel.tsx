
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useElementContext } from "@/context/ElementContext";
import {
  Sparkles, 
  Plus, 
  Type
} from "lucide-react";

// Fabric & font dummy list
const fontFamilies = [
  { name: 'Arial', family: 'Arial, sans-serif' },
  { name: 'Georgia', family: 'Georgia, serif' },
  { name: 'Helvetica', family: 'Helvetica, Arial, sans-serif' },
  { name: 'Times New Roman', family: '"Times New Roman", serif' },
];
const fabrics = [
  { name: 'Cotton', value: 'cotton' },
  { name: 'Polyester', value: 'polyester' },
  { name: 'Silk', value: 'silk' },
  { name: 'Linen', value: 'linen' }
];

const textStyles = [
  { name: 'Heading', text: 'Add a heading', fontSize: 32, fontWeight: 700, description: "Large, bold title" },
  { name: 'Subheading', text: 'Add a subheading', fontSize: 20, fontWeight: 500, description: "Subtitle or medium section" },
  { name: 'Body', text: 'Add a little bit of body text', fontSize: 16, fontWeight: 400, description: "Main content or notes" },
];

const gradientButton =
  "bg-[linear-gradient(100deg,#09100B_0%,#233229_75%,#09100B_100%)] text-white";

// Mock: highlight the first element as selected
const StudioTextPanel = () => {
  const { addCanvasElement } = useElementContext();
  const [textInput, setTextInput] = useState("");
  const [selectedFont, setSelectedFont] = useState(fontFamilies[0]);

  // Add new text element to canvas
  const handleAddText = (text: string, family: string, fontSize = 16, fontWeight: number = 400) => {
    const newTextElement = {
      id: `text-${Date.now()}`,
      name: 'Text',
      category: 'text',
      type: 'text',
      position: { x: 50, y: 50 },
      rotation: 0,
      scale: 1,
      zIndex: 1000,
      text: text,
      fontFamily: family,
      fontSize,
      fontWeight,
      style: {
        color: '#2D2D2D',
        fontWeight: fontWeight,
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'left',
        fontFamily: family,
        fontSize: `${fontSize}px`,
      },
      preview: (
        <div style={{
          fontFamily: family,
          fontSize: `${fontSize}px`,
          fontWeight,
          color: '#2D2D2D',
        }}>
          {text}
        </div>
      )
    };
    addCanvasElement(newTextElement);
  };

  const handleAddCustomText = () => {
    if (!textInput.trim()) return;
    handleAddText(textInput, selectedFont.family, 18, 400);
    setTextInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 pt-5 pb-2">
        <div className="relative">
          <Input
            className="pl-10 h-11 bg-[#F5F8FA] border-0 rounded-xl text-base shadow-sm placeholder:text-gray-400"
            placeholder="Search fonts and combinations"
            disabled
            value=""
            onChange={() => {}}
          />
          <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" />
        </div>
      </div>
      {/* Add a text box */}
      <div className="px-4 mb-3">
        <Button className={`${gradientButton} w-full h-11 rounded-xl flex items-center justify-center gap-2 text-base font-semibold shadow mt-1`} onClick={() => { handleAddText('Double-click to edit', selectedFont.family, 22, 400); }}>
          <Plus className="w-5 h-5" /> Add a text box
        </Button>
      </div>
      {/* Magic Write - just a visual button */}
      <div className="px-4 flex flex-col gap-2 mb-2">
        <Button
          variant="secondary"
          size="default"
          className="w-full h-11 rounded-xl flex items-center gap-2 justify-start text-base font-semibold border-0 mb-1"
          disabled
        >
          <Sparkles className="w-5 h-5 text-violet-500" />
          Magic Write
        </Button>
      </div>
      {/* Default text styles */}
      <div className="px-4 text-[13px] text-gray-500 font-semibold pt-1 pb-2">
        Default text styles
      </div>
      <div className="flex flex-col gap-2 px-4">
        {textStyles.map((style, idx) => (
          <button
            key={idx}
            type="button"
            className="group flex flex-col text-left bg-white hover:bg-gray-100 rounded-xl px-5 py-3 border border-gray-100 shadow-sm transition"
            style={{ cursor: 'pointer' }}
            onClick={() => { handleAddText(style.text, selectedFont.family, style.fontSize, style.fontWeight); }}
          >
            <div style={{
              fontFamily: selectedFont.family,
              fontWeight: style.fontWeight,
              fontSize: style.fontSize,
              color: '#101A24'
            }} className="mb-0.5">{style.text}</div>
            {style.name === 'Heading' && <div className="text-xs text-gray-400">{style.description}</div>}
            {style.name === 'Subheading' && <div className="text-xs text-gray-400">{style.description}</div>}
            {style.name === 'Body' && <div className="text-xs text-gray-400">{style.description}</div>}
          </button>
        ))}
      </div>
      {/* Custom text creator */}
      <div className="px-4 py-3">
        <div className="font-semibold text-xs text-gray-600 mb-1">Custom text</div>
        <div className="flex gap-2">
          <Input
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            className="text-sm flex-1"
            placeholder="Enter your text"
          />
          <Button
            size="sm"
            variant="outline"
            className="border-[#233229] border"
            onClick={() => { handleAddCustomText(); }}
            disabled={!textInput.trim()}
          >
            Add
          </Button>
        </div>
        {/* Font family selector (quick grid) */}
        <div className="flex gap-2 mt-2">
          {fontFamilies.map((font, i) => (
            <div
              key={font.name}
              className={`rounded-xl px-3 py-2 cursor-pointer text-[13px] font-medium border ${selectedFont.name === font.name ? "bg-[#EAF3EB]" : "bg-white hover:bg-gray-100"} ${selectedFont.name === font.name ? "border-[#233229]" : "border-gray-200"}`}
              style={{ fontFamily: font.family }}
              onClick={() => setSelectedFont(font)}
            >
              {font.name}
            </div>
          ))}
        </div>
      </div>
      {/* Tip */}
      <div className="px-4 pb-2 pt-3 text-xs text-[#2d4338]">
        Tip: Double-click on text elements to edit them directly on the canvas.
      </div>
    </div>
  );
};

export default StudioTextPanel;
