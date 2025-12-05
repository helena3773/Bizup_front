import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AlertCircle, Clock, RotateCcw, Loader2 } from 'lucide-react';
import { outOfStockApi, OutOfStockItem, OutOfStockMenu } from '../lib/api';
import { toast } from 'sonner';
import { TabNavigation } from './TabNavigation';

interface OutOfStockTabProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function OutOfStockTab({ activeTab = 'outofstock', onTabChange }: OutOfStockTabProps) {
  const [outOfStockItems, setOutOfStockItems] = useState<OutOfStockItem[]>([]);
  const [outOfStockMenus, setOutOfStockMenus] = useState<OutOfStockMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [restocking, setRestocking] = useState<number | null>(null);

  useEffect(() => {
    loadOutOfStockItems();
  }, []);

  const loadOutOfStockItems = async () => {
    try {
      setLoading(true);
      const data = await outOfStockApi.getAll();
      setOutOfStockItems(data.items);
      setOutOfStockMenus(data.menus);
    } catch (error) {
      console.error('품절 상품 목록 로딩 오류:', error);
      toast.error('품절 상품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">급한</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-500">중요</Badge>;
      case 'recent':
        return <Badge variant="secondary">최근</Badge>;
      default:
        return null;
    }
  };

  const handleRestock = async (id: number) => {
    try {
      setRestocking(id);
      // 재입고 완료 처리
      const quantity = 50; // 재고 수량 추가
      await outOfStockApi.restock(id, quantity);
      toast.success('재입고를 완료했어요.');
      loadOutOfStockItems();
    } catch (error) {
      console.error('재입고 오류:', error);
      toast.error('재입고를 진행하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setRestocking(null);
    }
  };

  const totalLoss = outOfStockItems.reduce((sum, item) => sum + item.estimated_loss, 0);
  const totalItems = outOfStockItems.length;
  const totalMenus = outOfStockMenus.length;

  return (
    <div 
      id="outofstock-tab"
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
      {onTabChange && <TabNavigation activeTab={activeTab} onTabChange={onTabChange} tabId="outofstock-tab" />}
      <div className="container mx-auto px-6 max-w-7xl flex flex-col" style={{ minHeight: 'calc(100vh - 3rem)', paddingTop: '1.5rem' }}>
        <div style={{ marginBottom: '45px' }}>
          <h2 className="text-2xl font-medium text-gray-900" style={{ fontSize: '36px', marginLeft: '5px', marginTop: '6.5px' }}>품절 현황</h2>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <p className="text-gray-600 flex items-center gap-2" style={{ fontSize: '17px', marginLeft: '2px' }}>
            <AlertCircle className="w-4 h-4 text-[#3182F6]" />
            품절된 재료와 메뉴를 빠르게 채워 매출을 늘려 보세요.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-4">
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">품절 재료</p>
            <p className="text-[20px] text-gray-900 font-medium">
              {totalItems}개
            </p>
          </div>
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">품절 메뉴</p>
            <p className="text-[20px] text-gray-900 font-medium">
              {totalMenus}개
            </p>
          </div>
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">예상 손실</p>
            <p className="text-[20px] text-gray-900 font-medium">{totalLoss.toLocaleString()}원</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col" style={{ minHeight: '400px' }}>
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">품절 메뉴</h3>
            <p className="text-sm text-gray-500 mt-1">품절 재료를 사용하는 메뉴 목록</p>
          </div>
          <div className="overflow-x-auto p-6">
            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3182F6]" />
                <p className="text-gray-600 mt-2 text-[15px]">품절 메뉴를 불러오는 중이에요…</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50" style={{ backgroundColor: '#f9fafb', borderBottomColor: '#e5e7eb' }}>
                      <TableHead className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]" style={{ backgroundColor: '#f9fafb' }}>
                        메뉴명
                      </TableHead>
                      <TableHead className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]" style={{ backgroundColor: '#f9fafb' }}>
                        품절 재료
                      </TableHead>
                      <TableHead className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]" style={{ backgroundColor: '#f9fafb' }}>
                        품절 기간
                      </TableHead>
                      <TableHead className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]" style={{ backgroundColor: '#f9fafb' }}>
                        상태
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outOfStockMenus.length > 0 ? (
                      outOfStockMenus.map((menu) => (
                        <TableRow
                          key={menu.id}
                          className="hover:bg-gray-50/50"
                          style={{ borderBottomColor: '#e5e7eb' }}
                        >
                          <TableCell className="px-6 py-6 text-center text-[15px] text-gray-900">{menu.name}</TableCell>
                          <TableCell className="px-6 py-6 text-center text-[15px] text-gray-600">
                            <div className="flex flex-wrap justify-center gap-1">
                              {menu.missing_ingredients.map((ing, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {ing}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-6 text-center text-[15px] text-gray-600">
                            <div className="flex items-center justify-center gap-2 text-gray-800">
                              <Clock className="w-4 h-4" />
                              {menu.days_out_of_stock}일
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-6 text-center">
                            {getStatusBadge(menu.status)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow style={{ borderBottomColor: '#e5e7eb' }}>
                        <TableCell colSpan={4} className="px-6 text-center" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
                          <p className="text-[15px] text-gray-400">품절된 메뉴가 없어요.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-6 mb-4"></div>
        <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col mb-4" style={{ minHeight: '400px' }}>
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">품절 재료</h3>
            <p className="text-sm text-gray-500 mt-1">재고가 0인 재료 목록</p>
          </div>
          <div className="overflow-x-auto p-6">
            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3182F6]" />
                <p className="text-gray-600 mt-2 text-[15px]">품절 재료를 불러오는 중이에요…</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50" style={{ backgroundColor: '#f9fafb', borderBottomColor: '#e5e7eb' }}>
                      <TableHead className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]" style={{ backgroundColor: '#f9fafb' }}>
                        재료명
                      </TableHead>
                      <TableHead className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]" style={{ backgroundColor: '#f9fafb' }}>
                        카테고리
                      </TableHead>
                      <TableHead className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]" style={{ backgroundColor: '#f9fafb' }}>
                        품절 기간
                      </TableHead>
                      <TableHead className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]" style={{ backgroundColor: '#f9fafb' }}>
                        마지막 재고
                      </TableHead>
                      <TableHead className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]" style={{ backgroundColor: '#f9fafb' }}>
                        예상 손실
                      </TableHead>
                      <TableHead className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]" style={{ backgroundColor: '#f9fafb' }}>
                        상태
                      </TableHead>
                      <TableHead className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]" style={{ backgroundColor: '#f9fafb' }}>
                        관리
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outOfStockItems.length > 0 ? (
                      outOfStockItems.map((item) => (
                        <TableRow
                          key={item.id}
                          className="hover:bg-gray-50/50"
                          style={{ borderBottomColor: '#e5e7eb' }}
                        >
                          <TableCell className="px-6 py-6 text-center text-[15px] text-gray-900">{item.name}</TableCell>
                          <TableCell className="px-6 py-6 text-center text-[15px] text-gray-600">{item.category}</TableCell>
                          <TableCell className="px-6 py-6 text-center text-[15px] text-gray-600">
                            <div className="flex items-center justify-center gap-2 text-gray-800">
                              <Clock className="w-4 h-4" />
                              {item.days_out_of_stock}일
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-6 text-center text-[15px] text-gray-600">
                            {item.last_stock} {item.unit}
                          </TableCell>
                          <TableCell className="px-6 py-6 text-center text-[15px] text-gray-900">
                            -{item.estimated_loss.toLocaleString()}원
                          </TableCell>
                          <TableCell className="px-6 py-6 text-center">
                            {getStatusBadge(item.status)}
                          </TableCell>
                          <TableCell className="px-6 py-6 text-center">
                            <Button
                              size="sm"
                              className="bg-[#F0F7FF] text-[#0B5ED7] border-none transition-all duration-200 font-medium hover:bg-[#E0EDFF]"
                              onClick={() => handleRestock(item.id)}
                              disabled={restocking === item.id}
                            >
                              {restocking === item.id ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  재입고 중...
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-3 h-3 mr-1" />
                                  재입고 진행
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow style={{ borderBottomColor: '#e5e7eb' }}>
                        <TableCell colSpan={7} className="px-6 text-center" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
                          <p className="text-[15px] text-gray-400">품절된 재료가 없어요.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
