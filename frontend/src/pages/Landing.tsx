import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BrainCircuit, Upload, Sparkles, LineChart } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Premium ambient background */}
      <div className="absolute top-0 left-1/4 w-1/2 h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      
      <header className="px-8 py-6 flex justify-between items-center glass border-b border-border/50 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">DecisionMind AI</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#features" className="text-textMuted hover:text-white transition">Features</a>
          <a href="#demo" className="text-textMuted hover:text-white transition">Demo</a>
          <a href="#pricing" className="text-textMuted hover:text-white transition">Pricing</a>
        </nav>
        <div className="flex space-x-4">
          <Link to="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <div className="inline-flex items-center space-x-2 bg-surface/50 border border-primary/30 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">The Future of Business Intelligence</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Upload Any Dataset. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-pink-500">
            Discover Insights.
          </span>
        </h1>
        
        <p className="text-xl text-textMuted max-w-2xl mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Build AI models, generate executive reports, and chat with your data using our Universal Business Intelligence & AutoML Platform. No coding required.
        </p>

        <div className="flex space-x-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Link to="/register">
            <Button size="lg" className="rounded-full px-8 shadow-primary/50">
              Start Building for Free
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="rounded-full px-8 border-border hover:bg-surface">
            View Live Demo
          </Button>
        </div>

        <div className="mt-32 grid md:grid-cols-3 gap-8 max-w-6xl w-full px-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="glass-card p-8 text-left flex flex-col items-start transition-transform hover:-translate-y-2 duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">1. Upload Data</h3>
            <p className="text-textMuted">Drag and drop your CSV or Excel files. We automatically clean, validate, and prepare your dataset.</p>
          </div>
          
          <div className="glass-card p-8 text-left flex flex-col items-start transition-transform hover:-translate-y-2 duration-300">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
              <BrainCircuit className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3">2. Train AI Models</h3>
            <p className="text-textMuted">Our AutoML engine compares dozens of algorithms (XGBoost, Random Forest) to find the best predictor.</p>
          </div>
          
          <div className="glass-card p-8 text-left flex flex-col items-start transition-transform hover:-translate-y-2 duration-300">
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-6">
              <LineChart className="w-6 h-6 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">3. Make Decisions</h3>
            <p className="text-textMuted">Chat with your data using LLMs, view SHAP explainability charts, and export interactive PDF reports.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
