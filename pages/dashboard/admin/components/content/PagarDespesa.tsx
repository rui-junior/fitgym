import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  IconButton,
  createToaster,
  Toaster,
  Field,
  Badge,
} from "@chakra-ui/react";

import { useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  pago: boolean;
  categoria?: string;
  mesAno: string;
  criadoEm: string;
  atualizadoEm: string;
}

interface PagarDespesaProps {
  despesa: Despesa;
  onBack: () => void;
}

const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
});

export default function PagarDespesa({ despesa, onBack }: PagarDespesaProps) {
  // Definir data de pagamento como hoje por padrão
  const hoje = new Date().toISOString().split("T")[0];
  const [dataPagamento, setDataPagamento] = useState(hoje);
  const [isLoading, setIsLoading] = useState(false);

  function formatarData(dataISO: string): string {
    const data = new Date(dataISO);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  function isVencido(dataISO: string): boolean {
    const hoje = new Date();
    const vencimento = new Date(dataISO);
    hoje.setHours(0, 0, 0, 0);
    vencimento.setHours(0, 0, 0, 0);
    return vencimento < hoje;
  }

  function diasAtraso(dataISO: string): number {
    const hoje = new Date();
    const vencimento = new Date(dataISO);
    hoje.setHours(0, 0, 0, 0);
    vencimento.setHours(0, 0, 0, 0);

    const diffTime = hoje.getTime() - vencimento.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!dataPagamento) {
      toaster.create({
        title: "Erro de validação",
        description: "Data de pagamento é obrigatória.",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/pagardespesa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: despesa.id,
          mesAno: despesa.mesAno,
          dataPagamento: dataPagamento,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toaster.create({
          title: "Pagamento registrado",
          description: "O pagamento da despesa foi registrado com sucesso.",
          type: "success",
          duration: 3000,
        });

        // Voltar para a lista após 1 segundo
        setTimeout(() => {
          onBack();
        }, 1000);
      } else {
        toaster.create({
          title: "Erro ao registrar pagamento",
          description: result.message || "Ocorreu um erro ao registrar o pagamento.",
          type: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toaster.create({
        title: "Erro ao registrar pagamento",
        description: "Ocorreu um erro ao registrar o pagamento.",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const vencido = isVencido(despesa.dataVencimento);
  const atraso = diasAtraso(despesa.dataVencimento);
  const dataVencimentoFormatada = formatarData(despesa.dataVencimento);

  return (
    <>
      {/* <Toaster toaster={toaster} /> */}

      <Box w="100%" minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
        <Box maxW="800px" mx="auto">
          {/* Header */}
          <Flex align="center" gap={3} mb={6}>
            <IconButton
              aria-label="Voltar"
              onClick={onBack}
              variant="ghost"
              size="lg"
              disabled={isLoading}
            >
              <FiArrowLeft />
            </IconButton>
            <Box>
              <Heading size="lg" color="gray.800">
                Lançar Pagamento
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Registre o pagamento desta despesa
              </Text>
            </Box>
          </Flex>

          {/* Informações da Despesa */}
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            p={{ base: 6, md: 8 }}
            mb={6}
          >
            <Flex align="center" justify="space-between" mb={4}>
              <Heading size="md" color="gray.800">
                Dados da Despesa
              </Heading>
              {vencido ? (
                <Badge colorScheme="red" fontSize="sm" px={3} py={1}>
                  Atrasado
                </Badge>
              ) : (
                <Badge colorScheme="yellow" fontSize="sm" px={3} py={1}>
                  Pendente
                </Badge>
              )}
            </Flex>

            <Stack gap={4}>
              <Flex justify="space-between" align="center">
                <Text color="gray.600" fontSize="sm" fontWeight="medium">
                  Descrição:
                </Text>
                <Text color="gray.800" fontSize="md" fontWeight="semibold">
                  {despesa.descricao}
                </Text>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text color="gray.600" fontSize="sm" fontWeight="medium">
                  Categoria:
                </Text>
                <Text color="gray.800" fontSize="md">
                  {despesa.categoria || "Geral"}
                </Text>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text color="gray.600" fontSize="sm" fontWeight="medium">
                  Valor:
                </Text>
                <Text
                  color="red.600"
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  R$ {despesa.valor.toFixed(2)}
                </Text>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text color="gray.600" fontSize="sm" fontWeight="medium">
                  Data de Vencimento:
                </Text>
                <Box textAlign="right">
                  <Text
                    color={vencido ? "red.600" : "gray.800"}
                    fontSize="md"
                    fontWeight="semibold"
                  >
                    {dataVencimentoFormatada}
                  </Text>
                  {vencido && (
                    <Text fontSize="xs" color="red.500" fontWeight="bold">
                      {atraso} dia{atraso !== 1 ? "s" : ""} de atraso
                    </Text>
                  )}
                </Box>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text color="gray.600" fontSize="sm" fontWeight="medium">
                  Mês/Ano:
                </Text>
                <Text color="gray.800" fontSize="md">
                  {despesa.mesAno}
                </Text>
              </Flex>
            </Stack>

            {vencido && (
              <Box
                mt={6}
                p={4}
                bg="red.50"
                borderRadius="lg"
                border="1px"
                borderColor="red.200"
              >
                <Flex align="center" gap={2}>
                  <FiAlertCircle color="#C53030" size={20} />
                  <Text fontSize="sm" color="red.800" fontWeight="medium">
                    Esta despesa está vencida há {atraso} dia{atraso !== 1 ? "s" : ""}
                  </Text>
                </Flex>
              </Box>
            )}
          </Box>

          {/* Formulário de Pagamento */}
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            p={{ base: 6, md: 8 }}
          >
            <Heading size="md" color="gray.800" mb={6}>
              Registrar Pagamento
            </Heading>

            <form onSubmit={handleSubmit}>
              <Stack gap={6}>
                {/* Data de Pagamento */}
                <Field.Root>
                  <Field.Label
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                  >
                    Data do Pagamento *
                  </Field.Label>
                  <Input
                    type="date"
                    value={dataPagamento}
                    onChange={(e) => setDataPagamento(e.target.value)}
                    size="lg"
                    disabled={isLoading}
                  />
                  <Field.HelperText fontSize="xs" color="gray.500">
                    Informe a data em que o pagamento foi realizado
                  </Field.HelperText>
                </Field.Root>

                {/* Botões */}
                <Flex gap={4} justify="flex-end" mt={4}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onBack}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="green"
                    size="lg"
                    // isLoading={isLoading}
                    loadingText="Registrando..."
                  >
                    <Flex align="center" gap={2}>
                      <FiCheckCircle />
                      Confirmar Pagamento
                    </Flex>
                  </Button>
                </Flex>
              </Stack>
            </form>
          </Box>

          {/* Informações adicionais */}
          <Box
            mt={6}
            p={4}
            bg="blue.50"
            borderRadius="lg"
            border="1px"
            borderColor="blue.200"
          >
            <Text fontSize="sm" color="blue.800" fontWeight="medium" mb={2}>
              💡 Dica
            </Text>
            <Text fontSize="xs" color="blue.700">
              Após confirmar o pagamento, a despesa será marcada como paga e não
              poderá ser editada. Certifique-se de que a data está correta antes de
              confirmar.
            </Text>
          </Box>
        </Box>
      </Box>
    </>
  );
}
