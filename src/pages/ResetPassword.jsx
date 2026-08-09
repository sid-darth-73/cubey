import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import api from "../utils/api";
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';

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

    const stepIcons = { 1: Mail, 2: KeyRound, 3: ShieldCheck };
    const StepIcon = stepIcons[step];

    const stepTitles = {
        1: "Reset Password",
        2: "Enter Code",
        3: "New Password",
    };

    const stepSubtitles = {
        1: "Enter your email to receive an OTP",
        2: `We sent a code to ${email}`,
        3: "Secure your account with a new password",
    };

    return (
        <div
            className="flex items-center justify-center min-h-screen px-4"
            style={{ backgroundColor: '#121212', color: '#ffffff' }}
        >
            <div
                className="w-full max-w-md rounded-lg p-8"
                style={{
                    backgroundColor: '#181818',
                    boxShadow: 'rgba(0,0,0,0.5) 0px 8px 24px',
                }}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-2 mb-5">
                        {[1, 2, 3].map(s => (
                            <div
                                key={s}
                                className="h-1 rounded-full transition-all duration-300"
                                style={{
                                    width: s === step ? '32px' : '12px',
                                    backgroundColor: s === step ? '#1ed760' : '#282828',
                                }}
                            />
                        ))}
                    </div>

                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: '#1f1f1f' }}
                    >
                        <StepIcon size={22} style={{ color: '#1ed760' }} />
                    </div>
                    <h1 className="text-[24px] font-bold text-white mb-1">{stepTitles[step]}</h1>
                    <p className="text-[14px]" style={{ color: '#b3b3b3' }}>
                        {stepSubtitles[step]}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {message && (
                        <div
                            className="text-sm text-center font-medium p-3 rounded-lg"
                            style={{
                                backgroundColor: message.includes("success") ? 'rgba(30,215,96,0.1)' : 'rgba(83,157,245,0.1)',
                                color: message.includes("success") ? '#1ed760' : '#539df5',
                                border: `1px solid ${message.includes("success") ? 'rgba(30,215,96,0.2)' : 'rgba(83,157,245,0.2)'}`,
                            }}
                        >
                            {message}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-4">
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
                        <div className="space-y-4">
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
                                        className="text-xs transition-colors"
                                        style={{ color: '#b3b3b3' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#1ed760'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
                                    >
                                        Change email?
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
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

                    {error && (
                        <div
                            className="text-sm p-3 rounded-lg text-center"
                            style={{ color: '#f3727f', backgroundColor: 'rgba(243,114,127,0.1)', border: '1px solid rgba(243,114,127,0.2)' }}
                        >
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        className="w-full h-12 rounded-full text-[14px] font-bold uppercase tracking-[1.4px] transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#1ed760', color: '#000000' }}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#1db954'; }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#1ed760'; }}
                        onClick={() => handleSubmit()}
                    >
                        {loading && (
                            <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        )}
                        {step === 1 ? "Send Code" : step === 2 ? "Verify Code" : "Reset Password"}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => navigate("/signin")}
                            className="text-sm transition-colors"
                            style={{ color: '#b3b3b3' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                            onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
                        >
                            Back to <span style={{ color: '#1ed760' }}>Sign In</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
