/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Cpu, 
  ChevronRight, 
  Download, 
  Printer, 
  RefreshCw,
  TrendingUp,
  AlertOctagon,
  Calendar,
  Layers,
  Clock
} from 'lucide-react';
import { AutomatedReport } from '../types';

interface AiReportsProps {
  reports: AutomatedReport[];
  onGenerateReport: (type: 'finance' | 'stock' | 'discrepancy' | 'general') => Promise<boolean>;
  errorMsg: string;
  successMsg: string;
}

export default function AiReports({
  reports,
  onGenerateReport,
  errorMsg,
  successMsg
}: AiReportsProps) {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [reportType, setReportType] = useState<'finance' | 'stock' | 'discrepancy' | 'general'>('general');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Set default report once reports load
  useEffect(() => {
    if (reports.length > 0 && !selectedReportId) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  // Loading screen sub-messages to improve user experience
  const loadingMessages = [
    "Menghubungkan ke Kecerdasan Buatan Gemini AI...",
    "Membaca rekaman buku kas keluar-masuk Kalimaya Alunna...",
    "Memetakan sisa unit sediaan fisik di stockis gudang...",
    "Melakukan verifikasi audit silang (cross-checks) arus dana beralih barang...",
    "Merumuskan rekomendasi strategi bisnis & operasional tim Direksi...",
    "Menyelesaikan penulisan draf laporan eksekutif formal..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const success = await onGenerateReport(reportType);
      if (success && reports.length > 0) {
        // Automatically select the newest report (will be at reports[0] since we unshift on server)
        setSelectedReportId(reports[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const getActiveReport = () => {
    return reports.find(r => r.id === selectedReportId) || reports[0];
  };

  // Professional markdown parser helper to render HTML neatly adorned by styled Tailwind classes
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    // Split text by newlines and convert elements
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // 1. Headers H3 (e.g., ### Title)
      if (line.startsWith('### ')) {
        return (
          <h3 key={i} className="text-base font-bold text-slate-900 mt-6 mb-3 font-sans border-b border-gray-100 pb-1.5 flex items-center">
            <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
            {line.replace('### ', '')}
          </h3>
        );
      }
      
      // 2. Headers H4 (e.g., #### Title)
      if (line.startsWith('#### ')) {
        return (
          <h4 key={i} className="text-sm font-semibold text-slate-800 mt-4 mb-2 font-sans tracking-tight">
            {line.replace('#### ', '')}
          </h4>
        );
      }

      // 3. Bullets (- item, * item)
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const content = line.substring(2);
        // Look forbold items (e.g. **bold**: text)
        const parts = content.split('**');
        if (parts.length >= 3) {
          return (
            <ul key={i} className="list-disc pl-5 my-1.5 text-xs text-slate-600 font-sans leading-relaxed">
              <li>
                <strong className="text-slate-800 font-semibold">{parts[1]}</strong>
                {parts.slice(2).join('')}
              </li>
            </ul>
          );
        }
        return (
          <ul key={i} className="list-disc pl-5 my-1.5 text-xs text-slate-600 font-sans leading-relaxed">
            <li>{content}</li>
          </ul>
        );
      }

      // 4. Bold block parsing on simple lines
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={i} className="text-xs text-slate-600 font-sans my-2 leading-relaxed">
            {parts.map((p, idx) => idx % 2 === 1 ? <strong key={idx} className="text-slate-900 font-bold">{p}</strong> : p)}
          </p>
        );
      }

      // 5. Empty lines
      if (line.trim() === '') {
        return <div key={i} className="h-2.5" />;
      }

      // 6. Backup regular paragraph
      return (
        <p key={i} className="text-xs text-slate-600 font-sans my-1.5 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  const activeReport = getActiveReport();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ai-reports-container">
      
      {/* LEFT COLUMN: Report Catalog and Request Center */}
      <div className="lg:col-span-4 space-y-5" id="reports-left-column">
        
        {/* Trigger / Configurator Area */}
        <fieldset className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs" id="generator-configurator">
          <legend className="bg-slate-900 text-white text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-widest shadow-xs">Pemicu Laporan AI</legend>
          
          <div className="space-y-4 text-xs font-sans">
            <div>
              <p className="text-[11px] font-mono text-gray-400 mb-1.5">Pilih Fokus Analisis Korporat</p>
              <div className="space-y-2">
                
                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-gray-100 hover:bg-slate-50 cursor-pointer transition-all">
                  <input 
                    type="radio" 
                    name="reportType" 
                    value="general"
                    checked={reportType === 'general'}
                    onChange={() => setReportType('general')}
                    className="text-amber-600 focus:ring-amber-500 w-4 h-4" 
                  />
                  <div>
                    <h5 className="font-semibold text-slate-800">Ringkasan Integrasi Umum</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">Analisis performa silang gabungan dana kas & barang gudang.</p>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-gray-100 hover:bg-slate-50 cursor-pointer transition-all">
                  <input 
                    type="radio" 
                    name="reportType" 
                    value="finance"
                    checked={reportType === 'finance'}
                    onChange={() => setReportType('finance')}
                    className="text-amber-600 focus:ring-amber-500 w-4 h-4" 
                  />
                  <div>
                    <h5 className="font-semibold text-slate-800"><TrendingUp className="w-3 h-3 text-emerald-600 inline mr-1" /> Audit Aliran Kas Saja</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">Fokus mendalam analisis margin, laba, efisiensi modal keluar masuk.</p>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-gray-100 hover:bg-slate-50 cursor-pointer transition-all">
                  <input 
                    type="radio" 
                    name="reportType" 
                    value="stock"
                    checked={reportType === 'stock'}
                    onChange={() => setReportType('stock')}
                    className="text-amber-600 focus:ring-amber-500 w-4 h-4" 
                  />
                  <div>
                    <h5 className="font-semibold text-slate-800"><Layers className="w-3 h-3 text-blue-600 inline mr-1" /> Audit & Logistik Gudang</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">Fokus sediaan produk jadi, ketersediaan bahan baku, reorder point.</p>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-gray-100 hover:bg-slate-50 cursor-pointer transition-all">
                  <input 
                    type="radio" 
                    name="reportType" 
                    value="discrepancy"
                    checked={reportType === 'discrepancy'}
                    onChange={() => setReportType('discrepancy')}
                    className="text-amber-600 focus:ring-amber-500 w-4 h-4" 
                  />
                  <div>
                    <h5 className="font-semibold text-slate-800"><AlertOctagon className="w-3 h-3 text-rose-600 inline mr-1" /> Audit Silang & Selisih</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">Mengidentifikasi anomali logistik, kebocoran stockis vs kuitansi kas.</p>
                  </div>
                </label>

              </div>
            </div>

            {/* Warning about model or API keys */}
            <div className="bg-slate-50 text-[10px] text-slate-500 p-2.5 rounded-lg leading-relaxed flex items-start space-x-1.5 border border-slate-100 font-sans">
              <Cpu className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>
                Laporan ini dirancang langsung secara hibrid oleh kecerdasan buatan <strong>Gemini 3.5 Flash</strong> dengan menyerap total nilai keuangan dan logs fisik terupdate.
              </span>
            </div>

            <button 
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className={`w-full py-2.5 rounded-lg font-sans text-xs font-bold text-slate-900 border border-slate-700 hover:bg-slate-950 hover:text-white transition-all shadow-xs flex items-center justify-center space-x-2 ${
                isGenerating ? 'bg-slate-100 text-slate-400 border-gray-200 cursor-not-allowed' : 'bg-white'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-500" />
                  <span>Merumuskan Analisis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Rancang Laporan Otomatis</span>
                </>
              )}
            </button>
          </div>
        </fieldset>

        {/* Database Catalog of past reports */}
        <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs" id="reports-catalog">
          <h4 className="font-sans font-medium text-slate-800 text-xs mb-3 flex items-center">
            <Clock className="w-4 h-4 text-slate-400 mr-2" /> Arsip Laporan Korporat ({reports.length})
          </h4>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1" id="catalog-scroll">
            {reports.map((r, idx) => {
              const active = r.id === selectedReportId;
              const formattedDate = new Date(r.dateCreated).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReportId(r.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-sans transition-all flex items-start space-x-2.5 ${
                    active 
                      ? 'bg-amber-500/10 border-amber-300 text-slate-800' 
                      : 'bg-slate-50/50 border-gray-100 text-slate-600 hover:border-gray-200'
                  }`}
                >
                  <FileText className={`w-4 h-4 flex-shrink-0 mt-0.5 ${active ? 'text-amber-600' : 'text-slate-400'}`} />
                  <div className="overflow-hidden flex-1">
                    <h5 className="font-bold truncate leading-tight">{r.title}</h5>
                    <p className="text-[10px] text-gray-400 font-mono mt-1 flex items-center justify-between">
                      <span className="flex items-center"><Calendar className="w-3 h-3 mr-0.5" /> {formattedDate}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Document Viewer */}
      <div className="lg:col-span-8 flex flex-col h-[600px] bg-white rounded-3xl border border-gray-150 shadow-xs overflow-hidden" id="reports-right-column">
        
        {isGenerating ? (
          /* High fidelity animated loading interface */
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 animate-pulse-slow" id="report-loading-screen">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <Sparkles className="w-6 h-6 text-amber-500 absolute top-5 left-5 animate-bounce-slow" />
            </div>
            <h4 className="font-sans font-extrabold text-[#111] tracking-tight text-lg">Menyusun Laporan Bisnis Kalimaya Alunna</h4>
            <p className="text-xs text-gray-500 font-mono mt-2 h-8 max-w-sm">
              {loadingMessages[loadingStep]}
            </p>
            <div className="w-48 bg-gray-200 h-1.5 rounded-full overflow-hidden mt-4">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
              />
            </div>
          </div>
        ) : activeReport ? (
          /* Clean, beautiful document paper space */
          <div className="flex-1 flex flex-col overflow-hidden" id="report-active-space">
            
            {/* Top Toolbar */}
            <div className="bg-slate-50 p-4 px-6 border-b border-gray-100 flex items-center justify-between" id="report-viewer-toolbar">
              <div className="flex items-center space-x-2">
                <span className="p-1 px-2.5 bg-slate-900 text-white font-mono text-[9px] uppercase rounded-full shadow-xs">
                  {activeReport.type} AI Report
                </span>
                <span className="text-gray-300 font-mono">|</span>
                <span className="text-[10px] font-mono text-gray-500">
                  ID: {activeReport.id}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  type="button"
                  onClick={() => window.print()} 
                  className="bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 font-sans text-xs px-3 py-1.5 rounded-lg transition-all flex items-center"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Cetak / PDF
                </button>
              </div>
            </div>

            {/* Paper body */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-4" id="report-paper-scroller">
              <div className="text-center border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {activeReport.title}
                </h2>
                <p className="text-[10px] font-mono text-gray-400 mt-2 uppercase tracking-widest">
                  PT. KALIMAYA ALUNNA INDONESIA • TERBIT {new Date(activeReport.dateCreated).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Parsed actual contents */}
              <div className="prose max-w-none text-slate-800" id="report-text-render-canvas">
                {renderMarkdown(activeReport.content)}
              </div>
              
              <div className="pt-12 mt-12 border-t border-gray-100 text-center font-mono text-[9px] text-gray-400 flex flex-col items-center justify-center space-y-1">
                <p>LAPORAN ANALITIS INI DIHASILKAN SECARA DINAMIS OLEH INTEGRATIVE AI REASONING</p>
                <p>© 2026 PT. Kalimaya Alunna Indonesia. All rights reserved.</p>
              </div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-gray-400" id="report-empty-state">
            <FileText className="w-12 h-12 opacity-30 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-700">Draf Laporan Belum Tersedia</h4>
            <p className="text-xs max-w-xs mx-auto mt-1">Silakan klik tombol &quot;Rancang Laporan Otomatis&quot; di sebelah kiri untuk merancang laporan perdana Anda.</p>
          </div>
        )}

      </div>

    </div>
  );
}
