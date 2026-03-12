import Layout from "@/components/Layout";
import { useLocalAuth } from "@/_core/hooks/useLocalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PartnerDashboard() {
  const { user, isAuthenticated } = useLocalAuth();

  if (!isAuthenticated || user?.role !== "partner") {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-foreground/60">Acesso negado. Apenas parceiros podem acessar este painel.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Painel de Parceiro</h1>
          <p className="text-foreground/60">Bem-vindo, {user?.name}</p>
        </div>

        {/* Partner Info Card */}
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white">
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground/60">Nome</p>
                <p className="text-lg font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Usuário</p>
                <p className="text-lg font-semibold">{user?.username}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Papel</p>
                <Badge variant="default">Parceiro</Badge>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Último Acesso</p>
                <p className="text-lg font-semibold">{user?.loginTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground/60">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="text-base py-2 px-3">Ativo</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground/60">Permissões</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">Acesso Completo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground/60">Conectado</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="default" className="text-base py-2 px-3">Online</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Info Message */}
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Painel de Parceiros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/60">
              Este é o painel de controle para parceiros da Monstter Consultoria. 
              Aqui você pode gerenciar suas ordens de serviço, acompanhar pagamentos e visualizar seu desempenho.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
