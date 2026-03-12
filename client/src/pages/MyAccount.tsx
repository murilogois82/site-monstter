import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalAuth } from "@/_core/hooks/useLocalAuth";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function MyAccount() {
  const { user, isAuthenticated, isLoading, logout } = useLocalAuth();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/simple-login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        username: user.username || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = () => {
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Nome não pode estar vazio" });
      return;
    }

    // Update localStorage with new profile data
    const updatedUser = {
      ...user,
      name: formData.name,
    };

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
    setIsEditing(false);

    // Reload to update user context
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleChangePassword = () => {
    // Validate passwords
    if (!formData.currentPassword) {
      setMessage({ type: "error", text: "Digite a senha atual" });
      return;
    }

    if (!formData.newPassword || formData.newPassword.length < 4) {
      setMessage({
        type: "error",
        text: "Nova senha deve ter pelo menos 4 caracteres",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem" });
      return;
    }

    // For demo purposes, we'll just validate against the username (which is the password)
    // In a real app, this would be validated against a hashed password
    const testUsers: Record<string, string> = {
      admin: "admin",
      partner: "partner",
      manager: "manager",
      user: "user",
    };

    if (testUsers[user?.username || ""] !== formData.currentPassword) {
      setMessage({ type: "error", text: "Senha atual incorreta" });
      return;
    }

    // Update password in localStorage (in a real app, this would be sent to backend)
    setMessage({
      type: "success",
      text: "Senha alterada com sucesso! Use a nova senha no próximo login.",
    });

    // Reset password fields
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));

    setIsChangingPassword(false);

    // Logout after password change
    setTimeout(() => {
      logout();
      setLocation("/simple-login");
    }, 2000);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minha Conta</h1>
          <p className="text-foreground/60">Gerencie suas informações de perfil e segurança</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-700"
                : "bg-red-500/10 border border-red-500/20 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Information Card */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white">
            <CardTitle>Informações de Perfil</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Nome Completo
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full"
                  placeholder="Digite seu nome"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Usuário
                </label>
                <Input
                  type="text"
                  value={formData.username}
                  disabled
                  className="w-full bg-foreground/5"
                />
                <p className="text-xs text-foreground/50 mt-1">
                  Nome de usuário não pode ser alterado
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Papel
                </label>
                <Input
                  type="text"
                  value={
                    user.role === "admin"
                      ? "Administrador"
                      : user.role === "manager"
                        ? "Gerenciador"
                        : user.role === "partner"
                          ? "Parceiro"
                          : "Usuário"
                  }
                  disabled
                  className="w-full bg-foreground/5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-2">
                  Último Acesso
                </label>
                <Input
                  type="text"
                  value={user.loginTime || "Nunca"}
                  disabled
                  className="w-full bg-foreground/5"
                />
              </div>

              <div className="flex gap-3 pt-4">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Salvar Alterações
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
            <CardTitle>Segurança</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!isChangingPassword ? (
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="outline"
              >
                Alterar Senha
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-2">
                    Senha Atual
                  </label>
                  <Input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Digite sua senha atual"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-2">
                    Nova Senha
                  </label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Digite a nova senha"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirme a nova senha"
                    className="w-full"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleChangePassword}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Confirmar Alteração
                  </Button>
                  <Button
                    onClick={() => {
                      setIsChangingPassword(false);
                      setFormData((prev) => ({
                        ...prev,
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      }));
                    }}
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
