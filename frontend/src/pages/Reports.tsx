import { useState, useEffect } from 'react';
import { datasetService } from '../services/datasetService';
import { automlService } from '../services/automlService';
import { FileText, Printer } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Plot from 'react-plotly.js';

export default function Reports() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const d = await datasetService.getDatasets();
        const m = await automlService.getModels();
        setDatasets(d);
        setModels(m);
      } catch (err) {
        console.error("Failed to fetch reports data", err);
      }
    };
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const selectedModel = models.find(m => m.id === selectedModelId);
  const selectedDataset = selectedModel ? datasets.find(d => d.id === selectedModel.dataset_id) : null;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hide controls when printing */}
      <div className="print:hidden flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold flex items-center">
          <FileText className="w-6 h-6 mr-3 text-pink-500" />
          Executive Reports
        </h2>
      </div>

      <div className="print:hidden glass-card p-6 mb-8 flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <label className="block text-sm font-medium text-textMuted mb-2">
            Select a Trained Model to Generate Report
          </label>
          <select 
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={selectedModelId || ''}
            onChange={(e) => setSelectedModelId(Number(e.target.value))}
          >
            <option value="">-- Choose a Model --</option>
            {models.map(m => {
              const d = datasets.find(data => data.id === m.dataset_id);
              return (
                <option key={m.id} value={m.id}>
                  {m.algorithm_used} predicting '{m.target_column}' (Dataset: {d?.filename})
                </option>
              );
            })}
          </select>
        </div>
        
        {selectedModel && (
          <Button onClick={handlePrint} className="ml-6 shadow-primary/25">
            <Printer className="w-4 h-4 mr-2" />
            Print / Save to PDF
          </Button>
        )}
      </div>

      {selectedModel && selectedDataset && (
        <div className="bg-white text-black p-8 rounded-xl shadow-xl print:shadow-none print:p-0 print:bg-transparent max-w-5xl mx-auto printable-report">
          {/* Custom style to override dark mode for printing/report view */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .printable-report, .printable-report * {
                visibility: visible;
              }
              .printable-report {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                color: black !important;
                background: white !important;
              }
              .glass-card {
                background: transparent !important;
                border: 1px solid #e2e8f0 !important;
                box-shadow: none !important;
              }
            }
          `}</style>
          
          <div className="border-b-2 border-gray-200 pb-6 mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Executive Summary Report</h1>
            <p className="text-gray-500">DecisionMind AI Automated Analysis</p>
            <p className="text-sm text-gray-400 mt-4">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Dataset Overview</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-800">Filename:</span> {selectedDataset.filename}</p>
                <p><span className="font-semibold text-gray-800">Total Rows:</span> {selectedDataset.row_count.toLocaleString()}</p>
                <p><span className="font-semibold text-gray-800">Total Features:</span> {selectedDataset.column_count}</p>
                <p><span className="font-semibold text-gray-800">Data Quality Score:</span> {selectedDataset.quality_score}%</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Model Configuration</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-semibold text-gray-800">Target Variable:</span> {selectedModel.target_column}</p>
                <p><span className="font-semibold text-gray-800">Task Type:</span> {selectedModel.task_type}</p>
                <p><span className="font-semibold text-gray-800">Algorithm:</span> {selectedModel.algorithm_used}</p>
                <p><span className="font-semibold text-gray-800">Status:</span> <span className="text-green-600 font-bold">Successfully Trained</span></p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">Performance Metrics</h3>
          <div className="grid grid-cols-4 gap-4 mb-10">
            {Object.entries(selectedModel.metrics).map(([key, value]: [string, any]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                <span className="text-xs text-gray-500 block uppercase font-bold tracking-wider mb-1">{key.replace('_', ' ')}</span>
                <span className="text-3xl font-bold text-gray-900">{value}</span>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">Key Drivers (Feature Importance)</h3>
          <p className="text-gray-600 mb-4 text-sm">
            The following chart illustrates the features that had the most significant impact on predicting the target variable <strong>{selectedModel.target_column}</strong>.
          </p>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-center">
             {selectedModel.feature_importance_chart && (
                <div className="w-full h-[400px]">
                  <Plot
                    data={selectedModel.feature_importance_chart.data}
                    layout={{
                      ...selectedModel.feature_importance_chart.layout,
                      autosize: true,
                      margin: { l: 150, r: 20, t: 40, b: 40 },
                      paper_bgcolor: 'transparent',
                      plot_bgcolor: 'transparent',
                      font: { color: 'black' },
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                  />
                </div>
              )}
          </div>
          
          <div className="mt-12 text-center text-gray-400 text-xs border-t pt-4">
            Confidential - For internal use only. Generated by DecisionMind AI.
          </div>
        </div>
      )}
      
      {!selectedModel && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px] border-dashed border-2 border-border/50">
          <FileText className="w-16 h-16 text-textMuted/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Report Selected</h3>
          <p className="text-textMuted max-w-md">
            Select a trained model from the dropdown above to generate and print its Executive Summary.
          </p>
        </div>
      )}
    </div>
  );
}
