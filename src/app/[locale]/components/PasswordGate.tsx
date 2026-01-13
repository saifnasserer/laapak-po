'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from '@/i18n/routing';
import { Lock } from 'lucide-react';

export function PasswordGate() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.success) {
                // Refresh the page to show authenticated content
                router.refresh();
            } else {
                setError('Invalid password');
                setPassword('');
            }
        } catch (err) {
            setError('Authentication failed. Please try again.');
            console.error('Auth error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Lock size={32} className="text-green-600" />
                    </div>
                    <img
                        src="/assets/cropped-Logo-mark.png.png"
                        alt="Laapak Logo"
                        className="w-12 h-12 object-contain mb-3"
                    />
                    <h1 className="text-2xl font-bold text-gray-900">Laapak PO</h1>
                    <p className="text-sm text-gray-500 mt-1">Enter password to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                            autoFocus
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Authenticating...' : 'Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}
