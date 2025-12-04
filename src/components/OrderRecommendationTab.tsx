import { TabNavigation } from './TabNavigation';
import { ExternalLink } from 'lucide-react';

interface OrderRecommendationTabProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

interface OrderSite {
  id: number;
  name: string;
  url: string;
  description?: string;
  category?: string;
}

export function OrderRecommendationTab({ activeTab = 'order', onTabChange }: OrderRecommendationTabProps) {
  // 발주 사이트 리스트 (예시 데이터)
  const orderSites: OrderSite[] = [
    {
      id: 1,
      name: '사이트 1',
      url: 'https://example.com',
      description: '발주 사이트 설명',
      category: '식자재',
    },
    {
      id: 2,
      name: '사이트 2',
      url: 'https://example.com',
      description: '발주 사이트 설명',
      category: '식자재',
    },
    {
      id: 3,
      name: '사이트 3',
      url: 'https://example.com',
      description: '발주 사이트 설명',
      category: '식자재',
    },
  ];

  const handleSiteClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      id="order-tab"
      className="-mx-6 -mt-6 -mb-6" 
      style={{ 
        backgroundColor: '#f3f5f7', 
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        minHeight: '100vh',
        paddingTop: '0',
        paddingBottom: '1.5rem'
      }}
    >
      {onTabChange && <TabNavigation activeTab={activeTab} onTabChange={onTabChange} tabId="order-tab" />}
      <div className="container mx-auto px-6 max-w-7xl flex flex-col" style={{ minHeight: 'calc(100vh - 3rem)', paddingTop: '1.5rem' }}>
        <div style={{ marginBottom: '45px' }}>
          <h2 className="text-2xl font-medium text-gray-900" style={{ fontSize: '36px', marginLeft: '5px', marginTop: '6.5px' }}>발주 사이트</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 flex-1" style={{ minHeight: 'calc(100vh - 200px)', marginTop: '2px' }}>
          {/* Description */}
          <div className="p-6 border-b border-gray-100">
            <p className="text-gray-600" style={{ fontSize: '17px', marginLeft: '2px' }}>
              발주에 사용할 수 있는 사이트 목록이에요.
            </p>
          </div>

          {/* Sites List */}
          <div className="p-6">
            {orderSites.length > 0 ? (
              <div className="grid gap-4">
                {orderSites.map((site) => (
                  <div
                    key={site.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
                    onClick={() => handleSiteClick(site.url)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-[18px] font-medium text-gray-900">{site.name}</h3>
                          {site.category && (
                            <span className="text-[12px] text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {site.category}
                            </span>
                          )}
                        </div>
                        {site.description && (
                          <p className="text-[15px] text-gray-600 mb-2">{site.description}</p>
                        )}
                        <p className="text-[14px] text-gray-500">{site.url}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
                <p className="text-[15px] text-gray-400">등록된 발주 사이트가 없어요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
