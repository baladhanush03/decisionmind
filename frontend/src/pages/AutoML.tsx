import { useState, useEffect } from 'react';
import { datasetService } from '../services/datasetService';
import { automlService } from '../services/automlService';
import { BrainCircuit, Play, CheckCircle, BarChart, Target } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Plot from 'react-plotly.js';

export default function AutoML() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>('');
  
  const [isTraining, setIsTraining] = useState(false);
  const [trainedModel, setTrainedModel] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const data = await datasetService.getDatasets();
      setDatasets(data);
    } catch (err) {
      console.error(err);
    }
  };


  const handleDatasetSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelectedDatasetId(id);
    setTargetColumn('');
    setTrainedModel(null);
    setError('');
    
    if (id) {
      try {
        const cols = await automlService.getDatasetColumns(id);
        setColumns(cols);
      } catch (err) {
        console.error("Failed to fetch columns", err);
      }
    } else {
      setColumns([]);
    }
  };

  const handleTrain = async () => {
    if (!selectedDatasetId || !targetColumn) return;
    
    setIsTraining(true);
    setError('');
    
    try {
      const result = await automlService.trainModel(selectedDatasetId, targetColumn);
      setTrainedModel(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Training failed');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold flex items-center">
          <BrainCircuit className="w-6 h-6 mr-3 text-accent" />
          AutoML Studio
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="glass-card p-6 h-fit">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            Model Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">
                1. Select Dataset
              </label>
              <select 
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={selectedDatasetId || ''}
                onChange={handleDatasetSelect}
              >
                <option value="">-- Choose a Dataset --</option>
                {datasets.map(d => (
                  <option key={d.id} value={d.id}>{d.filename}</option>
                ))}
              </select>
            </div>

            {columns.length > 0 && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-textMuted mb-2 mt-4">
                  2. Select Target Variable (What to predict)
                </label>
                <select 
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={targetColumn}
                  onChange={(e) => setTargetColumn(e.target.value)}
                >
                  <option value="">-- Choose Target --</option>
                  {columns.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <Button 
              className="w-full mt-6" 
              onClick={handleTrain} 
              disabled={!selectedDatasetId || !targetColumn || isTraining}
              isLoading={isTraining}
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              {isTraining ? 'Training Model...' : 'Start Training'}
            </Button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {trainedModel ? (
            <div className="animate-slide-up space-y-6">
              {/* Metrics Header */}
              <div className="glass-card p-6 border-t-4 border-green-500">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center text-green-500 mb-2">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-semibold text-lg">Training Complete</span>
                    </div>
                    <h4 className="text-xl font-bold">{trainedModel.algorithm_used}</h4>
                    <p className="text-textMuted text-sm mt-1">Predicting: <span className="text-text font-medium">{trainedModel.target_column}</span></p>
                  </div>
                  <div className="bg-surface px-4 py-2 rounded-lg border border-border">
                    <span className="text-xs text-textMuted block uppercase">Task Type</span>
                    <span className="font-semibold text-primary capitalize">{trainedModel.task_type}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(trainedModel.metrics).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-surface/50 p-4 rounded-lg">
                      <span className="text-xs text-textMuted block uppercase mb-1">{key.replace('_', ' ')}</span>
                      <span className="text-2xl font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Importance */}
              <div className="glass-card p-6 min-h-[400px]">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-accent" />
                  Feature Importance
                </h3>
                {trainedModel.feature_importance_chart && (
                  <div className="w-full h-[400px]">
                    <Plot
                      data={trainedModel.feature_importance_chart.data}
                      layout={{
                        ...trainedModel.feature_importance_chart.layout,
                        autosize: true,
                        margin: { l: 150, r: 20, t: 40, b: 40 }, // More left margin for long labels
                      }}
                      useResizeHandler={true}
                      style={{ width: '100%', height: '100%' }}
                      config={{ displayModeBar: false }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px] border-dashed border-2 border-border/50">
              <BrainCircuit className="w-16 h-16 text-textMuted/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Model Trained Yet</h3>
              <p className="text-textMuted max-w-md">
                Select a dataset and a target column on the left to automatically train and evaluate a machine learning model.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
