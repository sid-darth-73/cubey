import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthButton } from "../components/ui/AuthButton";
import api from "../utils/api";

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
        e.preventDefault();
        if (step === 1) handleRequestOtp();
        if (step === 2) handleVerifyOtp();
        if (step === 3) handleChangePassword();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-gray-900 text-white px-4">
            <form onSubmit={handleSubmit} className="bg-slate-800 p-6 md:p-8 w-full max-w-md rounded-2xl shadow-xl border border-slate-600 backdrop-blur-sm flex flex-col gap-5">
                <h2 className="text-3xl font-bold text-center font-quick text-blue-400 animate-pulse mb-2">
                    {step === 1 && "Reset Password"}
                    {step === 2 && "Enter OTP"}
                    {step === 3 && "New Password"}
                </h2>

                {message && <div className="text-green-400 text-sm text-center font-medium bg-green-900/30 p-2 rounded">{message}</div>}
                
                {step === 1 && (
                    <div className="flex flex-col gap-1 fade-in">
                        <label className="text-sm font-mont font-medium text-slate-200">Email Address</label>
                        <div className="flex items-center border border-slate-600 rounded-lg h-12 pl-3 focus-within:border-blue-500 transition-all">
                            <input 
                                ref={emailRef} 
                                type="email" 
                                placeholder="Enter your email" 
                                className="bg-transparent font-mont border-none outline-none text-white px-2 flex-1 h-full"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-1 fade-in">
                        <label className="text-sm font-mont font-medium text-slate-200">OTP Code</label>
                        <div className="flex items-center border border-slate-600 rounded-lg h-12 pl-3 focus-within:border-blue-500 transition-all">
                            <input 
                                ref={otpRef} 
                                type="text" 
                                placeholder="Enter 6-digit OTP" 
                                className="bg-transparent font-mont border-none outline-none text-white px-2 flex-1 h-full tracking-widest text-center text-lg"
                                autoFocus
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-1 text-center">
                            Sent to {email}. <span className="text-blue-400 cursor-pointer hover:underline" onClick={() => setStep(1)}>Wrong email?</span>
                        </p>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-3 fade-in">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-mont font-medium text-slate-200">New Password</label>
                            <div className="flex items-center border border-slate-600 rounded-lg h-12 pl-3 focus-within:border-blue-500 transition-all">
                                <input 
                                    ref={newPasswordRef} 
                                    type="password" 
                                    placeholder="New password" 
                                    className="bg-transparent font-mont border-none outline-none text-white px-2 flex-1 h-full"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-mont font-medium text-slate-200">Confirm Password</label>
                            <div className="flex items-center border border-slate-600 rounded-lg h-12 pl-3 focus-within:border-blue-500 transition-all">
                                <input 
                                    ref={confirmPasswordRef} 
                                    type="password" 
                                    placeholder="Confirm new password" 
                                    className="bg-transparent font-mont border-none outline-none text-white px-2 flex-1 h-full"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {error && <div className="text-red-400 text-sm mt-1 text-center">{error}</div>}

                <AuthButton 
                    text={
                        step === 1 ? "Send OTP" : 
                        step === 2 ? "Verify OTP" : 
                        "Reset Password"
                    } 
                    loading={loading}
                />

                <p className="text-sm text-center text-slate-300 mt-2">
                    <span onClick={() => navigate("/signin")} className="text-blue-400 cursor-pointer hover:underline">
                        Back to Sign In
                    </span>
                </p>
            </form>
        </div>
    );
}
