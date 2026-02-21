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
