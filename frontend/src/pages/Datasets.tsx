import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, CheckCircle2, AlertCircle, BarChart2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { datasetService } from '../services/datasetService';
import { Link } from 'react-router-dom';

export default function Datasets() {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchDatasets = async () => {
    try {
      const data = await datasetService.getDatasets();
      setDatasets(data);
    } catch (err) {
      console.error("Failed to fetch datasets", err);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadError('');
    
    try {
      await datasetService.uploadDataset(acceptedFiles[0]);
      await fetchDatasets();
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || 'Failed to upload dataset');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Datasets</h2>
      </div>

      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`glass-card p-12 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed transition-all ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
          <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-textMuted'}`} />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {isDragActive ? 'Drop your file here' : 'Upload a new dataset'}
        </h3>
        <p className="text-sm text-textMuted max-w-sm mb-4">
          Drag and drop a CSV or Excel file, or click to browse your files.
        </p>
        
        {uploadError && (
          <div className="flex items-center text-red-500 text-sm mt-2 bg-red-500/10 px-3 py-1.5 rounded-full">
            <AlertCircle className="w-4 h-4 mr-2" />
            {uploadError}
          </div>
        )}
        
        {isUploading && (
          <div className="mt-4 text-primary text-sm flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
            Uploading and analyzing...
          </div>
        )}
      </div>

      {/* Datasets List */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Datasets</h3>
        {datasets.length === 0 ? (
          <div className="glass p-8 text-center rounded-xl border border-border text-textMuted">
            You haven't uploaded any datasets yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((dataset) => (
              <div key={dataset.id} className="glass-card p-6 flex flex-col hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <File className="w-8 h-8 text-primary mr-3" />
                    <div className="truncate pr-4">
                      <h4 className="font-semibold truncate">{dataset.filename}</h4>
                      <p className="text-xs text-textMuted">
                        {(dataset.file_size_bytes / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <span className="text-textMuted block text-xs">Rows</span>
                    <span className="font-medium">{dataset.row_count}</span>
                  </div>
                  <div>
                    <span className="text-textMuted block text-xs">Columns</span>
                    <span className="font-medium">{dataset.column_count}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-textMuted block text-xs mb-1">Quality Score</span>
                    <div className="flex items-center">
                      <div className="flex-1 bg-surface rounded-full h-2 mr-3 overflow-hidden">
                        <div 
                          className={`h-full ${dataset.quality_score > 80 ? 'bg-green-500' : dataset.quality_score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${dataset.quality_score}%` }}
                        />
                      </div>
                      <span className="font-medium">{dataset.quality_score}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-border flex justify-between">
                  <Link to={`/dashboard/datasets/${dataset.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart2 className="w-4 h-4 mr-2" />
                      View Analysis
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
