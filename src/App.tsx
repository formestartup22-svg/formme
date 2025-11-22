import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Templates from "./pages/Templates";
import Marketplace from "./pages/Marketplace";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Reviews from "./pages/Reviews";
import About from "./pages/About";
import StudioSelection from "./pages/StudioSelection";
import ComingSoon from "./pages/ComingSoon";
import Dashboard from "./pages/Dashboard";
import DesignWorkspace from "./pages/DesignWorkspace";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Toaster } from "sonner";
import SimpleDesigner from "./pages/SimpleDesigner";
import DesignStudio from "./pages/DesignStudio";
import ProfessionalStudio from "./pages/ProfessionalStudio";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import ManufacturerOrderWorkspace from "./pages/ManufacturerOrderWorkspace";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Templates />} />
          <Route path="/studio-selection" element={<StudioSelection />} />
          <Route path="/designer" element={<DesignStudio />} />
          <Route path="/old-designer" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/simple" element={<SimpleDesigner />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/professional-studio" element={<ProfessionalStudio />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workflow" element={<Dashboard />} />
          <Route path="/design/:id" element={<DesignWorkspace />} />
          <Route path="/manufacturer" element={<ManufacturerDashboard />} />
          <Route path="/manufacturer/order/:id" element={<ManufacturerOrderWorkspace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </DndProvider>
  );
}

export default App;
