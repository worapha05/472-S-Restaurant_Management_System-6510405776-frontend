'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(`Error: ${result.error}`);
      } else if (result?.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError('Unknown authentication error');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-mainText mb-1">
          เข้าสู่ระบบ
        </h2>
        <p className="mt-2 text-center text-sm text-secondText">
          หรือ{' '}
          <Link href="/signup" className="font-medium text-inputFieldFocus hover:text-primary">
            สร้างบัญชีใหม่
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background py-8 px-4 shadow-sm border border-searchBox rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 bg-cancelRed/10 border-l-4 border-cancelRed p-4 rounded">
              <p className="text-cancelRed">{error}</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary">
                อีเมล
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary">
                รหัสผ่าน
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-searchBox rounded-md shadow-sm placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-inputFieldFocus focus:border-inputFieldFocus sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              {/* <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-inputFieldFocus border-searchBox rounded focus:ring-inputFieldFocus"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondText">
                  จดจำฉัน
                </label>
              </div> */}

              <div className="text-sm">
                <Link href="/signup" className="font-medium text-inputFieldFocus hover:text-primary">
                  สมัครสมาชิก
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-background bg-button hover:bg-hoverButton focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inputFieldFocus disabled:opacity-50 transition-colors"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </div>
          </form>

          {/* <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-searchBox"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-secondText">หรือเข้าสู่ระบบด้วย</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-searchBox rounded-md shadow-sm bg-background text-sm font-medium text-secondText hover:bg-searchBox focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inputFieldFocus"
                >
                  <span>Google</span>
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-searchBox rounded-md shadow-sm bg-background text-sm font-medium text-secondText hover:bg-searchBox focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-inputFieldFocus"
                >
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </div> */}

        </div>
      </div>
    </div>
  );
}