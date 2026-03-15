import { useEffect } from "react";
import { useLocalAuth } from "@/_core/hooks/useLocalAuth";
import Layout from "@/components/Layout";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Lock, LayoutDashboard, Users, DollarSign, Calendar, FileText } from "lucide-react";

export default function RestrictedArea() {
  const { user, isAuthenticated, isLoading } = useLocalAuth();
  const [, setLocation] = useLocation();

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/simple-login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="w-full max-w-md border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Acesso Negado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 mb-4">
                Você precisa estar autenticado para acessar esta página.
              </p>
              <Button onClick={() => setLocation("/simple-login")} className="w-full">
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Definir links de acesso baseado no role
  const getAccessLinks = () => {
    const links = [];

    if (user.role === "admin" || user.role === "manager") {
      links.push(
        {
          icon: LayoutDashboard,
          title: "Dashboard",
          description: "Visualize o dashboard de administração",
          path: "/admin",
          roles: ["admin", "manager"],
        },
        {
          icon: Calendar,
          title: "Calendário",
          description: "Gerencie ordens de serviço agendadas",
          path: "/calendar",
          roles: ["admin", "manager"],
        },
        {
          icon: FileText,
          title: "Ordens de Serviço",
          description: "Gerenciar todas as ordens de serviço",
          path: "/admin/service-orders",
          roles: ["admin", "manager"],
        },
        {
          icon: Users,
          title: "Usuários",
          description: "Gerenciar usuários do sistema",
          path: "/admin/users",
          roles: ["admin"],
        },
        {
          icon: Users,
          title: "Clientes",
          description: "Gerenciar clientes",
          path: "/admin/clients",
          roles: ["admin", "manager"],
        },
        {
          icon: Users,
          title: "Parceiros",
          description: "Gerenciar parceiros",
          path: "/admin/partners",
          roles: ["admin"],
        },
        {
          icon: DollarSign,
          title: "Pagamentos",
          description: "Gerenciar pagamentos e financeiro",
          path: "/admin/payments-dashboard",
          roles: ["admin", "manager"],
        }
      );
    }

    if (user.role === "partner") {
      links.push(
        {
          icon: FileText,
          title: "Minhas Ordens de Serviço",
          description: "Visualize suas ordens de serviço",
          path: "/partners/service-orders",
          roles: ["partner"],
        },
        {
          icon: LayoutDashboard,
          title: "Dashboard de Parceiros",
          description: "Acesse seu dashboard",
          path: "/partner-dashboard",
          roles: ["partner"],
        }
      );
    }

    // Todos podem acessar sua conta
    links.push(
      {
        icon: Users,
        title: "Minha Conta",
        description: "Gerenciar suas informações pessoais",
        path: "/my-account",
        roles: ["admin", "manager", "partner", "user"],
      }
    );

    return links.filter((link) => link.roles.includes(user.role));
  };

  const accessLinks = getAccessLinks();

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-8 h-8 text-red-500" />
              <h1 className="text-4xl font-bold text-foreground">Área Restrita</h1>
            </div>
            <p className="text-lg text-foreground/70">
              Bem-vindo, <span className="font-semibold text-primary">{user.name}</span>!
            </p>
            <p className="text-sm text-foreground/60 mt-2">
              Seu perfil: <span className="font-semibold capitalize">{user.role}</span>
            </p>
          </div>

          {/* Access Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Card
                  key={link.path}
                  className="hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setLocation(link.path)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-lg">{link.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/70 mb-4">{link.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(link.path);
                      }}
                    >
                      Acessar →
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* No Access Message */}
          {accessLinks.length === 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-5 w-5" />
                  Nenhum acesso disponível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700">
                  Seu perfil de usuário não tem acesso a nenhuma área restrita no momento.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Precisa de ajuda?</h3>
            <p className="text-sm text-blue-800">
              Se você acredita que deveria ter acesso a uma área específica, entre em contato com o administrador do sistema.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
