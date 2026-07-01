import { Outlet } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-text animate-slide-up" style={{ animationDelay: '0.1s' }}>
          DecisionMind AI
        </h2>
        <p className="mt-2 text-center text-sm text-textMuted animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Universal Business Intelligence & AutoML Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="glass-card py-8 px-4 sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
