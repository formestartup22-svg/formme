
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Search, X } from 'lucide-react';
import { getTemplatesByCategory, GarmentTemplate } from '@/data/garmentTemplates';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

const GENDERS = ['All', 'Male', 'Female'];
const CATEGORIES = ['All', 'T-Shirts', 'Pants', 'Hoodies', 'Jackets', 'Sweaters', 'Skirts'];

const TemplateSelector = ({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) => {
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTemplates = useMemo(() => {
    let templates = getTemplatesByCategory(selectedCategory);

    if (selectedGender !== 'All') {
      templates = templates.filter(t => t.gender.toLowerCase() === selectedGender.toLowerCase());
    }

    if (searchTerm.trim() !== '') {
      templates = templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return templates;
  }, [selectedCategory, selectedGender, searchTerm]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 text-base mb-4">Select Gender</h3>
        <div className="grid grid-cols-2 gap-3">
          {['Male', 'Female'].map(gender => (
            <Button
              key={gender}
              variant={selectedGender === gender ? 'default' : 'outline'}
              onClick={() => setSelectedGender(gender)}
              className="w-full justify-start text-left h-12 px-4"
            >
              <span className="text-3xl mr-3">{gender === 'Male' ? '👨' : '👩'}</span>
              <div>
                <span className="font-semibold">{gender}</span>
                <p className="font-normal text-xs text-gray-500">Models</p>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 text-base mb-3">Design Templates</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="grid grid-cols-1 gap-3 pb-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`relative p-3 border-2 rounded-xl cursor-pointer transition-all hover:border-blue-300 ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-gray-200 bg-white'
              }`}
              onClick={() => onTemplateChange(template.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-3xl shrink-0">
                  {template.preview}
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm truncate" title={template.name}>{template.name}</h4>
                    {template.isPremium && <Crown className="w-4 h-4 text-yellow-500 shrink-0" />}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                    {template.isPremium ? (
                      <span className="text-xs font-medium text-blue-600">${template.price}</span>
                    ) : (
                      <span className="text-xs font-medium text-green-600">Free</span>
                    )}
                  </div>
                </div>

                {selectedTemplate === template.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p className="font-medium">No templates found</p>
              <p className="text-sm">Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TemplateSelector;
