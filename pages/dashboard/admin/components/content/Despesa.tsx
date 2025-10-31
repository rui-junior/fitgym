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
  createToaster,
  Toaster,
  Dialog,
  Input,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import AddDespesa from "./AddDespesa";
import PagarDespesa from "./PagarDespesa";

import {
  FiDollarSign,
  FiTrendingDown,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowLeft,
  FiTrash2,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";

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

interface DespesaProps {
  onBack: () => void;
}

const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
});

type ViewType = "lista" | "adicionar" | "pagar";

export default function Despesa({ onBack }: DespesaProps) {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [despesaToDelete, setDespesaToDelete] = useState<Despesa | null>(null);
  const [selectedDespesa, setSelectedDespesa] = useState<Despesa | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("lista");

  // Estado para mês/ano selecionado (formato: mm/aaaa)
  const hoje = new Date();
  const mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");
  const anoAtual = String(hoje.getFullYear());
  const [mesAnoSelecionado, setMesAnoSelecionado] = useState(
    `${mesAtual}/${anoAtual}`
  );

  // Buscar despesas do mês selecionado
  const fetchDespesas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/verifydespesa", {
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
        setDespesas(result.data);
      } else {
        console.error("Erro ao buscar despesas:", result.message);
      }
    } catch (error) {
      console.error("Erro ao buscar despesas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDespesas();
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

  // Calcular resumo de despesas
  const calcularResumoDespesas = () => {
    const totalGeral = despesas.reduce((acc, d) => acc + (d.valor || 0), 0);
    const totalPago = despesas
      .filter((d) => d.pago)
      .reduce((acc, d) => acc + (d.valor || 0), 0);
    const totalPendente = despesas
      .filter((d) => !d.pago)
      .reduce((acc, d) => acc + (d.valor || 0), 0);
    const totalAtrasado = despesas
      .filter((d) => !d.pago && isVencido(d.dataVencimento))
      .reduce((acc, d) => acc + (d.valor || 0), 0);

    return {
      totalGeral,
      totalPago,
      totalPendente,
      totalAtrasado,
      quantidadeTotal: despesas.length,
      quantidadePaga: despesas.filter((d) => d.pago).length,
      quantidadePendente: despesas.filter((d) => !d.pago).length,
      quantidadeAtrasada: despesas.filter(
        (d) => !d.pago && isVencido(d.dataVencimento)
      ).length,
    };
  };

  // Deletar despesa
  const handleDeleteDespesa = async () => {
    if (!despesaToDelete) return;

    try {
      const response = await fetch("/api/deletedespesa", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: despesaToDelete.id,
          mesAno: despesaToDelete.mesAno,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toaster.create({
          title: "Despesa excluída",
          description: "A despesa foi excluída com sucesso.",
          type: "success",
          duration: 3000,
        });
        fetchDespesas();
      } else {
        toaster.create({
          title: "Erro ao excluir",
          description: result.message,
          type: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toaster.create({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a despesa.",
        type: "error",
        duration: 3000,
      });
    } finally {
      setDespesaToDelete(null);
    }
  };

  const confirmDeleteDespesa = (despesa: Despesa) => {
    setDespesaToDelete(despesa);
  };

  const handlePagarDespesa = (despesa: Despesa) => {
    setSelectedDespesa(despesa);
    setCurrentView("pagar");
  };

  const handleAdicionarDespesa = () => {
    setCurrentView("adicionar");
  };

  const handleBackInternal = () => {
    setCurrentView("lista");
    setSelectedDespesa(null);
    // Recarregar lista após voltar
    fetchDespesas();
  };

  // Se estiver na view de pagar, renderizar PagarDespesa
  if (currentView === "pagar" && selectedDespesa) {
    return (
      <PagarDespesa despesa={selectedDespesa} onBack={handleBackInternal} />
    );
  }

  // Se estiver na view de adicionar, renderizar AddDespesa
  if (currentView === "adicionar") {
    return <AddDespesa onBack={handleBackInternal} />;
  }

  // Obter mês/ano atual para exibição
  // const hoje = new Date();
  // const mesAtual = hoje.toLocaleDateString("pt-BR", {
  //   month: "long",
  //   year: "numeric",
  // });

  const resumoDespesas = calcularResumoDespesas();

  return (
    <>
      {/* <Toaster toaster={toaster} /> */}

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
                Despesas
              </Heading>
              <Text color="gray.600" fontSize="sm">
                {despesas.length} despesa(s)
              </Text>
            </Box>
          </Flex>

          <Flex
            gap={3}
            align="center"
            direction={{ base: "column", md: "row" }}
          >
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
                <FiCalendar color="#E53E3E" />
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
              colorScheme="red"
              size="lg"
              onClick={handleAdicionarDespesa}
              disabled={isLoading}
            >
              <Flex align="center" gap={2}>
                <FiPlus size={20} />
                Nova Despesa
              </Flex>
            </Button>
          </Flex>
        </Flex>

        {/* Cards de Resumo de Despesas */}
        {!isLoading && despesas.length > 0 && (
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
                <Box bg="red.100" p={2} borderRadius="lg" color="red.600">
                  <FiTrendingDown size={20} />
                </Box>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Total do Mês
                </Text>
              </Flex>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                R$ {resumoDespesas.totalGeral.toFixed(2)}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {resumoDespesas.quantidadeTotal} despesa(s)
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
                  Pago
                </Text>
              </Flex>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                R$ {resumoDespesas.totalPago.toFixed(2)}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {resumoDespesas.quantidadePaga} pagamento(s)
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
                  A Pagar
                </Text>
              </Flex>
              <Text fontSize="2xl" fontWeight="bold" color="yellow.600">
                R$ {resumoDespesas.totalPendente.toFixed(2)}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {resumoDespesas.quantidadePendente} pendente(s)
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
                R$ {resumoDespesas.totalAtrasado.toFixed(2)}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {resumoDespesas.quantidadeAtrasada} atrasado(s)
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
                <Spinner size="lg" color="red.500" />
                <Text color="gray.600">Carregando despesas...</Text>
              </Flex>
            </Flex>
          ) : despesas.length === 0 ? (
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
                  <FiTrendingDown size={32} />
                </Box>
                <Heading size="md" color="gray.600" mb={2}>
                  Nenhuma despesa encontrada
                </Heading>
                <Text color="gray.500" fontSize="sm" mb={4}>
                  Não há despesas cadastradas para este mês
                </Text>
                <Button
                  colorScheme="red"
                  size="md"
                  onClick={handleAdicionarDespesa}
                >
                  <Flex align="center" gap={2}>
                    <FiPlus size={18} />
                    Cadastrar Primeira Despesa
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
                      Descrição
                    </Text>
                  </Box>
                  <Box flex="1">
                    <Text fontWeight="bold" color="gray.700" fontSize="sm">
                      Categoria
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
                {despesas.map((despesa: Despesa) => {
                  const vencido = isVencido(despesa.dataVencimento);
                  const atraso = diasAtraso(despesa.dataVencimento);
                  const dataFormatada = formatarData(despesa.dataVencimento);
                  const pago = despesa.pago;

                  return (
                    <Box key={despesa.id}>
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
                              {despesa.descricao}
                            </Text>
                          </Box>

                          <Box flex="1">
                            <Text
                              fontWeight="medium"
                              color="gray.700"
                              fontSize="sm"
                            >
                              {despesa.categoria || "-"}
                            </Text>
                          </Box>

                          <Box flex="1">
                            <Text
                              fontWeight="medium"
                              color="gray.700"
                              fontSize="sm"
                            >
                              R$ {despesa.valor.toFixed(2)}
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
                              {!pago && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => handlePagarDespesa(despesa)}
                                  >
                                    <FiDollarSign size={14} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() =>
                                      confirmDeleteDespesa(despesa)
                                    }
                                  >
                                    <FiTrash2 size={14} />
                                  </Button>
                                </>
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
                                {despesa.descricao}
                              </Text>
                              {vencido && !pago && (
                                <Text
                                  fontSize="xs"
                                  color="red.500"
                                  fontWeight="bold"
                                >
                                  {atraso} dia{atraso !== 1 ? "s" : ""} de
                                  atraso
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
                              <Text color="gray.500">Categoria:</Text>
                              <Text color="gray.800">
                                {despesa.categoria || "-"}
                              </Text>
                            </Flex>

                            <Flex justify="space-between">
                              <Text color="gray.500">Valor:</Text>
                              <Text color="gray.800">
                                R$ {despesa.valor.toFixed(2)}
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
                          {!pago && (
                            <Flex gap={2} justify="flex-end">
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => handlePagarDespesa(despesa)}
                              >
                                <FiDollarSign size={14} />
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => confirmDeleteDespesa(despesa)}
                              >
                                <FiTrash2 size={14} />
                              </Button>
                            </Flex>
                          )}
                        </Flex>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </>
          )}
        </Box>

        {/* Dialog para Deletar Despesa */}
        <Dialog.Root
          open={despesaToDelete !== null}
          onOpenChange={(e) => !e.open && setDespesaToDelete(null)}
          role="alertdialog"
        >
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title fontSize="lg" fontWeight="bold">
                  Excluir Despesa
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text>
                  Tem certeza que deseja excluir esta despesa? Esta ação não
                  pode ser desfeita.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={() => setDespesaToDelete(null)}>
                  Cancelar
                </Button>
                <Button colorScheme="red" onClick={handleDeleteDespesa} ml={3}>
                  Excluir
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Box>
    </>
  );
}
