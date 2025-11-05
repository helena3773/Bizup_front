import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Package, TrendingUp, AlertTriangle, Settings } from 'lucide-react';
import { InventoryTab } from './components/InventoryTab';
import { OrderRecommendationTab } from './components/OrderRecommendationTab';
import { OutOfStockTab } from './components/OutOfStockTab';
import { SettingsTab } from './components/SettingsTab';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
          <h1 className="text-gray-900 font-medium bold text-lg mb-2 pl-4">Bizup 가게 운영 관리 시스템</h1>
            <p className="text-gray-500 text-lg mb-6 pl-4">재고부터 발주까지, 스마트하게 관리하세요</p>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm h-auto py-4 px-2">
              <TabsTrigger 
                value="inventory" 
                className={`flex items-center gap-2 py-3 px-3 transition-all duration-200 text-gray-800 font-medium hover:text-gray-900 ${
                  activeTab === 'inventory' ? 'bg-gray-50 font-semibold' : ''
                }`}
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">재고 관리</span>
                <span className="sm:hidden">재고</span>
              </TabsTrigger>
              <TabsTrigger 
                value="order" 
                className={`flex items-center gap-2 py-3 px-3 transition-all duration-200 text-gray-800 font-medium hover:text-gray-900 ${
                  activeTab === 'order' ? 'bg-gray-50 font-semibold' : ''
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">발주 추천</span>
                <span className="sm:hidden">발주</span>
              </TabsTrigger>
              <TabsTrigger 
                value="outofstock" 
                className={`flex items-center gap-2 py-3 px-3 transition-all duration-200 text-gray-800 font-medium hover:text-gray-900 ${
                  activeTab === 'outofstock' ? 'bg-gray-50 font-semibold' : ''
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">품절 관리</span>
                <span className="sm:hidden">품절</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className={`flex items-center gap-2 py-3 px-3 transition-all duration-200 text-gray-800 font-medium hover:text-gray-900 ${
                  activeTab === 'settings' ? 'bg-gray-50 font-semibold' : ''
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">설정</span>
                <span className="sm:hidden">설정</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="inventory" className="m-0">
                <InventoryTab />
              </TabsContent>
              
              <TabsContent value="order" className="m-0">
                <OrderRecommendationTab />
              </TabsContent>
              
              <TabsContent value="outofstock" className="m-0">
                <OutOfStockTab />
              </TabsContent>
              
              <TabsContent value="settings" className="m-0">
                <SettingsTab />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      <Toaster />
    </>
  );
}
