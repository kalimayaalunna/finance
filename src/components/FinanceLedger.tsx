/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Tag, 
  DollarSign, 
  Trash2, 
  Link, 
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';
import { FinanceTransaction, StockItem } from '../types';

interface FinanceLedgerProps {
  transactions: FinanceTransaction[];
  stocks: StockItem[];
  onAddTransaction: (tx: Omit<FinanceTransaction, 'id' | 'updatedAt'>) => Promise<boolean>;
  onDeleteTransaction: (id: string) => Promise<boolean>;
  errorMsg: string;
  successMsg: string;
}

export default function FinanceLedger({
  transactions,
  stocks,
  onAddTransaction,
  onDeleteTransaction,
  errorMsg,
  successMsg
}: FinanceLedgerProps) {
  // Form State
  const [type, setType] = useState<'masuk' | 'keluar'>('masuk');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Penjualan Produk Jadi');
  const [description, setDescription] = useState('');
  
  // Connected Stock checklist state
  const [linkToStock, setLinkToStock] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState('');
  const [stockQty, setStockQty] = useState<number>(1);
  
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState('');

  // Categories helper list triggered by transaction type
  const incomeCategories = ['Penjualan Produk Jadi', 'Pendapatan Jasa Poles', 'Modal Owner', 'Pendapatan Lainnya'];
  const expenseCategories = ['Pembelian Bahan Baku', 'Pembelian Kemasan', 'Operasional Gudang/Workshop', 'Gaji Pengrajin & Karyawan', 'Logistik & Ongkir', 'Biaya Lainnya'];

  const handleTypeChange = (newType: 'masuk' | 'keluar') => {
    setType(newType);
    setCategory(newType === 'masuk' ? incomeCategories[0] : expenseCategories[0]);
  };

  // Submit Handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (amount <= 0) {
      setFormError('Jumlah pengeluaran atau pemasukan uang harus bernilai positif.');
      return;
    }
    if (!description.trim()) {
      setFormError('Deskripsi transaksi wajib diisi untuk catatan audit.');
      return;
    }
    if (linkToStock && !selectedStockId) {
      setFormError('Silakan pilih item sediaan gudang yang ingin dihubungkan.');
      return;
    }

    const payload: Omit<FinanceTransaction, 'id' | 'updatedAt'> = {
      type,
      amount,
      date,
      category,
      description: description.trim(),
      linkedStockItemId: linkToStock ? selectedStockId : undefined,
      linkedStockQty: linkToStock ? stockQty : undefined
    };

    const success = await onAddTransaction(payload);
    if (success) {
      // Clear state
      setAmount(0);
      setDescription('');
      setLinkToStock(false);
      setSelectedStockId('');
      setStockQty(1);
      setIsAdding(false);
    }
  };

  // Helper currency formatter
  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6" id="finance-ledger-container">
      
      {/* Upper Control Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-150 shadow-xs" id="ledger-header-panel">
        <div id="finance-titles">
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Sistem Pembukuan Kas</p>
          <h4 className="font-sans font-medium text-slate-800 text-sm mt-0.5">Catatan Keluar-Masuk & Hubungan Inventori</h4>
        </div>

        <button 
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="bg-slate-900 text-white font-sans text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-800 transition-all flex items-center shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Catat Transaksi Baru
        </button>
      </div>

      {/* Expanded Log Transaction Form */}
      {isAdding && (
        <fieldset className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in" id="add-ledger-panel">
          <legend className="bg-slate-900 text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full shadow-xs">Pencatatan Buku Kas Kalimaya Alunna</legend>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              
              {/* Type Switch */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1.5Packed">Arah Kas Keuangan</label>
                <div className="grid grid-cols-2 p-1 rounded-lg bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('masuk')}
                    className={`py-1.5 text-center text-xs font-semibold rounded-md transition-all ${type === 'masuk' ? 'bg-white text-emerald-600 shadow-xs' : 'text-gray-400'}`}
                  >
                    Uang Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('keluar')}
                    className={`py-1.5 text-center text-xs font-semibold rounded-md transition-all ${type === 'keluar' ? 'bg-white text-rose-600 shadow-xs' : 'text-gray-400'}`}
                  >
                    Uang Keluar
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Nominal Transaksi (Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-mono text-xs">Rp</span>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="Contoh: 150000"
                    className="w-full pl-8 pr-3 p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs"
                    value={amount || ''}
                    onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Tanggal Transaksi</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="date" 
                    className="w-full pl-9 pr-3 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs bg-slate-50"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-[11px] font-mono text-gray-400 mb-1">Kategori Transaksi</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <select 
                    className="w-full pl-9 pr-3 p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans text-xs"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {type === 'masuk' 
                      ? incomeCategories.map(c => <option key={c} value={c}>{c}</option>)
                      : expenseCategories.map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                </div>
              </div>

            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">Keterangan / Deskripsi Rinci Kas</label>
              <textarea 
                rows={2}
                placeholder="Deskripsikan tujuan transaksi, nama pembeli atau vendor suplai..." 
                className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans text-xs"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Direct Connect to Stockist gudang */}
            <div className="border border-amber-100 bg-amber-50/40 rounded-xl p-4 space-y-3" id="stockist-link-container">
              <div className="flex items-center justify-between" id="stockist-checkbox-wrapper">
                <label className="inline-flex items-center space-x-2 text-slate-700 font-semibold cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    checked={linkToStock}
                    onChange={(e) => setLinkToStock(e.target.checked)}
                  />
                  <span className="flex items-center">
                    <Link className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Hubungkan langsung ke perhitungan Stockis Gudang
                  </span>
                </label>
                <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded flex items-center">
                  <Info className="w-3 h-3 mr-1" /> Multi-Sistem Terintegrasi
                </span>
              </div>

              {linkToStock && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-amber-100/60 animate-fade-in" id="link-fields">
                  
                  {/* Select stock SKU */}
                  <div>
                    <label className="block text-[10px] font-mono text-amber-800 mb-1">Komoditas Gudang yang Terpengaruh</label>
                    <select 
                      className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                      value={selectedStockId}
                      onChange={(e) => setSelectedStockId(e.target.value)}
                      required
                    >
                      <option value="">-- Pilih SKU komoditas yang disinkronkan --</option>
                      {stocks.map(s => (
                        <option key={s.id} value={s.id}>
                          [{s.sku}] {s.name} (Tersedia: {s.quantity} {s.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity adjustment amount */}
                  <div>
                    <label className="block text-[10px] font-mono text-amber-800 mb-1">Jumlah Unit yang Keluar/Masuk (Kuantitas)</label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="number" 
                        min="1"
                        className="w-24 p-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs"
                        value={stockQty}
                        onChange={(e) => setStockQty(Math.max(1, Number(e.target.value)))}
                        required
                      />
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {type === 'masuk' 
                          ? '💵 Masuk: Mengasumsikan penjualan. Unit produk di gudang berkurang otomatis (-).'
                          : '🛒 Keluar: Mengasumsikan pengadaan. Unit bahan baku/pembelian di gudang bertambah otomatis (+).'
                        }
                      </p>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Form actions */}
            <div className="flex justify-end space-x-3 pt-1">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="bg-gray-100 hover:bg-gray-200 text-slate-800 font-sans font-medium px-4 py-2 rounded-lg"
              >
                Batalkan
              </button>
              <button 
                type="submit" 
                className="bg-slate-900 border border-slate-700 text-amber-500 font-sans font-extrabold px-5 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-xs"
              >
                Catat Transaksi Ke Kas
              </button>
            </div>

          </form>
        </fieldset>
      )}

      {/* Financial ledger main Table list */}
      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs" id="ledger-table-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500">
            <thead className="bg-slate-50 border-b border-gray-100 text-[10px] text-gray-400 uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Tanggal Kerja</th>
                <th className="py-3 px-4">Arah Kas</th>
                <th className="py-3 px-4">Klasifikasi Kategori</th>
                <th className="py-3 px-4">Deskripsi / Keterangan</th>
                <th className="py-3 px-4 text-center">Status Gudang</th>
                <th className="py-3 px-4 text-right">Nominal Arus (Rp)</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans text-xs">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-sans">
                    <DollarSign className="w-8 h-8 opacity-30 mx-auto mb-2 text-slate-600" />
                    Belum ada riwayat transaksi dicatat pada sistem kas keluar-masuk Kalimaya Alunna.
                  </td>
                </tr>
              ) : (
                transactions.slice().reverse().map((t) => {
                  const linkedStock = t.linkedStockItemId ? stocks.find(s => s.id === t.linkedStockItemId) : null;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {t.date}
                      </td>

                      {/* Direction Icon Tag */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          t.type === 'masuk' 
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {t.type === 'masuk' ? (
                            <>
                              <ArrowUpRight className="w-3 h-3 mr-0.5 text-green-600" /> Uang Masuk
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3 h-3 mr-0.5 text-rose-600" /> Uang Keluar
                            </>
                          )}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {t.category}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 font-sans text-slate-600 max-w-sm">
                        {t.description}
                      </td>

                      {/* Synchronized Stock marker */}
                      <td className="py-3.5 px-4 text-center">
                        {linkedStock ? (
                          <span className="inline-flex items-center text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100" title={`Stok yang dikoreksi: ${t.linkedStockQty} ${linkedStock.unit}`}>
                            <Link className="w-2.5 h-2.5 mr-1 text-emerald-600" />
                            SKU-LINK ({t.linkedStockQty})
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>

                      {/* Nominal Amount */}
                      <td className={`py-3.5 px-4 text-right font-mono text-xs font-bold ${t.type === 'masuk' ? 'text-green-600' : 'text-rose-600'}`}>
                        {t.type === 'masuk' ? '+' : '-'} {formatIDR(t.amount)}
                      </td>

                      {/* Delete actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          type="button"
                          onClick={() => {
                            if (confirm(`Hapus catatan transaksi "${t.description}" dari pembukuan? (Catatan: Penghapusan ledger tidak akan merefer stok otomatis kembali demi integritas gudang).`)) {
                              onDeleteTransaction(t.id);
                            }
                          }}
                          className="hover:text-rose-600 text-slate-300 p-1.5 rounded hover:bg-rose-50 transition-all inline-block"
                          title="Hapus Transaksi"
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

        {/* Ledger statistics footer */}
        <div className="bg-slate-50 p-3 px-4 border-t border-gray-100 flex items-center justify-between font-mono text-[10px] text-gray-400">
          <span>TERDAPAT {transactions.length} REKAMAN TRANSAKSI DALAM SISTEM LEDGER</span>
          <div className="space-x-4">
            <span className="text-green-600 font-bold">TOTAL MASUK: +{formatIDR(transactions.filter(t => t.type === 'masuk').reduce((sum, t) => sum + t.amount, 0))}</span>
            <span className="text-rose-600 font-bold">TOTAL KELUAR: -{formatIDR(transactions.filter(t => t.type === 'keluar').reduce((sum, t) => sum + t.amount, 0))}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
