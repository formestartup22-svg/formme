
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useElementContext } from "@/context/ElementContext";
import { CollarType, SleeveType, FitType } from "@/types/elements";

const ModelSettingsPanel = () => {
  const { 
    modelSettings,
    setCollarType, 
    setSleeveType, 
    setFitType 
  } = useElementContext();

  const collars: { value: CollarType; label: string }[] = [
    { value: 'crew', label: 'Crew Neck' },
    { value: 'v-neck', label: 'V-Neck' },
    { value: 'polo', label: 'Polo' },
    { value: 'henley', label: 'Henley' },
    { value: 'round', label: 'Round' },
  ];

  const sleeves: { value: SleeveType; label: string }[] = [
    { value: 'short', label: 'Short Sleeves' },
    { value: 'long', label: 'Long Sleeves' },
    { value: 'sleeveless', label: 'Sleeveless' },
    { value: 'raglan', label: 'Raglan' },
  ];

  const fits: { value: FitType; label: string }[] = [
    { value: 'regular', label: 'Regular Fit' },
    { value: 'slim', label: 'Slim Fit' },
    { value: 'oversized', label: 'Oversized' },
    { value: 'relaxed', label: 'Relaxed Fit' },
  ];

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-lg font-semibold">Style Options</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Collar Style</h3>
          <RadioGroup
            value={modelSettings.collarType}
            onValueChange={(value) => setCollarType(value as CollarType)}
            className="grid grid-cols-2 gap-2"
          >
            {collars.map((collar) => (
              <div 
                key={collar.value} 
                className={`flex items-center space-x-2 border p-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                  modelSettings.collarType === collar.value ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <RadioGroupItem value={collar.value} id={`collar-${collar.value}`} className="text-purple-600" />
                <Label htmlFor={`collar-${collar.value}`} className="cursor-pointer font-normal">{collar.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Sleeve Style</h3>
          <RadioGroup
            value={modelSettings.sleeveType}
            onValueChange={(value) => setSleeveType(value as SleeveType)}
            className="grid grid-cols-2 gap-2"
          >
            {sleeves.map((sleeve) => (
              <div 
                key={sleeve.value} 
                className={`flex items-center space-x-2 border p-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                  modelSettings.sleeveType === sleeve.value ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <RadioGroupItem value={sleeve.value} id={`sleeve-${sleeve.value}`} className="text-purple-600" />
                <Label htmlFor={`sleeve-${sleeve.value}`} className="cursor-pointer font-normal">{sleeve.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Fit Style</h3>
          <RadioGroup
            value={modelSettings.fitType}
            onValueChange={(value) => setFitType(value as FitType)}
            className="grid grid-cols-2 gap-2"
          >
            {fits.map((fit) => (
              <div 
                key={fit.value} 
                className={`flex items-center space-x-2 border p-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                  modelSettings.fitType === fit.value ? 'border-purple-400 bg-purple-50' : 'border-gray-200'
                }`}
              >
                <RadioGroupItem value={fit.value} id={`fit-${fit.value}`} className="text-purple-600" />
                <Label htmlFor={`fit-${fit.value}`} className="cursor-pointer font-normal">{fit.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );
};

export default ModelSettingsPanel;
