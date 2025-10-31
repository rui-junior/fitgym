"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Stack,
  Spinner,
  Badge,
  Grid,
  Card,
  Separator,
  Button,
} from "@chakra-ui/react";
import { Collapse } from "@chakra-ui/transition";
import { parseCookies } from "nookies";
import { useEffect, useState } from "react";
import {
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiArrowDown,
  FiArrowUp,
  FiMinus,
} from "react-icons/fi";

import { Chart, useChart } from "@chakra-ui/charts";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Dobras {
  abdominal: number;
  axilarMedia: number;
  biceps: number;
  coxa: number;
  soma: number;
  subescapular: number;
  suprailiaca: number;
  triceps: number;
}

interface Medidas {
  abdomen: number;
  bracoDireito: number;
  bracoEsquerdo: number;
  cintura: number;
  coxaDireita: number;
  coxaEsquerda: number;
  panturrilhaDireita: number;
  panturrilhaEsquerda: number;
  quadril: number;
  torax: number;
}

interface Resultados {
  imc: number;
  massaGorda: number;
  massaMagra: number;
  percentualGordura: number;
}

interface Avaliacao {
  id: string;
  altura: number;
  peso: number;
  sexo: string;
  cpf: string;
  observacoes: string;
  criadoEm: any;
  atualizadoEm: any;
  dobras: Dobras;
  medidas: Medidas;
  resultados: Resultados;
}

interface DadosGrafico {
  data: string;
  peso: number;
  gordura: number;
  massaMagra: number;
}

