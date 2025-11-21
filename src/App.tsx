
import {
  Routes,
  Route,
} from "react-router-dom";
import Index from "./pages/Index";
import Templates from "./pages/Templates";
import Marketplace from "./pages/Marketplace";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Reviews from "./pages/Reviews";
import StudioSelection from "./pages/StudioSelection";
import ComingSoon from "./pages/ComingSoon";
import Workflow from "./pages/Workflow";
import DesignWorkspace from "./pages/DesignWorkspace";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Toaster } from "sonner";
import SimpleDesigner from './pages/SimpleDesigner';
import DesignStudio from './pages/DesignStudio';
import ProfessionalStudio from "./pages/ProfessionalStudio";

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
          <Route path='/professional-studio' element={<ProfessionalStudio />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/design/:id" element={<DesignWorkspace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </DndProvider>
  );
}

export default App;
