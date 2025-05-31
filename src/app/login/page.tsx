'use client';

import { useState } from 'react';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from "./login.module.css";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }      router.push('/dashboard');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err && typeof (err as Error).message === 'string') {
        setError((err as Error).message);
      } else {
        setError('Failed to login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginInner}>
          <h1 className={styles.loginHeader}>
            Login to Your Account
          </h1>
          <form onSubmit={handleLogin}>
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <label htmlFor="password" style={{ display: 'block', fontWeight: 500, marginBottom: 4 }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                disabled={isLoading}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.button}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/signup"
              className={styles.link}
            >
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}