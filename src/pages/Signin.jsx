import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import api from "../utils/api";

export function Signin() {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSignIn() {
        const email = emailRef.current?.value?.trim();
        const password = passwordRef.current?.value;

        if(!email || !password) {
            setError("All fields are required."); return;
        }

        try {
            setLoading(true);
            const res = await api.post("/auth/signin", { email, password });

            const data = res.data;
            localStorage.setItem("token", data.token);
            localStorage.setItem("shareLink", data.shareLink);
            localStorage.setItem("user", email);
            // Tell SocketContext to connect now that we have a token
            window.dispatchEvent(new Event('user:loggedin'));
            navigate("/dashboard/timer");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid credentials");
            setLoading(false);
        }
    }

    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Enter") handleSignIn();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    return (
        <div
            className="flex items-center justify-center min-h-screen px-4"
            style={{ backgroundColor: '#121212', color: '#ffffff' }}
        >
            {/* Card */}
            <div
                className="w-full max-w-md rounded-lg p-8"
                style={{
                    backgroundColor: '#181818',
                    boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px',
                }}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5 text-black text-lg font-black"
                        style={{ backgroundColor: '#1ed760' }}
                    >
                        S
                    </div>
                    <h1 className="text-[24px] font-bold text-white mb-1">Welcome Back</h1>
                    <p className="text-[14px]" style={{ color: '#b3b3b3' }}>
                        Sign in to continue your speedcubing journey
                    </p>
                </div>

                {/* Form */}
                <div className="flex flex-col gap-5">
                    <Input
                        ref={emailRef}
                        label="WCA ID or Email"
                        placeholder="Enter your WCA ID or Email"
                        autoFocus
                    />

                    <div className="flex flex-col gap-1">
                        <Input
                            ref={passwordRef}
                            type="password"
                            label="Password"
                            placeholder="Enter your password"
                        />
                        <div className="text-right mt-1">
                            <span
                                onClick={() => navigate("/reset-password")}
                                className="text-xs cursor-pointer transition-colors"
                                style={{ color: '#b3b3b3' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#1ed760'}
                                onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
                            >
                                Forgot Password?
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div
                            className="text-sm p-3 rounded-lg text-center text-[#f3727f]"
                            style={{ backgroundColor: 'rgba(243,114,127,0.1)', border: '1px solid rgba(243,114,127,0.2)' }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSignIn}
                        disabled={loading}
                        className="w-full h-12 rounded-full text-[14px] font-bold uppercase tracking-[1.4px] transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#1ed760', color: '#000000' }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#1db954'; }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#1ed760'; }}
                    >
                        {loading && (
                            <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        )}
                        Sign In
                    </button>

                    {/* Divider */}
                    <div className="relative my-1">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full" style={{ borderTop: '1px solid #282828' }} />
                        </div>
                        <div className="relative flex justify-center">
                            <span
                                className="px-3 text-[11px] uppercase tracking-widest"
                                style={{ backgroundColor: '#181818', color: '#b3b3b3' }}
                            >
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Google */}
                    <button
                        onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3002"}/auth/google`}
                        className="w-full h-11 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 transition-all duration-200"
                        style={{ backgroundColor: '#1f1f1f', color: '#ffffff', border: '1px solid #4d4d4d' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252525'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1f1f1f'}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Google
                    </button>

                    <p className="text-sm text-center" style={{ color: '#b3b3b3' }}>
                        Don't have an account?{" "}
                        <span
                            onClick={() => navigate("/signup")}
                            className="font-bold cursor-pointer transition-colors"
                            style={{ color: '#1ed760' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#1db954'}
                            onMouseLeave={e => e.currentTarget.style.color = '#1ed760'}
                        >
                            Sign up
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}
