/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { 
  Plus, 
  Minus, 
  Search, 
  Trash2, 
  Package, 
  AlertCircle, 
  Coins, 
  Filter, 
  Layers 
} from 'lucide-react';
import { StockItem } from '../types';

interface StockisGudangProps {
  stocks: StockItem[];
  onAddStock: (item: Omit<StockItem, 'id' | 'updatedAt'>) => Promise<boolean>;
  onUpdateStock: (id: string, updates: Partial<StockItem>) => Promise<boolean>;
  onDeleteStock: (id: string) => Promise<boolean>;
  errorMsg: string;
  successMsg: string;
}

export default function StockisGudang({ 
  stocks, 
  onAddStock, 
  onUpdateStock, 
  onDeleteStock,
  errorMsg,
  successMsg
}: StockisGudangProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // New Stock Form state
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Bahan Baku' | 'Produk Jadi' | 'Kemasan' | 'Lainnya'>('Bahan Baku');
  const [quantity, setQuantity] = useState<number>(0);
  const [minQuantity, setMinQuantity] = useState<number>(10);
  const [unit, setUnit] = useState('pcs');
  const [avgCostPrice, setAvgCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  
  const [isAdding, setIsAdding] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Process item submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!sku.trim() || !name.trim()) {
      setSubmitError('SKU dan nama produk sediaan wajib diisi.');
      return;
    }

    const success = await onAddStock({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      quantity,
      minQuantity,
      unit: unit.trim().toLowerCase() || 'pcs',
      avgCostPrice,
      sellingPrice
    });

    if (success) {
      // Clear form on success
      setSku('');
      setName('');
      setCategory('Bahan Baku');
      setQuantity(0);
      setMinQuantity(10);
      setUnit('pcs');
      setAvgCostPrice(0);
      setSellingPrice(0);
      setIsAdding(false);
    }
  };

  // Quick incremental updates for inventory auditing
  const adjustQuantity = (item: StockItem, diff: number) => {
    const newQty = Math.max(0, item.quantity + diff);
    onUpdateStock(item.id, { quantity: newQty });
  };

  // Helper currency formatter
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filter stocks list
  const filteredStocks = stocks.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="stock-manager-container">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-150 shadow-xs" id="stock-controls">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input 
            type="text" 
            placeholder="Cari SKU atau Nama Sediaan..." 
            className="w-full text-xs font-sans pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3" id="stock-filter-buttons">
          <span className="text-gray-400 text-xs hidden sm:inline"><Filter className="w-3.5 h-3.5 inline mr-1" /> Klasifikasi:</span>
          <select 
            className="text-xs bg-slate-50 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">Semua Kategori</option>
            <option value="Bahan Baku">Bahan Baku</option>
            <option value="Produk Jadi">Produk Jadi</option>
            <option value="Kemasan">Kemasan</option>
            <option value="Lainnya">Lainnya</option>
          </select>

          <button 
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="bg-slate-900 text-white font-sans text-xs font-medium px-4 p-2 rounded-lg hover:bg-slate-800 transition-all flex items-center shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Registrasi SKU Baru
          </button>
        </div>
      </div>

      {/* Slide-out or Expandable New Stock Form Panel */}
      {isAdding && (
        <fieldset className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in" id="add-stock-panel">
          <legend className="bg-slate-900 text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">Form Registrasi Sediaan</legend>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* SKU Code */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Kode SKU sediaan (Unik)</label>
                <input 
                  type="text" 
                  placeholder="Contoh: SKU-KO-001" 
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>

              {/* Item Name */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Nama Sediaan Komoditas</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Kalimaya Black Opal Rough Banten" 
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Kategori Tipe</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="Bahan Baku">Bahan Baku</option>
                  <option value="Produk Jadi">Produk Jadi</option>
                  <option value="Kemasan">Kemasan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              
              {/* Initial Qty */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Kuantitas Stok Awal</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                />
              </div>

              {/* Low stock limit */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Batas Minimum Safe-Stock</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(Math.max(1, Number(e.target.value)))}
                />
              </div>

              {/* Unit of measure */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Satuan Dasar</label>
                <input 
                  type="text" 
                  placeholder="Contoh: gram, pcs, box" 
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                />
              </div>

              {/* Average Cost price */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Hrg Pokok Beli per Unit (Rp)</label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="Rp"
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  value={avgCostPrice}
                  onChange={(e) => setAvgCostPrice(Math.max(0, Number(e.target.value)))}
                />
              </div>

              {/* Optional Retail price */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Estimasi Hrg Jual per Unit (Rp)</label>
                <input 
                  type="number" 
                  min="0"
                  placeholder="Rp"
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Math.max(0, Number(e.target.value)))}
                />
              </div>

            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="bg-gray-100 hover:bg-gray-200 text-slate-800 font-sans font-medium px-4 py-2 rounded-lg transition-all"
              >
                Batalkan
              </button>
              <button 
                type="submit" 
                className="bg-slate-900 border border-slate-700 text-amber-500 font-sans font-bold px-5 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-xs"
              >
                Simpan Ke Gudang
              </button>
            </div>

          </form>
        </fieldset>
      )}

      {/* Main Table Panel */}
      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs" id="stock-table-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500">
            <thead className="bg-slate-50 border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Info SKU</th>
                <th className="py-3 px-4">Nama Sediaan</th>
                <th className="py-3 px-4">Klasifikasi</th>
                <th className="py-3 px-4 text-center">Status Sisa</th>
                <th className="py-3 px-4 text-right">Biaya Pokok (Rp)</th>
                <th className="py-3 px-4 text-right">Potensi Jual (Rp)</th>
                <th className="py-3 px-4 text-center">Koreksi Stok</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-xs">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-sans">
                    <Package className="w-8 h-8 opacity-30 mx-auto mb-2 text-slate-600" />
                    Belum ada sediaan gudang yang terdaftar atau cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((item) => {
                  const isLow = item.quantity <= item.minQuantity;
                  const totalCostVal = item.quantity * item.avgCostPrice;
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {item.sku}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-sans text-slate-700 font-semibold">
                        <div>{item.name}</div>
                        <div className="text-[9px] text-gray-400 font-mono mt-0.5">Asset Val: {formatIDR(totalCostVal)}</div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 font-sans">
                        <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded font-medium ${
                          item.category === 'Bahan Baku' 
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : item.category === 'Produk Jadi'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : item.category === 'Kemasan'
                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                            : 'bg-gray-50 text-gray-600 border border-gray-100'
                        }`}>
                          <Layers className="w-2.5 h-2.5 mr-1" />
                          {item.category}
                        </span>
                      </td>

                      {/* Qty & Safe State */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className={`text-sm font-extrabold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                            {item.quantity} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                          </span>
                          {isLow && (
                            <span className="inline-flex items-center text-[9px] text-rose-500 bg-rose-50 px-1 py-0.5 rounded font-mono font-medium mt-1">
                              <AlertCircle className="w-2.5 h-2.5 mr-0.5 flex-shrink-0" /> Stok Minim (&lt;={item.minQuantity})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-600">
                        {formatIDR(item.avgCostPrice)}
                      </td>

                      {/* Retail Price */}
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-800 font-semibold">
                        {item.sellingPrice > 0 ? formatIDR(item.sellingPrice) : <span className="text-gray-300">-</span>}
                      </td>

                      {/* Quick Adjust */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex rounded-lg border border-gray-200 bg-slate-50 p-0.5 overflow-hidden shadow-xs">
                          <button 
                            type="button"
                            onClick={() => adjustQuantity(item, -1)}
                            className="p-1 hover:bg-white hover:text-rose-600 rounded transition-colors"
                            title="Kurangi 1 unit"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-[11px] font-mono font-bold flex items-center justify-center p-0.5 text-slate-700">
                            {item.quantity}
                          </span>
                          <button 
                            type="button"
                            onClick={() => adjustQuantity(item, 1)}
                            className="p-1 hover:bg-white hover:text-green-600 rounded transition-colors"
                            title="Tambah 1 unit"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus sediaan ${item.name} (${item.sku}) dari sistem gudang?`)) {
                              onDeleteStock(item.id);
                            }
                          }}
                          className="hover:text-rose-600 text-slate-300 p-1.5 rounded hover:bg-rose-50 transition-all inline-block"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table summary bar */}
        <div className="bg-slate-50 p-3 px-4 border-t border-gray-100 flex items-center justify-between font-mono text-[10px] text-gray-400">
          <span>MENAMPILKAN {filteredStocks.length} DARI {stocks.length} MATERI SEDIAAN BERKAS</span>
          <span>ESTIMASI TOTAL VALUASI: {formatIDR(filteredStocks.reduce((sum, s) => sum + (s.quantity * s.avgCostPrice), 0))}</span>
        </div>

      </div>

    </div>
  );
}
