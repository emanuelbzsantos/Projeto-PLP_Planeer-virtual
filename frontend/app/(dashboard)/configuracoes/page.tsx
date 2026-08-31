"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Mail, Shield, Key, CheckCircle, AlertTriangle, Edit2, X } from "lucide-react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export default function ConfiguresPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setName(parsedUser.name || "");
        setEmail(parsedUser.email || "");
      } catch (e) {
        console.error("Erro ao converter dados do usuario:", e);
      }
    }
  }, []);

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    // Só entra no fluxo de troca de senha se o usuario realmente digitou uma NOVA senha.
    // (evita falso positivo quando o navegador faz autofill do campo "Senha Antiga" sozinho)
    if (newPassword) {
      if (!oldPassword) {
        setErrorMessage("Voce precisa inserir sua senha antiga para definir uma nova.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage("A nova senha e a confirmacao nao coincidem.");
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage("A nova senha precisa ter no minimo 6 caracteres.");
        return;
      }
    }

    setLoading(true);
    if (!user) return;

    try {
      const token = localStorage.getItem("auth_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      const payload: any = {
        user: { name, email },
      };

      if (newPassword) {
        payload.user.password = newPassword;
        payload.user.password_confirmation = confirmPassword;
        payload.old_password = oldPassword;
      }

      const res = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || data.errors?.join(", ") || "Falha ao atualizar dados.");
        return;
      }

      const updatedUser = { ...user, name: data.name, email: data.email };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccessMessage("Dados atualizados com sucesso!");
      
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsEditing(false);
    } catch (err) {
      setErrorMessage("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Erro ao realizar logout no servidor:", err);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      setLogoutLoading(false);
      router.push("/login");
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto w-full pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-3 tracking-tight">
          <div className="bg-[var(--color-primary-light)] p-2 rounded-xl text-[var(--color-primary)]">
            <Shield size={24} />
          </div>
          Configuracoes
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2">
          Gerencie seu perfil, preferencias e seguranca da conta.
        </p>
      </header>

      <div className="bg-white dark:bg-slate-900 border border-[var(--color-border)] dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
            <User className="text-[var(--color-primary)]" size={20} />
            Dados do Usuario
          </h2>

          {!isEditing && user && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] px-3 py-1.5 rounded-lg transition-colors"
            >
              <Edit2 size={12} />
              Editar
            </button>
          )}
        </div>

        {successMessage && (
          <div className="mb-6 p-3 rounded-xl bg-[#F0FDF4] dark:bg-emerald-950/30 text-[var(--color-success)] text-sm flex items-center gap-2 border border-[#DCFCE7] dark:border-emerald-900/50">
            <CheckCircle size={16} />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-[#FEF2F2] dark:bg-rose-950/30 text-[var(--color-danger)] text-sm flex items-center gap-2 border border-[#FEE2E2] dark:border-rose-900/50">
            <AlertTriangle size={16} />
            {errorMessage}
          </div>
        )}

        {user ? (
          !isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[#F8F9FC] dark:bg-slate-800/60 rounded-2xl border border-[var(--color-border)] dark:border-slate-700">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-[var(--color-border)] dark:border-slate-700 text-[var(--color-primary)]">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">Nome</p>
                  <p className="text-base font-semibold text-[var(--color-text)]">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-[#F8F9FC] dark:bg-slate-800/60 rounded-2xl border border-[var(--color-border)] dark:border-slate-700">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-[var(--color-border)] dark:border-slate-700 text-[var(--color-primary)]">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">E-mail</p>
                  <p className="text-base font-semibold text-[var(--color-text)]">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-[#F8F9FC] dark:bg-slate-800/60 rounded-2xl border border-[var(--color-border)] dark:border-slate-700">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-[var(--color-border)] dark:border-slate-700 text-[var(--color-text-secondary)]">
                  <Key size={24} />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">Senha</p>
                  <p className="text-base font-semibold text-[var(--color-text)]">********</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateUser} className="space-y-6" autoComplete="off">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Informacoes Basicas</h3>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-slate-700 bg-white dark:bg-slate-800 text-[var(--color-text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-slate-700 bg-white dark:bg-slate-800 text-[var(--color-text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all text-sm"
                  />
                </div>
              </div>

              <hr className="border-[var(--color-border)] dark:border-slate-700" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Seguranca (Alteracao de Senha)</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Deixe os campos abaixo em branco caso nao queira alterar a sua senha.
                </p>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                    Senha Antiga
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Insira sua senha atual"
                    autoComplete="current-password"
                    className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-slate-700 bg-white dark:bg-slate-800 text-[var(--color-text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimo de 6 caracteres"
                    autoComplete="new-password"
                    className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-slate-700 bg-white dark:bg-slate-800 text-[var(--color-text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    autoComplete="new-password"
                    className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-slate-700 bg-white dark:bg-slate-800 text-[var(--color-text)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] transition-all text-sm"
                  />
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-secondary)]">
                Aviso: Alteracoes de nome ou e-mail tem um tempo de espera obrigatorio de 5 minutos entre atualizacoes.
              </p>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium rounded-lg text-sm transition-colors"
                >
                  {loading ? "Salvando..." : "Salvar Dados"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-[var(--color-border)] dark:border-slate-700 text-[var(--color-text)] font-medium rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </form>
          )
        ) : (
          <p className="text-[var(--color-text-secondary)]">Nenhum dado do usuario encontrado.</p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-[var(--color-border)] dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-[var(--color-text)]">Encerrar Sessao</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Isso encerrara sua sessao atual no Planner Virtual. Para voltar, voce precisara inserir suas credenciais de login novamente.
        </p>

        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="flex items-center gap-2 bg-[#FEF2F2] dark:bg-rose-950/30 hover:bg-[#FEE2E2] dark:hover:bg-rose-950/50 text-[var(--color-danger)] px-5 py-2.5 rounded-xl transition-all duration-200 font-semibold border border-[#FEE2E2] dark:border-rose-900/50 text-sm"
        >
          <LogOut size={18} />
          {logoutLoading ? "Saindo..." : "Sair da conta"}
        </button>
      </div>
    </div>
  );
}