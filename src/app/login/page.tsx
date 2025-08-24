'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
    };
  }
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Initialize Turnstile
  useEffect(() => {
    let widgetId: string | null = null;
    let isMounted = true;

    const loadTurnstile = () => {
      // Check if Turnstile is already initialized
      const container = document.getElementById('turnstile-container');
      if (!container) return;

      // Check if widget already exists
      if (container.children.length > 0) return;

      // Clear container first
      container.innerHTML = '';

      if (typeof window !== 'undefined' && window.turnstile) {
        widgetId = window.turnstile.render('#turnstile-container', {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA',
          theme: 'light',
          callback: (token: string) => {
            if (isMounted) {
              setTurnstileToken(token);
            }
          },
          'error-callback': () => {
            if (isMounted) {
              setError('Failed to load CAPTCHA. Please try again.');
            }
          }
        });

        if (isMounted) {
          setTurnstileWidgetId(widgetId);
        }
      }
    };

    // 在开发环境中，如果Turnstile没有加载，显示一个测试组件
    const renderTestTurnstile = () => {
      const container = document.getElementById('turnstile-container');
      if (container && process.env.NODE_ENV === 'development') {
        container.innerHTML = '<div style="padding: 10px; border: 1px solid #ccc; background: #f5f5f5; text-align: center;">Test Turnstile Widget<br/>(Click to simulate verification)<br/><button onclick="document.querySelector(\'#turnstile-container\').innerHTML=\'Verified\'; document.querySelector(\'button[type=submit]\').disabled=false;" style="margin-top: 5px; padding: 5px 10px; background: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;">Simulate Verification</button></div>';
      }
    };

    // Load Turnstile script
    if (typeof window !== 'undefined') {
      if (!window.turnstile) {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
        if (!existingScript) {
          const script = document.createElement('script');
          script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
          script.async = true;
          script.defer = true;
          (window as any).onloadTurnstileCallback = () => {
            if (isMounted) {
              loadTurnstile();
            }
          };
          document.head.appendChild(script);
        } else {
          // Script exists, wait a bit and try to load
          setTimeout(() => {
            if (isMounted && window.turnstile) {
              loadTurnstile();
            }
          }, 100);
        }
        
        // 在开发环境中，如果没有加载Turnstile，显示测试组件
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => {
            if (isMounted && !window.turnstile) {
              renderTestTurnstile();
            }
          }, 1000);
        }
      } else {
        // Turnstile already loaded
        loadTurnstile();
      }
    }

    return () => {
      isMounted = false;
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.reset(widgetId);
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Check if Turnstile token is available (skip in development)
    if (!turnstileToken && process.env.NODE_ENV !== 'development') {
      setError('Please complete the CAPTCHA verification');
      setIsLoading(false);
      return;
    }
    
    try {
      // Pass Turnstile token to login function
      const success = await login(username, password, turnstileToken);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid username or password');
        // Reset Turnstile on failed login
        if (turnstileWidgetId && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId);
          setTurnstileToken('');
        }
      }
    } catch (err) {
      setError('An error occurred during login');
      // Reset Turnstile on error
      if (turnstileWidgetId && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId);
        setTurnstileToken('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {/* Turnstile Container */}
          <div className="flex justify-center">
            <div id="turnstile-container"></div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}