import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import api from "../utils/api";

export function Signup() {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSignUp() {
        const email = emailRef.current?.value?.trim();
        const password = passwordRef.current?.value;

        if(!email || !password) {
            setError("All fields are required."); return;
        }
        try {
            setLoading(true);
            const res = await api.post("/auth/signup", { email, password });

            const data = res.data;
            localStorage.setItem("token", data.token);
            localStorage.setItem("shareLink", data.shareLink);
            localStorage.setItem("user", email);
            navigate("/dashboard/timer");
        } catch(err) {
            setError(err.response?.data?.message || "Signup failed");
            setLoading(false);
        }
    }

    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Enter") handleSignUp();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white px-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl opacity-40"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl opacity-40"></div>
            </div>

            <Card className="w-full max-w-md relative z-10 border-white/10 bg-surface/50">
                <CardHeader>
                    <CardTitle className="text-center text-3xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        Join Cubey
                    </CardTitle>
                    <p className="text-center text-slate-400 text-sm">
                        Track your PBs, drill algs, and level up!
                    </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                    <Input 
                        ref={emailRef} 
                        label="WCA ID or Email" 
                        placeholder="Enter your WCA ID or Email" 
                        autoFocus
                    />
                    
                    <Input 
                        ref={passwordRef} 
                        type="password" 
                        label="Password" 
                        placeholder="Create a password" 
                    />

                    {error && <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20 text-center">{error}</div>}

                    <Button onClick={handleSignUp} loading={loading} className="w-full mt-2">
                        Sign Up
                    </Button>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-700"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0f172a] px-2 text-slate-400">Or continue with</span>
                        </div>
                    </div>

                    <Button onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3002"}/auth/google`} variant="outline" className="w-full flex items-center justify-center gap-2 border-slate-700 hover:bg-slate-800 bg-[#1e293b]">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Google
                    </Button>

                    <p className="text-sm text-center text-slate-400 mt-2">
                        Already have an account?{" "}
                        <span onClick={() => navigate("/signin")} className="text-blue-400 cursor-pointer hover:text-blue-300 font-medium transition-colors">
                            Sign in
                        </span>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
