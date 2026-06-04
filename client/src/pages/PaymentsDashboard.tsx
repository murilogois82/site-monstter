import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, RefreshCcw } from "lucide-react";
import { useLocalAuth } from "@/_core/hooks/useLocalAuth";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import AdminNav from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { subMonths } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

type PaymentStatus = "pending" | "scheduled" | "completed";

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendente",
  scheduled: "Agendado",
  completed: "Pago",
};

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatDateInput = (date: Date) => date.toISOString().slice(0, 10);

const formatDateTime = (value?: Date | string | null) => {
  if (!value) {
    return "Não informado";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return date.toLocaleDateString("pt-BR");
};

const getPaymentAgeDays = (value?: Date | string | null) => {
  if (!value) {
    return 0;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
};

export default function PaymentsDashboard() {
  const { user, isAuthenticated, isLoading } = useLocalAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== "admin" && user?.role !== "manager"))) {
      setLocation("/simple-login");
    }
  }, [isAuthenticated, user, isLoading, setLocation]);

  const [periodStart, setPeriodStart] = useState<Date>(subMonths(new Date(), 1));
  const [periodEnd, setPeriodEnd] = useState<Date>(new Date());
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<number[]>([]);

  const { data: orders, isLoading: ordersLoading } = trpc.serviceOrder.listAll.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "manager"),
  });

  const { data: partners, isLoading: partnersLoading } = trpc.partner.listAll.useQuery(undefined, {
    enabled: isAuthenticated && (user?.role === "admin" || user?.role === "manager"),
  });

  const {
    data: pendingPaymentsList = [],
    isLoading: pendingPaymentsLoading,
    refetch: refetchPendingPayments,
  } = trpc.payment.listPending.useQuery(
    {
      startDate: periodStart,
      endDate: periodEnd,
    },
    {
      enabled: isAuthenticated && (user?.role === "admin" || user?.role === "manager"),
    }
  );

  const updatePaymentStatusMutation = trpc.payment.updateStatus.useMutation({
    onSuccess: () => {
      void refetchPendingPayments();
    },
  });

  const isAuthorized = isAuthenticated && (user?.role === "admin" || user?.role === "manager");

  const selectedPayments = useMemo(
    () => pendingPaymentsList.filter((payment) => selectedPaymentIds.includes(payment.id)),
    [pendingPaymentsList, selectedPaymentIds]
  );

  const overduePayments = useMemo(
    () => pendingPaymentsList.filter((payment) => getPaymentAgeDays(payment.createdAt) > 20),
    [pendingPaymentsList]
  );

  const scheduledProjection = selectedPayments.reduce((acc, payment) => acc + Number.parseFloat(String(payment.amount || "0")), 0);

  const handleTogglePayment = (paymentId: number, checked: boolean) => {
    setSelectedPaymentIds((current) =>
      checked ? [...current, paymentId] : current.filter((id) => id !== paymentId)
    );
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedPaymentIds(checked ? pendingPaymentsList.map((payment) => payment.id) : []);
  };

  const handleUpdatePaymentStatus = async (paymentId: number, status: PaymentStatus) => {
    try {
      await updatePaymentStatusMutation.mutateAsync({ id: paymentId, status });
      setSelectedPaymentIds((current) => current.filter((id) => id !== paymentId));
      toast.success(`Pagamento marcado como ${PAYMENT_STATUS_LABELS[status].toLowerCase()}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar pagamento.");
    }
  };

  const handleBatchSchedule = async () => {
    if (selectedPaymentIds.length === 0) {
      toast.info("Selecione ao menos um pagamento pendente.");
      return;
    }

    try {
      await Promise.all(
        selectedPaymentIds.map((paymentId) =>
          updatePaymentStatusMutation.mutateAsync({ id: paymentId, status: "scheduled" })
        )
      );
      toast.success(`${selectedPaymentIds.length} pagamento(s) marcado(s) como agendado(s).`);
      setSelectedPaymentIds([]);
      void refetchPendingPayments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar pagamentos em lote.");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto" />
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  if (ordersLoading || partnersLoading || pendingPaymentsLoading) {
    return (
      <Layout>
        <AdminNav />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-foreground/70">Carregando dashboard...</p>
        </div>
      </Layout>
    );
  }

  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter((order) => order.status === "completed" || order.status === "closed").length || 0;
  const totalHours = orders?.reduce((acc, order) => acc + (Number.parseFloat(String(order.totalHours || "0")) || 0), 0) || 0;
  const averageHoursPerOrder = totalOrders > 0 ? (totalHours / totalOrders).toFixed(2) : "0";

  const hourlyRate = 150;
  const totalRevenue = totalHours * hourlyRate;
  const pendingPayments = pendingPaymentsList.length;
  const pendingRevenue = pendingPaymentsList.reduce(
    (acc, payment) => acc + Number.parseFloat(String(payment.amount || "0")),
    0
  );
  const overdueRevenue = overduePayments.reduce(
    (acc, payment) => acc + Number.parseFloat(String(payment.amount || "0")),
    0
  );

  const partnerHoursMap = new Map<number, { name: string; hours: number }>();
  orders?.forEach((order) => {
    const hours = Number.parseFloat(String(order.totalHours || "0")) || 0;
    if (partnerHoursMap.has(order.partnerId)) {
      const existing = partnerHoursMap.get(order.partnerId)!;
      existing.hours += hours;
    } else {
      const partner = partners?.find((item) => item.id === order.partnerId);
      partnerHoursMap.set(order.partnerId, {
        name: partner?.companyName || `Parceiro ${order.partnerId}`,
        hours,
      });
    }
  });

  const partnerHoursData = Array.from(partnerHoursMap.values()).map((item) => ({
    name: item.name,
    horas: Number.parseFloat(item.hours.toFixed(2)),
    receita: Number.parseFloat((item.hours * hourlyRate).toFixed(2)),
  }));

  const statusData = [
    { name: "Rascunho", value: orders?.filter((order) => order.status === "draft").length || 0 },
    { name: "Enviada", value: orders?.filter((order) => order.status === "sent").length || 0 },
    { name: "Em Progresso", value: orders?.filter((order) => order.status === "in_progress").length || 0 },
    { name: "Concluída", value: orders?.filter((order) => order.status === "completed").length || 0 },
    { name: "Encerrada", value: orders?.filter((order) => order.status === "closed").length || 0 },
  ].filter((item) => item.value > 0);

  const COLORS = ["#94a3b8", "#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

  const monthlyData = new Map<string, { month: string; orders: number; hours: number }>();
  orders?.forEach((order) => {
    const date = new Date(order.startDateTime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = date.toLocaleDateString("pt-BR", { year: "numeric", month: "short" });

    if (monthlyData.has(monthKey)) {
      const existing = monthlyData.get(monthKey)!;
      existing.orders += 1;
      existing.hours += Number.parseFloat(String(order.totalHours || "0")) || 0;
    } else {
      monthlyData.set(monthKey, {
        month: monthLabel,
        orders: 1,
        hours: Number.parseFloat(String(order.totalHours || "0")) || 0,
      });
    }
  });

  const monthlyChartData = Array.from(monthlyData.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, item]) => ({
      mes: item.month,
      ordens: item.orders,
      horas: Number.parseFloat(item.hours.toFixed(2)),
    }));

  return (
    <Layout>
      <AdminNav />
      <div className="min-h-screen bg-gradient-to-br from-background via-red-50/30 to-background py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard de Pagamentos</h1>
              <p className="text-foreground/70">Visão gerencial de receitas, horas trabalhadas e pendências financeiras.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/80 border rounded-xl p-4 shadow-sm">
              <div>
                <Label htmlFor="periodStart">Início</Label>
                <Input
                  id="periodStart"
                  type="date"
                  value={formatDateInput(periodStart)}
                  onChange={(event) => setPeriodStart(new Date(`${event.target.value}T00:00:00`))}
                />
              </div>
              <div>
                <Label htmlFor="periodEnd">Fim</Label>
                <Input
                  id="periodEnd"
                  type="date"
                  value={formatDateInput(periodEnd)}
                  onChange={(event) => setPeriodEnd(new Date(`${event.target.value}T23:59:59`))}
                />
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={() => void refetchPendingPayments()}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground/70">Total de Ordens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{totalOrders}</p>
                <p className="text-sm text-foreground/60 mt-1">{completedOrders} concluídas ou encerradas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground/70">Total de Horas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{totalHours.toFixed(2)}h</p>
                <p className="text-sm text-foreground/60 mt-1">Média: {averageHoursPerOrder}h por OS</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground/70">Receita Gerada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-foreground/60 mt-1">Referência: {formatCurrency(hourlyRate)}/hora</p>
              </CardContent>
            </Card>

            <Card className={overduePayments.length > 0 ? "border-orange-200 bg-orange-50/80" : undefined}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground/70">Pagamentos Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">{formatCurrency(pendingRevenue)}</p>
                <p className="text-sm text-foreground/60 mt-1">{pendingPayments} pendência(s), {overduePayments.length} vencida(s)</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8 border-orange-100">
            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Pendências de pagamento do período
                </CardTitle>
                <p className="text-sm text-foreground/60 mt-1">
                  Use a seleção múltipla para agendar pagamentos pendentes. Pendências com mais de 20 dias recebem destaque operacional.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  disabled={selectedPaymentIds.length === 0 || updatePaymentStatusMutation.isPending}
                  onClick={handleBatchSchedule}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Agendar selecionados
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg border bg-white/80 p-4">
                  <p className="text-sm text-foreground/60">Selecionados</p>
                  <p className="text-2xl font-bold text-foreground">{selectedPaymentIds.length}</p>
                </div>
                <div className="rounded-lg border bg-white/80 p-4">
                  <p className="text-sm text-foreground/60">Valor selecionado</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(scheduledProjection)}</p>
                </div>
                <div className="rounded-lg border bg-white/80 p-4">
                  <p className="text-sm text-foreground/60">Vencidos há mais de 20 dias</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(overdueRevenue)}</p>
                </div>
              </div>

              {pendingPaymentsList.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full bg-white text-sm">
                    <thead className="bg-muted/60">
                      <tr className="border-b">
                        <th className="w-12 px-4 py-3 text-left">
                          <Checkbox
                            checked={selectedPaymentIds.length === pendingPaymentsList.length && pendingPaymentsList.length > 0}
                            onCheckedChange={(checked) => handleToggleAll(Boolean(checked))}
                            aria-label="Selecionar todos os pagamentos pendentes"
                          />
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">Pagamento</th>
                        <th className="px-4 py-3 text-left font-semibold">Parceiro</th>
                        <th className="px-4 py-3 text-right font-semibold">Valor</th>
                        <th className="px-4 py-3 text-left font-semibold">Criado em</th>
                        <th className="px-4 py-3 text-left font-semibold">Idade</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                        <th className="px-4 py-3 text-right font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPaymentsList.map((payment) => {
                        const ageDays = getPaymentAgeDays(payment.createdAt);
                        const partner = partners?.find((item) => item.id === payment.partnerId);
                        const isOverdue = ageDays > 20;

                        return (
                          <tr key={payment.id} className={`border-b last:border-b-0 ${isOverdue ? "bg-orange-50/70" : ""}`}>
                            <td className="px-4 py-3 align-middle">
                              <Checkbox
                                checked={selectedPaymentIds.includes(payment.id)}
                                onCheckedChange={(checked) => handleTogglePayment(payment.id, Boolean(checked))}
                                aria-label={`Selecionar pagamento ${payment.id}`}
                              />
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <div className="font-semibold text-foreground">#{payment.id}</div>
                              <div className="text-xs text-foreground/60">OS #{payment.osId}</div>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <div className="font-medium text-foreground">{partner?.companyName || `Parceiro ${payment.partnerId}`}</div>
                              <div className="text-xs text-foreground/60">ID {payment.partnerId}</div>
                            </td>
                            <td className="px-4 py-3 text-right align-middle font-semibold text-green-700">
                              {formatCurrency(Number.parseFloat(String(payment.amount || "0")) || 0)}
                            </td>
                            <td className="px-4 py-3 align-middle">{formatDateTime(payment.createdAt)}</td>
                            <td className="px-4 py-3 align-middle">
                              <Badge variant={isOverdue ? "destructive" : "secondary"} className="gap-1">
                                {isOverdue && <AlertTriangle className="h-3 w-3" />}
                                {ageDays} dia(s)
                              </Badge>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <Badge variant="outline">{PAYMENT_STATUS_LABELS[payment.paymentStatus as PaymentStatus] || payment.paymentStatus}</Badge>
                            </td>
                            <td className="px-4 py-3 align-middle text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={updatePaymentStatusMutation.isPending}
                                  onClick={() => handleUpdatePaymentStatus(payment.id, "scheduled")}
                                >
                                  Agendar
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={updatePaymentStatusMutation.isPending}
                                  onClick={() => handleUpdatePaymentStatus(payment.id, "completed")}
                                >
                                  Pagar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed py-12 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-green-600 mb-3" />
                  <p className="font-semibold text-foreground">Nenhum pagamento pendente no período selecionado.</p>
                  <p className="text-sm text-foreground/60 mt-1">Ajuste as datas para consultar outro intervalo.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Horas por Consultor</CardTitle>
              </CardHeader>
              <CardContent>
                {partnerHoursData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={partnerHoursData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="horas" fill="#dc2626" name="Horas" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-foreground/60 py-12">Nenhum dado disponível</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((item, index) => (
                          <Cell key={`cell-${item.name}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-foreground/60 py-12">Nenhum dado disponível</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="ordens" stroke="#3b82f6" name="Ordens" />
                    <Line yAxisId="right" type="monotone" dataKey="horas" stroke="#dc2626" name="Horas" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-foreground/60 py-12">Nenhum dado disponível</p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Receita por Consultor</CardTitle>
            </CardHeader>
            <CardContent>
              {partnerHoursData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Consultor</th>
                        <th className="text-right py-3 px-4">Horas Trabalhadas</th>
                        <th className="text-right py-3 px-4">Receita Gerada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partnerHoursData.map((partner) => (
                        <tr key={partner.name} className="border-b">
                          <td className="py-3 px-4">{partner.name}</td>
                          <td className="text-right py-3 px-4">{partner.horas}h</td>
                          <td className="text-right py-3 px-4 font-semibold text-green-600">{formatCurrency(partner.receita)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold">
                        <td className="py-3 px-4">Total</td>
                        <td className="text-right py-3 px-4">{totalHours.toFixed(2)}h</td>
                        <td className="text-right py-3 px-4 text-green-600">{formatCurrency(totalRevenue)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-center text-foreground/60 py-12">Nenhum dado disponível</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
