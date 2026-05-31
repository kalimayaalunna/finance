/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  AlertTriangle, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { StockItem, FinanceTransaction } from '../types';

interface DashboardProps {
  stocks: StockItem[];
  transactions: FinanceTransaction[];
}

export default function DashboardAnalytics({ stocks, transactions }: DashboardProps) {
  // 1. Calculate Financial summaries
  const totalIncome = transactions
    .filter(t => t.type === 'masuk')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'keluar')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;

  // 2. Calculate Warehouse Inventory asset value
  const totalInventoryValue = stocks.reduce(
    (sum, item) => sum + (item.quantity * item.avgCostPrice), 
    0
  );

  // 3. Count Low Stock items
  const lowStockItems = stocks.filter(item => item.quantity <= item.minQuantity);

  // 4. Group stock valuation by category for Pie Chart
  const categoriesMap = stocks.reduce((acc, item) => {
    const itemValue = item.quantity * item.avgCostPrice;
    acc[item.category] = (acc[item.category] || 0) + itemValue;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(categoriesMap).map(key => ({
    name: key,
    value: categoriesMap[key]
  }));

  const COLORS = ['#d97706', '#0d9488', '#2563eb', '#6b7280']; // amber, teal, blue, gray

  // 5. Structure transactions data per category for Finance Bar Chart
  const financeCategoryMap = transactions.reduce((acc, t) => {
    const amt = t.amount;
    if (t.type === 'masuk') {
      acc[t.category] = (acc[t.category] || 0) + amt;
    } else {
      acc[t.category] = (acc[t.category] || 0) - amt;
    }
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(financeCategoryMap).map(key => ({
    name: key,
    Net: financeCategoryMap[key],
    Tipe: financeCategoryMap[key] >= 0 ? 'Pemasukan' : 'Pengeluaran'
  }));

  // Format IDR Currency helper
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* 4-Column KPI Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="kpi-grid">
        
        {/* Total Pemasukan Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between" id="kpi-income">
          <div className="space-y-1">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">Total Pemasukan</p>
            <h3 className="text-xl font-bold font-sans text-emerald-600 transition-all">
              {formatIDR(totalIncome)}
            </h3>
            <span className="inline-flex items-center text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> Aliran Masuk
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Pengeluaran Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between" id="kpi-expense">
          <div className="space-y-1">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">Total Pengeluaran</p>
            <h3 className="text-xl font-bold font-sans text-rose-600">
              {formatIDR(totalExpense)}
            </h3>
            <span className="inline-flex items-center text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-mono">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> Aliran Keluar
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Laba Bersih Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between" id="kpi-net">
          <div className="space-y-1">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">Saldo Kas Bersih</p>
            <h3 className={`text-xl font-bold font-sans ${netCashflow >= 0 ? 'text-slate-800' : 'text-rose-700'}`}>
              {formatIDR(netCashflow)}
            </h3>
            <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-mono ${netCashflow >= 0 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'}`}>
              <DollarSign className="w-3 h-3 mr-0.5" /> Neraca Buku
            </span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-700 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Aset Gudang Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between" id="kpi-stock-val">
          <div className="space-y-1">
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">Estimasi Nilai Barang</p>
            <h3 className="text-xl font-bold font-sans text-slate-800">
              {formatIDR(totalInventoryValue)}
            </h3>
            <span className="inline-flex items-center text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">
              <Layers className="w-3 h-3 mr-0.5" /> {stocks.length} Jenis Produk
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg animate-pulse-slow">
            <Layers className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Safety Alert Banner if Low Stock exists */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-start space-x-3 shadow-xs" id="low-stock-alert-banner">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <div>
            <h4 className="font-semibold text-sm">Pemberitahuan Sistem Gudang Terintegrasi</h4>
            <p className="text-xs text-amber-800 mt-1">
              Terdapat <strong>{lowStockItems.length} barang</strong> yang membutuhkan restock secepatnya karena jumlah berada di bawah batas pasokan minimum (safe-stock): 
              {lowStockItems.map(item => ` ${item.name} (${item.quantity} ${item.unit})`).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* Analytics Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="charts-grid">
        
        {/* Left Side: Finance Flow per Category */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-7" id="chart-left">
          <div className="mb-4">
            <h4 className="font-sans font-medium text-slate-800 tracking-tight">Performa Keuangan Per Kategori</h4>
            <p className="text-xs text-gray-400 font-mono mt-0.5">Nilai bersih transaksi kas masuk/keluar terkelompok</p>
          </div>
          <div className="h-72 w-full">
            {barData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Clock className="w-8 h-8 opacity-40 mb-2" />
                <p className="text-xs">Belum ada transaksi terekam untuk dianalisis</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" fontSize={11} stroke="#9ca3af" tickLine={false} />
                  <YAxis fontSize={11} stroke="#9ca3af" tickLine={false} tickFormatter={(v) => `${(v/1000).toLocaleString()}k`} />
                  <Tooltip 
                    formatter={(value: any) => [formatIDR(Number(value)), 'Saldo Bersih']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: '11px' }}
                  />
                  <Bar dataKey="Net" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Net >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Side: Stock Value distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-5" id="chart-right">
          <div className="mb-4">
            <h4 className="font-sans font-medium text-slate-800 tracking-tight">Proporsi Aset Stok Pergudangan</h4>
            <p className="text-xs text-gray-400 font-mono mt-0.5">Persentase total valuasi rupiah barang per tipe kategori</p>
          </div>
          <div className="h-72 flex flex-col md:flex-row items-center justify-between">
            <div className="h-full w-full md:w-3/5">
              {pieData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Clock className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs">Tidak ada stok produk terdaftar</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatIDR(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="flex flex-col space-y-2 w-full md:w-2/5 justify-center md:pl-4 mt-2 md:mt-0" id="pie-legend">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-start space-x-2 text-xs">
                  <span 
                    className="w-3 p-1.5 h-3 rounded-xs inline-block flex-shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="overflow-hidden">
                    <p className="font-medium text-slate-700 truncate">{entry.name}</p>
                    <p className="text-[10px] font-mono text-gray-400">{formatIDR(entry.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Grid of recent ledger and stock summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-tables">
        
        {/* Low Stock Watchlist */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs" id="table-low-stok-summary">
          <h4 className="font-sans font-medium text-slate-800 tracking-tight flex items-center mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
            Watchlist Tingkat Keamanan Pasokan
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500">
              <thead className="bg-slate-50 text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="py-2.5 px-3">Kode SKU</th>
                  <th className="py-2.5 px-3">Nama Sediaan</th>
                  <th className="py-2.5 px-3 text-center">Jumlah Sediaan</th>
                  <th className="py-2.5 px-3 text-center">Minimum Safe</th>
                  <th className="py-2.5 px-3 text-right">Ambang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {stocks.map(s => {
                  const percentSafe = Math.round((s.quantity / s.minQuantity) * 100);
                  const isLow = s.quantity <= s.minQuantity;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono text-slate-800 font-medium">{s.sku}</td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{s.name}</td>
                      <td className="py-2.5 px-3 text-center text-slate-800 font-semibold">{s.quantity} {s.unit}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{s.minQuantity} {s.unit}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-sm font-semibold ${isLow ? 'bg-rose-50 text-rose-700' : 'bg-green-50 text-green-700'}`}>
                          {isLow ? `${percentSafe}% (Tipis)` : `${percentSafe}% (Aman)`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latest Activity Logs */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs" id="table-recent-tx-summary">
          <h4 className="font-sans font-medium text-slate-800 tracking-tight flex items-center mb-3">
            <Clock className="w-4 h-4 text-slate-500 mr-2" />
            Aktivitas Aliran Transaksi Terkini
          </h4>
          <div className="space-y-3">
            {transactions.slice(-4).reverse().map(t => (
              <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-50 hover:border-slate-100 transition-all font-sans">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${t.type === 'masuk' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                    {t.type === 'masuk' ? 'IN' : 'OUT'}
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 truncate">{t.description}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{t.category} • {t.date}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-xs font-mono font-bold ${t.type === 'masuk' ? 'text-green-600' : 'text-rose-600'}`}>
                    {t.type === 'masuk' ? '+' : '-'} {formatIDR(t.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
