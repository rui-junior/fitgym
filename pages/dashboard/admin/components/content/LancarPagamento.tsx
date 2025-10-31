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
import { FiArrowLeft, FiCheck } from "react-icons/fi";

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

interface LancarPagamentoProps {
  financa: {
    id: string;
    nome: string;
    cpf: string;
    plano: string;
    valorPlano: number;
    periodoPlano: number;
    mesAno: string;
    dataVencimento: string;
  };
  onBack: () => void;
}

export default function LancarPagamento({
  financa,
  onBack,
}: LancarPagamentoProps) {
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dataPagamento) {
      toaster.create({
        title: "Data não informada",
        description: "Por favor, selecione a data de pagamento.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);

    try {
      // Converter mesAno de MM/AAAA para MM-AAAA
      const mesAnoFormatado = financa.mesAno.replace(/\//g, "-");

      // 1. Atualizar o registro financeiro (marcar como pago)
      const financaResponse = await fetch("/api/atualizafinancas", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: financa.id, // Incluir o ID do documento
          cpf: financa.cpf,
          mesAno: mesAnoFormatado,
          dataPagamento: dataPagamento,
        }),
      });

      const financaResult = await financaResponse.json();

      if (!financaResult.success) {
        toaster.create({
          title: "Erro ao registrar pagamento",
          description:
            financaResult.message || "Ocorreu um erro ao atualizar o registro financeiro.",
          type: "error",
          duration: 5000,
        });
        return;
      }

      // 2. Criar novo registro financeiro para o próximo período (apenas se tiver CPF válido)
      // Receitas avulsas (sem CPF ou com CPF null) não geram próxima cobrança automaticamente
      
      // if (financa.cpf && financa.cpf !== "null" && financa.periodoPlano > 0) {
      //   // Calcular próxima data de vencimento
      //   const dataVencimentoAtual = new Date(financa.dataVencimento);
      //   const proximaDataVencimento = new Date(dataVencimentoAtual);
      //   proximaDataVencimento.setDate(
      //     proximaDataVencimento.getDate() + financa.periodoPlano
      //   );

      //   // Calcular próximo mês/ano
      //   const proximoMes = String(proximaDataVencimento.getMonth() + 1).padStart(2, "0");
      //   const proximoAno = String(proximaDataVencimento.getFullYear());
      //   const proximoMesAno = `${proximoMes}/${proximoAno}`;

      //   const novaFinancaData = {
      //     nome: financa.nome,
      //     mesAno: proximoMesAno,
      //     cpf: financa.cpf,
      //     plano: financa.plano,
      //     valorPlano: financa.valorPlano,
      //     periodoPlano: financa.periodoPlano,
      //     dataVencimento: proximaDataVencimento.toISOString().split("T")[0],
      //   };

      //   const novaFinancaResponse = await fetch("/api/addfinancas", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(novaFinancaData),
      //   });

      //   const novaFinancaResult = await novaFinancaResponse.json();

      //   if (novaFinancaResult.success) {
      //     toaster.create({
      //       title: "Pagamento registrado com sucesso!",
      //       description: `Pagamento de ${financa.nome} confirmado e próxima cobrança criada para ${proximoMesAno}.`,
      //       type: "success",
      //       duration: 5000,
      //     });
      //   } else {
      //     // Pagamento foi registrado, mas falhou ao criar próxima cobrança
      //     toaster.create({
      //       title: "Pagamento registrado",
      //       description: `Pagamento confirmado, mas houve erro ao criar próxima cobrança: ${novaFinancaResult.error || "erro desconhecido"}`,
      //       type: "warning",
      //       duration: 5000,
      //     });
      //   }
      // } else {
      //   // Receita avulsa - apenas confirma o pagamento sem criar próxima cobrança
      //   toaster.create({
      //     title: "Pagamento registrado com sucesso!",
      //     description: `Pagamento de ${financa.nome} confirmado.`,
      //     type: "success",
      //     duration: 5000,
      //   });
      // }

      onBack();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toaster.create({
        title: "Erro ao registrar pagamento",
        description: "Ocorreu um erro ao processar o pagamento.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
      <Box maxW="600px" mx="auto">
        <Button variant="ghost" onClick={onBack} mb={6} disabled={isSaving}>
          <Flex align="center" gap={2}>
            <FiArrowLeft />
            Voltar
          </Flex>
        </Button>

        <Box
          bg="white"
          borderRadius="xl"
          shadow="sm"
          border="1px"
          borderColor="gray.200"
          p={6}
        >
          <Heading size="lg" color="gray.800" mb={6}>
            Lançar Pagamento
          </Heading>

          {/* Resumo da Finança */}
          <Box
            bg="blue.50"
            borderRadius="lg"
            p={4}
            mb={6}
            border="1px"
            borderColor="blue.200"
          >
            <Stack gap={3}>
              <Flex justify="space-between">
                <Text color="gray.600" fontWeight="medium">
                  Cliente:
                </Text>
                <Text color="gray.800" fontWeight="bold">
                  {financa.nome}
                </Text>
              </Flex>

              {/* <Flex justify="space-between">
                <Text color="gray.600" fontWeight="medium">
                  CPF:
                </Text>
                <Text color="gray.800" fontWeight="bold">
                  {financa.cpf}
                </Text>
              </Flex> */}

              <Flex justify="space-between">
                <Text color="gray.600" fontWeight="medium">
                  Plano:
                </Text>
                <Text color="gray.800" fontWeight="bold">
                  {financa.plano}
                </Text>
              </Flex>

              <Flex justify="space-between">
                <Text color="gray.600" fontWeight="medium">
                  Valor:
                </Text>
                <Text color="green.600" fontWeight="bold" fontSize="lg">
                  R$ {financa.valorPlano.toFixed(2)}
                </Text>
              </Flex>

              <Flex justify="space-between">
                <Text color="gray.600" fontWeight="medium">
                  Vencimento:
                </Text>
                <Text color="gray.800" fontWeight="bold">
                  {new Date(financa.dataVencimento).toLocaleDateString("pt-BR", {
                    timeZone: "UTC",
                  })}
                </Text>
              </Flex>
            </Stack>
          </Box>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            <Stack gap={6}>
              <Field.Root required>
                <Field.Label>Data do Pagamento</Field.Label>
                <Input
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
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
                  Data em que o pagamento foi recebido
                </Text>
              </Field.Root>

              {/* {financa.cpf && financa.cpf !== "null" && financa.periodoPlano > 0 && (
                <Box
                  bg="yellow.50"
                  borderRadius="md"
                  p={3}
                  border="1px"
                  borderColor="yellow.200"
                >
                  <Text fontSize="sm" color="yellow.800">
                    <strong>Atenção:</strong> Ao confirmar este pagamento, o sistema
                    automaticamente criará a próxima cobrança para o período seguinte.
                  </Text>
                </Box>
              )} */}

              <Flex gap={3} justify="flex-end">
                <Button
                  variant="outline"
                  onClick={onBack}
                  size="lg"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  colorScheme="green"
                  size="lg"
                  loading={isSaving}
                  loadingText="Processando..."
                  disabled={!dataPagamento}
                >
                  <Flex align="center" gap={2}>
                    <FiCheck size={20} />
                    Confirmar Pagamento
                  </Flex>
                </Button>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}
