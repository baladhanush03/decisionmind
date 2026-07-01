import { useState, useEffect } from 'react';
import { datasetService } from '../services/datasetService';
import { automlService } from '../services/automlService';
import { Play, Activity, Bot, ChevronRight, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Predict() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  
  const [features, setFeatures] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  
  const [prediction, setPrediction] = useState<string | number | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const d = await datasetService.getDatasets();
        const m = await automlService.getModels();
        setDatasets(d);
        setModels(m);
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, []);

  const handleModelSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelectedModelId(id);
    setPrediction(null);
    setError('');
    setFormData({});
    
    if (id) {
      const selectedModel = models.find(m => m.id === id);
      if (selectedModel) {
        try {
          const cols = await automlService.getDatasetColumns(selectedModel.dataset_id);
          // Features are all columns EXCEPT the target column
          const featureCols = cols.filter((c: string) => c !== selectedModel.target_column);
          setFeatures(featureCols);
          
          // Initialize form state
          const initialForm: Record<string, string> = {};
          featureCols.forEach((f: string) => initialForm[f] = '');
          setFormData(initialForm);
        } catch (err) {
          setError("Failed to load model features");
        }
      }
    } else {
      setFeatures([]);
    }
  };

  const handleInputChange = (feature: string, value: string) => {
    setFormData(prev => ({ ...prev, [feature]: value }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModelId) return;
    
    setIsPredicting(true);
    setError('');
    
    try {
      // Cast numeric strings to numbers for the backend
      const payload: Record<string, any> = {};
      for (const [k, v] of Object.entries(formData)) {
        if (!isNaN(Number(v)) && v.trim() !== '') {
          payload[k] = Number(v);
        } else {
          payload[k] = v;
        }
      }
      
      const res = await automlService.predict(selectedModelId, payload);
      setPrediction(res.prediction);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Prediction failed. Ensure all feature values are correct.");
      setPrediction(null);
    } finally {
      setIsPredicting(false);
    }
  };

  const selectedModel = models.find(m => m.id === selectedModelId);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold flex items-center">
          <Activity className="w-6 h-6 mr-3 text-green-500" />
          Model Inference & Predictions
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Selection & Feature Input */}
        <div className="lg:col-span-2 glass-card p-6 h-fit">
          <label className="block text-sm font-medium text-textMuted mb-2">
            Select a Trained Model to use for Prediction
          </label>
          <select 
            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-8"
            value={selectedModelId || ''}
            onChange={handleModelSelect}
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

          {features.length > 0 && selectedModel && (
            <div className="animate-slide-up">
              <h3 className="text-lg font-semibold mb-4 border-b border-border/50 pb-2">
                Enter Feature Values
              </h3>
              <p className="text-sm text-textMuted mb-6">
                Fill in the values below to predict the <span className="font-bold text-text">{selectedModel.target_column}</span>.
              </p>
              
              <form onSubmit={handlePredict}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 pb-4">
                  {features.map(f => (
                    <Input
                      key={f}
                      label={f}
                      required
                      value={formData[f]}
                      onChange={(e) => handleInputChange(f, e.target.value)}
                      placeholder={`Enter value for ${f}`}
                    />
                  ))}
                </div>
                
                {error && (
                  <div className="mt-4 bg-red-500/10 text-red-500 text-sm p-3 rounded-lg border border-red-500/20">
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full mt-6 shadow-primary/25"
                  isLoading={isPredicting}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Prediction
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Prediction Output */}
        <div className="glass-card p-6 h-fit min-h-[300px] flex flex-col items-center justify-center text-center">
          {prediction !== null ? (
            <div className="animate-fade-in flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-textMuted text-sm uppercase tracking-wider mb-2">Predicted Output</h4>
              <p className="text-4xl font-bold text-white mb-2">
                {typeof prediction === 'number' ? prediction.toFixed(4) : prediction}
              </p>
              <p className="text-sm text-primary mt-4 flex items-center">
                <Bot className="w-4 h-4 mr-2" />
                Generated by DecisionMind AI
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-textMuted/50">
              <Bot className="w-16 h-16 mb-4" />
              <p>Select a model and run a prediction to see the results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
