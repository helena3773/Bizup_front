import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Search, Edit2, Loader2, Trash2, RefreshCw, Pause, Play } from 'lucide-react';
import { inventoryApi, InventoryItem, InventoryStats } from '../lib/api';
import { toast } from 'sonner';
import { TabNavigation } from './TabNavigation';

interface InventoryTabProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function InventoryTab({ activeTab = 'inventory', onTabChange }: InventoryTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true); // 자동 새로고침 활성화
  const refreshInterval = 5000; // 5초마다 새로고침
  const [needsSetup, setNeedsSetup] = useState(false);
  const [autoRefreshLocked, setAutoRefreshLocked] = useState(false);

  const sanitizedCategories = inventory
    .map((i) => i.category)
    .filter((category) => category && category !== '-');
  const inventoryCategories = Array.from(new Set(sanitizedCategories)).sort();
  const [maxCategoryWidth, setMaxCategoryWidth] = useState<number>(180); // fallback width

  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    minQuantity: '',
    price: '',
  });

  const [editItem, setEditItem] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    minQuantity: '',
    price: '',
  });

  // 재고 목록 로딩
  useEffect(() => {
    loadInventory();
    loadStats();
  }, []);

  // 실시간 재고 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // 조용히 새로고침 (로딩 표시 없이)
      loadInventorySilently();
      loadStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // 조용한 새로고침 (로딩 표시 없이)
  const loadInventorySilently = async () => {
    try {
      const previousInventory = inventory;
      // searchQuery가 빈 문자열이거나 공백만 있으면 undefined로 전달
      const search = searchQuery?.trim() || undefined;
      const data = await inventoryApi.getAll(search);

      const requiresSetup = handleSetupGuard(data);

      if (!requiresSetup && previousInventory.length > 0) {
        data.forEach((newItem) => {
          const oldItem = previousInventory.find((item) => item.id === newItem.id);
          if (oldItem) {
            if (newItem.quantity < oldItem.quantity) {
              if (oldItem.quantity > oldItem.min_quantity && newItem.quantity <= newItem.min_quantity) {
                toast.warning(`${newItem.name} 재고가 부족합니다! (${newItem.quantity}${newItem.unit} 남음)`);
              }
              if (oldItem.quantity > 0 && newItem.quantity === 0) {
                toast.error(`${newItem.name} 재고가 품절되었습니다!`);
              }
            }
          }
        });
      }
      
      setInventory(data);
    } catch (error) {
      console.error('재고 목록 자동 새로고침 오류:', error);
      // 조용한 새로고침이므로 에러 토스트는 표시하지 않음
    }
  };

  // 검색어 변경 시 재고 목록 다시 로딩 (디바운싱)
  useEffect(() => {
    if (searchQuery === undefined) return;
    
    const timeoutId = setTimeout(() => {
      loadInventory();
    }, 300); // 300ms 디바운싱
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // 다이얼로그 열림 시 폼 데이터 초기화
  useEffect(() => {
    if (!isDialogOpen) {
      setNewItem({ name: '', category: '', quantity: '', unit: '', minQuantity: '', price: '' });
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (!isEditDialogOpen && editingItemId === null) {
      setEditItem({ name: '', category: '', quantity: '', unit: '', minQuantity: '', price: '' });
    }
  }, [isEditDialogOpen, editingItemId]);

  // useEffect로 외부 클릭 이벤트 핸들러 추가
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (showCategoryDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCategoryDropdown]);

  // useEffect로 가장 긴 카테고리 width 재기
  useEffect(() => {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return;
    ctx.font = '20px Noto Sans KR, sans-serif';
    const testItems = [
      '전체 카테고리',
      ...inventoryCategories,
    ];
    const maxW = testItems.reduce((prev, txt) => Math.max(prev, ctx.measureText(txt).width), 0);
    setMaxCategoryWidth(Math.ceil(maxW) + 48); // 좌우 padding 여유 48px
  }, [inventoryCategories.length, inventoryCategories.join(',')]);

  // 선택된 카테고리가 목록에서 사라지면 초기화
  useEffect(() => {
    if (selectedInventoryCategory && !inventoryCategories.includes(selectedInventoryCategory)) {
      setSelectedInventoryCategory('');
    }
  }, [inventoryCategories.join(','), selectedInventoryCategory]);

  const isPlaceholderItem = (item: InventoryItem) =>
    item.category === '-' ||
    item.unit === '-' ||
    (item.quantity === 0 && item.min_quantity === 0 && item.price === 0);

  const handleSetupGuard = (items: InventoryItem[]) => {
    const requiresSetup = items.some(isPlaceholderItem);
    setNeedsSetup(requiresSetup);

    if (requiresSetup) {
      if (autoRefresh) {
        setAutoRefresh(false);
      }
      if (!autoRefreshLocked) {
        setAutoRefreshLocked(true);
      }
    } else {
      if (autoRefreshLocked) {
        setAutoRefresh(true);
        setAutoRefreshLocked(false);
        toast.success('모든 항목이 초기화되었어요. 실시간 재고 반영을 시작합니다.');
      }
    }

    return requiresSetup;
  };

  const loadInventory = async (forceSearchQuery?: string) => {
    try {
      setLoading(true);
      // forceSearchQuery가 제공되면 사용, 아니면 현재 searchQuery 사용
      const search = forceSearchQuery !== undefined 
        ? (forceSearchQuery.trim() || undefined)
        : (searchQuery?.trim() || undefined);
      const data = await inventoryApi.getAll(search);
      console.log('재고 목록 로드됨:', data.length, '개', search ? `(검색: "${search}")` : '(전체)');
      console.log('재고 항목들:', data.map(item => `${item.name} (${item.category})`).slice(0, 10));
      handleSetupGuard(data);
      setInventory(data);
    } catch (error) {
      console.error('재고 목록 로딩 오류:', error);
      toast.error('재고 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await inventoryApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('재고 통계 로딩 오류:', error);
    }
  };

  // 상품명/카테고리/카테고리필터 동시 적용 필터 (useMemo로 최적화)
  const filteredInventory = useMemo(() => {
    const result = inventory.filter(
      (item) => {
        // 검색어가 없거나 공백만 있으면 검색 필터 통과
        const searchTerm = (searchQuery || '').trim().toLowerCase();
        const matchesSearch = !searchTerm || 
          item.name.toLowerCase().includes(searchTerm) ||
          (item.category || '').toLowerCase().includes(searchTerm);
        
        // 카테고리 필터: 선택된 카테고리가 없으면 모두 통과
        const matchesCategory = !selectedInventoryCategory || item.category === selectedInventoryCategory;
        
        return matchesSearch && matchesCategory;
      }
    );
    console.log('필터링 결과:', {
      total: inventory.length,
      filtered: result.length,
      searchQuery,
      selectedCategory: selectedInventoryCategory,
      items: result.map(i => i.name)
    });
    return result;
  }, [inventory, searchQuery, selectedInventoryCategory]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.category) {
      toast.error('필수 정보를 입력하고 다시 시도해 주세요.');
      return;
    }

    try {
      setAdding(true);
      await inventoryApi.create({
        name: newItem.name,
        category: newItem.category,
        quantity: parseInt(newItem.quantity) || 0,
        unit: newItem.unit || '',
        min_quantity: parseInt(newItem.minQuantity) || 0,
        price: parseInt(newItem.price) || 0,
      });
      toast.success('새 재고를 추가했어요.');
      setNewItem({ name: '', category: '', quantity: '', unit: '', minQuantity: '', price: '' });
      setIsDialogOpen(false);
      loadInventory();
      loadStats();
    } catch (error) {
      console.error('재고 추가 오류:', error);
      toast.error('재고를 추가하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setAdding(false);
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setEditItem({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit || '',
      minQuantity: item.min_quantity.toString(),
      price: item.price.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItemId) return;
    if (!editItem.name || !editItem.category) {
      toast.error('필수 정보를 입력하고 다시 시도해 주세요.');
      return;
    }

    try {
      setEditing(true);
      // 자동 새로고침 잠시 중지 (수정 중 덮어쓰기 방지)
      const wasAutoRefresh = autoRefresh;
      if (wasAutoRefresh) {
        setAutoRefresh(false);
      }
      
      // API 호출
      const updatedItem = await inventoryApi.update(editingItemId, {
        name: editItem.name,
        category: editItem.category,
        quantity: parseFloat(editItem.quantity) || 0,
        unit: editItem.unit || '',
        min_quantity: parseFloat(editItem.minQuantity) || 0,
        price: parseFloat(editItem.price) || 0,
      });
      
      console.log('수정된 항목:', updatedItem);
      
      toast.success('재고 정보를 업데이트했어요.');
      setIsEditDialogOpen(false);
      setEditingItemId(null);
      setEditItem({ name: '', category: '', quantity: '', unit: '', minQuantity: '', price: '' });
      
      // 검색어와 필터 강제 초기화 (수정된 항목이 보이도록)
      setSearchQuery('');
      setSelectedInventoryCategory('');
      
      // 통계 새로고침
      await loadStats();
      
      // loadInventory를 강제로 빈 검색어로 호출하여 전체 목록 로드
      await loadInventory('');
      
      // 자동 새로고침 복구
      if (wasAutoRefresh && !autoRefreshLocked) {
        setTimeout(() => {
          setAutoRefresh(true);
        }, 1000); // 1초 후 복구
      }
    } catch (error) {
      console.error('재고 수정 오류:', error);
      toast.error('재고 정보를 수정하지 못했어요. 잠시 후 다시 시도해 주세요.');
      // 에러 발생 시 전체 목록 다시 로드
      await loadInventory();
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('이 재고를 삭제할까요?')) {
      return;
    }

    try {
      await inventoryApi.delete(id);
      toast.success('재고를 삭제했어요.');
      loadInventory();
      loadStats();
    } catch (error) {
      console.error('재고 항목 삭제 오류:', error);
      toast.error('재고를 삭제하지 못했어요. 다시 시도해 주세요.');
    }
  };

  return (
    <>
      <div 
        id="inventory-tab"
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
        {onTabChange && <TabNavigation activeTab={activeTab} onTabChange={onTabChange} tabId="inventory-tab" />}
        <div className="container mx-auto px-6 max-w-7xl flex flex-col" style={{ minHeight: 'calc(100vh - 3rem)', paddingTop: '1.5rem' }} >
        <div style={{ marginBottom: '45px' }}>
          <h2 className="text-2xl font-medium text-gray-900" style={{ fontSize: '36px', marginLeft: '5px', marginTop: '6.5px' }}>재고 현황</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 flex-1" style={{ minHeight: 'calc(100vh - 200px)', marginTop: '2px' }}>
        {/* Description */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-gray-600" style={{ fontSize: '17px', marginLeft: '6px', marginTop: '4px' }}>
                {needsSetup ? (
                  <>
                    처음 등록할 때는 카테고리, 수량, 단위, 가격을 입력해주세요.
                    <br />
                    입력이 끝나면 재고가 자동으로 반영돼요.
                    </>
                ) : autoRefreshLocked ? (
                  <>
                    필수 정보를 입력할 때까지 실시간 업데이트가 잠시 멈춰 있어요.
                  </>
                ) : autoRefresh ? (
                  <>
                    실시간 업데이트 중... ({refreshInterval / 1000}초마다)
                  </>
                ) : (
                  <>
                    재고를 관리하고 실시간으로 업데이트할 수 있어요.
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  if (autoRefreshLocked) {
                    toast.info('초기화를 먼저 완료해 주세요!');
                    return;
                  }
                  setAutoRefresh(!autoRefresh);
                  if (!autoRefresh) {
                    loadInventory();
                    loadStats();
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors border"
                style={{ 
                  backgroundColor: autoRefresh ? '#f0f9ff' : '#ffffff',
                  borderColor: autoRefresh ? '#3182f6' : '#e5e7eb',
                  color: autoRefresh ? '#3182f6' : '#6b7280',
                  fontSize: '14px'
                }}
                title={
                  autoRefreshLocked
                    ? '필수 정보를 입력하면 자동으로 재개돼요.'
                    : autoRefresh
                      ? '자동 새로고침 중지'
                      : '자동 새로고침 시작'
                }
              >
                {autoRefresh ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>일시정지</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>시작</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  loadInventory();
                  loadStats();
                  toast.success('재고를 새로고침했습니다.');
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors border border-gray-300 hover:bg-gray-50"
                style={{ fontSize: '14px' }}
                title="지금 새로고침"
              >
                <RefreshCw className="w-4 h-4" />
                <span>새로고침</span>
              </button>
              <button
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center justify-center gap-3 text-white rounded-full transition-colors"
                style={{ backgroundColor: '#3182f6', fontSize: '18px', padding: '14px 28px', fontWeight: 600 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3182f6';
                }}
              >
                <Plus className="w-6 h-6" />
                재고 추가
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 p-6 border-b border-gray-100">
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">전체 재고</p>
            <p className="text-[20px] text-gray-900 font-medium">
              {stats?.total_items ?? inventory.length}개
            </p>
          </div>
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">재고 부족</p>
            <p className="text-[20px] text-gray-900 font-medium">
              {stats?.low_stock_count ??
                inventory.filter(
                  (item) => item.quantity <= item.min_quantity && item.quantity > 0
                ).length}개
            </p>
          </div>
          <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-500 mb-1">품절 상품</p>
            <p className="text-[20px] text-gray-900 font-medium">
              {stats?.out_of_stock_count ??
                inventory.filter((item) => item.quantity === 0).length}개
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute" strokeWidth={1.5} style={{ top: '50%', left: '19px', transform: 'translateY(-50%)', position: 'absolute' }} />
              <Input
                type="text"
                placeholder="상품명 또는 카테고리를 검색해 주세요."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border-gray-300 bg-white placeholder:text-[#0a0a0a]"
                style={{ height: '60px', fontSize: '20px', color: '#0a0a0a', paddingLeft: '63px' }}
              />
            </div>
            <div className="sm:w-48" style={{ position: 'relative', width: maxCategoryWidth }} ref={dropdownRef}>
              <button
                type="button"
                aria-label="카테고리 선택"
                className="flex items-center justify-between w-full h-[60px] px-4 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-100"
                style={{ fontSize: '16px', lineHeight: '59px', paddingTop: 0, paddingBottom: 0, paddingRight: '32px', color: '#0a0a0a', width: maxCategoryWidth, whiteSpace: 'nowrap' }}
                onClick={() => setShowCategoryDropdown(v => !v)}
              >
                <span style={{ color: '#0a0a0a', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  {selectedInventoryCategory === '' ? '전체 카테고리' : selectedInventoryCategory}
                </span>
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth={2.2}
                  style={{ marginLeft: '4px', width: 18, height: 18 }}
                  focusable="false"
                  aria-hidden="true"
                >
                  <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showCategoryDropdown && (
                <ul style={{
                  position: 'absolute',
                  zIndex: 30,
                  width: maxCategoryWidth,
                  marginTop: '3px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 24px 4px #00000011',
                  background: '#fff',
                  border: '1px solid #ecf0f1',
                  maxHeight: 290,
                  overflowY: 'auto',
                  padding: '7px 0'
                }}>
                  <li
                    style={{
                      color: '#0a0a0a',
                      fontSize: '16px',
                      padding: '13px 19px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      background: selectedInventoryCategory === '' ? '#f1f7ff' : 'transparent',
                      fontWeight: selectedInventoryCategory === '' ? 600 : 400
                    }}
                    onClick={() => { setSelectedInventoryCategory(''); setShowCategoryDropdown(false); }}
                  >
                    전체 카테고리
                  </li>
                  {inventoryCategories.map((category) => (
                    <li
                      key={category}
                      style={{
                        padding: '13px 19px',
                        fontSize: 16,
                        color: '#363a49',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        background: selectedInventoryCategory === category ? '#f1f7ff' : 'transparent',
                        fontWeight: selectedInventoryCategory === category ? 600 : 400
                      }}
                      onClick={() => { setSelectedInventoryCategory(category); setShowCategoryDropdown(false); }}
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>


        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#3182F6]" />
              <p className="text-gray-600 mt-2 text-[15px]">재고 목록을 불러오는 중이에요…</p>
            </div>
          ) : (
            <table className="w-full" key={`inventory-table-${inventory.length}-${filteredInventory.length}`}>
              <thead>
                <tr className="border-b border-gray-100" style={{ height: '50px' }}>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    상품명
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    카테고리
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    현재 재고
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    최소 재고
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    가격
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    상태
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    마지막 업데이트
                  </th>
                  <th className="text-center px-6 text-gray-600 font-medium whitespace-nowrap text-[19px] md:text-[16px] lg:text-[19px]">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => {
                    const isOutOfStock = item.quantity === 0;
                    const isLowStock = item.quantity > 0 && item.quantity < item.min_quantity;
                    const placeholderItem = isPlaceholderItem(item);
                    let status = '충분';
                    let statusVariant: 'default' | 'secondary' | 'destructive' = 'secondary';
                    let statusClassName = '';
                    if (placeholderItem) {
                      status = '초기화 필요';
                      statusVariant = 'secondary';
                      statusClassName = 'text-sky-700 bg-sky-50 text-[11px]';
                    } else if (isOutOfStock) {
                      status = '품절';
                      statusVariant = 'destructive';
                      statusClassName = 'text-red-600 bg-red-50 text-[12px] font-semibold';
                    } else if (isLowStock) {
                      status = '부족';
                      statusVariant = 'default';
                      statusClassName = 'text-orange-600 bg-orange-50 text-[12px] font-semibold';
                    } else {
                      statusVariant = 'secondary';
                      statusClassName = 'text-green-600 bg-green-50 text-[12px] font-semibold';
                    }

                    const displayCategory = item.category === '-' ? '-' : item.category || '-';
                    const displayQuantity = placeholderItem
                      ? '-'
                      : `${item.quantity}${item.unit ? ` ${item.unit}` : ''}`;
                    const displayMinQuantity = placeholderItem
                      ? '-'
                      : `${item.min_quantity}${item.unit ? ` ${item.unit}` : ''}`;
                    const displayPrice = placeholderItem ? '-' : `₩${item.price.toLocaleString()}`;

                    return (
                      <tr
                        key={item.id}
                        data-item-id={item.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-center text-[15px]" style={{ color: '#4a5565' }}>{item.name}</td>
                        <td className="px-6 py-4 text-center text-[15px]" style={{ color: '#4a5565' }}>{displayCategory}</td>
                        <td className="px-6 py-4 text-center text-[15px]" style={{ color: '#4a5565' }}>
                          {displayQuantity}
                        </td>
                        <td className="px-6 py-4 text-center text-[15px]" style={{ color: '#4a5565' }}>
                          {displayMinQuantity}
                        </td>
                        <td className="px-6 py-4 text-center text-[15px]" style={{ color: '#4a5565' }}>
                          {displayPrice}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={statusVariant} className={statusClassName}>
                            {status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center text-[15px]" style={{ color: '#4a5565' }}>
                          {item.last_updated}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-[16px] h-[16px]" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-[16px] h-[16px]" strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 text-center" style={{ paddingTop: '120px', paddingBottom: '120px' }}>
                      <p className="text-[15px] text-gray-400">등록된 재고가 아직 없어요.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      </div>

      {/* Add Inventory Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[22px] font-medium">재고 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[14px] text-gray-600">제품명</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="예: 우유"
                required
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-[14px] text-gray-600">카테고리</Label>
              <Input
                id="category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="예: 필수 재료"
                required
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-[14px] text-gray-600">현재 재고</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  placeholder="0"
                  required
                  min="0"
                  className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minQuantity" className="text-[14px] text-gray-600">최소 재고</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={newItem.minQuantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, minQuantity: e.target.value })
                  }
                  placeholder="0"
                  required
                  min="0"
                  className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-[14px] text-gray-600">재고단위</Label>
              <Input
                id="unit"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                placeholder="예: 개, 박스, kg"
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className="text-[14px] text-gray-600">가격 (₩)</Label>
              <Input
                id="price"
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="0"
                required
                min="0"
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 h-11 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-[15px]"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={adding}
                className="flex-1 h-11 px-4 bg-[#93C5FD] text-gray-600 rounded-lg hover:bg-[#7CB5FC] transition-colors text-[15px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                    추가 중...
                  </>
                ) : (
                  '추가'
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Inventory Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-[22px] font-medium">재고 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateItem} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="editName" className="text-[14px] text-gray-600">제품명</Label>
              <Input
                id="editName"
                value={editItem.name}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                placeholder="예: 우유"
                required
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editCategory" className="text-[14px] text-gray-600">카테고리</Label>
              <Input
                id="editCategory"
                value={editItem.category}
                onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                placeholder="예: 필수 재료"
                required
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editQuantity" className="text-[14px] text-gray-600">현재 재고</Label>
                <Input
                  id="editQuantity"
                  type="number"
                  value={editItem.quantity}
                  onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })}
                  placeholder="0"
                  required
                  min="0"
                  className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editMinQuantity" className="text-[14px] text-gray-600">최소 재고</Label>
                <Input
                  id="editMinQuantity"
                  type="number"
                  value={editItem.minQuantity}
                  onChange={(e) =>
                    setEditItem({ ...editItem, minQuantity: e.target.value })
                  }
                  placeholder="0"
                  required
                  min="0"
                  className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editUnit" className="text-[14px] text-gray-600">재고단위</Label>
              <Input
                id="editUnit"
                value={editItem.unit}
                onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                placeholder="예: 개, 박스, kg"
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPrice" className="text-[14px] text-gray-600">가격 (₩)</Label>
              <Input
                id="editPrice"
                type="number"
                value={editItem.price}
                onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                placeholder="0"
                required
                min="0"
                className="h-11 rounded-lg border-gray-200 bg-gray-50 text-[15px]"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 h-11 px-4 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-[15px]"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={editing}
                className="flex-1 h-11 px-4 bg-[#93C5FD] text-gray-600 rounded-lg hover:bg-[#7CB5FC] transition-colors text-[15px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {editing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                    수정 중...
                  </>
                ) : (
                  '수정'
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
