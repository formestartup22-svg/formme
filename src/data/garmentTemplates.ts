export interface GarmentTemplate {
  id: string;
  name: string;
  type: 'tshirt' | 'hoodie' | 'dress' | 'pants' | 'skirt' | 'jacket';
  style: 'crew-neck' | 'v-neck' | 'tank-top' | 'long-sleeve' | 'polo' | 'crew-neck-premium' | 'track-patterned-pants' | 'stripes-short-sleeve';
  preview: string;
  category: string;
  isPremium: boolean;
  price?: number;
  gender: 'male' | 'female' | 'unisex';
  description?: string;
}

export const garmentTypes = [
  { id: 'tshirt', name: 'T-Shirts', icon: '👕' },
  { id: 'pants', name: 'Pants', icon: '👖' },
  { id: 'hoodie', name: 'Hoodies', icon: '👘' },
  { id: 'jacket', name: 'Jackets', icon: '🧥' }
];

export const garmentTemplates: GarmentTemplate[] = [
  // Male T-Shirt Templates
  {
    id: 'crew-neck-basic-male',
    name: 'Basic Crew Neck',
    type: 'tshirt',
    style: 'crew-neck',
    preview: '/lovable-uploads/de1f8a75-9240-4206-9413-d5df8df51b1d.png',
    category: 'Classic',
    isPremium: false,
    gender: 'male',
    description: 'Classic men\'s crew neck t-shirt'
  },
  // {
  //   id: 'v-neck-male',
  //   name: 'Classic V-Neck',
  //   type: 'tshirt',
  //   style: 'v-neck',
  //   preview: '🅥',
  //   category: 'Classic',
  //   isPremium: false,
  //   gender: 'male',
  //   description: 'Stylish men\'s v-neck tee'
  // },
  // {
  //   id: 'polo-basic-male',
  //   name: 'Classic Polo',
  //   type: 'tshirt',
  //   style: 'polo',
  //   preview: '👔',
  //   category: 'Formal',
  //   isPremium: true,
  //   price: 4.99,
  //   gender: 'male',
  //   description: 'Professional men\'s polo shirt'
  // },
  // {
  //   id: 'tank-top-basic-male',
  //   name: 'Tank Top',
  //   type: 'tshirt',
  //   style: 'tank-top',
  //   preview: '🎽',
  //   category: 'Summer',
  //   isPremium: false,
  //   gender: 'male',
  //   description: 'Casual men\'s tank top'
  // },
  {
    id: 'long-sleeve-basic-male',
    name: 'Long Sleeve Tee',
    type: 'tshirt',
    style: 'long-sleeve',
    preview: '/lovable-uploads/a11cb986-f613-4cdd-9b91-0e0a974da3a7.png',
    category: 'Classic',
    isPremium: false,
    gender: 'male',
    description: 'Comfortable men\'s long sleeve'
  },
  // {
  //   id: 'athletic-tshirt-male',
  //   name: 'Athletic Fit',
  //   type: 'tshirt',
  //   style: 'crew-neck',
  //   preview: '🏃‍♂️',
  //   category: 'Sport',
  //   isPremium: false,
  //   gender: 'male',
  //   description: 'Performance men\'s athletic tee'
  // },
  // {
  //   id: 'vintage-tshirt-male',
  //   name: 'Vintage Style',
  //   type: 'tshirt',
  //   style: 'crew-neck',
  //   preview: '📻',
  //   category: 'Retro',
  //   isPremium: true,
  //   price: 3.99,
  //   gender: 'male',
  //   description: 'Retro men\'s vintage tee'
  // },

  // Female T-Shirt Templates
  // {
  //   id: 'crew-neck-basic-female',
  //   name: 'Basic Crew Neck',
  //   type: 'tshirt',
  //   style: 'crew-neck',
  //   preview: '👚',
  //   category: 'Classic',
  //   isPremium: false,
  //   gender: 'female',
  //   description: 'Classic women\'s crew neck t-shirt'
  // },
  {
    id: 'v-neck-female',
    name: 'Classic V-Neck',
    type: 'tshirt',
    style: 'v-neck',
    preview: '/lovable-uploads/fcbbf9f0-f18b-4ada-9e93-321ecaec9860.png',
    category: 'Classic',
    isPremium: false,
    gender: 'female',
    description: 'Stylish women\'s v-neck tee'
  },
  // {
  //   id: 'tank-top-basic-female',
  //   name: 'Tank Top',
  //   type: 'tshirt',
  //   style: 'tank-top',
  //   preview: '👚',
  //   category: 'Summer',
  //   isPremium: false,
  //   gender: 'female',
  //   description: 'Casual women\'s tank top'
  // },
  {
    id: 'stripes-short-basic-female',
    name: 'Stripes Short Sleeve',
    type: 'tshirt',
    style: 'stripes-short-sleeve',
    preview: '/lovable-uploads/931658a5-d4c7-4f90-97ab-b94f531c6f6b.png',
    category: 'Classic',
    isPremium: false,
    gender: 'female',
    description: 'Comfortable women\'s long sleeve'
  },
  // {
  //   id: 'long-sleeve-basic-female',
  //   name: 'Long Sleeve Tee',
  //   type: 'tshirt',
  //   style: 'long-sleeve',
  //   preview: '👚',
  //   category: 'Classic',
  //   isPremium: false,
  //   gender: 'female',
  //   description: 'Comfortable women\'s long sleeve'
  // },
  // {
  //   id: 'polo-basic-female',
  //   name: 'Classic Polo',
  //   type: 'tshirt',
  //   style: 'polo',
  //   preview: '👚',
  //   category: 'Formal',
  //   isPremium: true,
  //   price: 4.99,
  //   gender: 'female',
  //   description: 'Professional women\'s polo shirt'
  // },
  // {
  //   id: 'crop-top-female',
  //   name: 'Crop Top',
  //   type: 'tshirt',
  //   style: 'crew-neck',
  //   preview: '👶',
  //   category: 'Trendy',
  //   isPremium: false,
  //   gender: 'female',
  //   description: 'Stylish women\'s crop top'
  // },
  // {
  //   id: 'fitted-tee-female',
  //   name: 'Fitted Tee',
  //   type: 'tshirt',
  //   style: 'crew-neck',
  //   preview: '✨',
  //   category: 'Fitted',
  //   isPremium: true,
  //   price: 2.99,
  //   gender: 'female',
  //   description: 'Form-fitting women\'s tee'
  // },

  // Pants Templates
  {
    id: 'patterned-track-female',
    name: 'Coloured Track Pants',
    type: 'pants',
    style: 'track-patterned-pants',
    preview: '/lovable-uploads/bc5bd816-ecf7-458c-9b10-0f1300b4db72.png',
    category: 'Casual',
    isPremium: false,
    gender: 'female',
    description: 'Stylish women\'s track patterned pants'
  },
  {
    id: 'joggers-male',
    name: 'Athletic Joggers',
    type: 'pants',
    style: 'track-patterned-pants',
    preview: '/lovable-uploads/e1aa13af-4bff-44d7-98ec-2352abb64731.png',
    category: 'Sport',
    isPremium: false,
    gender: 'male',
    description: 'Comfortable men\'s joggers'
  },
  // {
  //   id: 'cargo-pants-male',
  //   name: 'Cargo Pants',
  //   type: 'pants',
  //   style: 'track-patterned-pants',
  //   preview: '🎒',
  //   category: 'Utility',
  //   isPremium: true,
  //   price: 6.99,
  //   gender: 'male',
  //   description: 'Multi-pocket cargo pants'
  // },
  // {
  //   id: 'yoga-pants-female',
  //   name: 'Yoga Pants',
  //   type: 'pants',
  //   style: 'track-patterned-pants',
  //   preview: '🧘‍♀️',
  //   category: 'Sport',
  //   isPremium: false,
  //   gender: 'female',
  //   description: 'Flexible yoga pants'
  // },

  // Hoodie Templates
  // {
  //   id: 'pullover-hoodie-male',
  //   name: 'Pullover Hoodie',
  //   type: 'hoodie',
  //   style: 'crew-neck',
  //   preview: '🧥',
  //   category: 'Casual',
  //   isPremium: false,
  //   gender: 'male',
  //   description: 'Classic men\'s pullover hoodie'
  // },
  // {
  //   id: 'zip-hoodie-female',
  //   name: 'Zip-Up Hoodie',
  //   type: 'hoodie',
  //   style: 'crew-neck',
  //   preview: '🧥',
  //   category: 'Casual',
  //   isPremium: false,
  //   gender: 'female',
  //   description: 'Convenient zip-up hoodie'
  // },
  // {
  //   id: 'oversized-hoodie-unisex',
  //   name: 'Oversized Hoodie',
  //   type: 'hoodie',
  //   style: 'crew-neck',
  //   preview: '🌙',
  //   category: 'Streetwear',
  //   isPremium: true,
  //   price: 7.99,
  //   gender: 'unisex',
  //   description: 'Trendy oversized hoodie'
  // },

  // Jacket Templates
  // {
  //   id: 'bomber-jacket-male',
  //   name: 'Bomber Jacket',
  //   type: 'jacket',
  //   style: 'crew-neck',
  //   preview: '✈️',
  //   category: 'Outerwear',
  //   isPremium: true,
  //   price: 12.99,
  //   gender: 'male',
  //   description: 'Classic bomber jacket'
  // },
  // {
  //   id: 'denim-jacket-female',
  //   name: 'Denim Jacket',
  //   type: 'jacket',
  //   style: 'crew-neck',
  //   preview: '👖',
  //   category: 'Casual',
  //   isPremium: true,
  //   price: 9.99,
  //   gender: 'female',
  //   description: 'Timeless denim jacket'
  // },

  // Unisex Templates
  {
    id: 'crew-neck-premium',
    name: 'Premium Crew Neck',
    type: 'tshirt',
    style: 'crew-neck',
    preview: '/lovable-uploads/4b5a73f9-716d-438c-92e3-9804a5128d72.png',
    category: 'Premium',
    isPremium: true,
    price: 2.99,
    gender: 'unisex',
    description: 'Premium unisex crew neck'
  },
  // {
  //   id: 'v-neck-premium',
  //   name: 'Premium V-Neck',
  //   type: 'tshirt',
  //   style: 'v-neck',
  //   preview: '✨',
  //   category: 'Premium',
  //   isPremium: true,
  //   price: 3.99,
  //   gender: 'unisex',
  //   description: 'Premium unisex v-neck'
  // }
];

