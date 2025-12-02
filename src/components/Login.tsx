import { FormEvent, useState } from 'react';
import { Lock, User } from 'lucide-react';
import { toast } from 'sonner';

import { authApi } from '../lib/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Toaster } from './ui/sonner';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login({ username, password });

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('bizup_access_token', res.access_token);
        window.localStorage.setItem('bizup_username', res.username);
      }

      toast.success('로그인에 성공했어요.');
      onLoginSuccess();
    } catch (error) {
      console.error(error);
      toast.error('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 md:gap-16">
        {/* 왼쪽: 소개 영역 (메인 랜딩과 톤 맞추기) */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="inline-flex items-center justify-center md:justify-start gap-2 px-3 py-1 rounded-full bg-[#eff6ff] text-[#3182f6] text-xs font-medium mb-2">
            <Lock className="w-3 h-3" />
            <span>사장님 전용 로그인</span>
          </div>
          <h1 className="text-gray-900 font-medium mb-2" style={{ fontSize: '32px' }}>
            Bizup 으로 가게 운영을 한 번에 챙겨요
          </h1>
          <p className="text-[#646d7a]" style={{ fontSize: '18px', fontWeight: 500 }}>
            로그인하고 재고부터 발주까지 한 화면에서 관리해보세요.
          </p>
          <ul className="mt-4 space-y-1 text-sm text-slate-500">
            <li>• 재고 부족 품목을 한눈에 확인</li>
            <li>• 발주 추천으로 적정 재고 유지</li>
            <li>• 품절 위험을 미리 알림</li>
          </ul>
        </div>

        {/* 오른쪽: 로그인 카드 */}
        <div className="flex-1 max-w-md w-full">
          <div className="border border-slate-200 rounded-2xl shadow-sm px-7 py-8 bg-white">
            <div className="mb-6 text-center md:text-left space-y-1">
              <div className="inline-flex items-center justify-center md:justify-start w-10 h-10 rounded-xl bg-[#f2f4f7] text-[#3182f6] mb-1">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">로그인</h2>
              <p className="text-xs text-slate-500">관리자 계정으로 접속해주세요.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs text-slate-600">
                    아이디
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs text-slate-600">
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
                  <p className="text-[11px] text-slate-400 mt-1">
                    기본 비밀번호는 <span className="font-mono font-semibold">bizup1234</span> 입니다. (로컬 개발용)
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 text-sm font-medium"
                disabled={loading}
              >
                {loading ? '로그인 중...' : '로그인'}
              </Button>
            </form>

            <p className="mt-4 text-[11px] text-center text-slate-400">
              이 로그인은 데모 용도이며, 실제 서비스에서는 별도의 계정 및 보안 설정이 필요합니다.
            </p>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}


