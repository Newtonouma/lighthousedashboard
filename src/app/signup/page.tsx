'use client';

import { useState } from 'react';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from "./signup.module.css";

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      // Optional: automatically redirect after success
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        <div className={styles.signupInner}>
          <h1 className={styles.signupHeader}>Sign Up</h1>
          {success ? (
            <div className={styles.error} style={{ color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              Check your email for the confirmation link! Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSignup}>
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
                  minLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={styles.button}
              >
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
          )}
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/login"
              className={styles.link}
            >
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}