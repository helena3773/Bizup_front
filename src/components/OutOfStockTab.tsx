import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AlertTriangle, AlertCircle, Clock, Package, RotateCcw, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { outOfStockApi, OutOfStockItem } from '../lib/api';
import { toast } from 'sonner';

export function OutOfStockTab() {
  const [outOfStockItems, setOutOfStockItems] = useState<OutOfStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restocking, setRestocking] = useState<number | null>(null);

  useEffect(() => {
    loadOutOfStockItems();
  }, []);

  const loadOutOfStockItems = async () => {
    try {
      setLoading(true);
      const data = await outOfStockApi.getAll();
      setOutOfStockItems(data);
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

  return (
    <div 
      className="-mx-6 -mt-6 -mb-6" 
      style={{ 
        backgroundColor: '#f3f5f7', 
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
        minHeight: '100vh',
        paddingTop: '1.5rem',
        paddingBottom: '1.5rem'
      }}
    >
      <div className="container mx-auto px-6 max-w-7xl flex flex-col" style={{ minHeight: 'calc(100vh - 3rem)' }}>
        <div style={{ marginBottom: '45px' }}>
          <h2 className="text-2xl font-medium text-gray-900" style={{ fontSize: '36px', marginLeft: '5px', marginTop: '6.5px' }}>품절 현황</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col" style={{ minHeight: 'calc(100vh - 200px)', marginTop: '2px' }}>
        {/* Description */}
        <div className="p-6 border-b border-gray-100">
          <p className="text-gray-600 flex items-center gap-2 font-semibold" style={{ fontSize: '17px', marginLeft: '2px' }}>
            <AlertCircle className="w-4 h-4 text-[#3182F6]" />
            품절된 상품을 빠르게 채워 고객 이탈을 줄여 보세요.
          </p>
        </div>

          <div className="flex-1 p-6">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="pt-0">
          {outOfStockItems.length > 0 ? (
            <>
              <Alert className="mb-6 border-[#FBCFD0] bg-[#FFF5F7] text-[#9B1B30]">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-[#9B1B30]">
                  품절 상품 {outOfStockItems.length}개가 있어요. 바로 재입고해 볼까요?
                </AlertDescription>
              </Alert>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#FFF0F0] rounded-2xl p-4 border border-[#FBCFD0]">
                  <p className="text-[#9B1B30] mb-1 text-sm">품절 상품</p>
                  <p className="text-[#D7263D] text-2xl font-bold">{outOfStockItems.length}개</p>
                </div>
                <div className="bg-[#F8F9FF] rounded-2xl p-4 border border-[var(--border)]">
                  <p className="text-[#1A2C53] mb-1 text-sm">평균 품절 기간</p>
                  <p className="text-[#0B5ED7] text-xl font-bold">
                    {outOfStockItems.length > 0 
                      ? Math.round(outOfStockItems.reduce((sum, item) => sum + item.days_out_of_stock, 0) / outOfStockItems.length)
                      : 0}일
                  </p>
                </div>
                <div className="bg-[#F0F7FF] rounded-2xl p-4 border border-[#CCE6FF]">
                  <p className="text-[#1A2C53] mb-1 text-sm">예상 손실</p>
                  <p className="text-[#0B5ED7] text-xl font-bold">{totalLoss.toLocaleString()}원</p>
                </div>
              </div>

              {/* Out of Stock Table */}
              <div className="border border-[var(--border)] rounded-2xl overflow-hidden mb-4 bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-red-50 hover:bg-red-50">
                      <TableHead className="pl-6 text-center">상품명</TableHead>
                      <TableHead className="text-center">카테고리</TableHead>
                      <TableHead className="text-center">품절 기간</TableHead>
                      <TableHead className="text-center">마지막 재고</TableHead>
                      <TableHead className="text-center">예상 손실</TableHead>
                      <TableHead className="text-center">상태</TableHead>
                      <TableHead className="text-center">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3182F6]" />
                          <p className="text-gray-600 mt-2">품절 상품을 불러오는 중이에요…</p>
                        </TableCell>
                      </TableRow>
                    ) : outOfStockItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          품절된 상품이 없어요. 지금 상태를 그대로 유지해 볼까요?
                        </TableCell>
                      </TableRow>
                    ) : (
                      outOfStockItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-red-50/50">
                          <TableCell className="pl-6 text-center">{item.name}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="border-gray-300 text-gray-800">
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2 text-red-600">
                              <Clock className="w-4 h-4" />
                              {item.days_out_of_stock}일
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-600 text-center">
                            {item.last_stock} {item.unit}
                          </TableCell>
                          <TableCell className="text-red-600 text-center">
                            -{item.estimated_loss.toLocaleString()}원
                          </TableCell>
                          <TableCell className="text-center">{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-center">
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
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-[#0B5ED7] mx-auto mb-4" style={{ marginTop: '3px' }} />
              <p className="text-gray-600 text-sm" style={{ marginTop: '3px' }}>품절된 상품이 없어요. 지금 상태를 그대로 유지해 볼까요?</p>
            </div>
          )}
        </CardContent>
      </Card>
          </div>

          {/* Prevention Tips */}
          <div className="p-6">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)] flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  품절 방지 권장 사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-gray-700">•</span>
                    <span>최소 재고량을 미리 설정하면 품절 위험을 줄일 수 있어요.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-700">•</span>
                    <span>판매 패턴을 분석해서 인기 상품을 항상 준비해 두세요.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-700">•</span>
                    <span>정기적으로 팔리는 상품은 미리 발주해 두면 좋아요.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-gray-700">•</span>
                    <span>계절·이벤트 상품은 발주 계획을 미리 세워 두세요.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
