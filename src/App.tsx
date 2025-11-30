import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Package, TrendingUp, AlertTriangle, Settings, Utensils } from 'lucide-react';
import { InventoryTab } from './components/InventoryTab';
import { OrderRecommendationTab } from './components/OrderRecommendationTab';
import { OutOfStockTab } from './components/OutOfStockTab';
import { SettingsTab } from './components/SettingsTab';
import { MenuTab } from './components/MenuTab';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // 초기 마운트 시 스크롤 방지
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 탭 변경 처리
  const handleTabChange = (tab: string, source: 'main' | 'nav' = 'main') => {
    // 같은 탭을 다시 클릭하면 초기 상태로 복귀
    if (activeTab === tab) {
      setActiveTab(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setActiveTab(tab);
    // 탭 변경 시 상단으로 스크롤
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  return (
    <>
      {!activeTab ? (
        /* 초기 화면 - 하얀색 배경 */
        <div className="min-h-screen bg-white" style={{ minHeight: '100vh' }}>
          <div 
            className="flex flex-col items-center justify-center"
            style={{
              minHeight: '100vh',
              paddingTop: '33.33vh',
              paddingBottom: '33.33vh'
            }}
          >
            <div className="container mx-auto px-6 max-w-7xl">
              {/* Header */}
              <div className="mb-8 text-center">
                <h1 className="text-gray-900 font-medium bold mb-2" style={{ fontSize: '35px' }}>Bizup 으로 가게 운영을 한 번에 챙겨요</h1>
                <p className="mb-6 font-black" style={{ fontSize: '25px', fontWeight: '600', color: '#646d7a' }}>재고부터 발주까지 가볍게 끝내보세요</p>
              </div>

              {/* Main Tabs */}
              <Tabs value="" onValueChange={(value) => handleTabChange(value, 'main')} className="w-full">
                <TabsList className="inline-flex items-center bg-[#f2f4f7] p-1.5 rounded-full h-auto mx-auto justify-center" style={{ gap: '16px' }}>
                  <TabsTrigger 
                    value="inventory" 
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#3182f6',
                      backgroundColor: '#eff6ff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3182f6';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                      e.currentTarget.style.color = '#3182f6';
                    }}
                  >
                    <Package className="w-5 h-5" />
                    <span className="hidden sm:inline">재고 관리</span>
                    <span className="sm:hidden">재고</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="menu" 
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#3182f6',
                      backgroundColor: '#eff6ff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3182f6';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                      e.currentTarget.style.color = '#3182f6';
                    }}
                  >
                    <Utensils className="w-5 h-5" />
                    <span className="hidden sm:inline">메뉴 관리</span>
                    <span className="sm:hidden">메뉴</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="order" 
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#3182f6',
                      backgroundColor: '#eff6ff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3182f6';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                      e.currentTarget.style.color = '#3182f6';
                    }}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span className="hidden sm:inline">발주 추천</span>
                    <span className="sm:hidden">발주</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="outofstock" 
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#3182f6',
                      backgroundColor: '#eff6ff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3182f6';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                      e.currentTarget.style.color = '#3182f6';
                    }}
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span className="hidden sm:inline">품절 관리</span>
                    <span className="sm:hidden">품절</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="settings" 
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#3182f6',
                      backgroundColor: '#eff6ff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3182f6';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                      e.currentTarget.style.color = '#3182f6';
                    }}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="hidden sm:inline">설정</span>
                    <span className="sm:hidden">설정</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      ) : (
        /* 탭 컨텐츠 영역 - 회색 배경 */
        <div 
          id="gray-section"
          className="bg-[#f3f5f7] min-h-screen"
          style={{
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value, 'nav')} className="w-full">
            <TabsContent 
              value="inventory" 
              className="m-0"
              style={{
                transition: 'opacity 0.3s ease-in-out',
                animation: activeTab === 'inventory' ? 'fadeIn 0.3s ease-in-out' : 'none'
              }}
            >
              <InventoryTab activeTab={activeTab} onTabChange={(tab) => handleTabChange(tab, 'nav')} />
            </TabsContent>
            <TabsContent 
              value="menu" 
              className="m-0"
              style={{
                transition: 'opacity 0.3s ease-in-out',
                animation: activeTab === 'menu' ? 'fadeIn 0.3s ease-in-out' : 'none'
              }}
            >
              <MenuTab activeTab={activeTab} onTabChange={(tab) => handleTabChange(tab, 'nav')} />
            </TabsContent>
            <TabsContent 
              value="order" 
              className="m-0"
              style={{
                transition: 'opacity 0.3s ease-in-out',
                animation: activeTab === 'order' ? 'fadeIn 0.3s ease-in-out' : 'none'
              }}
            >
              <OrderRecommendationTab activeTab={activeTab} onTabChange={(tab) => handleTabChange(tab, 'nav')} />
            </TabsContent>
            <TabsContent 
              value="outofstock" 
              className="m-0"
              style={{
                transition: 'opacity 0.3s ease-in-out',
                animation: activeTab === 'outofstock' ? 'fadeIn 0.3s ease-in-out' : 'none'
              }}
            >
              <OutOfStockTab activeTab={activeTab} onTabChange={(tab) => handleTabChange(tab, 'nav')} />
            </TabsContent>
            <TabsContent 
              value="settings" 
              className="m-0"
              style={{
                transition: 'opacity 0.3s ease-in-out',
                animation: activeTab === 'settings' ? 'fadeIn 0.3s ease-in-out' : 'none'
              }}
            >
              <SettingsTab activeTab={activeTab} onTabChange={(tab) => handleTabChange(tab, 'nav')} />
            </TabsContent>
          </Tabs>
        </div>
      )}
      <Toaster />
    </>
  );
}
