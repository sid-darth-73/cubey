import { useRef, useEffect, useState } from "react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { HeartIcon } from "../components/ui/HeartIcon";

export function Signin() {
    const wcaRef = useRef(null);
    const passwordRef = useRef(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");

    async function handleSignIn() {
        const wcaIdOrEmail = wcaRef.current?.value?.trim();
        const password = passwordRef.current?.value;

        if (!wcaIdOrEmail || !password) {
            setError("All fields are required.");
            return;
        }

        try {
            const res = await fetch("http://localhost:3002/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wcaIdOrEmail, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Invalid credentials");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("shareLink", data.shareLink);
            localStorage.setItem("user", wcaIdOrEmail);
            navigate("/dashboard");
        } catch (err) {
            setError("Network error. Try again.");
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
        <div className="flex flex-col justify-between min-h-screen bg-slate-900 text-white p-4">
            <div className="flex flex-grow items-center justify-center">
                <div className="bg-slate-800 rounded-xl p-8 w-full max-w-lg shadow-lg space-y-6">
                    <h1 className="text-2xl text-center font-mont">Sign In</h1>
                    <Input placeholder="WCA ID or Email" reference={wcaRef} />
                    <Input placeholder="Password" reference={passwordRef} type="password" />
                    {error && <div className="text-red-400 text-sm">{error}</div>}
                    <div className="flex justify-center">
                        <Button text="Sign In" onClick={handleSignIn} variant="primary" size="md" />
                    </div>
                    <p className="text-sm text-center text-gray-300">
                        Don't have an account?{" "}
                        <span className="text-blue-400 cursor-pointer" onClick={() => navigate("/signup")}>
                            Sign up
                        </span>
                    </p>
                </div>
            </div>
            <footer className="text-center text-gray-400 text-sm mb-2 font-normal">
                <div className="flex items-center justify-center">
                    <div>Made with</div>
                    <HeartIcon />
                    <div>
                        by{" "}
                        <a href="https://github.com/sid-darth-73/cubey" className="hover:underline" target="_blank">
                            unbit
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
