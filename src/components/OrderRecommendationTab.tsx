import { useState } from 'react';
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
  const orderSites: OrderSite[] = [
    {
      id: 1,
      name: '보사노바 커피로스터스',
      url: 'https://www.bncr.co.kr/wholesale',
      description: '033-653-0338 / 010-5183-5721',
      category: '국내 로스터리 B2B',
    },
    {
      id: 2,
      name: '퍼플빈 커피',
      url: 'https://purplebean.co.kr/category/%EC%82%AC%EC%97%85%EC%9E%90%EC%9A%A9-%EC%9B%90%EB%91%90/92/',
      description: '1661-5781',
      category: '국내 로스터리 B2B',
    },
    {
      id: 3,
      name: '코페아 (COFFEA)',
      url: 'https://www.coffea.co.kr/',
      description: '031-323-2927',
      category: '국내 로스터리 B2B',
    },
    {
      id: 4,
      name: '커피명가',
      url: 'https://myungga.com/han/html/wholesale_sub.html',
      description: '',
      category: '국내 로스터리 B2B',
    },
    {
      id: 5,
      name: '아쏘커피',
      url: 'https://assocoffee.co.kr/',
      description: '070-4155-2800',
      category: '국내 로스터리 B2B',
    },
    {
      id: 6,
      name: '504b 로스터리',
      url: 'https://www.504.co.kr/',
      description: '',
      category: '국내 로스터리 B2B',
    },
    {
      id: 7,
      name: '비니크 로스터스',
      url: 'https://beanique.kr/%EB%B9%84%EB%8B%88%ED%81%AC-%EC%86%8C%EA%B0%9C/',
      description: '1522-9226',
      category: '국내 로스터리 B2B',
    },
    {
      id: 8,
      name: '55도커피 로스터스',
      url: 'https://55docoffee.co.kr/',
      description: '',
      category: '국내 로스터리 B2B',
    },
    {
      id: 9,
      name: '리앙빈',
      url: 'http://lianbean.com/kor/sub06/menu_02.html',
      description: '010-2678-6411',
      category: '국내 로스터리 B2B',
    },
    {
      id: 10,
      name: '커피앳웍스',
      url: 'https://www.coffeeatworks.kr/board/write.php?bdId=cwb2b',
      description: '02-2276-6597',
      category: '국내 로스터리 B2B',
    },
    {
      id: 11,
      name: '테즈로스팅',
      url: 'https://m.tedsroasting.com/shopinfo/company_whole.html',
      description: '02-6925-3561',
      category: '국내 로스터리 B2B',
    },
    {
      id: 12,
      name: '미루꾸커피 [YnB COMPANY]',
      url: 'https://mirukku.com/roasting-factory/',
      description: '1533-3552 / 070-4108-5355',
      category: '국내 로스터리 B2B',
    },
    {
      id: 13,
      name: '파블로스 커피',
      url: 'https://cafepablo.co.kr/',
      description: '031-776-0606',
      category: '국내 로스터리 B2B',
    },
    {
      id: 14,
      name: '웨이브온 (Waveon Coffee)',
      url: 'https://m.waveoncoffee.com/layout/b2bInfo.html',
      description: '',
      category: '국내 로스터리 B2B',
    },
    {
      id: 15,
      name: '일산커피공장',
      url: 'http://www.ilsancoffee.co.kr/ez/',
      description: '',
      category: '국내 로스터리 B2B',
    },
    {
      id: 16,
      name: '프릳츠커피컴퍼니',
      url: 'https://m.fritz.co.kr/',
      description: '010-4504-1799',
      category: '국내 로스터리 B2B',
    },
    {
      id: 17,
      name: '커피리브레',
      url: 'https://m.coffeelibre.kr/',
      description: '070-4282-1101',
      category: '국내 로스터리 B2B',
    },
    {
      id: 18,
      name: '빈 브라더스',
      url: 'https://www.beanbrothers.co.kr/info/wholesaleservice',
      description: '010-8767-4709',
      category: '국내 로스터리 B2B',
    },
    {
      id: 19,
      name: '테일러 커피',
      url: 'https://tailorcoffee.com/',
      description: '010-9006-5048',
      category: '국내 로스터리 B2B',
    },
    {
      id: 20,
      name: '티젠',
      url: 'https://teazenmall.com/product/list.html?cate_no=860',
      description: '',
      category: '국내 티 납품업체',
    },
    {
      id: 21,
      name: '아마드티',
      url: 'https://smartstore.naver.com/ahmadtea/?NaPm=ct%3Dmiuir8qf%7Cci%3DER29d1d0ee-d2c2-11f0-bfdb-2ec7e22f2465%7Ctr%3Dbrnd%7Chk%3Db4b4c601875bb328cf71072bc4eb05c02306093c%7Cnacn%3DMx6oBYw01m2k',
      description: '',
      category: '국내 티 납품업체',
    },
    {
      id: 22,
      name: '아망티',
      url: 'https://www.amantea.co.kr/product/list.html?cate_no=112',
      description: '070-8114-4451',
      category: '국내 티 납품업체',
    },
    {
      id: 23,
      name: '타바론',
      url: 'https://www.tavalon.co.kr/?NaPm=ct%3Dmiuja4qc%7Cci%3DER371a0415-d2c4-11f0-a281-f6949ba831d6%7Ctr%3Dbrnd%7Chk%3D3d995db26052c42440e91c91f8de4c6ff5ab5e32%7Cnacn%3DMx6oBYw01m2k',
      description: '02-518-0819',
      category: '국내 티 납품업체',
    },
    {
      id: 24,
      name: '사루비아다방',
      url: 'http://www.salviatearoom.com/index.html?NaPm=ct%3Dmiujc5uf%7Cci%3DER6f947a88-d2c4-11f0-af53-7e054211357c%7Ctr%3Dsa%7Chk%3D9e807048a9e1a110d307f38dcee552697e35a0a1%7Cnacn%3DMx6oBYw01m2k',
      description: '02-723-2755',
      category: '국내 티 납품업체',
    },
    {
      id: 25,
      name: '트와이닝',
      url: 'https://smartstore.naver.com/twinings/profile',
      description: '',
      category: '국내 티 납품업체',
    },
    {
      id: 26,
      name: '룩아워티',
      url: 'https://www.lookourtea.com/?NaPm=ct%3Dmiujnswq%7Cci%3DERb34c07e7-d2c5-11f0-8625-8602e2b2b0a9%7Ctr%3Dbrnd%7Chk%3D95ccafb29e93a6bc19547d30bcdbd92bfb1f9961%7Cnacn%3DMx6oBYw01m2k',
      description: '031-717-3888',
      category: '국내 티 납품업체',
    },
    {
      id: 27,
      name: '에빠니',
      url: 'https://smartstore.naver.com/greenteamall?nl-ts-pid=jgeAElqXKZGssjvd%252FYw-202951&tr=slsmn',
      description: '',
      category: '국내 티 납품업체',
    },
    {
      id: 28,
      name: '리쉬티',
      url: 'https://www.rishi-tea.co.kr/',
      description: '031-261-9035',
      category: '국내 티 납품업체',
    },
    {
      id: 29,
      name: '크리스틴다트너',
      url: 'https://cdtea.co.kr/',
      description: '031-698-3078',
      category: '국내 티 납품업체',
    },
    {
      id: 30,
      name: '올데이티',
      url: 'https://alldaytea.com/alldaytea',
      description: '032-323-0815',
      category: '국내 티 납품업체',
    },
    {
      id: 31,
      name: '로네펠트',
      url: 'https://ronnefeldt.co.kr/',
      description: '031-784-9247',
      category: '국내 티 납품업체',
    },
    
    {
      id: 32,
      name: '쿠스미티',
      url: 'https://kusmiteakorea.com/?NaPm=ct%3Dmiuk51vt%7Cci%3Dcheckout%7Ctr%3Dds%7Ctrx%3Dnull%7Chk%3D3f9dbc246d93cdc612038b95e7b1328cf69730b7',
      description: '02-1688-5501',
      category: '국내 티 납품업체',
    },
  ];

  const categories = [
    { key: '국내 로스터리 B2B', label: '국내 로스터리 B2B' },
    { key: '국내 티 납품업체', label: '국내 티 납품업체' },
  ];

  const [internalTab, setInternalTab] = useState<string>(categories[0].key);

  const handleSiteClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentCategory = categories.find((c) => c.key === internalTab) ?? categories[0];
  const filteredSites = orderSites.filter((site) => site.category === currentCategory.key);

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
          <div className="p-6 space-y-6">
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              {categories.map(({ key, label }) => {
                const isActive = internalTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setInternalTab(key)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-white shadow-sm border border-gray-200 font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-200" />
                <h3 className="text-xl font-semibold text-gray-900">{currentCategory.label}</h3>
              </div>

              {filteredSites.length > 0 ? (
                <div className="grid gap-4">
                  {filteredSites.map((site) => (
                    <div
                      key={site.id}
                      className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer"
                      onClick={() => handleSiteClick(site.url)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-[18px] font-medium text-gray-900">{site.name}</h4>
                            {site.category && (
                              <span className="text-[12px] text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {site.category}
                              </span>
                            )}
                          </div>
                          {site.description && (
                            <p className="text-[15px] text-gray-600">{site.description}</p>
                          )}
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[14px] text-gray-400 border border-dashed border-gray-200 rounded-lg p-4">
                  해당 카테고리에 등록된 발주 사이트가 없어요.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
