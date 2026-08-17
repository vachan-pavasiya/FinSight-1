import React, { useState } from 'react';
import { uploadAPI } from '../api/upload';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    try {
      const res = await uploadAPI.uploadFile(formData);
      setResult(res.data);
      toast.success('File processed successfully!');
    } catch (err) {
      toast.error('Failed to process file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold gradient-text">Upload Bank Statement</h1>

      <div 
        onDragOver={handleDragOver} 
        onDragLeave={handleDragLeave} 
        onDrop={handleDrop}
        className={`glass-card border-2 border-dashed rounded-xl p-12 text-center transition-all ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-600'}`}
      >
        <UploadCloud size={64} className="mx-auto text-primary mb-4" />
        <h3 className="text-xl text-white font-medium mb-2">Drop your bank statement here</h3>
        <p className="text-gray-400 mb-6">Accepts .csv and .xlsx files</p>
        
        <input type="file" id="file-upload" className="hidden" accept=".csv,.xlsx" onChange={handleFileChange} />
        <label htmlFor="file-upload" className="cursor-pointer px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
          Browse Files
        </label>

        {file && (
          <div className="mt-6 p-4 bg-gray-800/50 rounded-lg inline-block text-left">
            <p className="text-white font-medium">{file.name}</p>
            <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
      </div>

      {file && !result && (
        <div className="text-center">
          <button onClick={handleUpload} disabled={isUploading} className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50">
            {isUploading ? 'Uploading...' : 'Process Statement'}
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-lg flex items-center justify-between bg-success/10 border border-success/20">
            <div className="flex items-center text-success">
              <CheckCircle size={24} className="mr-3" />
              <span className="font-medium">Successfully processed</span>
            </div>
            <div className="text-gray-300">
              <span className="text-white font-bold">{result.importedCount}</span> transactions imported, 
              <span className="text-danger font-bold ml-1">{result.failedCount}</span> failed
            </div>
          </div>
          
          <div className="glass-card rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs uppercase bg-gray-800/50 text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Merchant</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {result.transactions?.map((t, idx) => (
                    <tr key={idx} className="border-b border-gray-700/50">
                      <td className="px-6 py-4 text-white">{t.merchant}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs bg-gray-700 text-white">{t.category || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4">₹{t.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
