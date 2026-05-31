/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StockItem {
  id: string;
  sku: string;
  name: string;
  category: 'Bahan Baku' | 'Produk Jadi' | 'Kemasan' | 'Lainnya';
  quantity: number;
  minQuantity: number;
  unit: string;
  avgCostPrice: number;
  sellingPrice: number;
  updatedAt: string;
}

export interface FinanceTransaction {
  id: string;
  type: 'masuk' | 'keluar';
  amount: number;
  date: string;
  category: string;
  description: string;
  linkedStockItemId?: string;
  linkedStockQty?: number;
  updatedAt: string;
}

export interface AutomatedReport {
  id: string;
  dateCreated: string;
  title: string;
  content: string;
  type: 'finance' | 'stock' | 'discrepancy' | 'general';
}
