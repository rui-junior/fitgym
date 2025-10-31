"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Spinner,
  Stack,
  Text,
  createListCollection,
} from "@chakra-ui/react";

// Inline simple toaster fallback (replaces missing "@/components/ui/toaster" module)
type ToastOptions = {
  title?: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
};

const toaster = {
  create: (opts: ToastOptions) => {
    // Minimal fallback: log to console so callers still work during development.
    if (typeof window !== "undefined") {
      console.log("[toaster]", opts.type, opts.title, opts.description);
    }
  },
};

function Toaster({
  toaster: _t,
  children,
}: {
  toaster?: typeof toaster;
  children?: any;
}) {
  // This is a no-op visual component fallback so the JSX using <Toaster> compiles.
  return <>{children}</>;
}

import { Field } from "@chakra-ui/react/field";

import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@chakra-ui/react/select";

import { useEffect, useState } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";

interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  ativo: boolean;
}

interface Plano {
  id: string;
  nome: string;
  periodo: number;
  valor: number;
}

interface AddAssinaturaProps {
  onBack: () => void;
  mesAno: string; // Formato: mm-aaaa
}

export default function AddAssinatura({ onBack, mesAno }: AddAssinaturaProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [isLoadingClientes, setIsLoadingClientes] = useState(true);
  const [isLoadingPlanos, setIsLoadingPlanos] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Calcular data de início padrão baseada no mesAno recebido
  const getDataInicioPadrao = () => {
    const [mes, ano] = mesAno.split("-");
    return `${ano}-${mes}-01`; // Primeiro dia do mês selecionado
  };

  const [formData, setFormData] = useState({
    clienteId: "",
    planoId: "",
    dataInicio: getDataInicioPadrao(),
  });

  // Criar coleções para os selects
  const clientesCollection = createListCollection({
    items: clientes.map((c) => ({
      label: `${c.nome} - ${c.cpf}`,
      value: c.id,
    })),
  });

  const planosCollection = createListCollection({
    items: planos.map((p) => ({
      label: `${p.nome} - R$ ${p.valor.toFixed(2)} (${p.periodo} dias)`,
      value: p.id,
    })),
  });

  // Buscar clientes ativos
  const fetchClientes = async () => {
    setIsLoadingClientes(true);
    try {
      const response = await fetch("/api/verifyclient");
      const result = await response.json();

      if (result.success) {
        const clientesAtivos = result.data.filter((c: Cliente) => c.ativo);
        setClientes(clientesAtivos);
      } else {
        toaster.create({
          title: "Erro ao carregar clientes",
          description: result.message,
          type: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toaster.create({
        title: "Erro ao carregar clientes",
        description: "Ocorreu um erro ao buscar os clientes.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoadingClientes(false);
    }
  };

  // Buscar planos disponíveis
  const fetchPlanos = async () => {
    setIsLoadingPlanos(true);
    try {
      const response = await fetch("/api/verifyplanos");
      const result = await response.json();

      if (result.success) {
        setPlanos(result.data);
      } else {
        toaster.create({
          title: "Erro ao carregar planos",
          description: result.message,
          type: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
      toaster.create({
        title: "Erro ao carregar planos",
        description: "Ocorreu um erro ao buscar os planos.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoadingPlanos(false);
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchPlanos();
  }, []);

  const clienteSelecionado = clientes.find((c) => c.id === formData.clienteId);
  const planoSelecionado = planos.find((p) => p.id === formData.planoId);

  const calcularDataFim = () => {
    if (!formData.dataInicio || !planoSelecionado) return "";

    const dataInicio = new Date(formData.dataInicio);
    const dataFim = new Date(dataInicio);
    dataFim.setDate(dataFim.getDate() + planoSelecionado.periodo);

    return dataFim.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clienteId) {
      toaster.create({
        title: "Cliente não selecionado",
        description: "Por favor, selecione um cliente.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    if (!formData.planoId) {
      toaster.create({
        title: "Plano não selecionado",
        description: "Por favor, selecione um plano.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    if (!formData.dataInicio) {
      toaster.create({
        title: "Data de início não informada",
        description: "Por favor, informe a data de início.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);

    try {
      const dataFim = calcularDataFim();
      
      // Usar o mesAno recebido como prop
      const mesAnoFormatado = mesAno;
      const [mes, ano] = mesAno.split("-");

      const assinaturaData = {
        clienteId: formData.clienteId,
        clienteNome: clienteSelecionado?.nome || "",
        clienteCpf: clienteSelecionado?.cpf || "",
        planoId: formData.planoId,
        planoNome: planoSelecionado?.nome || "",
        valorPlano: planoSelecionado?.valor || 0,
        periodoPlano: planoSelecionado?.periodo || 30,
        dataInicio: formData.dataInicio,
        dataFim: dataFim,
        status: "ativa",
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      };

      // Chamar API de assinatura
      const response = await fetch("/api/addassinatura", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mesAno: mesAnoFormatado,
          assinatura: assinaturaData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Calcular data de vencimento (data de fim da assinatura)
        const dataVencimento = dataFim;

        // Chamar API de finanças
        const financaData = {
          nome: clienteSelecionado?.nome || "",
          mesAno: `${mes}/${ano}`, // Formato MM/AAAA
          cpf: clienteSelecionado?.cpf || "",
          plano: planoSelecionado?.nome || "",
          valorPlano: planoSelecionado?.valor || 0,
          periodoPlano: planoSelecionado?.periodo || 30,
          dataVencimento: dataVencimento,
        };

        const financaResponse = await fetch("/api/addfinancas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(financaData),
        });

        const financaResult = await financaResponse.json();

        if (financaResult.success) {
          toaster.create({
            title: "Assinatura criada com sucesso!",
            description: `Assinatura de ${clienteSelecionado?.nome} cadastrada e registro financeiro criado.`,
            type: "success",
            duration: 5000,
          });
        } else {
          // Assinatura foi criada, mas finança falhou
          toaster.create({
            title: "Assinatura criada",
            description: `Assinatura cadastrada, mas houve erro ao criar registro financeiro: ${financaResult.error || "erro desconhecido"}`,
            type: "warning",
            duration: 5000,
          });
        }

        onBack();
      } else {
        toaster.create({
          title: "Erro ao criar assinatura",
          description:
            result.message || "Ocorreu um erro ao salvar a assinatura.",
          type: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar assinatura:", error);
      toaster.create({
        title: "Erro ao criar assinatura",
        description: "Ocorreu um erro ao salvar a assinatura.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isLoadingClientes || isLoadingPlanos;

  // Formatar mesAno para exibição
  const getMesAnoExibicao = () => {
    const [mes, ano] = mesAno.split("-");
    const data = new Date(parseInt(ano), parseInt(mes) - 1);
    return data.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <Toaster toaster={toaster}>{() => null}</Toaster>
      <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={4}
          mb={8}
        >
          <Box>
            <Heading size="lg" color="gray.800" mb={2}>
              Nova Assinatura
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Cadastre uma nova assinatura para {getMesAnoExibicao()}
            </Text>
          </Box>

          <Button
            variant="outline"
            colorScheme="gray"
            size="lg"
            onClick={onBack}
            disabled={isSaving}
          >
            <Flex align="center" gap={2}>
              <FiArrowLeft size={20} />
              Voltar
            </Flex>
          </Button>
        </Flex>

        <Flex w={"100%"} h={"100%"} justify={"center"} align={"flex-start"}>
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            w={["700px"]}
            p={{ base: 4, md: 8 }}
          >
            {isLoading ? (
              <Flex justify="center" align="center" py={12}>
                <Flex direction="column" align="center" gap={4}>
                  <Spinner size="lg" color="blue.500" />
                  <Text color="gray.600">Carregando dados...</Text>
                </Flex>
              </Flex>
            ) : (
              <form onSubmit={handleSubmit}>
                <Stack gap={6}>
                  {/* Seleção de Cliente */}
                  <Field.Root required>
                    <Field.Label>Cliente</Field.Label>
                    <SelectRoot
                      collection={clientesCollection}
                      size="lg"
                      value={formData.clienteId ? [formData.clienteId] : []}
                      onValueChange={(e) =>
                        setFormData({
                          ...formData,
                          clienteId: e.value[0] || "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientesCollection.items.map((cliente) => (
                          <SelectItem item={cliente} key={cliente.value}>
                            {cliente.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                    {clientes.length === 0 && (
                      <Text color="red.500" fontSize="sm" mt={2}>
                        Nenhum cliente ativo encontrado. Cadastre um cliente
                        primeiro.
                      </Text>
                    )}
                  </Field.Root>

                  {/* Seleção de Plano */}
                  <Field.Root required>
                    <Field.Label>Plano</Field.Label>
                    <SelectRoot
                      collection={planosCollection}
                      size="lg"
                      value={formData.planoId ? [formData.planoId] : []}
                      onValueChange={(e) =>
                        setFormData({ ...formData, planoId: e.value[0] || "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {planosCollection.items.map((plano) => (
                          <SelectItem item={plano} key={plano.value}>
                            {plano.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>
                    {planos.length === 0 && (
                      <Text color="red.500" fontSize="sm" mt={2}>
                        Nenhum plano disponível. Cadastre um plano primeiro.
                      </Text>
                    )}
                  </Field.Root>

                  {/* Data de Início */}
                  <Field.Root required>
                    <Field.Label>Data de Início</Field.Label>
                    <Input
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) =>
                        setFormData({ ...formData, dataInicio: e.target.value })
                      }
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px #3182ce",
                      }}
                    />
                  </Field.Root>

                  {/* Resumo da Assinatura */}
                  {planoSelecionado && formData.dataInicio && (
                    <Box
                      p={4}
                      bg="blue.50"
                      borderRadius="md"
                      border="1px"
                      borderColor="blue.200"
                    >
                      <Heading size="sm" color="blue.800" mb={3}>
                        Resumo da Assinatura
                      </Heading>
                      <Stack gap={2} fontSize="sm">
                        <Flex justify="space-between">
                          <Text color="blue.700" fontWeight="medium">
                            Plano:
                          </Text>
                          <Text color="blue.900">{planoSelecionado.nome}</Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="blue.700" fontWeight="medium">
                            Valor:
                          </Text>
                          <Text color="blue.900">
                            R$ {planoSelecionado.valor.toFixed(2)}
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="blue.700" fontWeight="medium">
                            Período:
                          </Text>
                          <Text color="blue.900">
                            {planoSelecionado.periodo} dias
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="blue.700" fontWeight="medium">
                            Data de Início:
                          </Text>
                          <Text color="blue.900">
                            {new Date(formData.dataInicio).toLocaleDateString(
                              "pt-BR"
                            )}
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="blue.700" fontWeight="medium">
                            Data de Fim:
                          </Text>
                          <Text color="blue.900">
                            {new Date(calcularDataFim()).toLocaleDateString(
                              "pt-BR"
                            )}
                          </Text>
                        </Flex>
                      </Stack>
                    </Box>
                  )}

                  {/* Botões */}
                  <Flex gap={4} justify="flex-end" pt={4}>
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      size="lg"
                      onClick={onBack}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      loading={isSaving}
                      loadingText="Salvando..."
                      disabled={clientes.length === 0 || planos.length === 0}
                    >
                      <Flex align="center" gap={2}>
                        <FiSave size={20} />
                        Salvar Assinatura
                      </Flex>
                    </Button>
                  </Flex>
                </Stack>
              </form>
            )}
          </Box>
        </Flex>
      </Box>
    </>
  );
}
