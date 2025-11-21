
import { getTemplateById } from '@/data/garmentTemplates';

export interface GarmentParts {
  body: boolean;
  sleeves: boolean;
  collar: boolean;
  stripesColor: boolean;
}

export const getAvailablePartsForTemplate = (templateId: string): GarmentParts => {
  const template = getTemplateById(templateId);
  
  if (!template) {
    // Default to all parts if template not found
    return { body: true, sleeves: true, collar: true, stripesColor: false };
  }

  // Define which parts are available for each template type
  switch (template.id) {
    case 'patterned-track-female':
      return { body: true, sleeves: false, collar: false, stripesColor: false };
    case 'joggers-male':
    case 'cargo-pants-male':
    case 'stripes-short-basic-female':
      return { body: true, sleeves: true, collar: true, stripesColor: true };
    case 'yoga-pants-female':
      // Pants/trackpants only have body
      return { body: true, sleeves: false, collar: false, stripesColor: false };
    
    case 'tank-top-basic-male':
    case 'tank-top-basic-female':
    case 'crop-top-female':
      // Tank tops have body and collar but no sleeves
      return { body: true, sleeves: false, collar: true, stripesColor: false };
    
    case 'pullover-hoodie-male':
    case 'zip-hoodie-female':
    case 'oversized-hoodie-unisex':
    case 'bomber-jacket-male':
    case 'denim-jacket-female':
      // Hoodies and jackets have all parts
      return { body: true, sleeves: true, collar: true, stripesColor: false };
    
    default:
      // T-shirts and other garments have all parts
      return { body: true, sleeves: true, collar: true, stripesColor: false };
  }
};
