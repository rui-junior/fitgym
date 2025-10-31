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
  Badge,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { FiArrowLeft, FiDownload, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

interface ReceitaData {
  id: string;
  nome: string;
  cpf: string;
  plano: string;
  valorPlano: number;
  dataVencimento: string;
  pago: boolean;
  dataPagamento?: string;
}

interface DespesaData {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  pago: boolean;
  dataPagamento?: string;
  categoria?: string;
}

interface BalancoProps {
  onBack: () => void;
}

export default function Balanco({ onBack }: BalancoProps) {
  const [receitas, setReceitas] = useState<ReceitaData[]>([]);
  const [despesas, setDespesas] = useState<DespesaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para mês/ano selecionado - formato do input: aaaa-mm
  const hoje = new Date();
  const anoAtual = String(hoje.getFullYear());
  const mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");
  const [mesAnoInput, setMesAnoInput] = useState(`${anoAtual}-${mesAtual}`);

  // Converter formato do input (aaaa-mm) para formato Firebase (mm/aaaa)
  const converterParaFormatoFirebase = (inputValue: string): string => {
    const [ano, mes] = inputValue.split("-");
    return `${mes}/${ano}`;
  };

  // Buscar receitas e despesas
  const fetchDados = async () => {
    setIsLoading(true);
    try {
      const mesAnoFirebase = converterParaFormatoFirebase(mesAnoInput);

      // Buscar receitas
      const receitaResponse = await fetch("/api/verifyreceita", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mesAno: mesAnoFirebase,
        }),
      });
      const receitaResult = await receitaResponse.json();

      // Buscar despesas
      const despesaResponse = await fetch("/api/verifydespesa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mesAno: mesAnoFirebase,
        }),
      });
      const despesaResult = await despesaResponse.json();

      if (receitaResult.success) {
        setReceitas(receitaResult.data || []);
      } else {
        console.error("Erro ao buscar receitas:", receitaResult.message);
        setReceitas([]);
      }

      if (despesaResult.success) {
        setDespesas(despesaResult.data || []);
      } else {
        console.error("Erro ao buscar despesas:", despesaResult.message);
        setDespesas([]);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setReceitas([]);
      setDespesas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, [mesAnoInput]);

  // Calcular totais
  const totalReceitas = receitas.reduce((acc, r) => acc + (r.pago ? r.valorPlano : 0), 0);
  const totalDespesas = despesas.reduce((acc, d) => acc + (d.pago ? d.valor : 0), 0);
  const saldo = totalReceitas - totalDespesas;

  const totalReceitasPendentes = receitas.reduce((acc, r) => acc + (!r.pago ? r.valorPlano : 0), 0);
  const totalDespesasPendentes = despesas.reduce((acc, d) => acc + (!d.pago ? d.valor : 0), 0);

  // Formatar data
  function formatarData(dataISO: string): string {
    if (!dataISO) return "-";
    const data = new Date(dataISO);
    if (isNaN(data.getTime())) return "-";
    return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  // Converter mesAnoInput para exibição
  const getMesAnoExibicao = () => {
    const [ano, mes] = mesAnoInput.split("-");
    const data = new Date(parseInt(ano), parseInt(mes) - 1);
    return data.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  };

  // Exportar para CSV
  const exportarCSV = () => {
    const mesAnoExibicao = getMesAnoExibicao();
    
    // Cabeçalho do CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `BALANÇO FINANCEIRO - ${mesAnoExibicao.toUpperCase()}\n\n`;
    
    // Resumo
    csvContent += "RESUMO\n";
    csvContent += `Total de Receitas Pagas,R$ ${totalReceitas.toFixed(2)}\n`;
    csvContent += `Total de Despesas Pagas,R$ ${totalDespesas.toFixed(2)}\n`;
    csvContent += `Saldo,R$ ${saldo.toFixed(2)}\n`;
    csvContent += `Status,${saldo >= 0 ? "LUCRO" : "PREJUÍZO"}\n\n`;
    
    csvContent += `Total de Receitas Pendentes,R$ ${totalReceitasPendentes.toFixed(2)}\n`;
    csvContent += `Total de Despesas Pendentes,R$ ${totalDespesasPendentes.toFixed(2)}\n\n`;

    // Receitas
    csvContent += "RECEITAS\n";
    csvContent += "Nome,CPF,Plano,Valor,Data Vencimento,Status,Data Pagamento\n";
    
    const receitasOrdenadas = [...receitas].sort((a, b) => 
      new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime()
    );
    
    receitasOrdenadas.forEach((receita) => {
      csvContent += `"${receita.nome}","${receita.cpf}","${receita.plano}",`;
      csvContent += `"R$ ${receita.valorPlano.toFixed(2)}",`;
      csvContent += `"${formatarData(receita.dataVencimento)}",`;
      csvContent += `"${receita.pago ? "Pago" : "Pendente"}",`;
      csvContent += `"${receita.dataPagamento ? formatarData(receita.dataPagamento) : "-"}"\n`;
    });

    csvContent += "\n";

    // Despesas
    csvContent += "DESPESAS\n";
    csvContent += "Descrição,Categoria,Valor,Data Vencimento,Status,Data Pagamento\n";
    
    const despesasOrdenadas = [...despesas].sort((a, b) => 
      new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime()
    );
    
    despesasOrdenadas.forEach((despesa) => {
      csvContent += `"${despesa.descricao}","${despesa.categoria || "-"}",`;
      csvContent += `"R$ ${despesa.valor.toFixed(2)}",`;
      csvContent += `"${formatarData(despesa.dataVencimento)}",`;
      csvContent += `"${despesa.pago ? "Pago" : "Pendente"}",`;
      csvContent += `"${despesa.dataPagamento ? formatarData(despesa.dataPagamento) : "-"}"\n`;
    });

    // Criar link de download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `balanco_${mesAnoInput}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            Balanço Financeiro
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Visão geral de {getMesAnoExibicao()}
          </Text>
        </Box>

        <Flex gap={3} direction={{ base: "column", md: "row" }}>
          {/* Seletor de Mês/Ano */}
          <Input
            type="month"
            value={mesAnoInput}
            onChange={(e) => setMesAnoInput(e.target.value)}
            size="lg"
            bg="white"
            borderColor="gray.300"
            _hover={{ borderColor: "gray.400" }}
            _focus={{
              borderColor: "blue.500",
              boxShadow: "0 0 0 1px #3182ce",
            }}
            w={{ base: "100%", md: "200px" }}
          />

          <Button
            variant="outline"
            colorScheme="gray"
            size="lg"
            onClick={onBack}
          >
            <Flex align="center" gap={2}>
              <FiArrowLeft size={20} />
              Voltar
            </Flex>
          </Button>
        </Flex>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" py={12}>
          <Flex direction="column" align="center" gap={4}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.600">Carregando dados...</Text>
          </Flex>
        </Flex>
      ) : (
        <Stack gap={6}>
          {/* Cards de Resumo */}
          <Flex gap={4} direction={{ base: "column", md: "row" }}>
            {/* Card Receitas */}
            <Box
              flex="1"
              bg="white"
              borderRadius="xl"
              shadow="sm"
              border="1px"
              borderColor="gray.200"
              p={6}
            >
              <Flex align="center" gap={3} mb={3}>
                <Box bg="green.100" p={3} borderRadius="lg" color="green.600">
                  <FiTrendingUp size={24} />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Receitas Pagas
                  </Text>
                  <Heading size="lg" color="green.600">
                    R$ {totalReceitas.toFixed(2)}
                  </Heading>
                </Box>
              </Flex>
              <Text fontSize="xs" color="gray.500">
                Pendentes: R$ {totalReceitasPendentes.toFixed(2)}
              </Text>
            </Box>

            {/* Card Despesas */}
            <Box
              flex="1"
              bg="white"
              borderRadius="xl"
              shadow="sm"
              border="1px"
              borderColor="gray.200"
              p={6}
            >
              <Flex align="center" gap={3} mb={3}>
                <Box bg="red.100" p={3} borderRadius="lg" color="red.600">
                  <FiTrendingDown size={24} />
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    Despesas Pagas
                  </Text>
                  <Heading size="lg" color="red.600">
                    R$ {totalDespesas.toFixed(2)}
                  </Heading>
                </Box>
              </Flex>
              <Text fontSize="xs" color="gray.500">
                Pendentes: R$ {totalDespesasPendentes.toFixed(2)}
              </Text>
            </Box>

            {/* Card Saldo */}
            <Box
              flex="1"
              bg="white"
              borderRadius="xl"
              shadow="sm"
              border="1px"
              borderColor="gray.200"
              p={6}
            >
              <Flex align="center" gap={3} mb={3}>
                <Box
                  bg={saldo >= 0 ? "blue.100" : "orange.100"}
                  p={3}
                  borderRadius="lg"
                  color={saldo >= 0 ? "blue.600" : "orange.600"}
                >
                  <Text fontSize="2xl" fontWeight="bold">
                    {saldo >= 0 ? "💰" : "⚠️"}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                    {saldo >= 0 ? "Lucro" : "Prejuízo"}
                  </Text>
                  <Heading
                    size="lg"
                    color={saldo >= 0 ? "blue.600" : "orange.600"}
                  >
                    R$ {Math.abs(saldo).toFixed(2)}
                  </Heading>
                </Box>
              </Flex>
              <Badge
                colorScheme={saldo >= 0 ? "green" : "red"}
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
              >
                {saldo >= 0 ? "Positivo" : "Negativo"}
              </Badge>
            </Box>
          </Flex>

          {/* Botão Exportar CSV */}
          <Flex justify="flex-end">
            <Button
              colorScheme="blue"
              size="lg"
              onClick={exportarCSV}
              disabled={receitas.length === 0 && despesas.length === 0}
            >
              <Flex align="center" gap={2}>
                <FiDownload size={20} />
                Exportar CSV
              </Flex>
            </Button>
          </Flex>

          {/* Tabela de Receitas */}
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            overflow="hidden"
          >
            <Box bg="green.50" p={4} borderBottom="1px" borderColor="gray.200">
              <Heading size="md" color="green.700">
                Receitas ({receitas.length})
              </Heading>
            </Box>

            {receitas.length === 0 ? (
              <Flex justify="center" align="center" py={8}>
                <Text color="gray.500">Nenhuma receita encontrada</Text>
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
                        Nome
                      </Text>
                    </Box>
                    <Box flex="1.5">
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
                  </Flex>
                </Box>

                {/* Lista */}
                <Stack gap={0}>
                  {[...receitas]
                    .sort(
                      (a, b) =>
                        new Date(a.dataVencimento).getTime() -
                        new Date(b.dataVencimento).getTime()
                    )
                    .map((receita) => (
                      <Box
                        key={receita.id}
                        p={4}
                        borderBottom="1px"
                        borderColor="gray.100"
                        _hover={{ bg: "gray.50" }}
                        transition="all 0.2s"
                      >
                        {/* Desktop */}
                        <Flex
                          align="center"
                          gap={4}
                          display={{ base: "none", lg: "flex" }}
                        >
                          <Box flex="2">
                            <Text
                              fontWeight="medium"
                              color="gray.800"
                              fontSize="sm"
                            >
                              {receita.nome}
                            </Text>
                            <Text color="gray.500" fontSize="xs">
                              {receita.cpf}
                            </Text>
                          </Box>
                          <Box flex="1.5">
                            <Text
                              fontWeight="medium"
                              color="gray.700"
                              fontSize="sm"
                            >
                              {receita.plano}
                            </Text>
                          </Box>
                          <Box flex="1">
                            <Text
                              fontWeight="medium"
                              color="gray.700"
                              fontSize="sm"
                            >
                              R$ {receita.valorPlano.toFixed(2)}
                            </Text>
                          </Box>
                          <Box flex="1">
                            <Text
                              fontWeight="medium"
                              color="gray.700"
                              fontSize="sm"
                            >
                              {formatarData(receita.dataVencimento)}
                            </Text>
                          </Box>
                          <Box flex="1">
                            <Badge
                              colorScheme={receita.pago ? "green" : "yellow"}
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {receita.pago ? "Pago" : "Pendente"}
                            </Badge>
                          </Box>
                        </Flex>

                        {/* Mobile */}
                        <Stack
                          gap={2}
                          fontSize="sm"
                          display={{ base: "flex", lg: "none" }}
                        >
                          <Flex justify="space-between">
                            <Text color="gray.500">Nome:</Text>
                            <Text color="gray.800" fontWeight="medium">
                              {receita.nome}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text color="gray.500">Plano:</Text>
                            <Text color="gray.800">{receita.plano}</Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text color="gray.500">Valor:</Text>
                            <Text color="gray.800">
                              R$ {receita.valorPlano.toFixed(2)}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text color="gray.500">Vencimento:</Text>
                            <Text color="gray.800">
                              {formatarData(receita.dataVencimento)}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text color="gray.500">Status:</Text>
                            <Badge
                              colorScheme={receita.pago ? "green" : "yellow"}
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {receita.pago ? "Pago" : "Pendente"}
                            </Badge>
                          </Flex>
                        </Stack>
                      </Box>
                    ))}
                </Stack>
              </>
            )}
          </Box>

          {/* Tabela de Despesas */}
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            overflow="hidden"
          >
            <Box bg="red.50" p={4} borderBottom="1px" borderColor="gray.200">
              <Heading size="md" color="red.700">
                Despesas ({despesas.length})
              </Heading>
            </Box>

            {despesas.length === 0 ? (
              <Flex justify="center" align="center" py={8}>
                <Text color="gray.500">Nenhuma despesa encontrada</Text>
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
                    <Box flex="1.5">
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
                  </Flex>
                </Box>

                {/* Lista */}
                <Stack gap={0}>
                  {[...despesas]
                    .sort(
                      (a, b) =>
                        new Date(a.dataVencimento).getTime() -
                        new Date(b.dataVencimento).getTime()
                    )
                    .map((despesa) => (
                      <Box
                        key={despesa.id}
                        p={4}
                        borderBottom="1px"
                        borderColor="gray.100"
                        _hover={{ bg: "gray.50" }}
                        transition="all 0.2s"
                      >
                        {/* Desktop */}
                        <Flex
                          align="center"
                          gap={4}
                          display={{ base: "none", lg: "flex" }}
                        >
                          <Box flex="2">
                            <Text
                              fontWeight="medium"
                              color="gray.800"
                              fontSize="sm"
                            >
                              {despesa.descricao}
                            </Text>
                          </Box>
                          <Box flex="1.5">
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
                              color="gray.700"
                              fontSize="sm"
                            >
                              {formatarData(despesa.dataVencimento)}
                            </Text>
                          </Box>
                          <Box flex="1">
                            <Badge
                              colorScheme={despesa.pago ? "green" : "yellow"}
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {despesa.pago ? "Pago" : "Pendente"}
                            </Badge>
                          </Box>
                        </Flex>

                        {/* Mobile */}
                        <Stack
                          gap={2}
                          fontSize="sm"
                          display={{ base: "flex", lg: "none" }}
                        >
                          <Flex justify="space-between">
                            <Text color="gray.500">Descrição:</Text>
                            <Text color="gray.800" fontWeight="medium">
                              {despesa.descricao}
                            </Text>
                          </Flex>
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
                            <Text color="gray.800">
                              {formatarData(despesa.dataVencimento)}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text color="gray.500">Status:</Text>
                            <Badge
                              colorScheme={despesa.pago ? "green" : "yellow"}
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {despesa.pago ? "Pago" : "Pendente"}
                            </Badge>
                          </Flex>
                        </Stack>
                      </Box>
                    ))}
                </Stack>
              </>
            )}
          </Box>
        </Stack>
      )}
    </Box>
  );
}
