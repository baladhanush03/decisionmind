import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Plot from 'react-plotly.js';
import { ArrowLeft, Loader2, AlertTriangle, FileText, CheckCircle, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { datasetService } from '../services/datasetService';
import { DataChat } from '../components/DataChat';

export default function DatasetView() {
  const { id } = useParams<{ id: string }>();
  const [edaData, setEdaData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchEDA = async () => {
      try {
        const data = await datasetService.getDatasetEDA(Number(id));
        setEdaData(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to analyze dataset');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchEDA();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium text-text">Analyzing Dataset...</h3>
        <p className="text-sm text-textMuted">Running pandas profiling and generating charts</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-8 text-center rounded-xl border border-red-500/30">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text mb-2">Analysis Failed</h3>
        <p className="text-sm text-textMuted mb-6">{error}</p>
        <Link to="/dashboard/datasets">
          <Button variant="outline">Go Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in pb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/datasets">
            <Button variant="ghost" className="px-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Data Quality & Analysis</h2>
        </div>
        <Button 
          variant={showChat ? 'primary' : 'outline'} 
          onClick={() => setShowChat(!showChat)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {showChat ? 'Close Chat' : 'Chat with Data'}
        </Button>
      </div>

      <div className="flex-1 flex space-x-6 min-h-0">
        <div className={`flex-1 overflow-y-auto space-y-6 ${showChat ? 'pr-2' : ''}`}>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Missing Values Chart */}
            <div className="glass-card p-6 min-h-[400px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Missing Values Analysis</h3>
              <div className="flex-1 bg-surface/50 rounded-xl overflow-hidden flex items-center justify-center">
                {edaData?.missing_values_chart ? (
                  <Plot
                    data={edaData.missing_values_chart.data}
                    layout={{
                      ...edaData.missing_values_chart.layout,
                      autosize: true,
                      margin: { l: 40, r: 20, t: 40, b: 40 },
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                  />
                ) : (
                  <div className="text-textMuted flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    No missing values found!
                  </div>
                )}
              </div>
            </div>

            {/* Correlation Heatmap */}
            <div className="glass-card p-6 min-h-[400px] flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Feature Correlation</h3>
              <div className="flex-1 bg-surface/50 rounded-xl overflow-hidden flex items-center justify-center">
                {edaData?.correlation_heatmap ? (
                  <Plot
                    data={edaData.correlation_heatmap.data}
                    layout={{
                      ...edaData.correlation_heatmap.layout,
                      autosize: true,
                      margin: { l: 40, r: 40, t: 40, b: 40 },
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false }}
                  />
                ) : (
                  <div className="text-textMuted flex items-center">
                    Not enough numeric columns to correlate
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dataset Summary Stats */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              Column Data Types
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface/50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-textMuted rounded-l-lg">Column Name</th>
                    <th className="px-4 py-3 font-medium text-textMuted rounded-r-lg">Data Type</th>
                  </tr>
                </thead>
                <tbody>
                  {edaData?.stats?.types && Object.entries(edaData.stats.types).map(([col, type]: [string, any]) => (
                    <tr key={col} className="border-b border-border/50 last:border-0 hover:bg-surfaceHover/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{col}</td>
                      <td className="px-4 py-3 text-primary">{type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-96 flex-shrink-0 animate-slide-up h-full pb-6">
            <DataChat datasetId={Number(id)} />
          </div>
        )}
      </div>
    </div>
  );
}
