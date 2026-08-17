import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsAPI } from '../api/reports';
import { FileDown, Plus, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await reportsAPI.listReports();
      return res.data.data;
    }
  });

  const handleGenerate = async (data) => {
    setIsGenerating(true);
    try {
      const response = await reportsAPI.generateReport(data.startDate, data.endDate);
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FinSight_Report_${data.startDate}_to_${data.endDate}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report generated successfully');
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold gradient-text">Reports</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition">
          <Plus size={18} className="mr-2" /> Generate Report
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="shimmer h-12 rounded w-full"></div>)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="px-6 py-3">Filename</th>
                  <th className="px-6 py-3">Period</th>
                  <th className="px-6 py-3">Generated Date</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-500">No reports generated yet</td></tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                      <td className="px-6 py-4 font-medium text-white flex items-center">
                        <FileDown size={16} className="text-secondary mr-2" />
                        {report.filename}
                      </td>
                      <td className="px-6 py-4">{report.period}</td>
                      <td className="px-6 py-4">{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{(report.size / 1024).toFixed(2)} KB</td>
                      <td className="px-6 py-4 text-right">
                        <a href={report.url} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 inline-flex items-center">
                          Download
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <GenerateReportModal 
          onClose={() => !isGenerating && setIsModalOpen(false)} 
          onGenerate={handleGenerate} 
          isGenerating={isGenerating} 
        />
      )}
    </div>
  );
}

function GenerateReportModal({ onClose, onGenerate, isGenerating }) {
  const { register, handleSubmit } = useForm();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="glass-card w-full max-w-md p-6 rounded-xl relative">
        {!isGenerating && <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>}
        <h2 className="text-xl font-bold mb-4 text-white">Generate Custom Report</h2>
        
        <form onSubmit={handleSubmit(onGenerate)} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Start Date</label>
            <input type="date" {...register('startDate', { required: true })} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white" disabled={isGenerating} />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">End Date</label>
            <input type="date" {...register('endDate', { required: true })} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white" disabled={isGenerating} />
          </div>
          <button type="submit" disabled={isGenerating} className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition flex justify-center items-center disabled:opacity-70">
            {isGenerating ? <><Loader2 className="animate-spin mr-2" size={18} /> Generating PDF...</> : 'Generate Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
