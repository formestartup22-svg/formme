
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Eye, ShoppingCart, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Product {
  id: string;
  title: string;
  designer: string;
  price: number;
  image: string;
  tags: string[];
  category: string;
}

const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Classic White T-Shirt",
    designer: "StyleStudio",
    price: 29.99,
    image: "/lovable-uploads/67465d31-2315-4cf8-bf47-eb2efca21e46.png",
    tags: ["Cotton", "Summer", "Casual"],
    category: "T-Shirts"
  },
  {
    id: "2",
    title: "Vintage Graphic Tee",
    designer: "RetroDesigns",
    price: 34.99,
    image: "/placeholder.svg",
    tags: ["Graphic", "Retro", "Unisex"],
    category: "T-Shirts"
  },
  {
    id: "3",
    title: "Premium Black Polo",
    designer: "LuxeWear",
    price: 49.99,
    image: "/placeholder.svg",
    tags: ["Polo", "Business Casual", "Premium"],
    category: "Polos"
  },
  {
    id: "4",
    title: "Summer Collection Tee",
    designer: "BeachVibes",
    price: 27.99,
    image: "/placeholder.svg",
    tags: ["Summer", "Colorful", "Limited Edition"],
    category: "T-Shirts"
  },
  {
    id: "5",
    title: "Urban Street T-Shirt",
    designer: "CityThreads",
    price: 32.99,
    image: "/placeholder.svg",
    tags: ["Urban", "Streetwear", "Trendy"],
    category: "T-Shirts"
  },
  {
    id: "6",
    title: "Eco-Friendly Hemp Shirt",
    designer: "GreenFashion",
    price: 39.99,
    image: "/placeholder.svg",
    tags: ["Sustainable", "Eco", "Natural"],
    category: "T-Shirts"
  },
  {
    id: "7",
    title: "Classic Striped Polo",
    designer: "LuxeWear",
    price: 45.99,
    image: "/placeholder.svg",
    tags: ["Stripes", "Casual", "Business"],
    category: "Polos"
  },
  {
    id: "8",
    title: "Winter Hooded Jacket",
    designer: "CityThreads",
    price: 89.99,
    image: "/placeholder.svg",
    tags: ["Winter", "Warm", "Waterproof"],
    category: "Jackets"
  },
  {
    id: "9",
    title: "Premium Leather Jacket",
    designer: "LuxeWear",
    price: 199.99,
    image: "/placeholder.svg",
    tags: ["Leather", "Premium", "Limited Edition"],
    category: "Jackets"
  },
  {
    id: "10",
    title: "Zip-Up Hoodie",
    designer: "UrbanStyle",
    price: 59.99,
    image: "/placeholder.svg",
    tags: ["Casual", "Comfortable", "Everyday"],
    category: "Hoodies"
  },
  {
    id: "11",
    title: "Limited Edition Designer Hoodie",
    designer: "StyleStudio",
    price: 89.99,
    image: "/placeholder.svg",
    tags: ["Designer", "Limited Edition", "Premium"],
    category: "Hoodies"
  }
];

const CATEGORIES = ["All", "T-Shirts", "Polos", "Hoodies", "Jackets", "Premium", "Limited Edition"];
const DESIGNERS = ["All Designers", "StyleStudio", "RetroDesigns", "LuxeWear", "BeachVibes", "CityThreads", "GreenFashion"];

