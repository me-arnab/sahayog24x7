import { Outlet } from "react-router-dom";
import { TopNavbar } from "./TopNavbar";
import { Sidebar } from "./Sidebar";
import { LayoutProvider } from "../../context/LayoutContext";

const WavePattern = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-[500px] overflow-hidden pointer-events-none opacity-40 z-0">
      <svg viewBox="0 0 1000 400" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="mainWaveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        {[...Array(12)].map((_, i) => (
          <path
            key={`mw1-${i}`}
            d={`M-50,420 Q${250 + i * 30},${40 + i * 15} 1050,${280 + i * 10}`}
            fill="none"
            stroke="url(#mainWaveGrad)"
            strokeWidth="1.5"
            opacity={0.3 + (i % 4) * 0.15}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <path
            key={`mw2-${i}`}
            d={`M-50,420 C${150 + i * 40},${350 - i * 10} ${450 - i * 20},${150 + i * 25} 1050,${340 + i * 6}`}
            fill="none"
            stroke="url(#mainWaveGrad)"
            strokeWidth="1"
            opacity={0.2 + (i % 3) * 0.1}
          />
        ))}
      </svg>
    </div>
  );
};

const DotPattern = () => (
  <div 
    className="fixed top-0 right-0 w-full h-full pointer-events-none opacity-[0.15] z-0" 
    style={{
      backgroundImage: 'radial-gradient(#3b82f6 1.5px, transparent 1.5px)',
      backgroundSize: '20px 20px',
      WebkitMaskImage: 'radial-gradient(circle at top right, black 5%, transparent 60%)',
      maskImage: 'radial-gradient(circle at top right, black 5%, transparent 60%)'
    }} 
  />
);

export function DashboardLayout() {
  return (
    <LayoutProvider>
      <div className="min-h-screen bg-bg flex overflow-hidden relative">
        <DotPattern />
        <WavePattern />
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <TopNavbar />
          
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </LayoutProvider>
  );
}
