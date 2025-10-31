import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
  Badge,
  Grid,
  IconButton,
  Input,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import LancarPagamento from "./LancarPagamento";
import EditarFinancas from "./EditarFinancas";
import AddFinanca from "./AddFinanca";

import {
  FiDollarSign,
  FiEye,
  FiUsers,
  FiPlus,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";

interface FormData {
  id: string;
  nome: string;
  atualizadoEm: string;
  cpf: string;
  criadoEm: string;
  dataVencimento: string;
  mesAno: string;
  periodoPlano: number;
  plano: string;
  valorPlano: number;
  dataPagamento?: string;
  pago: boolean;
}

type ViewType = "lista" | "lancar" | "detalhes" | "adicionar";

interface ReceitaProps {
  onBack: () => void;
}

export default function Receita({ onBack }: ReceitaProps) {
  const [financas, setFinancas] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>("lista");
  const [selectedFinanca, setSelectedFinanca] = useState<FormData | null>(null);

  // Estado para mês/ano selecionado (formato: mm/aaaa)
  const hoje = new Date();
  const mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");
  const anoAtual = String(hoje.getFullYear());
  const [mesAnoSelecionado, setMesAnoSelecionado] = useState(
    `${mesAtual}/${anoAtual}`
  );

  // Buscar finanças do mês selecionado
  const fetchFinancas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/verifyreceita", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mesAno: mesAnoSelecionado,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setFinancas(result.data);
      } else {
        console.error("Erro ao buscar finanças:", result.message);
      }
    } catch (error) {
      console.error("Erro ao buscar finanças:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchFinancas();
  }, [mesAnoSelecionado]);

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

  // Calcular resumo financeiro
  const calcularResumo = () => {
    const totalGeral = financas.reduce(
      (acc, f) => acc + (f.valorPlano || 0),
      0
    );
    const totalPago = financas
      .filter((f) => f.pago)
      .reduce((acc, f) => acc + (f.valorPlano || 0), 0);
    const totalPendente = financas
      .filter((f) => !f.pago)
      .reduce((acc, f) => acc + (f.valorPlano || 0), 0);
    const totalAtrasado = financas
      .filter((f) => !f.pago && isVencido(f.dataVencimento))
      .reduce((acc, f) => acc + (f.valorPlano || 0), 0);

    return {
      totalGeral,
      totalPago,
      totalPendente,
      totalAtrasado,
      quantidadeTotal: financas.length,
      quantidadePaga: financas.filter((f) => f.pago).length,
      quantidadePendente: financas.filter((f) => !f.pago).length,
      quantidadeAtrasada: financas.filter(
        (f) => !f.pago && isVencido(f.dataVencimento)
      ).length,
    };
  };

  const handleLancarPagamento = (financa: FormData) => {
    setSelectedFinanca(financa);
    setCurrentView("lancar");
  };

  const handleVerDetalhes = (financa: FormData) => {
    setSelectedFinanca(financa);
    setCurrentView("detalhes");
  };

  const handleAdicionarFinanca = () => {
    setCurrentView("adicionar");
  };

  const handleBackInternal = () => {
    setCurrentView("lista");
    setSelectedFinanca(null);
    // Recarregar lista após voltar
    fetchFinancas();
  };

  if (currentView === "lancar" && selectedFinanca) {
    return (
      <LancarPagamento financa={selectedFinanca} onBack={handleBackInternal} />
    );
  }

  if (currentView === "detalhes" && selectedFinanca) {
    return (
      <EditarFinancas financa={selectedFinanca} onBack={handleBackInternal} />
    );
  }

  if (currentView === "adicionar") {
    return <AddFinanca onBack={handleBackInternal} />;
  }

  // Obter mês/ano atual para exibição
  //   const hoje = new Date();
  //   const mesAtual = hoje.toLocaleDateString("pt-BR", {
  //     month: "long",
  //     year: "numeric",
  //   });

  const resumo = calcularResumo();

  return (
    <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        gap={4}
        mb={6}
      >
        <Flex align="center" gap={3}>
          <IconButton
            aria-label="Voltar"
            onClick={onBack}
            variant="ghost"
            size="lg"
          >
            <FiArrowLeft />
          </IconButton>
          <Box>
            <Heading size="lg" color="gray.800" mb={2}>
              Receitas
            </Heading>
            <Text color="gray.600" fontSize="sm">
              {financas.length} cobrança(s)
            </Text>
          </Box>
        </Flex>

        <Flex gap={3} align="center" direction={{ base: "column", md: "row" }}>
          {/* Seletor de Mês/Ano */}
          <Flex
            align="center"
            gap={2}
            bg="white"
            p={2}
            borderRadius="lg"
            border="1px"
            borderColor="gray.200"
          >
            <IconButton
              aria-label="Mês anterior"
              size="sm"
              variant="ghost"
              onClick={() => {
                const [mes, ano] = mesAnoSelecionado.split("/");
                const data = new Date(parseInt(ano), parseInt(mes) - 1, 1);
                data.setMonth(data.getMonth() - 1);
                const novoMes = String(data.getMonth() + 1).padStart(2, "0");
                const novoAno = String(data.getFullYear());
                setMesAnoSelecionado(`${novoMes}/${novoAno}`);
              }}
              disabled={isLoading}
            >
              <FiChevronLeft />
            </IconButton>

            <Flex align="center" gap={2}>
              <FiCalendar color="#4299E1" />
              <Input
                type="month"
                value={`${mesAnoSelecionado.split("/")[1]}-${
                  mesAnoSelecionado.split("/")[0]
                }`}
                onChange={(e) => {
                  const [ano, mes] = e.target.value.split("-");
                  setMesAnoSelecionado(`${mes}/${ano}`);
                }}
                size="sm"
                w="150px"
                disabled={isLoading}
              />
            </Flex>

            <IconButton
              aria-label="Próximo mês"
              size="sm"
              variant="ghost"
              onClick={() => {
                const [mes, ano] = mesAnoSelecionado.split("/");
                const data = new Date(parseInt(ano), parseInt(mes) - 1, 1);
                data.setMonth(data.getMonth() + 1);
                const novoMes = String(data.getMonth() + 1).padStart(2, "0");
                const novoAno = String(data.getFullYear());
                setMesAnoSelecionado(`${novoMes}/${novoAno}`);
              }}
              disabled={isLoading}
            >
              <FiChevronRight />
            </IconButton>
          </Flex>

          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleAdicionarFinanca}
            disabled={isLoading}
          >
            <Flex align="center" gap={2}>
              <FiPlus size={20} />
              Nova Receita
            </Flex>
          </Button>
        </Flex>
      </Flex>

      {/* Cards de Resumo Financeiro */}
      {!isLoading && financas.length > 0 && (
        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={4}
          mb={6}
        >
          {/* Total Geral */}
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            p={5}
          >
            <Flex align="center" gap={3} mb={3}>
              <Box bg="blue.100" p={2} borderRadius="lg" color="blue.600">
                <FiTrendingUp size={20} />
              </Box>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Total do Mês
              </Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              R$ {resumo.totalGeral.toFixed(2)}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              {resumo.quantidadeTotal} cobrança(s)
            </Text>
          </Box>

          {/* Total Pago */}
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            p={5}
          >
            <Flex align="center" gap={3} mb={3}>
              <Box bg="green.100" p={2} borderRadius="lg" color="green.600">
                <FiCheckCircle size={20} />
              </Box>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Recebido
              </Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              R$ {resumo.totalPago.toFixed(2)}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              {resumo.quantidadePaga} pagamento(s)
            </Text>
          </Box>

          {/* Total Pendente */}
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            p={5}
          >
            <Flex align="center" gap={3} mb={3}>
              <Box bg="yellow.100" p={2} borderRadius="lg" color="yellow.600">
                <FiDollarSign size={20} />
              </Box>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                A Receber
              </Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
              R$ {resumo.totalPendente.toFixed(2)}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              {resumo.quantidadePendente} pendente(s)
            </Text>
          </Box>

          {/* Total Atrasado */}
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            p={5}
          >
            <Flex align="center" gap={3} mb={3}>
              <Box bg="red.100" p={2} borderRadius="lg" color="red.600">
                <FiAlertCircle size={20} />
              </Box>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Em Atraso
              </Text>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" color="red.600">
              R$ {resumo.totalAtrasado.toFixed(2)}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              {resumo.quantidadeAtrasada} atrasado(s)
            </Text>
          </Box>
        </Grid>
      )}

      <Box
        bg="white"
        borderRadius="xl"
        shadow="sm"
        border="1px"
        borderColor="gray.200"
        overflow="hidden"
      >
        {isLoading ? (
          <Flex justify="center" align="center" py={12}>
            <Flex direction="column" align="center" gap={4}>
              <Spinner size="lg" color="blue.500" />
              <Text color="gray.600">Carregando receita...</Text>
            </Flex>
          </Flex>
        ) : financas.length === 0 ? (
          <Flex justify="center" align="center" py={12}>
            <Box textAlign="center">
              <Box
                w={16}
                h={16}
                bg="gray.100"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="gray.400"
                mx="auto"
                mb={4}
              >
                <FiUsers size={32} />
              </Box>
              <Heading size="md" color="gray.600" mb={2}>
                Nenhuma receita encontrada
              </Heading>
              <Text color="gray.500" fontSize="sm" mb={4}>
                Não há cobranças cadastradas para este mês
              </Text>
              <Button
                colorScheme="blue"
                size="md"
                onClick={handleAdicionarFinanca}
              >
                <Flex align="center" gap={2}>
                  <FiPlus size={18} />
                  Cadastrar Primeira Cobrança
                </Flex>
              </Button>
            </Box>
          </Flex>
        ) : (
          <>
            {/* Header Desktop */}
            <Box
              bg="gray.50"
              p={4}
              borderBottom="1px"
              borderColor="gray.200"
              display={{ base: "none", lg: "block" }}
            >
              <Flex align="center" gap={4}>
                <Box flex="2">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    Cliente
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    Plano
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    Valor
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    Vencimento
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    Status
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    Ações
                  </Text>
                </Box>
              </Flex>
            </Box>

            {/* Lista */}
            <Stack gap={0}>
              {financas.map((financa: FormData) => {
                const vencido = isVencido(financa.dataVencimento);
                const atraso = diasAtraso(financa.dataVencimento);
                const dataFormatada = formatarData(financa.dataVencimento);
                const pago = financa.pago;

                return (
                  <Box key={financa.id}>
                    {/* Desktop */}
                    <Box
                      p={4}
                      borderBottom="1px"
                      borderColor="gray.100"
                      _hover={{ bg: "gray.50" }}
                      transition="all 0.2s"
                      display={{ base: "none", lg: "block" }}
                      bg={pago ? "green.50" : vencido ? "red.50" : "white"}
                    >
                      <Flex align="center" gap={4}>
                        <Box flex="2">
                          <Text
                            fontWeight="medium"
                            color={
                              pago
                                ? "green.700"
                                : vencido
                                ? "red.600"
                                : "gray.800"
                            }
                            fontSize="sm"
                          >
                            {financa.nome}
                          </Text>
                        </Box>

                        <Box flex="1">
                          <Text
                            fontWeight="medium"
                            color="gray.700"
                            fontSize="sm"
                          >
                            {financa.plano}
                          </Text>
                        </Box>

                        <Box flex="1">
                          <Text
                            fontWeight="medium"
                            color="gray.700"
                            fontSize="sm"
                          >
                            R$ {financa.valorPlano.toFixed(2)}
                          </Text>
                        </Box>

                        <Box flex="1">
                          <Text
                            fontWeight="medium"
                            color={
                              pago
                                ? "green.600"
                                : vencido
                                ? "red.600"
                                : "gray.700"
                            }
                            fontSize="sm"
                          >
                            {dataFormatada}
                          </Text>
                          {vencido && !pago && (
                            <Text
                              fontSize="xs"
                              color="red.500"
                              fontWeight="bold"
                            >
                              {atraso} dia{atraso !== 1 ? "s" : ""} de atraso
                            </Text>
                          )}
                        </Box>

                        <Box flex="1">
                          {pago ? (
                            <Badge
                              colorScheme="green"
                              fontSize="xs"
                              px={2}
                              py={1}
                            >
                              Pago
                            </Badge>
                          ) : vencido ? (
                            <Badge
                              colorScheme="red"
                              fontSize="xs"
                              px={2}
                              py={1}
                            >
                              Atrasado
                            </Badge>
                          ) : (
                            <Badge
                              colorScheme="yellow"
                              fontSize="xs"
                              px={2}
                              py={1}
                            >
                              Pendente
                            </Badge>
                          )}
                        </Box>

                        <Box flex="1">
                          <Flex gap={2}>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => handleVerDetalhes(financa)}
                            >
                              <FiEye size={14} />
                            </Button>
                            {!pago && (
                              <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="green"
                                onClick={() => handleLancarPagamento(financa)}
                              >
                                <FiDollarSign size={14} />
                              </Button>
                            )}
                          </Flex>
                        </Box>
                      </Flex>
                    </Box>

                    {/* Mobile */}
                    <Box
                      p={4}
                      borderBottom="1px"
                      borderColor="gray.100"
                      display={{ base: "block", lg: "none" }}
                      bg={pago ? "green.50" : vencido ? "red.50" : "white"}
                    >
                      <Flex direction="column" gap={3}>
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text
                              fontWeight="medium"
                              color={
                                pago
                                  ? "green.700"
                                  : vencido
                                  ? "red.600"
                                  : "gray.800"
                              }
                            >
                              {financa.nome}
                            </Text>
                            {vencido && !pago && (
                              <Text
                                fontSize="xs"
                                color="red.500"
                                fontWeight="bold"
                              >
                                {atraso} dia{atraso !== 1 ? "s" : ""} de atraso
                              </Text>
                            )}
                          </Box>
                          <Flex align="center" gap={2}>
                            {pago ? (
                              <Badge
                                colorScheme="green"
                                fontSize="xs"
                                px={2}
                                py={1}
                              >
                                Pago
                              </Badge>
                            ) : vencido ? (
                              <Badge
                                colorScheme="red"
                                fontSize="xs"
                                px={2}
                                py={1}
                              >
                                Atrasado
                              </Badge>
                            ) : (
                              <Badge
                                colorScheme="yellow"
                                fontSize="xs"
                                px={2}
                                py={1}
                              >
                                Pendente
                              </Badge>
                            )}
                          </Flex>
                        </Flex>
                        <Stack gap={2} fontSize="sm">
                          <Flex justify="space-between">
                            <Text color="gray.500">Plano:</Text>
                            <Text color="gray.800">{financa.plano}</Text>
                          </Flex>

                          <Flex justify="space-between">
                            <Text color="gray.500">Valor:</Text>
                            <Text color="gray.800">
                              R$ {financa.valorPlano.toFixed(2)}
                            </Text>
                          </Flex>

                          <Flex justify="space-between">
                            <Text color="gray.500">Vencimento:</Text>
                            <Text
                              color={
                                pago
                                  ? "green.600"
                                  : vencido
                                  ? "red.600"
                                  : "gray.800"
                              }
                            >
                              {dataFormatada}
                            </Text>
                          </Flex>
                        </Stack>
                        <Flex gap={2} justify="flex-end">
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="blue"
                            onClick={() => handleVerDetalhes(financa)}
                          >
                            <FiEye size={14} />
                          </Button>
                          {!pago && (
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleLancarPagamento(financa)}
                            >
                              <FiDollarSign size={14} />
                            </Button>
                          )}
                        </Flex>
                      </Flex>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </>
        )}
      </Box>
    </Box>
  );
}