const Marketplace = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDesigner, setSelectedDesigner] = useState("All Designers");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState(200);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter products based on selected criteria
  const filteredProducts = PRODUCTS.filter(product => {
    const categoryMatch = selectedCategory === "All" || 
                          product.category === selectedCategory || 
                          (selectedCategory === "Premium" && product.price > 50) ||
                          (selectedCategory === "Limited Edition" && product.tags.includes("Limited Edition"));
    
    const designerMatch = selectedDesigner === "All Designers" || product.designer === selectedDesigner;
    
    const searchMatch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       product.designer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const priceMatch = product.price <= priceRange;
    
    return categoryMatch && designerMatch && searchMatch && priceMatch;
  });

  const handleBuyNow = (product: Product) => {
    toast.success(`Added ${product.title} to cart!`);
    navigate(`/checkout?product=${product.id}`);
  };

  const handlePreview = (product: Product) => {
    setPreviewProduct(product);
  };

  const closePreview = () => {
    setPreviewProduct(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6f3] to-[#efede6]">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-4">
              Marketplace
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover unique designs from talented creators around the world
            </p>
            <div className="h-[1px] w-24 bg-[#344C3D] mx-auto mt-8"></div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-sm border border-white/20">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search designs, creators, tags..."
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#344C3D]/20 focus:border-[#344C3D] transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="border-[#344C3D]/20 text-[#344C3D] hover:bg-[#344C3D]/5"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Categories */}
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            selectedCategory === cat
                              ? "bg-[#344C3D] text-white"
                              : "bg-white/80 text-gray-600 hover:bg-[#344C3D]/10"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Designers */}
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">Designers</h3>
                    <div className="flex flex-wrap gap-2">
                      {DESIGNERS.map((designer) => (
                        <button
                          key={designer}
                          onClick={() => setSelectedDesigner(designer)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            selectedDesigner === designer
                              ? "bg-[#344C3D] text-white"
                              : "bg-white/80 text-gray-600 hover:bg-[#344C3D]/10"
                          }`}
                        >
                          {designer}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium text-gray-800 mb-3">Price Range</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>$0</span>
                        <span className="font-medium">${priceRange}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        step="10"
                        className="w-full accent-[#344C3D]"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredProducts.length} design{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-12 border border-white/20 max-w-md mx-auto">
                <h3 className="text-2xl font-light text-gray-800 mb-4">No designs found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <Button 
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedDesigner("All Designers");
                    setSearchQuery("");
                    setPriceRange(200);
                  }}
                  className="bg-[#344C3D] hover:bg-[#253b2e] text-white"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="group bg-white/60 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 text-lg leading-tight">{product.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">by {product.designer}</p>
                      </div>
                      <div className="text-xl font-semibold text-[#344C3D]">${product.price.toFixed(2)}</div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-[#344C3D]/10 text-xs rounded-full text-[#344C3D] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="text-xs text-gray-400 py-1">+{product.tags.length - 3} more</span>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex gap-2 p-4 pt-0">
                    <Button 
                      variant="outline"
                      onClick={() => handlePreview(product)}
                      className="flex-1 border-[#344C3D]/20 text-[#344C3D] hover:bg-[#344C3D]/5"
                      size="sm"
                    >
                      <Eye className="mr-2" size={14} />
                      Preview
                    </Button>
                    <Button 
                      onClick={() => handleBuyNow(product)}
                      className="flex-1 bg-[#344C3D] hover:bg-[#253b2e] text-white"
                      size="sm"
                    >
                      <ShoppingCart className="mr-2" size={14} />
                      Buy Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Preview Dialog */}
      <Dialog open={previewProduct !== null} onOpenChange={closePreview}>
        <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-sm border-white/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light text-gray-800">{previewProduct?.title}</DialogTitle>
            <DialogDescription className="text-gray-600">
              by {previewProduct?.designer} · ${previewProduct?.price.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center">
            <div className="w-full h-80 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
              <img 
                src={previewProduct?.image} 
                alt={previewProduct?.title}
                className="w-full h-full object-cover object-center"
              />
            </div>
            
            <div className="w-full">
              <h4 className="font-medium mb-3 text-gray-800">Details</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {previewProduct?.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#344C3D]/10 text-sm rounded-full text-[#344C3D] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button 
                onClick={() => {
                  if (previewProduct) handleBuyNow(previewProduct);
                  closePreview();
                }}
                className="w-full bg-[#344C3D] hover:bg-[#253b2e] text-white py-3 rounded-xl"
              >
                <ShoppingCart className="mr-2" size={16} />
                Add to Cart - ${previewProduct?.price.toFixed(2)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;
