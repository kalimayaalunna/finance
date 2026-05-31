/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { StockItem, FinanceTransaction, AutomatedReport } from './src/types';

const PORT = 3000;
const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'db.json');

// Initialize Database defaults if not exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const defaultStocks: StockItem[] = [
  {
    id: 'stock-1',
    sku: 'SKU-KO-001',
    name: 'Kalimaya Black Opal Rough',
    category: 'Bahan Baku',
    quantity: 120,
    minQuantity: 30,
    unit: 'gram',
    avgCostPrice: 85000,
    sellingPrice: 0,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stock-2',
    sku: 'SKU-CO-002',
    name: 'Kalimaya Crystal Oval Bead',
    category: 'Produk Jadi',
    quantity: 45,
    minQuantity: 15,
    unit: 'pcs',
    avgCostPrice: 150000,
    sellingPrice: 450000,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stock-3',
    sku: 'SKU-KK-003',
    name: 'Kotak Kayu Alunna Premium',
    category: 'Kemasan',
    quantity: 80,
    minQuantity: 20,
    unit: 'pcs',
    avgCostPrice: 25000,
    sellingPrice: 75000,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stock-4',
    sku: 'SKU-MO-004',
    name: 'Minyak Pengilap Batu Alunna',
    category: 'Lainnya',
    quantity: 15,
    minQuantity: 10,
    unit: 'botol',
    avgCostPrice: 12000,
    sellingPrice: 35000,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'stock-5',
    sku: 'SKU-CP-005',
    name: 'Cincin Perak Frame Sterling 925',
    category: 'Bahan Baku',
    quantity: 50,
    minQuantity: 12,
    unit: 'pcs',
    avgCostPrice: 70000,
    sellingPrice: 180000,
    updatedAt: new Date().toISOString()
  }
];

const defaultTransactions: FinanceTransaction[] = [
  {
    id: 'tx-1',
    type: 'masuk',
    amount: 9000000,
    date: '2026-05-18',
    category: 'Penjualan Produk Jadi',
    description: 'Penjualan 20 pcs Kalimaya Crystal Oval Bead mewah',
    linkedStockItemId: 'stock-2',
    linkedStockQty: 20,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-2',
    type: 'keluar',
    amount: 5100000,
    date: '2026-05-19',
    category: 'Pembelian Bahan Baku',
    description: 'Pembelian tambahan 60 gram Kalimaya Black Opal Rough',
    linkedStockItemId: 'stock-1',
    linkedStockQty: 60,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-3',
    type: 'keluar',
    amount: 500000,
    date: '2026-05-20',
    category: 'Pembelian Kemasan',
    description: 'Restock kotak kayu Alun-alun premium 20 buah',
    linkedStockItemId: 'stock-3',
    linkedStockQty: 20,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-4',
    type: 'masuk',
    amount: 1350000,
    date: '2026-05-21',
    category: 'Penjualan Produk Jadi',
    description: 'Penjualan 18 pcs Kotak Kayu Alunna Premium (Eceran)',
    linkedStockItemId: 'stock-3',
    linkedStockQty: 18,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tx-5',
    type: 'keluar',
    amount: 1200000,
    date: '2026-05-22',
    category: 'Operasional',
    description: 'Biaya listrik mesin asah & poles workshop Kalimaya Alunna',
    updatedAt: new Date().toISOString()
  }
];

const defaultReports: AutomatedReport[] = [
  {
    id: 'rep-1',
    dateCreated: '2026-05-22T10:00:00Z',
    title: 'Analisis Performa Awal Kalimaya Alunna',
    content: `### Laporan Analisis Kalimaya Alunna (Simulasi)

Selamat datang di Sistem Pelaporan Otomatis Kalimaya Alunna. Ini adalah draf laporan analisis performa logistik dan keuangan awal Anda.

#### 📈 Rangkuman Keuangan
*   **Total Pemasukan:** Rp 10.350.000
*   **Total Pengeluaran:** Rp 6.800.000
*   **Laba Bersih:** Rp 3.550.000
*   **Rasio Laba-Aktivitas:** Sehat (~34.3% margin)

#### 📦 Status Stockis & Gudang
*   Bahan mentah **Black Opal Rough** terpenuhi dengan kapasitas tinggi (120 gram), mendukung kestabilan asah hingga beberapa bulan ke depan.
*   Item **Minyak Pengilap Batu Alunna** mendekati batas stok minimum (tersisa 15 botol dari batas aman 10 botol). Perlu dipantau untuk pengadaan berikutnya demi kelancaran logistik akhir.

*Laporan ini dihasilkan secara otomatis oleh asisten keuangan terintegrasi Kalimaya Alunna.*`,
    type: 'general'
  }
];