export default function Avaliacoes() {
  const [uid, setUid] = useState<string | null>(null);
  const [cpf, setCpf] = useState<string | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const chartPeso = useChart({
    data: avaliacoes.map((avaliacao) => ({
      x: new Date(avaliacao.criadoEm).getTime(),
      y: avaliacao.peso,
    })),
    series: [{ label: "Peso (kg)", color: "green.600" }],
  });

  const chartGorduraCorporal = useChart({
    data: avaliacoes.map((avaliacao) => ({
      x: new Date(avaliacao.criadoEm).getTime(),
      y: avaliacao.resultados.percentualGordura,
    })),
    series: [{ label: "Gordura Corporal (%)", color: "orange.600" }],
  });

  const chartMassaMuscular = useChart({
    data: avaliacoes.map((avaliacao) => ({
      x: new Date(avaliacao.criadoEm).getTime(),
      y: avaliacao.resultados.massaMagra,
    })),
    series: [{ label: "Massa Muscular (Kg)", color: "teal.600" }],
  });

  // Extrair UID e CPF do token
  useEffect(() => {
    const cookies = parseCookies();
    const token = cookies.token;

    if (token) {
      try {
        const parts = token.split(".");
        const payload = JSON.parse(atob(parts[1]));
        setUid(payload.user_id);

        if (payload.cpf) {
          setCpf(payload.cpf);
        }
      } catch (error) {
        console.error("❌ Erro ao decodificar token:", error);
        setError("Erro ao autenticar usuário");
        setIsLoading(false);
      }
    } else {
      setError("Usuário não autenticado");
      setIsLoading(false);
    }
  }, []);

  // Buscar CPF do usuário no Firestore se não estiver no token
  useEffect(() => {
    if (!uid || cpf) return;

    const fetchUserCPF = async () => {
      try {
        console.log("🔍 Buscando CPF do usuário com UID:", uid);

        const response = await fetch("/api/verifyclient", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          const userData = Array.isArray(result.data)
            ? result.data[0]
            : result.data;

          if (userData.cpf) {
            console.log("✅ CPF encontrado:", userData.cpf);
            setCpf(userData.cpf);
          } else {
            setError("CPF do usuário não encontrado");
            setIsLoading(false);
          }
        } else {
          setError("Erro ao buscar dados do usuário");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar CPF do usuário:", error);
        setError("Erro ao carregar dados do usuário");
        setIsLoading(false);
      }
    };

    fetchUserCPF();
  }, [uid, cpf]);

  // Buscar avaliações quando CPF estiver disponível
  useEffect(() => {
    if (!cpf) return;

    const fetchAvaliacoes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/verifyclientavaliation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cpf }),
        });

        const result = await response.json();

        if (result.success) {
          if (result.data && result.data.avaliacoes) {
            setAvaliacoes(result.data.avaliacoes);
            console.log(`✅ ${result.data.total} avaliação(ões) carregada(s)`);

            // Expandir automaticamente a primeira avaliação (mais recente)
            if (result.data.avaliacoes.length > 0) {
              setExpandedCards(new Set([result.data.avaliacoes[0].id]));
            }
          } else {
            setAvaliacoes([]);
            console.log("ℹ️ Nenhuma avaliação encontrada");
          }
        } else {
          setError(result.message || "Nenhuma avaliação encontrada");
          console.warn("⚠️ API retornou erro:", result.error);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar avaliações:", error);
        setError("Erro ao carregar avaliações. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvaliacoes();
  }, [cpf]);

  // Função para alternar expansão do card
  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Função para formatar data
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";

    try {
      let date;

      if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } else {
        date = new Date(timestamp);
      }

      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Função para formatar data curta (para gráficos)
  const formatDateShort = (timestamp: any) => {
    if (!timestamp) return "N/A";

    try {
      let date;

      if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } else {
        date = new Date(timestamp);
      }

      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Função para classificar IMC
  // const classificarIMC = (imc: number) => {
  //   if (imc < 18.5) return { label: "Abaixo do peso", color: "blue" };
  //   if (imc < 25) return { label: "Peso normal", color: "green" };
  //   if (imc < 30) return { label: "Sobrepeso", color: "yellow" };
  //   if (imc < 35) return { label: "Obesidade Grau I", color: "orange" };
  //   if (imc < 40) return { label: "Obesidade Grau II", color: "red" };
  //   return { label: "Obesidade Grau III", color: "red" };
  // };

  // Função para classificar percentual de gordura
  const classificarGordura = (percentual: number, sexo: string) => {
    if (sexo === "masculino") {
      if (percentual < 6) return { label: "Essencial", color: "blue" };
      if (percentual < 14) return { label: "Atleta", color: "green" };
      if (percentual < 18) return { label: "Fitness", color: "green" };
      if (percentual < 25) return { label: "Aceitável", color: "yellow" };
      return { label: "Obesidade", color: "red" };
    } else {
      if (percentual < 14) return { label: "Essencial", color: "blue" };
      if (percentual < 21) return { label: "Atleta", color: "green" };
      if (percentual < 25) return { label: "Fitness", color: "green" };
      if (percentual < 32) return { label: "Aceitável", color: "yellow" };
      return { label: "Obesidade", color: "red" };
    }
  };

  // Renderizar estado de carregamento
  if (isLoading) {
    return (
      <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
        <Flex justify="center" align="center" minH="400px">
          <Flex direction="column" align="center" gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Carregando avaliações...</Text>
          </Flex>
        </Flex>
      </Box>
    );
  }

  // Renderizar estado de erro
  if (error) {
    return (
      <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
        <Flex justify="center" align="center" minH="400px">
          <Box textAlign="center">
            <Box
              w={16}
              h={16}
              bg="red.100"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="red.500"
              mx="auto"
              mb={4}
            >
              <FiAlertCircle size={32} />
            </Box>
            <Heading size="md" color="gray.700" mb={2}>
              {error}
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Entre em contato com a academia para mais informações
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  // Renderizar lista vazia
  if (avaliacoes.length === 0) {
    return (
      <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
        <Flex justify="center" align="center" minH="400px">
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
              <FiActivity size={32} />
            </Box>
            <Heading size="md" color="gray.600" mb={2}>
              Nenhuma avaliação encontrada
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Você ainda não possui avaliações físicas registradas
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  // console.log(avaliacoes)

  // Renderizar avaliações
  return (
    <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
      {/* Header */}
      <Box mb={8}>
        <Heading size="lg" color="gray.800" mb={2}>
          Minhas Avaliações Físicas
        </Heading>
        <Text color="gray.600" fontSize="sm">
          {avaliacoes.length} avaliação(ões) encontrada(s)
        </Text>
      </Box>

      {/* graficos */}
      <Flex
        w="100%"
        direction={{ base: "column", md: "row" }}
        my={5}
        id="graficos-container"
        bg="white"
        p={2}
        borderRadius="lg"
        justifyContent={['space-between']}
      >
        <Chart.Root chart={chartPeso}>
          {/* 1. Passamos os dados diretamente para o LineChart */}
          <LineChart
            data={chartPeso.data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid horizontal={false} vertical={false} />
            <XAxis
              type="number"
              dataKey="x"
              stroke={chartPeso.color("border")}
              domain={["dataMin", "dataMax"]}
              tickFormatter={(timestamp) =>
                new Date(timestamp).toLocaleDateString()
              }
              name="Data"
            />
            <YAxis
              dataKey="y"
              stroke={chartPeso.color("border")}
              name="Peso"
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip
              content={
                <Chart.Tooltip
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString()
                  }
                />
              }
            />
            <Legend content={<Chart.Legend />} />

            <Line
              type="monotone"
              dataKey="y"
              stroke={chartPeso.color("green.600")}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </Chart.Root>

        <Chart.Root maxH="sm" chart={chartGorduraCorporal}>
          {/* 1. Passamos os dados diretamente para o LineChart */}
          <LineChart
            data={chartGorduraCorporal.data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid horizontal={false} vertical={false} />
            <XAxis
              type="number"
              dataKey="x" // 2. Usamos a chave literal "x"
              stroke={chartGorduraCorporal.color("border")}
              domain={["dataMin", "dataMax"]}
              tickFormatter={(timestamp) =>
                new Date(timestamp).toLocaleDateString()
              }
              name="Data"
            />
            <YAxis
              dataKey="y" // 3. Usamos a chave literal "y"
              stroke={chartGorduraCorporal.color("border")}
              name="BF"
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip
              content={
                <Chart.Tooltip
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString()
                  }
                />
              }
            />
            <Legend content={<Chart.Legend />} />

            {/* 4. Simplificamos a renderização da linha */}
            <Line
              type="monotone" // Deixa a linha mais suave
              dataKey="y" // A chave do dado para o eixo Y
              stroke={chartGorduraCorporal.color("orange.600")} // Cor direto da série
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </Chart.Root>

        <Chart.Root maxH="sm" chart={chartMassaMuscular}>
          {/* 1. Passamos os dados diretamente para o LineChart */}
          <LineChart
            data={chartMassaMuscular.data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid horizontal={false} vertical={false} />
            <XAxis
              type="number"
              dataKey="x" // 2. Usamos a chave literal "x"
              stroke={chartMassaMuscular.color("border")}
              domain={["dataMin", "dataMax"]}
              tickFormatter={(timestamp) =>
                new Date(timestamp).toLocaleDateString()
              }
              name="Data"
            />
            <YAxis
              dataKey="y" // 3. Usamos a chave literal "y"
              stroke={chartMassaMuscular.color("border")}
              name="BF"
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip
              content={
                <Chart.Tooltip
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString()
                  }
                />
              }
            />
            <Legend content={<Chart.Legend />} />

            {/* 4. Simplificamos a renderização da linha */}
            <Line
              type="monotone" // Deixa a linha mais suave
              dataKey="y" // A chave do dado para o eixo Y
              stroke={chartMassaMuscular.color("teal.600")} // Cor direto da série
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </Chart.Root>
      </Flex>

      {/* Lista de Avaliações */}
      <Stack gap={4}>
        {avaliacoes.map((avaliacao, index) => {
          const isExpanded = expandedCards.has(avaliacao.id);
          const isFirst = index === 0;
          // const imcClass = classificarIMC(avaliacao.resultados.imc);
          const gorduraClass = classificarGordura(
            avaliacao.resultados.percentualGordura,
            avaliacao.sexo
          );

          return (
            <Card.Root
              key={avaliacao.id}
              bg="white"
              shadow={isFirst ? "lg" : "md"}
              border={isFirst ? "2px" : "1px"}
              borderColor={isFirst ? "blue.400" : "gray.200"}
            >
              <Card.Body p={6}>
                {/* Header do Card - Sempre Visível */}
                <Flex
                  direction={{ base: "column", md: "row" }}
                  justify="space-between"
                  align={{ base: "flex-start", md: "center" }}
                  gap={4}
                  mb={isExpanded ? 6 : 0}
                >
                  <Box flex="1">
                    <Flex align="center" gap={2} mb={2}>
                      <FiActivity size={20} color="#3182CE" />
                      <Heading size="md" color="gray.800">
                        Avaliação Física
                      </Heading>
                      {isFirst && (
                        <Badge colorPalette="blue" size="sm">
                          Mais Recente
                        </Badge>
                      )}
                    </Flex>
                    <Flex align="center" gap={2} color="gray.600">
                      <FiCalendar size={14} />
                      <Text fontSize="sm">
                        Realizada em {formatDate(avaliacao.criadoEm)}
                      </Text>
                    </Flex>
                  </Box>

                  {/* Resumo Rápido - Sempre Visível */}
                  <Grid
                    templateColumns={{
                      base: "repeat(2, 1fr)",
                      sm: "repeat(4, 1fr)",
                    }}
                    gap={3}
                    flex="1"
                  >
                    <Box textAlign="center">
                      <Text fontSize="xs" color="gray.600">
                        Peso
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        {avaliacao.peso} kg
                      </Text>
                    </Box>

                    {/* <Box textAlign="center">
                      <Text fontSize="xs" color="gray.600">
                        IMC
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="purple.600">
                        {avaliacao.resultados.imc.toFixed(1)}
                      </Text>
                    </Box> */}

                    <Box textAlign="center">
                      <Text fontSize="xs" color="gray.600">
                        % Gordura
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="orange.600">
                        {avaliacao.resultados.percentualGordura.toFixed(1)}%
                      </Text>
                    </Box>

                    <Box textAlign="center">
                      <Text fontSize="xs" color="gray.600">
                        Massa Magra
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="teal.600">
                        {avaliacao.resultados.massaMagra.toFixed(1)} kg
                      </Text>
                    </Box>
                  </Grid>

                  {/* Botão de Expandir/Recolher */}
                  <Button
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => toggleCard(avaliacao.id)}
                    size="sm"
                  >
                    {isExpanded ? (
                      <>
                        <FiChevronUp size={20} />
                        <Text ml={2}>Recolher</Text>
                      </>
                    ) : (
                      <>
                        <FiChevronDown size={20} />
                        <Text ml={2}>Ver Detalhes</Text>
                      </>
                    )}
                  </Button>
                </Flex>

                {/* Conteúdo Expandido */}
                <Collapse in={isExpanded}>
                  <Separator mb={6} />

                  {/* Dados Básicos Detalhados */}
                  <Box mb={6}>
                    <Heading size="sm" color="gray.700" mb={4}>
                      Dados Básicos
                    </Heading>
                    <Grid
                      templateColumns={{
                        base: "repeat(2, 1fr)",
                        md: "repeat(4, 1fr)",
                      }}
                      gap={4}
                    >
                      <Box
                        bg="blue.50"
                        p={4}
                        borderRadius="lg"
                        border="1px"
                        borderColor="blue.100"
                      >
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          Altura
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                          {avaliacao.altura} cm
                        </Text>
                      </Box>

                      <Box
                        bg="green.50"
                        p={4}
                        borderRadius="lg"
                        border="1px"
                        borderColor="green.100"
                      >
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          Peso
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="green.600"
                        >
                          {avaliacao.peso} kg
                        </Text>
                      </Box>

                      {/* <Box
                        bg="purple.50"
                        p={4}
                        borderRadius="lg"
                        border="1px"
                        borderColor="purple.100"
                      >
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          IMC
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="purple.600"
                        >
                          {avaliacao.resultados.imc.toFixed(1)}
                        </Text>
                        <Badge colorPalette={imcClass.color} size="xs" mt={1}>
                          {imcClass.label}
                        </Badge>
                      </Box> */}

                      <Box
                        bg="orange.50"
                        p={4}
                        borderRadius="lg"
                        border="1px"
                        borderColor="orange.100"
                      >
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          % Gordura
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="orange.600"
                        >
                          {avaliacao.resultados.percentualGordura.toFixed(1)}%
                        </Text>
                        <Badge
                          colorPalette={gorduraClass.color}
                          size="xs"
                          mt={1}
                        >
                          {gorduraClass.label}
                        </Badge>
                      </Box>
                    </Grid>
                  </Box>

                  {/* Composição Corporal */}
                  <Box mb={6}>
                    <Heading size="sm" color="gray.700" mb={4}>
                      Composição Corporal
                    </Heading>
                    <Grid
                      templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                      gap={4}
                    >
                      <Box
                        bg="teal.50"
                        p={4}
                        borderRadius="lg"
                        border="1px"
                        borderColor="teal.100"
                      >
                        <Flex align="center" justify="space-between">
                          <Box>
                            <Text fontSize="sm" color="gray.600" mb={1}>
                              Massa Magra
                            </Text>
                            <Text
                              fontSize="xl"
                              fontWeight="bold"
                              color="teal.600"
                            >
                              {avaliacao.resultados.massaMagra.toFixed(1)} kg
                            </Text>
                          </Box>
                          <FiTrendingUp size={24} color="#319795" />
                        </Flex>
                      </Box>

                      <Box
                        bg="red.50"
                        p={4}
                        borderRadius="lg"
                        border="1px"
                        borderColor="red.100"
                      >
                        <Flex align="center" justify="space-between">
                          <Box>
                            <Text fontSize="sm" color="gray.600" mb={1}>
                              Massa Gorda
                            </Text>
                            <Text
                              fontSize="xl"
                              fontWeight="bold"
                              color="red.600"
                            >
                              {avaliacao.resultados.massaGorda.toFixed(1)} kg
                            </Text>
                          </Box>
                          <FiTrendingDown size={24} color="#E53E3E" />
                        </Flex>
                      </Box>
                    </Grid>
                  </Box>

                  {/* Medidas Corporais */}
                  <Box mb={6}>
                    <Heading size="sm" color="gray.700" mb={4}>
                      Medidas Corporais (cm)
                    </Heading>
                    <Grid
                      templateColumns={{
                        base: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: "repeat(5, 1fr)",
                      }}
                      gap={3}
                    >
                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Tórax
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.medidas.torax}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Abdômen
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.medidas.abdomen}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Cintura
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.medidas.cintura}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Quadril
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.medidas.quadril}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Braço D
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.medidas.bracoDireito}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Braço E
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.medidas.bracoEsquerdo}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Coxa D
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.medidas.coxaDireita}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Coxa E
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.medidas.coxaEsquerda}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Panturrilha D
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.medidas.panturrilhaDireita}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Panturrilha E
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.medidas.panturrilhaEsquerda}
                        </Text>
                      </Box>
                    </Grid>
                  </Box>

                  {/* Dobras Cutâneas */}
                  <Box mb={6}>
                    <Heading size="sm" color="gray.700" mb={4}>
                      Dobras Cutâneas (mm)
                    </Heading>
                    <Grid
                      templateColumns={{
                        base: "repeat(2, 1fr)",
                        md: "repeat(4, 1fr)",
                      }}
                      gap={3}
                    >
                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Tríceps
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.dobras.triceps}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Bíceps
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.dobras.biceps}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Subescapular
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.dobras.subescapular}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Axilar Média
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.dobras.axilarMedia}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Supraílíaca
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.dobras.suprailiaca}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Abdominal
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.dobras.abdominal}
                        </Text>
                      </Box>

                      <Box bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Coxa
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="semibold"
                          color="gray.800"
                        >
                          {avaliacao.dobras.coxa}
                        </Text>
                      </Box>

                      <Box
                        bg="blue.100"
                        p={3}
                        borderRadius="md"
                        border="2px"
                        borderColor="blue.300"
                      >
                        <Text fontSize="xs" color="gray.700" fontWeight="bold">
                          Soma Total
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.700">
                          {avaliacao.dobras.soma}
                        </Text>
                      </Box>
                    </Grid>
                  </Box>

                  {/* Observações */}
                  {avaliacao.observacoes && (
                    <Box>
                      <Heading size="sm" color="gray.700" mb={3}>
                        Observações
                      </Heading>
                      <Box
                        bg="gray.50"
                        p={4}
                        borderRadius="md"
                        border="1px"
                        borderColor="gray.200"
                      >
                        <Text color="gray.700" fontSize="sm">
                          {avaliacao.observacoes}
                        </Text>
                      </Box>
                    </Box>
                  )}
                </Collapse>
              </Card.Body>
            </Card.Root>
          );
        })}
      </Stack>
    </Box>
  );
}
