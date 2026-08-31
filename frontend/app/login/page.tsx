"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            router.push("/");
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        const endpoint = isLogin ? "/login" : "/users";
        const payload = isLogin
            ? { email, password }
            : { user: { name, email, password } };

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.error || data.errors?.join(", ") || "Falha na requisição.");
                return;
            }

            // Salva o token retornado e redireciona
            localStorage.setItem("auth_token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/tarefas");
        } catch (err) {
            setErrorMessage("Erro ao conectar com o servidor.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4 w-full">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-[var(--color-border)] dark:border-slate-800">
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-[var(--color-primary)] text-white p-1.5 rounded-lg flex items-center justify-center h-8 w-8 font-bold">
                            P
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
                            Planner Virtual
                        </h1>
                    </div>
                </div>

                <h2 className="text-lg font-semibold mb-6 text-[var(--color-text)] text-center">
                    {isLogin ? "Acesse sua conta" : "Crie sua conta"}
                </h2>

                {errorMessage && (
                    <div className="mb-4 p-3 rounded-lg bg-[#FEF2F2] dark:bg-rose-950/30 text-[var(--color-danger)] text-sm border border-[#FEE2E2] dark:border-rose-900/50">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                                Nome
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-slate-700 bg-white dark:bg-slate-800 text-[var(--color-text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-slate-700 bg-white dark:bg-slate-800 text-[var(--color-text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                            Senha
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-slate-700 bg-white dark:bg-slate-800 text-[var(--color-text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-lg transition-colors"
                    >
                        {isLogin ? "Entrar" : "Cadastrar"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-[var(--color-primary)] hover:underline font-medium"
                    >
                        {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem conta? Entrar"}
                    </button>
                </div>
            </div>
        </div>
    );
}