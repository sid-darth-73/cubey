import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import api from "../utils/api";
import { KeyRound, Mail, ShieldCheck, Lock } from 'lucide-react';

export function ResetPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: New Password
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    
    // Form data
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    
    // Refs for focus/inputs
    const emailRef = useRef(null);
    const otpRef = useRef(null);
    const newPasswordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const handleRequestOtp = async (e) => {
        e?.preventDefault();
        const emailVal = emailRef.current?.value?.trim();
        if (!emailVal) { setError("Email is required"); return; }
        
        setLoading(true);
        setError("");
        setMessage("");
        
        try {
            await api.post('/auth/reset/', { email: emailVal });
            setEmail(emailVal);
            setStep(2);
            setMessage("OTP sent to your email.");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e?.preventDefault();
        const otpVal = otpRef.current?.value?.trim();
        if (!otpVal) { setError("OTP is required"); return; }
        
        setLoading(true);
        setError("");
        
        try {
            const res = await api.post('/auth/reset/verify', { email, otp: otpVal });
            if (res.data.resetToken) {
                setResetToken(res.data.resetToken);
                setStep(3);
                setMessage("OTP verified. Enter new password.");
            } else {
                setError("Invalid response from server");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e?.preventDefault();
        const newPass = newPasswordRef.current?.value;
        const confirmPass = confirmPasswordRef.current?.value;
        
        if (!newPass || !confirmPass) { setError("Both fields are required"); return; }
        if (newPass !== confirmPass) { setError("Passwords do not match"); return; }
        
        setLoading(true);
        setError("");
        
        try {
            await api.post('/auth/reset/change', { newPassword: newPass, resetToken });
            setMessage("Password reset successfully! Redirecting...");
            setTimeout(() => navigate('/signin'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password");
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        if(e) e.preventDefault();
        if (step === 1) handleRequestOtp();
        if (step === 2) handleVerifyOtp();
        if (step === 3) handleChangePassword();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white px-4 relative overflow-hidden">
             {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl opacity-30" />
            </div>

            <Card className="w-full max-w-md relative z-10 border-white/10 bg-surface/50">
                <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                        {step === 1 && <Mail size={24} className="text-white" />}
                        {step === 2 && <KeyRound size={24} className="text-white" />}
                        {step === 3 && <ShieldCheck size={24} className="text-white" />}
                    </div>
                    <CardTitle className="text-center text-2xl mb-2">
                        {step === 1 && "Reset Password"}
                        {step === 2 && "Enter Code"}
                        {step === 3 && "New Password"}
                    </CardTitle>
                     <p className="text-center text-slate-400 text-sm">
                        {step === 1 && "Enter your email to receive an OTP"}
                        {step === 2 && `We sent a code to ${email}`}
                        {step === 3 && "Secure your account with a new password"}
                    </p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        
                        {message && (
                            <div className={`text-sm text-center font-medium p-2 rounded ${message.includes("success") ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-300"}`}>
                                {message}
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <Input 
                                    ref={emailRef} 
                                    type="email" 
                                    label="Email Address"
                                    placeholder="Enter your email" 
                                    autoFocus
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="space-y-1">
                                    <Input 
                                        ref={otpRef} 
                                        type="text" 
                                        label="OTP Code"
                                        placeholder="Enter 6-digit code" 
                                        className="text-center tracking-widest text-lg font-mono"
                                        autoFocus
                                    />
                                    <div className="flex justify-end">
                                        <button 
                                            type="button"
                                            onClick={() => setStep(1)} 
                                            className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                                        >
                                            Change email?
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <Input 
                                    ref={newPasswordRef} 
                                    type="password" 
                                    label="New Password"
                                    placeholder="Enter new password" 
                                    autoFocus
                                />
                                <Input 
                                    ref={confirmPasswordRef} 
                                    type="password" 
                                    label="Confirm Password"
                                    placeholder="Confirm new password" 
                                />
                            </div>
                        )}

                        {error && <div className="text-red-400 text-sm text-center">{error}</div>}

                        <Button 
                            loading={loading} 
                            className="w-full mt-2"
                            onClick={() => handleSubmit()}
                        >
                            {step === 1 ? "Send Code" : step === 2 ? "Verify Code" : "Reset Password"}
                        </Button>

                         <div className="text-center mt-2">
                            <button 
                                type="button" 
                                onClick={() => navigate("/signin")} 
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Back to <span className="text-blue-400">Sign In</span>
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
