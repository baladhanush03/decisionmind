import { BrainCircuit, Upload, FileText, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-textMuted">Total Datasets</h3>
            <DatabaseIcon className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold">0</div>
          <p className="text-xs text-textMuted mt-2">Upload a dataset to begin</p>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-textMuted">Trained Models</h3>
            <BrainCircuit className="w-5 h-5 text-accent" />
          </div>
          <div className="text-3xl font-bold">0</div>
          <p className="text-xs text-textMuted mt-2">No active models</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-textMuted">Generated Reports</h3>
            <FileText className="w-5 h-5 text-pink-500" />
          </div>
          <div className="text-3xl font-bold">0</div>
          <p className="text-xs text-textMuted mt-2">PDF and Excel exports</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-textMuted">System Health</h3>
            <Activity className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-green-500">100%</div>
          <p className="text-xs text-textMuted mt-2">All systems operational</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 glass-card p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-surface border border-border/50 flex items-center justify-center mb-6">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Upload Your First Dataset</h2>
          <p className="text-textMuted max-w-md mb-8">
            Get started by uploading a CSV or Excel file. Our AI will automatically validate, clean, and analyze your data.
          </p>
          <Button size="lg" className="px-8 shadow-primary/25">
            <Upload className="w-5 h-5 mr-2" />
            Upload Dataset
          </Button>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Recent AI Insights</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border/50 rounded-xl">
            <BrainCircuit className="w-10 h-10 text-textMuted/30 mb-4" />
            <p className="text-sm text-textMuted">
              No insights generated yet. Train a model to get business recommendations and AI analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple icon for the KPI card
function DatabaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
