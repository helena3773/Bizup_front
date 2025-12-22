import { useState, useEffect, FormEvent } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Package, TrendingUp, AlertTriangle, Settings, Utensils, Lock, User } from 'lucide-react';
import { InventoryTab } from './components/InventoryTab';
import { OrderRecommendationTab } from './components/OrderRecommendationTab';
import { OutOfStockTab } from './components/OutOfStockTab';
import { SettingsTab } from './components/SettingsTab';
import { MenuTab } from './components/MenuTab';
import { Toaster } from './components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { toast } from 'sonner';
import { authApi } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  // 초기 마운트 시 localStorage에서 토큰 확인하여 로그인 상태 복원
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('bizup_access_token');
      if (token) {
        setIsAuthenticated(true);
      }
      window.scrollTo(0, 0);
    }
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoginLoading(true);
      const res = await authApi.login({ username, password });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('bizup_access_token', res.access_token);
        window.localStorage.setItem('bizup_username', res.username);
      }

      toast.success('로그인에 성공했어요.');
      setIsAuthenticated(true);
      setLoginDialogOpen(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error(error);
      toast.error('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!registerUsername || !registerPassword) {
      toast.error('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setRegisterLoading(true);
      const res = await authApi.register({
        username: registerUsername,
        password: registerPassword,
        email: registerEmail || undefined,
      });

      toast.success(res.message);
      setRegisterDialogOpen(false);
      setRegisterUsername('');
      setRegisterPassword('');
      setRegisterEmail('');
      // 회원가입 후 로그인 다이얼로그 열기
      setLoginDialogOpen(true);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || '회원가입에 실패했습니다.';
      toast.error(errorMessage);
    } finally {
      setRegisterLoading(false);
    }
  };

  // 탭 변경 처리
  const handleTabChange = (tab: string, source: 'main' | 'nav' = 'main') => {
    // 로그인하지 않았으면 탭 변경 불가 (안내 화면 표시)
    if (!isAuthenticated) {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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
                    value="menu" 
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: isAuthenticated ? '#3182f6' : '#94a3b8',
                      backgroundColor: isAuthenticated ? '#eff6ff' : '#f1f5f9',
                      cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                      opacity: isAuthenticated ? 1 : 0.6
                    }}
                    onMouseEnter={(e) => {
                      if (isAuthenticated) {
                        e.currentTarget.style.backgroundColor = '#3182f6';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isAuthenticated) {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.color = '#3182f6';
                      }
                    }}
                  >
                    <Utensils className="w-5 h-5" />
                    <span className="hidden sm:inline">메뉴 관리</span>
                    <span className="sm:hidden">메뉴</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="inventory" 
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: isAuthenticated ? '#3182f6' : '#94a3b8',
                      backgroundColor: isAuthenticated ? '#eff6ff' : '#f1f5f9',
                      cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                      opacity: isAuthenticated ? 1 : 0.6
                    }}
                    onMouseEnter={(e) => {
                      if (isAuthenticated) {
                        e.currentTarget.style.backgroundColor = '#3182f6';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isAuthenticated) {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.color = '#3182f6';
                      }
                    }}
                  >
                    <Package className="w-5 h-5" />
                    <span className="hidden sm:inline">재고 관리</span>
                    <span className="sm:hidden">재고</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="order" 
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: isAuthenticated ? '#3182f6' : '#94a3b8',
                      backgroundColor: isAuthenticated ? '#eff6ff' : '#f1f5f9',
                      cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                      opacity: isAuthenticated ? 1 : 0.6
                    }}
                    onMouseEnter={(e) => {
                      if (isAuthenticated) {
                        e.currentTarget.style.backgroundColor = '#3182f6';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isAuthenticated) {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.color = '#3182f6';
                      }
                    }}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span className="hidden sm:inline">발주 사이트</span>
                    <span className="sm:hidden">발주</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="outofstock" 
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium"
                    style={{
                      fontSize: '20px',
                      fontWeight: 600,
                      color: isAuthenticated ? '#3182f6' : '#94a3b8',
                      backgroundColor: isAuthenticated ? '#eff6ff' : '#f1f5f9',
                      cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                      opacity: isAuthenticated ? 1 : 0.6
                    }}
                    onMouseEnter={(e) => {
                      if (isAuthenticated) {
                        e.currentTarget.style.backgroundColor = '#3182f6';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isAuthenticated) {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.color = '#3182f6';
                      }
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
                      color: isAuthenticated ? '#3182f6' : '#94a3b8',
                      backgroundColor: isAuthenticated ? '#eff6ff' : '#f1f5f9',
                      cursor: isAuthenticated ? 'pointer' : 'not-allowed',
                      opacity: isAuthenticated ? 1 : 0.6
                    }}
                    onMouseEnter={(e) => {
                      if (isAuthenticated) {
                        e.currentTarget.style.backgroundColor = '#3182f6';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isAuthenticated) {
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                        e.currentTarget.style.color = '#3182f6';
                      }
                    }}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="hidden sm:inline">설정</span>
                    <span className="sm:hidden">설정</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* 로그인/회원가입 버튼 - 메뉴 관리 탭 아래 */}
              {isAuthenticated ? (
                /* 로그인 후: 로그아웃 버튼만 중앙에 표시 */
                <div className="w-full" style={{ marginTop: 'calc(1rem + 25px)' }}>
                  <div className="flex justify-center items-center mx-auto" style={{ width: 'fit-content' }}>
                    <Button
                      onClick={() => {
                        // 로그아웃
                        if (typeof window !== 'undefined') {
                          window.localStorage.removeItem('bizup_access_token');
                          window.localStorage.removeItem('bizup_username');
                        }
                        setIsAuthenticated(false);
                        setActiveTab(null);
                        toast.success('로그아웃되었습니다.');
                      }}
                      className="flex items-center justify-center gap-2 rounded-full transition-all duration-200"
                      style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        backgroundColor: '#f2f4f7',
                        color: '#646d7a',
                        paddingLeft: 'calc(1rem * 3)',
                        paddingRight: 'calc(1rem * 3)',
                        paddingTop: 'calc(0.5rem * 3)',
                        paddingBottom: 'calc(0.5rem * 3)',
                        minWidth: '140px',
                        width: '140px',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e2e8f0';
                        e.currentTarget.style.color = '#475569';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f2f4f7';
                        e.currentTarget.style.color = '#646d7a';
                      }}
                    >
                      로그아웃
                    </Button>
                  </div>
                </div>
              ) : (
                /* 로그인 전: 로그인과 회원가입 버튼 나란히 표시 */
                <div className="flex justify-center items-center" style={{ marginTop: 'calc(1rem + 25px)', gap: '20px' }}>
                  <Button
                    onClick={() => {
                      // 로그인 다이얼로그 열기
                      setLoginDialogOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-full transition-all duration-200"
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      backgroundColor: '#3182f6',
                      color: 'white',
                      paddingLeft: 'calc(1rem * 3)',
                      paddingRight: 'calc(1rem * 3)',
                      paddingTop: 'calc(0.5rem * 3)',
                      paddingBottom: 'calc(0.5rem * 3)',
                      minWidth: '140px',
                      width: '140px',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#3182f6';
                      e.currentTarget.style.color = 'white';
                    }}
                  >
                    로그인
                  </Button>
                  <Button
                    onClick={() => {
                      setRegisterDialogOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-full transition-all duration-200"
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      backgroundColor: '#646d7a',
                      color: 'white',
                      paddingLeft: 'calc(1rem * 3)',
                      paddingRight: 'calc(1rem * 3)',
                      paddingTop: 'calc(0.5rem * 3)',
                      paddingBottom: 'calc(0.5rem * 3)',
                      minWidth: '140px',
                      width: '140px',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#475569';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#646d7a';
                      e.currentTarget.style.color = 'white';
                    }}
                  >
                    회원가입
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : !isAuthenticated && activeTab ? (
        /* 로그인하지 않았을 때 안내 화면 */
        <div 
          id="gray-section"
          className="bg-[#f3f5f7] min-h-screen"
          style={{
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          <div className="flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
            <div className="container mx-auto px-6 max-w-7xl text-center">
              <div className="mb-8">
                <h2 className="text-gray-900 font-medium mb-4" style={{ fontSize: '32px' }}>
                  로그인하고 이용해보세요
                </h2>
                <p className="text-gray-600 mb-8" style={{ fontSize: '18px' }}>
                  재고 관리부터 발주까지, 모든 기능은 로그인 후 사용할 수 있어요
                </p>
              </div>
              
              <div className="flex justify-center items-center gap-4">
                <Button
                  onClick={() => setLoginDialogOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-full transition-all duration-200"
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    backgroundColor: '#3182f6',
                    color: 'white',
                    paddingLeft: 'calc(1rem * 3)',
                    paddingRight: 'calc(1rem * 3)',
                    paddingTop: 'calc(0.5rem * 3)',
                    paddingBottom: 'calc(0.5rem * 3)',
                    minWidth: '140px',
                    width: '140px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#3182f6';
                    e.currentTarget.style.color = 'white';
                  }}
                >
                  로그인
                </Button>
                <Button
                  onClick={() => setRegisterDialogOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-full transition-all duration-200"
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    backgroundColor: '#646d7a',
                    color: 'white',
                    paddingLeft: 'calc(1rem * 3)',
                    paddingRight: 'calc(1rem * 3)',
                    paddingTop: 'calc(0.5rem * 3)',
                    paddingBottom: 'calc(0.5rem * 3)',
                    minWidth: '140px',
                    width: '140px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#475569';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#646d7a';
                    e.currentTarget.style.color = 'white';
                  }}
                >
                  회원가입
                </Button>
              </div>
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

      {/* 로그인 다이얼로그 */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#f2f4f7] text-[#3182f6]">
                <User className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-900">로그인</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleLogin} className="mt-3">
            <div>
              <Label htmlFor="username" className="text-xs text-slate-600 block mb-1">
                아이디
              </Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요."
                className="h-10 text-sm mb-1"
              />
              <br/>
              <Label htmlFor="password" className="text-xs text-slate-600 block mb-1">
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="h-10 text-sm"
              />
            </div>
            <br/>
            <div className="flex gap-3" style={{ marginTop: '20px' }}>
              <Button
                type="button"
                onClick={() => {
                  setLoginDialogOpen(false);
                  setUsername('');
                  setPassword('');
                }}
                className="flex-1 h-10 text-sm font-medium"
                variant="outline"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10 text-sm font-medium"
                disabled={loginLoading}
              >
                {loginLoading ? '로그인 중...' : '로그인'}
              </Button>
            </div>
          </form>

          <p className="mt-4 text-[11px] text-center text-slate-400">
            이 로그인은 데모 용도이며<br />
            실제 서비스에서는 별도의 계정 및 보안 설정이 필요합니다.
          </p>
        </DialogContent>
      </Dialog>

      {/* 회원가입 다이얼로그 */}
      <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#f2f4f7] text-[#3182f6]">
                <User className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-900">회원가입</DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handleRegister} className="mt-3">
            <div>
              <Label htmlFor="register-username" className="text-xs text-slate-600 block mb-1">
                아이디
              </Label>
              <Input
                id="register-username"
                type="text"
                autoComplete="username"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="h-10 text-sm mb-1"
              />
              <br/>
              <Label htmlFor="register-password" className="text-xs text-slate-600 block mb-1">
                비밀번호
              </Label>
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="h-10 text-sm mb-1"
              />
              <br/>
              <Label htmlFor="register-email" className="text-xs text-slate-600 block mb-1">
                이메일 (선택)
              </Label>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="이메일을 입력하세요 (선택사항)"
                className="h-10 text-sm"
              />
            </div>
            <br/>
            <div className="flex gap-3" style={{ marginTop: '20px' }}>
              <Button
                type="button"
                onClick={() => {
                  setRegisterDialogOpen(false);
                  setRegisterUsername('');
                  setRegisterPassword('');
                  setRegisterEmail('');
                }}
                className="flex-1 h-10 text-sm font-medium"
                variant="outline"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10 text-sm font-medium"
                disabled={registerLoading}
              >
                {registerLoading ? '가입 중...' : '회원가입'}
              </Button>
            </div>
          </form>

          <p className="mt-4 text-[11px] text-center text-slate-400">
            이미 계정이 있으신가요?{' '}
            <button
              type="button"
              onClick={() => {
                setRegisterDialogOpen(false);
                setLoginDialogOpen(true);
              }}
              className="text-[#3182f6] hover:underline"
            >
              로그인
            </button>
          </p>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  );
}