function getInitialDB() {
  if (fs.existsSync(DB_PATH)) {
    try {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      const data = JSON.parse(content);
      // Ensure all fields exist
      return {
        stocks: data.stocks || defaultStocks,
        transactions: data.transactions || defaultTransactions,
        reports: data.reports || defaultReports,
      };
    } catch (e) {
      console.error('Error reading DB, fallback to defaults', e);
      return { stocks: defaultStocks, transactions: defaultTransactions, reports: defaultReports };
    }
  } else {
    const data = { stocks: defaultStocks, transactions: defaultTransactions, reports: defaultReports };
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return data;
  }
}

let db = getInitialDB();

function saveToDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // GET ALL DATA at once (stocks, transactions, reports) for easy single-source of truth client sync
  app.get('/api/data', (req, res) => {
    res.json(db);
  });

  // STOCK ROUTES
  // Create / Post Stock
  app.post('/api/stock', (req, res) => {
    const { sku, name, category, quantity, minQuantity, unit, avgCostPrice, sellingPrice } = req.body;
    if (!name || !sku || !category) {
      return res.status(400).json({ error: 'Nama, SKU, dan Kategori wajib diisi.' });
    }
    const isSkuExists = db.stocks.some(s => s.sku.toLowerCase() === sku.toLowerCase());
    if (isSkuExists) {
      return res.status(400).json({ error: `SKU ${sku} sudah terdaftar.` });
    }

    const newItem: StockItem = {
      id: 'stock-' + Date.now(),
      sku,
      name,
      category,
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 0,
      unit: unit || 'pcs',
      avgCostPrice: Number(avgCostPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      updatedAt: new Date().toISOString()
    };

    db.stocks.push(newItem);
    saveToDB();
    res.status(201).json({ message: 'Item stok berhasil ditambahkan', item: newItem, data: db });
  });

  // Update Stock Item
  app.put('/api/stock/:id', (req, res) => {
    const { id } = req.params;
    const index = db.stocks.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item stok tidak ditemukan.' });
    }

    const { sku, name, category, quantity, minQuantity, unit, avgCostPrice, sellingPrice } = req.body;
    db.stocks[index] = {
      ...db.stocks[index],
      sku: sku || db.stocks[index].sku,
      name: name || db.stocks[index].name,
      category: category || db.stocks[index].category,
      quantity: quantity !== undefined ? Number(quantity) : db.stocks[index].quantity,
      minQuantity: minQuantity !== undefined ? Number(minQuantity) : db.stocks[index].minQuantity,
      unit: unit || db.stocks[index].unit,
      avgCostPrice: avgCostPrice !== undefined ? Number(avgCostPrice) : db.stocks[index].avgCostPrice,
      sellingPrice: sellingPrice !== undefined ? Number(sellingPrice) : db.stocks[index].sellingPrice,
      updatedAt: new Date().toISOString()
    };

    saveToDB();
    res.json({ message: 'Stok berhasil diperbarui', item: db.stocks[index], data: db });
  });

  // Delete Stock Item
  app.delete('/api/stock/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = db.stocks.length;
    db.stocks = db.stocks.filter(s => s.id !== id);
    if (db.stocks.length === initialLen) {
      return res.status(404).json({ error: 'Item stok tidak ditemukan' });
    }
    saveToDB();
    res.json({ message: 'Stok berhasil dihapus', data: db });
  });

  // FINANCE ROUTES
  // Create Finance Transaction (and optionally connect with warehouse stock calculation)
  app.post('/api/finance', (req, res) => {
    const { type, amount, date, category, description, linkedStockItemId, linkedStockQty } = req.body;

    if (!type || !amount || !date || !category || !description) {
      return res.status(400).json({ error: 'Tipe, jumlah, tanggal, kategori, dan deskripsi transaksi wajib diisi.' });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Jumlah uang harus berupa angka positif.' });
    }

    const newTx: FinanceTransaction = {
      id: 'tx-' + Date.now(),
      type, // 'masuk' or 'keluar'
      amount: parsedAmount,
      date,
      category,
      description,
      linkedStockItemId: linkedStockItemId || undefined,
      linkedStockQty: linkedStockQty ? Number(linkedStockQty) : undefined,
      updatedAt: new Date().toISOString()
    };

    // If connected to stockist item, adjust stock quantites immediately!
    if (linkedStockItemId && linkedStockQty) {
      const stockIndex = db.stocks.findIndex(s => s.id === linkedStockItemId);
      if (stockIndex !== -1) {
        const qtyDiff = Number(linkedStockQty);
        // If money comes IN ('masuk'), it implies we SOLD a product, so stock goes down!
        // If money goes OUT ('keluar'), it implies we PURCHASED materials / stock, so stock goes UP!
        if (type === 'masuk') {
          db.stocks[stockIndex].quantity = Math.max(0, db.stocks[stockIndex].quantity - qtyDiff);
        } else if (type === 'keluar') {
          db.stocks[stockIndex].quantity = db.stocks[stockIndex].quantity + qtyDiff;
        }
        db.stocks[stockIndex].updatedAt = new Date().toISOString();
      }
    }

    db.transactions.push(newTx);
    saveToDB();
    res.status(201).json({ message: 'Transaksi berhasil dicatat dan disinkronkan ke gudang', transaction: newTx, data: db });
  });

  // Delete Finance Transaction (does not revert stock automatically to avoid accounting chaos, but deletes ledger)
  app.delete('/api/finance/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = db.transactions.length;
    db.transactions = db.transactions.filter(t => t.id !== id);
    if (db.transactions.length === initialLen) {
      return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
    }
    saveToDB();
    res.json({ message: 'Transaksi berhasil dihapus dari pembukuan', data: db });
  });

  // AI-POWERED AUTOMATIC REPORTERS (using Gemini API)
  app.post('/api/report/generate', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY belum dikonfigurasi di secrets/lingkungan Anda. Silakan isi di menu Settings.'
        });
      }

      const { type } = req.body; // 'finance' | 'stock' | 'discrepancy' | 'general'
      const reportType = type || 'general';

      // 1. Compile state summaries for Gemini context
      const totalIncome = db.transactions.filter(t => t.type === 'masuk').reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = db.transactions.filter(t => t.type === 'keluar').reduce((sum, t) => sum + t.amount, 0);
      const netProfit = totalIncome - totalExpense;

      const stocksSummary = db.stocks.map(s => {
        const isAlert = s.quantity <= s.minQuantity;
        const totalAssetVal = s.quantity * s.avgCostPrice;
        return `- [${s.sku}] ${s.name}: ${s.quantity} ${s.unit} (Harga Pokok: Rp ${s.avgCostPrice.toLocaleString('id-ID')}, Estimasi Aset Gudang: Rp ${totalAssetVal.toLocaleString('id-ID')}) ${isAlert ? '[⚠️ STOK TIPIS / SEGERA RESTOCK]' : ''}`;
      }).join('\n');

      const recentTxSummary = db.transactions.slice(-10).map(t => {
        return `- [${t.date}] [${t.type.toUpperCase()}] ${t.category}: Rp ${t.amount.toLocaleString('id-ID')} - ${t.description}`;
      }).join('\n');

      // 2. Draft the system prompt & analysis direction based on requested report type
      let specificAspect = '';
      if (reportType === 'finance') {
        specificAspect = 'Fokuslah pada audit kesehatan keuangan perusahaan, tren sirkulasi kas masuk dan keluar, analisis pengeluaran operasional terbesar, perkiraan laba kotor vs laba bersih, dan efisiensi capital expenditure.';
      } else if (reportType === 'stock') {
        specificAspect = 'Fokuslah pada manajemen aset pergudangan, perputaran produk (inventory turnover), identifikasi barang yang lambat berputar (slow-moving) vs sangat laku (fast-moving), dan kepatuhan unit safe-stock.';
      } else if (reportType === 'discrepancy') {
        specificAspect = 'Fokuslah pada audit silang antara keuangan keluar untuk pengadaan dan peningkatan unit stok yang tercatat, serta uang masuk dari penjualan dengan pengurangan stok. Cari anomali, selisih perhitungan, atau potensi kerugian barang.';
      } else {
        specificAspect = 'Berikan rangkuman komprehensif mengintegrasikan arus keuangan mingguan Kalimaya Alunna serta performa logistik stok gudang.';
      }

      const userPrompt = `Analisis data operasional PT. Kalimaya Alunna Indonesia berikut ini:
Perusahaan ini bergerak di bidang kerajinan & perhiasan batu opal permata premium (Gemstone) berciri khas kearifan lokal berkelas ekspor.

--- DATA REKAP KEALUNAN ---
1. Rangkuman Pembukuan Keuangan:
   - Total Uang Masuk (Pemasukan): Rp ${totalIncome.toLocaleString('id-ID')}
   - Total Uang Keluar (Pengeluaran): Rp ${totalExpense.toLocaleString('id-ID')}
   - Profitabilitas Bersih: Rp ${netProfit.toLocaleString('id-ID')}

2. Daftar Rincian 10 Transaksi Keuangan Terakhir:
${recentTxSummary || 'Tidak ada transaksi keuangan tercatat.'}

3. Daftar Fisik Stok Gudang Terkini:
${stocksSummary || 'Tidak ada stok gudang terdaftar.'}

--- INSTRUKSI ANALISIS ---
- Buat sebuah laporan formal, informatif, dan mendalam menggunakan Bahasa Indonesia yang sangat profesional dan berorientasi korporat.
- Hindari bahasa klise AI. Gunakan istilah keuangan/logistik resmi (seperti Cash-flow metrics, Reorder point, Inventory asset value, dsb).
- Sediakan bagian berikut:
  1. RINGKASAN EKSEKUTIF (Executive Summary singkat).
  2. ANALISIS MATRIKS (Soroti KPI keuangan dan efisiensi gudang).
  3. REKOMENDASI STRATEGIS (Rekomendasi taktis apa yang harus dilakukan manajemen segera berdasarkan kondisi stok tipis atau pengeluaran operasional).
- Aspek khusus analisis saat ini: ${specificAspect}

Berikan judul laporan yang menarik, letakkan tanggal laporan saat ini (2026-05-23), dan sapa jajaran Direksi PT Kalimaya Alunna Indonesia dengan hormat.`;

      // 3. Query Google Gen AI
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userPrompt,
      });

      const reportContent = response.text || 'Gagal merancang isi laporan otomatis dari AI.';

      // Make a title based on reportType
      let formattedTitle = 'Laporan Analisis ';
      if (reportType === 'finance') formattedTitle += 'Kesehatan Keuangan Korporat';
      else if (reportType === 'stock') formattedTitle += 'Verifikasi & Efisiensi Gudang';
      else if (reportType === 'discrepancy') formattedTitle += 'Audit Silang & Deteksi Anomali';
      else formattedTitle += 'Kinerja Integrasi PT Kalimaya Alunna';

      const newReport: AutomatedReport = {
        id: 'rep-' + Date.now(),
        dateCreated: new Date().toISOString(),
        title: formattedTitle,
        content: reportContent,
        type: reportType
      };

      db.reports.unshift(newReport); // Put newest report first
      saveToDB();

      res.status(201).json({
        message: 'Laporan otomatis berhasil dirancang oleh AI Kalimaya',
        report: newReport,
        data: db
      });

    } catch (e: any) {
      console.error('Gemini Report generation error:', e);
      res.status(500).json({
        error: `Gagal merancang laporan AI: ${e.message || e}`
      });
    }
  });

  // Vite preview & static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kalimaya Alunna Server is running on port ${PORT}`);
  });
}

startServer();
