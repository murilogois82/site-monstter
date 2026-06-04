import { useEffect } from "react";
import { useLocation } from "wouter";
import { CalendarDays, ClipboardList, ShieldCheck, UserRound } from "lucide-react";
import Layout from "@/components/Layout";
import { PartnerControlPanel } from "@/components/PartnerControlPanel";
import { useLocalAuth } from "@/_core/hooks/useLocalAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatLoginTime(loginTime?: string) {
  if (!loginTime) {
    return "Não informado";
  }

  const parsedDate = new Date(loginTime);
  if (Number.isNaN(parsedDate.getTime())) {
    return loginTime;
  }

  return parsedDate.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function PartnerDashboard() {
  const { user, isAuthenticated, isLoading } = useLocalAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "partner")) {
      setLocation("/simple-login");
    }
  }, [isAuthenticated, isLoading, setLocation, user?.role]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto" />
            <p className="mt-4 text-foreground/70">Carregando painel do parceiro...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated || user?.role !== "partner") {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-red-50/40 to-background py-10 px-4">
        <div className="container mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge className="mb-3 bg-red-100 text-red-700 hover:bg-red-100">Área do parceiro</Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Painel de Parceiro</h1>
              <p className="text-foreground/70">
                Bem-vindo, {user?.name}. Acompanhe suas ordens de serviço, produtividade e valores estimados em tempo real.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setLocation("/service-order-form")} className="bg-red-600 hover:bg-red-700">
                Nova ordem de serviço
              </Button>
              <Button variant="outline" onClick={() => setLocation("/partners/service-orders")}>
                Ver minhas OS
              </Button>
            </div>
          </div>

          <Card className="border-red-100 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5" />
                Informações do acesso
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-foreground/60">Nome</p>
                  <p className="text-lg font-semibold text-foreground">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Usuário</p>
                  <p className="text-lg font-semibold text-foreground">{user?.username}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Perfil</p>
                  <Badge variant="default" className="mt-1">Parceiro ativo</Badge>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Último acesso</p>
                  <p className="text-lg font-semibold text-foreground">{formatLoginTime(user?.loginTime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  Status operacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="text-base py-2 px-3 bg-green-100 text-green-700 hover:bg-green-100">Online</Badge>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                  <ClipboardList className="h-4 w-4 text-red-600" />
                  Gestão de OS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70 mb-4">Cadastre, envie e acompanhe suas ordens de serviço.</p>
                <Button variant="outline" size="sm" onClick={() => setLocation("/partners/service-orders")}>Acessar ordens</Button>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/70">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  Histórico e desempenho
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/70">Os indicadores abaixo são calculados com base nas suas ordens registradas.</p>
              </CardContent>
            </Card>
          </div>

          <PartnerControlPanel />
        </div>
      </div>
    </Layout>
  );
}
