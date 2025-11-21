
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  // Define sidebar items with corresponding color accents from mood board
  const sidebarItems = [
    {
      id: "Elements",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
      ),
      label: "Elements",
      accent: "#D3BFE8" // Lavender
    },
    {
      id: "Text",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
      ),
      label: "Text",
      accent: "#FFCAD4" // Pink
    },
    {
      id: "Uploads",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M4 13.5V12a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7.3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-.8"/><circle cx="8" cy="8" r="1"/></svg>
      ),
      label: "Uploads",
      accent: "#FFC72C" // Yellow
    },
    {
      id: "Colors",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="17" r="2"/><circle cx="7" cy="10" r="2"/><circle cx="8" cy="20" r="2"/><path d="M18.5 14.5 14 8l-10 12"/></svg>
      ),
      label: "Colors",
      accent: "#FEF7CD" // Light Yellow
    },
    {
      id: "Layers",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 20 7 12 12 4 7 12 2"/><polygon points="12 12 20 17 12 22 4 17 12 12"/></svg>
      ),
      label: "Layers",
      accent: "#E5DEFF" // Light Purple
    },
    {
      id: "Fabrics",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10"/><path d="m16 3 5 5"/><path d="M6 14a3 3 0 0 1 0-6h.5"/><path d="M9 11h10"/><path d="M15 17h2"/></svg>
      ),
      label: "Fabrics",
      accent: "#D3E4FD" // Light Blue
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="w-[80px] bg-gradient-to-b from-[#FFF8F0] to-[#FEF7CD]/30 border-r flex flex-col items-center pt-4">
      {sidebarItems.map((item) => (
        <div
          key={item.id}
          onClick={() => handleTabChange(item.id)}
          className={cn(
            "w-full flex flex-col items-center justify-center py-3.5 cursor-pointer transition-all group",
            activeTab === item.id
              ? "text-purple-600"
              : "text-gray-500 hover:text-gray-800"
          )}
        >
          <div 
            className={cn(
              "p-2 rounded-md transition-colors", 
              activeTab === item.id 
                ? `bg-[${item.accent}]` 
                : "group-hover:bg-gray-100"
            )}
            style={{ 
              backgroundColor: activeTab === item.id ? item.accent : undefined
            }}
          >
            {item.icon}
          </div>
          <span className="text-[10px] mt-1 font-medium">{item.label}</span>
        </div>
      ))}

      <div className="mt-auto mb-6">
        <div 
          className="flex flex-col items-center justify-center py-3.5 cursor-pointer transition-all text-gray-500 hover:text-gray-800 group"
          onClick={() => {}}
        >
          <div className="p-2 rounded-md group-hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="6" r="4"/><path d="M17 10h2a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-2"/><path d="M7 10H5a2 2 0 0 0-2 2v1a3 3 0 0 0 3 3h2"/><line x1="12" x2="12" y1="10" y2="18"/><line x1="8" x2="16" y1="18" y2="18"/></svg>
          </div>
          <span className="text-[10px] mt-1 font-medium">Try On</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
