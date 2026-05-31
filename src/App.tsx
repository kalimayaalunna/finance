/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Package, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Menu,
  X,
  RefreshCw,
  Coins
} from 'lucide-react';
import { StockItem, FinanceTransaction, AutomatedReport } from './types';
import DashboardAnalytics from './components/DashboardAnalytics';
import StockisGudang from './components/StockisGudang';
import FinanceLedger from './components/FinanceLedger';
import AiReports from './components/AiReports';

type ActiveTab = 'dashboard' | 'finance' | 'stock' | 'ai-reports';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Data State
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [reports, setReports] = useState<AutomatedReport[]>([]);
  
  // Loading & Interactivity states
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Real-time Clock clock state
  const [currentTime, setCurrentTime] = useState<string>('');

  // Fetch initial combined data
  const fetchAllData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`Koneksi server terputus: status ${response.status}. Pastikan server backend Anda berjalan.`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Sistem sedang sinkronisasi. Harap tunggu beberapa saat.');
      }
      
      const data = await response.json();
      setStocks(data.stocks || []);
      setTransactions(data.transactions || []);
      setReports(data.reports || []);
      setGlobalError('');
    } catch (e: any) {
      console.error('Error fetching dashboard state:', e);
      setGlobalError(e.message || 'Gagal memuat database dari server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // Setup interval to fetch data quietly in background (simulating real-time updates)
    const dataInterval = setInterval(() => {
      fetchAllData(true);
    }, 15000);

    // Setup real-time Clock in ID-Jakarta format
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }) + ' WIB');
    }, 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, []);

  // Helper to show temporary toast messages
  const triggerToast = (msgString: string, isError = false) => {
    if (isError) {
      setErrorMsg(msgString);
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setSuccessMsg(msgString);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  // 1. ADD NEW STOCK
  const handleAddStock = async (newStockItem: Omit<StockItem, 'id' | 'updatedAt'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStockItem)
      });
      
      let resData: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        resData = await res.json();
      }
      
      if (!res.ok) {
        triggerToast(resData?.error || `Gagal mendaftarkan sediaan baru (Gagal menghubungkan ke server, Status ${res.status})`, true);
        return false;
      }
      
      // Update state
      setStocks(resData.data?.stocks || []);
      triggerToast('Sediaan komoditas baru disimpan dengan aman ke gudang.');
      return true;
    } catch (e: any) {
      triggerToast(`Gagal mendaftarkan sediaan: ${e.message || 'Masalah jaringan ke server'}`, true);
      return false;
    }
  };

  // 2. UPDATE EXISTING STOCK (including quick Qty increments/decrements)
  const handleUpdateStock = async (id: string, updates: Partial<StockItem>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/stock/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      let resData: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        resData = await res.json();
      }
      
      if (!res.ok) {
        triggerToast(resData?.error || `Gagal mengedit stok (Gagal menghubungkan ke server, Status ${res.status})`, true);
        return false;
      }
      
      // Update state
      setStocks(resData.data?.stocks || []);
      return true;
    } catch (e: any) {
      triggerToast(`Gagal mengedit stok: ${e.message || 'Masalah jaringan ke server'}`, true);
      return false;
    }
  };

  // 3. DELETE STOCK ITEM
  const handleDeleteStock = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/stock/${id}`, {
        method: 'DELETE'
      });
      
      let resData: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        resData = await res.json();
      }
      
      if (!res.ok) {
        triggerToast(resData?.error || `Gagal menghapus sediaan (Gagal menghubungkan ke server, Status ${res.status})`, true);
        return false;
      }
      
      // Update state
      setStocks(resData.data?.stocks || []);
      triggerToast('Unit komoditas berhasil dihapus dari daftar pergudangan.');
      return true;
    } catch (e: any) {
      triggerToast(`Gagal menghapus sediaan: ${e.message || 'Masalah jaringan ke server'}`, true);
      return false;
    }
  };

  // 4. RECORD NEW FINANCIAL TRANSACTION (with optional Stockist Linking)
  const handleAddTransaction = async (newTx: Omit<FinanceTransaction, 'id' | 'updatedAt'>): Promise<boolean> => {
    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx)
      });
      
      let resData: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        resData = await res.json();
      }
      
      if (!res.ok) {
        triggerToast(resData?.error || `Gagal mencatat transaksi kas (Gagal menghubungkan ke server, Status ${res.status})`, true);
        return false;
      }
      
      // Dynamic response contains sync-updated stocks & transactions
      setTransactions(resData.data?.transactions || []);
      setStocks(resData.data?.stocks || []);
      triggerToast(resData.message || 'Transaksi dicatat dan persediaan otomatis disesuaikan.');
      return true;
    } catch (e: any) {
      triggerToast(`Gagal mencatat transaksi: ${e.message || 'Masalah jaringan ke server'}`, true);
      return false;
    }
  };

  // 5. ERASE TRADING ENTRY
  const handleDeleteTransaction = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/finance/${id}`, {
        method: 'DELETE'
      });
      
      let resData: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        resData = await res.json();
      }
      
      if (!res.ok) {
        triggerToast(resData?.error || `Gagal menghapus entri keuangan (Gagal menghubungkan ke server, Status ${res.status})`, true);
        return false;
      }
      
      setTransactions(resData.data?.transactions || []);
      triggerToast('Catatan pembukuan kas dibatalkan atau dihapus.');
      return true;
    } catch (e: any) {
      triggerToast(`Gagal menghapus entri: ${e.message || 'Masalah jaringan ke server'}`, true);
      return false;
    }
  };

  // 6. GENERATE AUTO EXECUTIVE BUSINESS REPORT WITH AI
  const handleGenerateReport = async (reportStyle: 'finance' | 'stock' | 'discrepancy' | 'general'): Promise<boolean> => {
    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reportStyle })
      });
      
      let resData: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        resData = await res.json();
      }
      
      if (!res.ok) {
        triggerToast(resData?.error || `Gagal menyusun laporan AI (Gagal menghubungkan ke server, Status ${res.status})`, true);
        return false;
      }
      
      // Put updated data state
      setReports(resData.data?.reports || []);
      triggerToast('Kecerdasan Buatan Gemini berhasil merumuskan analisis baru!');
      return true;
    } catch (e: any) {
      triggerToast(`Gagal merumuskan laporan AI: ${e.message || 'Masalah jaringan ke server'}`, true);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans" id="app-canvas-root">
      
      {/* 1. TOP PREMIUM HEADER BAR */}
      <header className="bg-slate-900 text-white border-b border-amber-500/30 sticky top-0 z-50 shadow-md px-4 py-3.5" id="app-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Company Brand Logo & Titles */}
          <div className="flex items-center space-x-3" id="brand-emblem-wrap">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-extrabold text-base shadow-inner select-none animate-pulse-slow">
              KA
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-widest">Enterprise Edition</span>
              </div>
              <h1 className="text-sm font-sans font-black tracking-tight mt-0.5">PT. KALIMAYA ALUNNA INDONESIA</h1>
            </div>
          </div>

          {/* Quick Informational Actions and Time widgets */}
          <div className="flex items-center space-x-4 text-xs font-mono" id="header-widgets">
            {/* Real-time sync indicator */}
            <button 
              type="button"
              onClick={() => fetchAllData(true)} 
              disabled={isRefreshing}
              className="bg-slate-800 hover:bg-slate-700 hover:text-amber-400 border border-slate-700 p-2 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer max-lg:hidden"
              title="Perbarui database secara manual"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : 'text-gray-400'}`} />
              <span>{isRefreshing ? 'Melakukan Sinkron...' : 'Sinkronisasi'}</span>
            </button>

            {/* Live Clock / Location Widget */}
            <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-gray-300 flex items-center space-x-2" id="header-clock">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold">{currentTime || "Loading..."}</span>
            </div>
          </div>

        </div>
      </header>

      {/* 2. TAB SELECTION NAVIGATION MODULE */}
      <nav className="bg-white border-b border-gray-150 py-3 px-4 shadow-xs relative z-40" id="main-navigation">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center space-x-2.5 overflow-x-auto scrollbar-hide py-1" id="nav-tabs-group">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-4 py-2 font-semibold text-xs rounded-xl font-sans transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dasbor Analitik</span>
            </button>

            <button
              onClick={() => setActiveTab('finance')}
              className={`flex items-center space-x-1.5 px-4 py-2 font-semibold text-xs rounded-xl font-sans transition-all cursor-pointer ${
                activeTab === 'finance' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>Buku Kas (Finance)</span>
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`flex items-center space-x-1.5 px-4 py-2 font-semibold text-xs rounded-xl font-sans transition-all cursor-pointer ${
                activeTab === 'stock' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Stockis Gudang</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-reports')}
              className={`flex items-center space-x-1.5 px-4 py-2 font-semibold text-xs rounded-xl font-sans transition-all cursor-pointer ${
                activeTab === 'ai-reports' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Automasi AI Laporan</span>
            </button>
          </div>

          <p className="text-[10px] font-mono text-gray-400 max-sm:hidden">
            Email: kalimayaalunnaindonesia@gmail.com
          </p>

        </div>
      </nav>

      {/* 3. FLUID CONTENT GRID */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8" id="main-content-area">
        
        {/* Toast Notification Popups */}
        <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none" id="toasts-anchor">
          {successMsg && (
            <div className="p-4 bg-slate-950 border-l-4 border-emerald-500 text-white shadow-stone-900 shadow-lg rounded-xl flex items-center space-x-3 pointer-events-auto animate-bounce-slow" id="toast-success">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-xs font-sans font-medium">{successMsg}</p>
            </div>
          )}
          
          {errorMsg && (
            <div className="p-4 bg-slate-950 border-l-4 border-rose-500 text-white shadow-stone-900 shadow-lg rounded-xl flex items-center space-x-3 pointer-events-auto animate-bounce-slow animate-pulse-slow" id="toast-danger">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <p className="text-xs font-sans font-medium">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-5 mb-6 flex items-start space-x-3 shadow-xs" id="critical-global-error-banner">
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Terjadi Kesalahan Sinkronisasi Server</h3>
              <p className="text-xs text-rose-800 mt-1">{globalError}</p>
              <button 
                type="button" 
                onClick={() => fetchAllData()} 
                className="mt-3 bg-rose-600 font-semibold text-white text-[11px] px-3.5 py-1.5 rounded-lg hover:bg-rose-700 transition-all font-mono uppercase"
              >
                Coba Memuat Ulang Database
              </button>
            </div>
          </div>
        )}

        {/* MAIN VIEWS IN TAB FORM */}
        {isLoading ? (
          /* High fidelity skeletal/loading element */
          <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400 p-12" id="global-scaffold-loading">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-mono">Menyelaraskan Sistem Integrasi Kalimaya Alunna...</p>
          </div>
        ) : (
          <div className="animate-fade-in" id="active-tab-host">
            
            {activeTab === 'dashboard' && (
              <DashboardAnalytics 
                stocks={stocks} 
                transactions={transactions} 
              />
            )}

            {activeTab === 'finance' && (
              <FinanceLedger 
                transactions={transactions} 
                stocks={stocks}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                errorMsg={errorMsg}
                successMsg={successMsg}
              />
            )}

            {activeTab === 'stock' && (
              <StockisGudang 
                stocks={stocks}
                onAddStock={handleAddStock}
                onUpdateStock={handleUpdateStock}
                onDeleteStock={handleDeleteStock}
                errorMsg={errorMsg}
                successMsg={successMsg}
              />
            )}

            {activeTab === 'ai-reports' && (
              <AiReports 
                reports={reports}
                onGenerateReport={handleGenerateReport}
                errorMsg={errorMsg}
                successMsg={successMsg}
              />
            )}

          </div>
        )}

      </main>

      {/* 4. FOOTER CREDITS INFO BAR */}
      <footer className="bg-slate-900 text-gray-500 border-t border-slate-800 px-4 py-6 text-center font-mono text-[10px]" id="app-footer-credit">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 PT. KALIMAYA ALUNNA INDONESIA. INTEGRATED SYSTEMS VERSION 4.1-STABLE.</p>
          <div className="flex items-center space-x-3 text-[9px] text-gray-400">
            <span>DATABASE: PERSISTENT JSON</span>
            <span>•</span>
            <span>AI: GEMINI 3.5 FLASH</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
