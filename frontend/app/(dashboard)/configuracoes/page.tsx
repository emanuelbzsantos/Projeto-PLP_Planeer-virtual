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
  
  // Controle de Edição do Perfil
  const [isEditing, setIsEditing] = useState(false);

  // Form de Dados (Nome, E-mail, Senha)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Mensagens globais de feedback
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
        console.error("Erro ao converter dados do usuário:", e);
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

    // Validações no lado do cliente
    if (newPassword || confirmPassword || oldPassword) {
      if (!oldPassword) {
        setErrorMessage("Você precisa inserir sua senha antiga para definir uma nova.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage("A nova senha e a confirmação não coincidem.");
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage("A nova senha precisa ter no mínimo 6 caracteres.");
        return;
      }
    }

    setLoading(true);
    if (!user) return;

    try {
      const token = localStorage.getItem("auth_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      // Monta o payload
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

      // Atualiza localStorage e estado local
      const updatedUser = { ...user, name: data.name, email: data.email };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccessMessage("Dados atualizados com sucesso!");
      
      // Limpa os campos de senha
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
    <div className="p-8 max-w-3xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Shield className="text-indigo-500" />
          Configurações
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gerencie seu perfil, preferências e segurança da conta.
        </p>
      </header>

      {/* Painel Unificado: Dados do Usuário */}
      <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="text-indigo-500" size={20} />
            Dados do Usuário
          </h2>

          {!isEditing && user && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Edit2 size={12} />
              Editar
            </button>
          )}
        </div>

        {successMessage && (
          <div className="mb-6 p-3 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            {errorMessage}
          </div>
        )}

        {user ? (
          !isEditing ? (
            /* MODO DE VISUALIZAÇÃO ESTÁTICA */
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Nome</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-xl text-purple-600 dark:text-purple-400">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">E-mail</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-xl text-gray-600 dark:text-gray-400">
                  <Key size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Senha</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">••••••••</p>
                </div>
              </div>
            </div>
          ) : (
            /* MODO DE EDIÇÃO UNIFICADO */
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Informações Básicas</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-800" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Segurança (Alteração de Senha)</h3>
                <p className="text-xs text-gray-400">
                  Deixe os campos abaixo em branco caso não queira alterar a sua senha.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Senha Antiga
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Insira sua senha atual"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white text-sm"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Aviso: Alterações de nome ou e-mail têm um tempo de espera obrigatório de 5 minutos entre atualizações.
              </p>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors"
                >
                  {loading ? "Salvando..." : "Salvar Dados"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </form>
          )
        ) : (
          <p className="text-gray-500">Nenhum dado do usuário encontrado.</p>
        )}
      </div>

      {/* Seção: Logout */}
      <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Encerrar Sessão</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Isso encerrará sua sessão atual no Planner Virtual. Para voltar, você precisará inserir suas credenciais de login novamente.
        </p>

        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 px-5 py-3 rounded-xl transition-all duration-200 font-semibold border border-red-100 dark:border-red-900/30 text-sm"
        >
          <LogOut size={20} />
          {logoutLoading ? "Saindo..." : "Sair da conta"}
        </button>
      </div>
    </div>
  );
}