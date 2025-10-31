
"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";

import { Field } from "@chakra-ui/react/field";

import { useState } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";

// Inline simple toaster fallback
type ToastOptions = {
  title?: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
};

const toaster = {
  create: (opts: ToastOptions) => {
    if (typeof window !== "undefined") {
      console.log("[toaster]", opts.type, opts.title, opts.description);
    }
  },
};

interface AddFinancaProps {
  onBack: () => void;
}

export default function AddFinanca({ onBack }: AddFinancaProps) {
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    plano: "",
    valorPlano: "",
    periodoPlano: "30",
    dataVencimento: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.nome.trim()) {
      toaster.create({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do cliente ou descrição.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    if (!formData.plano.trim()) {
      toaster.create({
        title: "Plano obrigatório",
        description: "Por favor, informe o plano ou tipo de cobrança.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    if (!formData.valorPlano || parseFloat(formData.valorPlano) <= 0) {
      toaster.create({
        title: "Valor inválido",
        description: "Por favor, informe um valor válido.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    if (!formData.dataVencimento) {
      toaster.create({
        title: "Data de vencimento obrigatória",
        description: "Por favor, informe a data de vencimento.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);

    try {
      // Calcular mês/ano baseado na data de vencimento
      const dataVenc = new Date(formData.dataVencimento);
      const mes = String(dataVenc.getMonth() + 1).padStart(2, "0");
      const ano = String(dataVenc.getFullYear());
      const mesAno = `${mes}/${ano}`;

      const financaData = {
        nome: formData.nome.trim(),
        cpf: formData.cpf.trim() || undefined, // Enviar undefined se vazio
        plano: formData.plano.trim(),
        valorPlano: parseFloat(formData.valorPlano),
        periodoPlano: parseInt(formData.periodoPlano) || 30,
        dataVencimento: formData.dataVencimento,
        mesAno: mesAno,
      };

      const response = await fetch("/api/addfinancas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(financaData),
      });

      const result = await response.json();

      if (result.success) {
        toaster.create({
          title: "Finança cadastrada com sucesso!",
          description: `Cobrança de ${formData.nome} cadastrada para ${mesAno}.`,
          type: "success",
          duration: 5000,
        });

        onBack();
      } else {
        toaster.create({
          title: "Erro ao cadastrar finança",
          description: result.error || "Ocorreu um erro ao salvar o registro.",
          type: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Erro ao cadastrar finança:", error);
      toaster.create({
        title: "Erro ao cadastrar finança",
        description: "Ocorreu um erro ao salvar o registro.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
            Nova Cobrança
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Cadastre uma nova cobrança ou conta a receber
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
          w={["100%", "100%", "700px"]}
          p={{ base: 4, md: 8 }}
        >
          <form onSubmit={handleSubmit}>
            <Stack gap={6}>
              {/* Nome/Descrição */}
              <Field.Root required>
                <Field.Label>Nome do Cliente / Descrição</Field.Label>
                <Input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex: João Silva ou Mensalidade Outubro"
                  size="lg"
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px #3182ce",
                  }}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Obrigatório
                </Text>
              </Field.Root>

              {/* CPF (opcional) */}
              <Field.Root>
                <Field.Label>CPF (opcional)</Field.Label>
                <Input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData({ ...formData, cpf: e.target.value })
                  }
                  placeholder="000.000.000-00"
                  size="lg"
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px #3182ce",
                  }}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Deixe em branco para lançamentos sem CPF
                </Text>
              </Field.Root>

              {/* Plano/Tipo */}
              <Field.Root required>
                <Field.Label>Plano / Tipo de Cobrança</Field.Label>
                <Input
                  type="text"
                  value={formData.plano}
                  onChange={(e) =>
                    setFormData({ ...formData, plano: e.target.value })
                  }
                  placeholder="Ex: Mensal 2x, Trimestral, Serviço Avulso"
                  size="lg"
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px #3182ce",
                  }}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Obrigatório
                </Text>
              </Field.Root>

              {/* Valor */}
              <Field.Root required>
                <Field.Label>Valor (R$)</Field.Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valorPlano}
                  onChange={(e) =>
                    setFormData({ ...formData, valorPlano: e.target.value })
                  }
                  placeholder="0.00"
                  size="lg"
                  bg="white"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px #3182ce",
                  }}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Obrigatório
                </Text>
              </Field.Root>

              {/* Período (dias) */}
              <Field.Root>
                <Field.Label>Período (dias)</Field.Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.periodoPlano}
                  onChange={(e) =>
                    setFormData({ ...formData, periodoPlano: e.target.value })
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
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Usado para calcular próxima cobrança (padrão: 30 dias)
                </Text>
              </Field.Root>

              {/* Data de Vencimento */}
              <Field.Root required>
                <Field.Label>Data de Vencimento</Field.Label>
                <Input
                  type="date"
                  value={formData.dataVencimento}
                  onChange={(e) =>
                    setFormData({ ...formData, dataVencimento: e.target.value })
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
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Obrigatório - Define também o mês/ano do registro
                </Text>
              </Field.Root>

              {/* Resumo */}
              {formData.nome && formData.valorPlano && formData.dataVencimento && (
                <Box
                  p={4}
                  bg="blue.50"
                  borderRadius="md"
                  border="1px"
                  borderColor="blue.200"
                >
                  <Heading size="sm" color="blue.800" mb={3}>
                    Resumo
                  </Heading>
                  <Stack gap={2} fontSize="sm">
                    <Flex justify="space-between">
                      <Text color="blue.700" fontWeight="medium">
                        Cliente/Descrição:
                      </Text>
                      <Text color="blue.900">{formData.nome}</Text>
                    </Flex>
                    {formData.cpf && (
                      <Flex justify="space-between">
                        <Text color="blue.700" fontWeight="medium">
                          CPF:
                        </Text>
                        <Text color="blue.900">{formData.cpf}</Text>
                      </Flex>
                    )}
                    <Flex justify="space-between">
                      <Text color="blue.700" fontWeight="medium">
                        Valor:
                      </Text>
                      <Text color="blue.900">
                        R$ {parseFloat(formData.valorPlano || "0").toFixed(2)}
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="blue.700" fontWeight="medium">
                        Vencimento:
                      </Text>
                      <Text color="blue.900">
                        {new Date(formData.dataVencimento).toLocaleDateString(
                          "pt-BR",
                          { timeZone: "UTC" }
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
                >
                  <Flex align="center" gap={2}>
                    <FiSave size={20} />
                    Salvar Cobrança
                  </Flex>
                </Button>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Flex>
    </Box>
  );
}

