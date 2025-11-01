import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ShoppingCart, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { orderApi, OrderRecommendation } from '../lib/api';
import { toast } from 'sonner';

export function OrderRecommendationTab() {
  const [recommendations, setRecommendations] = useState<OrderRecommendation[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getRecommendations();
      setRecommendations(data);
    } catch (error) {
      console.error('발주 추천 목록 로딩 오류:', error);
      toast.error('발주 추천 목록 로딩 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const totalCost = recommendations
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.estimated_cost, 0);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="badge-priority-high">높음</Badge>;
      case 'medium':
        return <Badge variant="default" className="badge-priority-medium">보통</Badge>;
      case 'low':
        return <Badge variant="secondary" className="badge-priority-low">낮음</Badge>;
      default:
        return null;
    }
  };

  const toggleItem = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOrderAll = async () => {
    if (selectedItems.length === 0) return;

    try {
      setOrdering(true);
      const items = recommendations
        .filter(item => selectedItems.includes(item.id))
        .map(item => ({
          inventory_item_id: item.id,
          quantity: item.recommended_qty,
          priority: item.priority,
        }));

      await orderApi.create({ items });
      toast.success(`${selectedItems.length}개의 상품을 발주했습니다.`);
      setSelectedItems([]);
      loadRecommendations();
    } catch (error) {
      console.error('발주 오류:', error);
      toast.error('발주 오류가 발생했습니다.');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="card-standard">
        <CardHeader className="card-header-grey">
          <CardTitle className="card-title-primary">
            <TrendingUp className="icon-card-title" />
            발주 추천
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm">AI 기반 재고 분석으로 자동으로 발주를 추천합니다.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert className="alert-info">
            <AlertCircle className="alert-icon" />
            <AlertDescription className="alert-text">
              우선순위가 높은 상품을 우선적으로 발주하세요. 최근 사용량을 분석하여 발주하는 것이 효율적입니다.
            </AlertDescription>
          </Alert>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="stat-card stat-card-red">
              <p className="stat-label">높음 발주</p>
              <p className="stat-value-red">
                {recommendations.filter(r => r.priority === 'high').length}개
              </p>
            </div>
            <div className="stat-card stat-card-yellow">
              <p className="stat-label">보통 발주</p>
              <p className="stat-value-yellow">
                {recommendations.filter(r => r.priority === 'medium').length}개
              </p>
            </div>
            <div className="stat-card stat-card-gray">
              <p className="stat-label">선택 개수</p>
              <p className="stat-value-gray">{selectedItems.length}개</p>
            </div>
            <div className="stat-card stat-card-green">
              <p className="stat-label">예상 비용</p>
              <p className="stat-value-green">{totalCost.toLocaleString()}원</p>
            </div>
          </div>

          {/* Recommendations Table */}
          <div className="table-container">
            <Table>
              <TableHeader>
                <TableRow className="table-header-row">
                  <TableHead className="w-12 text-center"></TableHead>
                  <TableHead className="text-center">상품명</TableHead>
                  <TableHead className="text-center">현재 재고</TableHead>
                  <TableHead className="text-center">평균 사용</TableHead>
                  <TableHead className="text-center">추천 발주</TableHead>
                  <TableHead className="text-center">예상 비용</TableHead>
                  <TableHead className="text-center">우선순위</TableHead>
                  <TableHead className="text-center">예상 소진</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="loading-container">
                      <Loader2 className="loading-spinner" />
                      <p className="loading-text">발주 추천 목록 로딩 중...</p>
                    </TableCell>
                  </TableRow>
                ) : recommendations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="empty-state">
                      발주 추천 목록이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  recommendations.map((item) => {
                    const daysLeft = item.days_until_out_of_stock;
                    return (
                      <TableRow
                        key={item.id}
                        className={`table-row-selectable ${
                          selectedItems.includes(item.id) ? 'table-row-selected' : ''
                        }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItem(item.id)}
                            className="checkbox-custom"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell className="text-center">{item.name}</TableCell>
                        <TableCell className="text-center">
                          {item.current_stock} {item.unit}
                        </TableCell>
                        <TableCell className="text-muted text-center">
                          {item.avg_daily} {item.unit}/일
                        </TableCell>
                        <TableCell className="text-primary text-center">
                          {item.recommended_qty} {item.unit}
                        </TableCell>
                        <TableCell className="text-center">{item.estimated_cost.toLocaleString()}원</TableCell>
                        <TableCell className="text-center">{getPriorityBadge(item.priority)}</TableCell>
                        <TableCell className="text-center">
                          <span className={daysLeft <= 2 ? 'text-danger' : 'text-muted'}>
                            약 {daysLeft}일
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setSelectedItems([])}
              disabled={selectedItems.length === 0}
            >
              선택 해제
            </Button>
            <Button
              className="btn-action"
              onClick={handleOrderAll}
              disabled={selectedItems.length === 0 || ordering}
            >
              {ordering ? (
                <>
                  <Loader2 className="icon-spinner" />
                  발주 중...
                </>
              ) : (
                <>
                  <ShoppingCart className="icon-button" />
                  발주 진행 ({selectedItems.length}개)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="card-standard">
        <CardHeader>
          <CardTitle className="card-title-primary">
            <CheckCircle className="icon-card-title" />
            발주 팁
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="tips-list">
            <li className="tips-item">
              <span className="tips-bullet">•</span>
              <span>발주 추천 상품 중 2-3개를 선택하여 발주하는 것이 효율적입니다.</span>
            </li>
            <li className="tips-item">
              <span className="tips-bullet">•</span>
              <span>과거 이력과 계절성을 분석하여 인기제품을 발주하는 방식이 효율적입니다.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
