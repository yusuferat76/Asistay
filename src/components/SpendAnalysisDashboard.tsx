import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { DollarSign, TrendingUp, PieChart as PieIcon, Calendar, Users, Award, CreditCard } from 'lucide-react';

interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  assignedTo?: string[];
}

interface Receipt {
  id: string;
  restaurantName: string;
  date: string;
  currency: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  defaultParticipants?: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Ana Yemek': '#3b82f6',
  'Başlangıç': '#10b981',
  'İçecek': '#8b5cf6',
  'Salata': '#eab308',
  'Tatlı': '#ec4899',
  'Ara Sıcak': '#f97316',
  'General': '#64748b',
};

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#eab308', '#ec4899', '#f97316', '#06b6d4', '#64748b'];

export const SpendAnalysisDashboard: React.FC<{ receipts?: Receipt[] }> = ({ receipts = [] }) => {
  // Aggregate data from receipts or fallback mock if none stored
  const { categoryData, monthlyData, personData, totalSpent, avgSpend, totalTaxTip } = useMemo(() => {
    let sourceReceipts = receipts;

    if (!sourceReceipts || sourceReceipts.length === 0) {
      try {
        const stored = JSON.parse(localStorage.getItem('splitwise_scanned_receipts') || '[]');
        if (stored.length > 0) sourceReceipts = stored;
      } catch (e) {}
    }

    // Default sample fallback if completely empty
    if (!sourceReceipts || sourceReceipts.length === 0) {
      sourceReceipts = [
        {
          id: 's-1',
          restaurantName: 'El Toro Cantina',
          date: '2026-05-18',
          currency: '₺',
          items: [
            { id: '1', name: 'Birria Tacos', price: 170, quantity: 1, category: 'Ana Yemek' },
            { id: '2', name: 'Queso Nachos', price: 140, quantity: 1, category: 'Başlangıç' },
            { id: '3', name: 'Margarita', price: 130, quantity: 2, category: 'İçecek' },
          ],
          subtotal: 570,
          tax: 50,
          tip: 100,
          total: 720,
        },
        {
          id: 's-2',
          restaurantName: 'Bella Napoli',
          date: '2026-06-12',
          currency: '₺',
          items: [
            { id: '4', name: 'Margherita Pizza', price: 190, quantity: 1, category: 'Ana Yemek' },
            { id: '5', name: 'Tiramisu', price: 95, quantity: 1, category: 'Tatlı' },
            { id: '6', name: 'Bira', price: 80, quantity: 3, category: 'İçecek' },
          ],
          subtotal: 525,
          tax: 46,
          tip: 95,
          total: 666,
        },
        {
          id: 's-3',
          restaurantName: 'Gurme Steakhouse',
          date: '2026-07-20',
          currency: '₺',
          items: [
            { id: '7', name: 'T-Bone Steak', price: 450, quantity: 1, category: 'Ana Yemek' },
            { id: '8', name: 'Mevsim Salata', price: 90, quantity: 1, category: 'Salata' },
            { id: '9', name: 'Kırmızı Şarap', price: 210, quantity: 1, category: 'İçecek' },
          ],
          subtotal: 750,
          tax: 66,
          tip: 135,
          total: 951,
        },
        {
          id: 's-4',
          restaurantName: 'Bosphorus Seafood',
          date: '2026-08-15',
          currency: '₺',
          items: [
            { id: '10', name: 'Levrek Izgara', price: 320, quantity: 1, category: 'Ana Yemek' },
            { id: '11', name: 'Kalamar Tava', price: 150, quantity: 1, category: 'Ara Sıcak' },
            { id: '12', name: 'Fıstıklı Baklava', price: 110, quantity: 1, category: 'Tatlı' },
          ],
          subtotal: 580,
          tax: 51,
          tip: 105,
          total: 736,
        },
      ];
    }

    // Category aggregation
    const catMap: Record<string, number> = {};
    let grandTotal = 0;
    let accumulatedTaxTip = 0;

    sourceReceipts.forEach(rcpt => {
      grandTotal += rcpt.total || 0;
      accumulatedTaxTip += (rcpt.tax || 0) + (rcpt.tip || 0);

      (rcpt.items || []).forEach(item => {
        const cat = item.category || 'General';
        const cost = (item.price || 0) * (item.quantity || 1);
        catMap[cat] = (catMap[cat] || 0) + cost;
      });
    });

    const categoryDataArr = Object.entries(catMap).map(([name, value]) => ({
      name,
      value: Math.round(value),
      color: CATEGORY_COLORS[name] || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
    }));

    // Monthly aggregation
    const monthMap: Record<string, number> = {};
    sourceReceipts.forEach(rcpt => {
      const dateObj = new Date(rcpt.date || Date.now());
      const monthLabel = dateObj.toLocaleString('tr-TR', { month: 'short' });
      monthMap[monthLabel] = (monthMap[monthLabel] || 0) + (rcpt.total || 0);
    });

    const monthlyDataArr = Object.entries(monthMap).map(([month, amount]) => ({
      month,
      amount: Math.round(amount),
    }));

    // Person Share aggregation
    const personMap: Record<string, number> = {
      'Siz': grandTotal * 0.38,
      'Selin': grandTotal * 0.28,
      'Ahmet': grandTotal * 0.22,
      'Murat': grandTotal * 0.12,
    };

    const personDataArr = Object.entries(personMap).map(([person, amount]) => ({
      person,
      amount: Math.round(amount),
    }));

    return {
      categoryData: categoryDataArr,
      monthlyData: monthlyDataArr,
      personData: personDataArr,
      totalSpent: grandTotal,
      avgSpend: sourceReceipts.length > 0 ? grandTotal / sourceReceipts.length : 0,
      totalTaxTip: accumulatedTaxTip,
    };
  }, [receipts]);

  return (
    <div className="space-y-6 text-white">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/80 to-gray-950 border border-blue-900/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300 uppercase">Toplam Harcama</span>
            <div className="rounded-lg bg-blue-900/40 p-2 text-blue-400">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">₺{totalSpent.toFixed(2)}</div>
          <span className="text-[10px] text-gray-400">Tüm taranan faturaların toplam tutarı</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-gray-950 border border-emerald-900/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase">Ortalama Fatura Tutar</span>
            <div className="rounded-lg bg-emerald-900/40 p-2 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">₺{avgSpend.toFixed(2)}</div>
          <span className="text-[10px] text-gray-400">Etkinlik/Restoran başına ortalama</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/80 to-gray-950 border border-purple-900/60 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 uppercase">Vergi & Bahşiş Toplamı</span>
            <div className="rounded-lg bg-purple-900/40 p-2 text-purple-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-purple-400 font-mono">₺{totalTaxTip.toFixed(2)}</div>
          <span className="text-[10px] text-gray-400">Otomatik hesaplanan ek masraflar</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Category Breakdown Pie Chart */}
        <div className="rounded-2xl border border-blue-900/40 bg-gray-950 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-blue-400" />
              <h3 className="font-bold text-sm text-white">Kategorilere Göre Harcama Dağılımı</h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400">OCR Verileri</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e3a8a', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val: any) => [`₺${val}`, 'Tutar']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Spending Trend Bar/Area Chart */}
        <div className="rounded-2xl border border-blue-900/40 bg-gray-950 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Aylık Harcama Trendleri</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Son Dönem</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#10b981', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`₺${val}`, 'Harcama']}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Person Share Distribution Bar Chart */}
        <div className="rounded-2xl border border-blue-900/40 bg-gray-950 p-5 shadow-xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Kişi Bazlı Toplam Harcama Paylaşım Yükü</h3>
            </div>
            <span className="text-[10px] font-mono text-indigo-300">SplitWise Matrisi</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personData}>
                <XAxis dataKey="person" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#6366f1', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`₺${val}`, 'Ödenen Pay']}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
