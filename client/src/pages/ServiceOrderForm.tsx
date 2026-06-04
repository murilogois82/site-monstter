import { useEffect, useState } from "react";
import { useLocalAuth } from "@/_core/hooks/useLocalAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ServiceOrderForm() {
  const { user, isAuthenticated, isLoading } = useLocalAuth();
  const [, setLocation] = useLocation();

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/simple-login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    osNumber: "",
    clientName: "",
    clientEmail: "",
    serviceType: "",
    startDateTime: "",
    interval: "",
    endDateTime: "",
    description: "",
  });

  // Buscar lista de clientes
  const { data: clients } = trpc.clientManagement.listAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Buscar próximo número de OS
  const { data: nextOSNumber } = trpc.serviceOrder.getNextOSNumber.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createOSMutation = trpc.serviceOrder.create.useMutation();

  // Preencher número de OS automaticamente quando carregar
  useEffect(() => {
    if (nextOSNumber) {
      console.log("Numero da OS gerado:", nextOSNumber);
      setFormData((prev) => ({
        ...prev,
        osNumber: nextOSNumber,
      }));
    }
  }, [nextOSNumber, isAuthenticated]);

  // Debug: log do formData quando osNumber muda
  useEffect(() => {
    if (formData.osNumber) {
      console.log("FormData atualizado com osNumber:", formData.osNumber);
    }
  }, [formData.osNumber]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro deste campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const selectedClient = clients?.find((c) => c.id === parseInt(clientId));
    if (selectedClient) {
      console.log("Cliente selecionado:", selectedClient);
      setFormData((prev) => ({
        ...prev,
        clientName: selectedClient.name || "",
        clientEmail: selectedClient.email || "",
      }));
      // Limpar erro de cliente
      if (errors.clientId) {
        setErrors((prev) => ({
          ...prev,
          clientId: "",
        }));
      }
    } else {
      console.warn("Cliente não encontrado para ID:", clientId);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.osNumber.trim()) {
      newErrors.osNumber = "Número da OS é obrigatório";
    }
    if (!selectedClientId) {
      newErrors.clientId = "Selecione um cliente";
    }
    if (!formData.clientName.trim()) {
      newErrors.clientName = "Nome do cliente é obrigatório";
    }
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = "E-mail do cliente é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = "E-mail inválido";
    }
    if (!formData.serviceType.trim()) {
      newErrors.serviceType = "Tipo de serviço é obrigatório";
    }
    if (!formData.startDateTime) {
      newErrors.startDateTime = "Data e hora de início é obrigatória";
    }
    if (!formData.endDateTime) {
      newErrors.endDateTime = "Data e hora de término é obrigatória";
    }
    if (formData.startDateTime && formData.endDateTime) {
      const start = new Date(formData.startDateTime);
      const end = new Date(formData.endDateTime);
      if (end <= start) {
        newErrors.endDateTime = "Data de término deve ser posterior à data de início";
      }
    }
    if (formData.interval) {
      const intervalNum = parseInt(formData.interval);
      if (isNaN(intervalNum) || intervalNum < 0) {
        newErrors.interval = "Intervalo deve ser um número positivo";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalHours = () => {
    if (!formData.startDateTime || !formData.endDateTime) return 0;

    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);
    const diffMs = end.getTime() - start.getTime();
    let diffHours = diffMs / (1000 * 60 * 60);

    // Descontar intervalo (em minutos) do total de horas
    if (formData.interval) {
      const intervalHours = parseInt(formData.interval) / 60;
      diffHours = diffHours - intervalHours;
    }

    return Math.max(0, Math.round(diffHours * 100) / 100);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setLoading(true);
    try {
      const totalHours = calculateTotalHours();

      await createOSMutation.mutateAsync({
        osNumber: formData.osNumber,
        clientId: selectedClientId ? parseInt(selectedClientId) : undefined,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        serviceType: formData.serviceType,
        startDateTime: new Date(formData.startDateTime),
        interval: formData.interval ? parseInt(formData.interval) : undefined,
        endDateTime: formData.endDateTime ? new Date(formData.endDateTime) : undefined,
        totalHours: totalHours > 0 ? totalHours : undefined,
        description: formData.description,
      });

      toast.success("✅ Ordem de Serviço salva com sucesso!");
      setFormData({
        osNumber: nextOSNumber || "",
        clientName: "",
        clientEmail: "",
        serviceType: "",
        startDateTime: "",
        interval: "",
        endDateTime: "",
        description: "",
      });
      setSelectedClientId("");
    } catch (error: any) {
      console.error("Erro ao salvar OS:", error);
      
      if (error.message?.includes("Duplicate") || error.message?.includes("UNIQUE")) {
        toast.error("❌ Este número de OS já existe. Use outro número.");
      } else if (error.message?.includes("email")) {
        toast.error("❌ E-mail inválido ou já existe.");
      } else {
        toast.error(`❌ Erro ao salvar: ${error.message || "Erro desconhecido"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setShowConfirmation(true);
  };

  const confirmSend = async () => {
    setShowConfirmation(false);
    setLoading(true);
    try {
      const totalHours = calculateTotalHours();

      const result = await createOSMutation.mutateAsync({
        osNumber: formData.osNumber,
        clientId: selectedClientId ? parseInt(selectedClientId) : undefined,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        serviceType: formData.serviceType,
        startDateTime: new Date(formData.startDateTime),
        interval: formData.interval ? parseInt(formData.interval) : undefined,
        endDateTime: formData.endDateTime ? new Date(formData.endDateTime) : undefined,
        totalHours: totalHours > 0 ? totalHours : undefined,
        description: formData.description,
      });

      toast.success("✅ Ordem de Serviço enviada com sucesso!");
      setFormData({
        osNumber: nextOSNumber || "",
        clientName: "",
        clientEmail: "",
        serviceType: "",
        startDateTime: "",
        interval: "",
        endDateTime: "",
        description: "",
      });
      setSelectedClientId("");
      setLocation("/partners/service-orders");
    } catch (error: any) {
      console.error("Erro ao enviar OS:", error);
      
      if (error.message?.includes("Duplicate") || error.message?.includes("UNIQUE")) {
        toast.error("❌ Este número de OS já existe. Use outro número.");
      } else if (error.message?.includes("email")) {
        toast.error("❌ E-mail inválido ou já existe.");
      } else {
        toast.error(`❌ Erro ao enviar: ${error.message || "Erro desconhecido"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalHours = calculateTotalHours();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white">
            <CardTitle className="text-2xl">Nova Ordem de Serviço</CardTitle>
            <p className="text-red-100 mt-2">Preencha os dados da ordem de serviço abaixo</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Número da OS - Editável */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Número da OS *
              </Label>
              <Input
                type="text"
                name="osNumber"
                value={formData.osNumber}
                onChange={handleInputChange}
                placeholder={nextOSNumber || "Ex: OS-2026-0001"}
                className={`font-semibold ${errors.osNumber ? "border-red-500" : ""}`}
              />
              {errors.osNumber && <p className="text-red-500 text-sm mt-1">{errors.osNumber}</p>}
            </div>

            {/* Seleção de Cliente */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Selecionar Cliente *
              </Label>
              <Select value={selectedClientId} onValueChange={handleClientSelect}>
                <SelectTrigger className={errors.clientId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Escolha um cliente cadastrado" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>}
            </div>

            {/* Nome e E-mail do Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Nome do Cliente *
                </Label>
                <Input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Preenchido automaticamente"
                  className={errors.clientName ? "border-red-500" : ""}
                />
                {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>}
              </div>
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  E-mail do Cliente *
                </Label>
                <Input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  placeholder="Preenchido automaticamente"
                  className={errors.clientEmail ? "border-red-500" : ""}
                />
                {errors.clientEmail && <p className="text-red-500 text-sm mt-1">{errors.clientEmail}</p>}
              </div>
            </div>

            {/* Tipo de Serviço */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Tipo de Serviço *
              </Label>
              <Select value={formData.serviceType} onValueChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  serviceType: value,
                }));
                if (errors.serviceType) {
                  setErrors((prev) => ({
                    ...prev,
                    serviceType: "",
                  }));
                }
              }}>
                <SelectTrigger className={errors.serviceType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione um tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consultoria TOTVS ERP">Consultoria TOTVS ERP</SelectItem>
                  <SelectItem value="Implementação">Implementação</SelectItem>
                  <SelectItem value="Suporte Técnico">Suporte Técnico</SelectItem>
                  <SelectItem value="Treinamento">Treinamento</SelectItem>
                  <SelectItem value="Auditoria">Auditoria</SelectItem>
                  <SelectItem value="Customização">Customização</SelectItem>
                  <SelectItem value="Integração">Integração</SelectItem>
                </SelectContent>
              </Select>
              {errors.serviceType && <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>}
            </div>

            {/* Data e Hora de Início */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Data e Hora de Início *
                </Label>
                <Input
                  type="datetime-local"
                  name="startDateTime"
                  value={formData.startDateTime}
                  onChange={handleInputChange}
                  className={errors.startDateTime ? "border-red-500" : ""}
                  required
                />
                {errors.startDateTime && <p className="text-red-500 text-sm mt-1">{errors.startDateTime}</p>}
              </div>
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Intervalo (minutos)
                </Label>
                <Input
                  type="number"
                  name="interval"
                  value={formData.interval}
                  onChange={handleInputChange}
                  placeholder="Ex: 60 (será descontado do total)"
                  className={errors.interval ? "border-red-500" : ""}
                />
                {errors.interval && <p className="text-red-500 text-sm mt-1">{errors.interval}</p>}
              </div>
            </div>

            {/* Data e Hora de Término */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Data e Hora de Término *
              </Label>
              <Input
                type="datetime-local"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleInputChange}
                className={errors.endDateTime ? "border-red-500" : ""}
                required
              />
              {errors.endDateTime && <p className="text-red-500 text-sm mt-1">{errors.endDateTime}</p>}
            </div>

            {/* Total de Horas (Calculado) */}
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-foreground">
                Total de Horas (Calculado com desconto de intervalo): <span className="text-lg font-bold text-red-600">{totalHours} horas</span>
              </p>
            </div>

            {/* Descrição do Serviço */}
            <div>
              <Label className="block text-sm font-medium text-foreground mb-2">
                Descrição do Serviço
              </Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descreva os detalhes do serviço prestado..."
                rows={5}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-6">
              <Button
                onClick={handleSave}
                disabled={loading || Object.keys(errors).length > 0}
                variant="outline"
                className="flex-1"
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                onClick={handleSend}
                disabled={loading || Object.keys(errors).length > 0}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {loading ? "Enviando..." : "Enviar para Cliente"}
              </Button>
            </div>

            {/* Modal de Confirmação */}
            {showConfirmation && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-96">
                  <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white">
                    <CardTitle>Confirmar Envio</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="mb-4">Tem certeza que deseja enviar esta Ordem de Serviço para o cliente?</p>
                    <p className="text-sm text-gray-600 mb-6">
                      <strong>Cliente:</strong> {formData.clientName}<br />
                      <strong>E-mail:</strong> {formData.clientEmail}<br />
                      <strong>Total de Horas:</strong> {calculateTotalHours()} horas
                    </p>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => setShowConfirmation(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={confirmSend}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        Confirmar Envio
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