export const templateCategories = [
  'All',
  'Classic',
  'Premium',
  'Summer',
  'Formal',
  'Sport',
  'Casual',
  'Trendy',
  'Streetwear'
];

export const getTemplatesByCategory = (category: string): GarmentTemplate[] => {
  if (category === 'All') return garmentTemplates;
  return garmentTemplates.filter(template => template.category === category);
};

export const getTemplatesByGender = (gender: 'male' | 'female' | 'unisex'): GarmentTemplate[] => {
  return garmentTemplates.filter(template => 
    template.gender === gender || template.gender === 'unisex'
  );
};

export const getTemplatesByType = (type: string): GarmentTemplate[] => {
  return garmentTemplates.filter(template => template.type === type);
};

export const getTemplatesByTypeAndGender = (type: string, gender: 'male' | 'female' | 'unisex'): GarmentTemplate[] => {
  return garmentTemplates.filter(template => 
    template.type === type && (template.gender === gender || template.gender === 'unisex')
  );
};

export const getTemplatesByCategoryAndGender = (category: string, gender: 'male' | 'female' | 'unisex'): GarmentTemplate[] => {
  const categoryFiltered = getTemplatesByCategory(category);
  return categoryFiltered.filter(template => 
    template.gender === gender || template.gender === 'unisex'
  );
};

export const getTemplateById = (id: string): GarmentTemplate | undefined => {
  console.warn('what is insdie ', garmentTemplates.find(template => template.id === id));
  return garmentTemplates.find(template => template.id === id);
};
