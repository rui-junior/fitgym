import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  Text,
  Badge,
} from "@chakra-ui/react";

import { FiArrowLeft, FiCalendar, FiDollarSign, FiUser } from "react-icons/fi";

interface EditarFinancasProps {
  financa: {
    id: string;
    nome: string;
    plano: string;
    valorPlano: number;
    dataVencimento: string;
    dataPagamento?: string;
    pago: boolean;
    periodoPlano: number;
  };
  onBack: () => void;
}

export default function EditarFinancas({
  financa,
  onBack,
}: EditarFinancasProps) {
  function formatarData(dataISO: string): string {
    if (!dataISO) return "Não informado";
    const data = new Date(dataISO);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  return (
    <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
      <Box maxW="800px" mx="auto">
        <Button variant="ghost" onClick={onBack} mb={6}>
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
          overflow="hidden"
        >
          {/* Header */}
          <Box
            bg="blue.500"
            p={6}
            color="white"
          >
            <Flex align="center" gap={3} mb={2}>
              <FiUser size={24} />
              <Heading size="lg">Detalhes da Finança</Heading>
            </Flex>
            <Text fontSize="sm" opacity={0.9}>
              Visualize todas as informações da cobrança
            </Text>
          </Box>

          {/* Conteúdo */}
          <Box p={6}>
            <Stack gap={6}>
              {/* Status */}
              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Status do Pagamento
                </Text>
                {financa.pago ? (
                  <Badge colorScheme="green" fontSize="md" px={3} py={2}>
                    ✓ Pago
                  </Badge>
                ) : (
                  <Badge colorScheme="red" fontSize="md" px={3} py={2}>
                    ✗ Pendente
                  </Badge>
                )}
              </Box>

              {/* Cliente */}
              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Cliente
                </Text>
                <Flex align="center" gap={2}>
                  <FiUser color="gray" />
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    {financa.nome}
                  </Text>
                </Flex>
              </Box>

              {/* Plano */}
              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Plano Contratado
                </Text>
                <Text fontSize="lg" fontWeight="medium" color="gray.800">
                  {financa.plano}
                </Text>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Período: {financa.periodoPlano} dias
                </Text>
              </Box>

              {/* Valor */}
              <Box>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Valor da Mensalidade
                </Text>
                <Flex align="center" gap={2}>
                  <FiDollarSign color="green" size={20} />
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    R$ {financa.valorPlano.toFixed(2)}
                  </Text>
                </Flex>
              </Box>

              {/* Datas */}
              <Box
                bg="gray.50"
                borderRadius="lg"
                p={4}
                border="1px"
                borderColor="gray.200"
              >
                <Stack gap={4}>
                  {/* Data de Início */}
                  <Box>
                    <Flex align="center" gap={2} mb={1}>
                      <FiCalendar size={16} color="gray" />
                      <Text fontSize="sm" color="gray.500">
                        Data de Início (Vencimento)
                      </Text>
                    </Flex>
                    <Text fontSize="lg" fontWeight="medium" color="gray.800" ml={6}>
                      {formatarData(financa.dataVencimento)}
                    </Text>
                  </Box>

                  {/* Data de Pagamento */}
                  {financa.pago && financa.dataPagamento && (
                    <Box>
                      <Flex align="center" gap={2} mb={1}>
                        <FiCalendar size={16} color="green" />
                        <Text fontSize="sm" color="gray.500">
                          Data do Pagamento
                        </Text>
                      </Flex>
                      <Text fontSize="lg" fontWeight="medium" color="green.600" ml={6}>
                        {formatarData(financa.dataPagamento)}
                      </Text>
                    </Box>
                  )}

                  {/* Mensagem se não pago */}
                  {!financa.pago && (
                    <Box>
                      <Flex align="center" gap={2} mb={1}>
                        <FiCalendar size={16} color="red" />
                        <Text fontSize="sm" color="gray.500">
                          Data do Pagamento
                        </Text>
                      </Flex>
                      <Text fontSize="md" color="red.500" ml={6}>
                        Pagamento ainda não realizado
                      </Text>
                    </Box>
                  )}
                </Stack>
              </Box>

              {/* Informações Adicionais */}
              <Box
                bg="blue.50"
                borderRadius="lg"
                p={4}
                border="1px"
                borderColor="blue.200"
              >
                <Text fontSize="sm" color="blue.800" fontWeight="medium" mb={2}>
                  ℹ️ Informações Adicionais
                </Text>
                <Stack gap={2} fontSize="sm" color="blue.700">
                  <Text>
                    • O vencimento é na data de início da assinatura
                  </Text>
                  <Text>
                    • Após o pagamento, uma nova cobrança será gerada automaticamente
                  </Text>
                  <Text>
                    • O período do plano é de {financa.periodoPlano} dias
                  </Text>
                </Stack>
              </Box>

              {/* Botão Voltar */}
              <Flex justify="flex-end" pt={4}>
                <Button
                  onClick={onBack}
                  colorScheme="blue"
                  size="lg"
                >
                  Fechar
                </Button>
              </Flex>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

