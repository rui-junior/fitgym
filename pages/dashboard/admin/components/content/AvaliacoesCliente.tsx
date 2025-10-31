import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Stack,
  Badge,
  Separator,
  Spinner,
  Icon,
} from "@chakra-ui/react";

import { Collapse } from "@chakra-ui/transition";

import {
  FiActivity,
  FiArrowLeft,
  FiPlus,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiTrash2,
  FiCalendar,
  FiUser,
} from "react-icons/fi";

import { Cliente } from "./types/ClientTypes";

interface Avaliacao {
  [x: string]: any;
  medidas: any;
  resultados: any;
  id: string;
  peso: number;
  altura: number;
  imc: number;
  percentualGordura: number;
  massaMagra: number;
  massaGorda: number;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

interface AvaliacoesClienteProps {
  cliente: Cliente;
  onBack: () => void;
  onNovaAvaliacao: (cliente: Cliente) => void;
}

const AvaliacoesCliente = ({
  cliente,
  onBack,
  onNovaAvaliacao,
}: AvaliacoesClienteProps) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [ultimaAvaliacao, setUltimaAvaliacao] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Buscar avaliações do cliente
  const fetchAvaliacoes = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/verifyclientavaliation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cpf: cliente.cpf }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();

      // console.log(result.data);

      if (result.success) {
        setAvaliacoes(result.data.avaliacoes);
        setUltimaAvaliacao(result.data.ultimaAvaliacao);
      } else {
        console.error("Erro ao buscar avaliações:", result.error);
        setAvaliacoes([]);
        setUltimaAvaliacao(null);
      }
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
      setAvaliacoes([]);
      setUltimaAvaliacao(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Deletar avaliação
  const handleDeleteAvaliacao = async (avaliacaoId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta avaliação?")) {
      return;
    }

    setIsDeleting(avaliacaoId);


    try {
      const response = await fetch("/api/deleteclientavaliation", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: cliente.cpf,
          avaliacaoId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Remover da lista local
        setAvaliacoes((prev) => prev.filter((av) => av.id !== avaliacaoId));

        // Atualizar última avaliação se necessário
        if (ultimaAvaliacao?.id === avaliacaoId) {
          const novasAvaliacoes = avaliacoes.filter(
            (av) => av.id !== avaliacaoId
          );
          setUltimaAvaliacao(novasAvaliacoes[0] || null);
        }

        // alert("Avaliação excluída com sucesso!");
      } else {
        alert(`Erro ao excluir avaliação: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao excluir avaliação:", error);
      // alert("Erro ao excluir avaliação");
    } finally {
      setIsDeleting(null);
    }
  };

  // Calcular idade
  const calcularIdade = (dataNascimento: string): number => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }

    return idade;
  };

  // Classificar IMC
  const classificarIMC = (imc: number): { label: string; color: string } => {
    if (imc < 18.5) return { label: "Abaixo do peso", color: "blue" };
    if (imc < 25) return { label: "Peso normal", color: "green" };
    if (imc < 30) return { label: "Sobrepeso", color: "yellow" };
    if (imc < 35) return { label: "Obesidade I", color: "orange" };
    if (imc < 40) return { label: "Obesidade II", color: "red" };
    return { label: "Obesidade III", color: "purple" };
  };

  // Formatar data
  const formatarData = (dataString: string): string => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR");
  };

  // Indicador de tendência - ✅ CORRIGIDO
  const getTendencia = (valorAtual: number, valorAnterior: number) => {
    if (valorAtual > valorAnterior) {
      return { icon: FiTrendingUp, color: "red.500" };
    } else if (valorAtual < valorAnterior) {
      return { icon: FiTrendingDown, color: "green.500" };
    } else {
      return { icon: FiMinus, color: "gray.500" };
    }
  };

  useEffect(() => {
    fetchAvaliacoes();
  }, [cliente.cpf]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
      {/* Header */}
      <Flex align="center" justify="space-between" mb={6}>
        <Flex align="center" gap={4}>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Flex align="center" gap={2}>
              <FiArrowLeft size={16} />
              Voltar
            </Flex>
          </Button>
          <Box>
            <Heading size="lg" color="gray.800">
              Avaliações Físicas
            </Heading>
            <Text color="gray.600" fontSize="sm">
              {cliente.nome} • {calcularIdade(cliente.dataNascimento)} anos
            </Text>
          </Box>
        </Flex>

        <Button colorScheme="green" onClick={() => onNovaAvaliacao(cliente)}>
          <Flex align="center" gap={2}>
            <FiPlus size={16} />
            Nova Avaliação
          </Flex>
        </Button>
      </Flex>

      <Stack gap={6} align={"center"}>
        {/* Última Avaliação - Só mostra se existir */}
        {ultimaAvaliacao && (
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            p={6}
            w={["30%"]}
          >
            <Flex align="center" gap={3} mb={4}>
              <Box
                w={10}
                h={10}
                bg="green.50"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="green.500"
              >
                <FiActivity size={20} />
              </Box>
              <Box>
                <Heading size="md" color="gray.800">
                  Última Avaliação
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  {formatarData(ultimaAvaliacao.criadoEm)}
                </Text>
              </Box>
            </Flex>

            <Flex direction={{ base: "column", md: "row" }} gap={6}>
              {/* Métricas principais */}
              <Flex flex={1} direction="column" gap={4}>
                <Flex justify="space-between">
                  <Text color="gray.600">Peso:</Text>
                  <Text fontWeight="bold">{ultimaAvaliacao.peso} kg</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.600">Massa Gorda:</Text>
                  <Flex align="center" gap={2}>
                    <Text fontWeight="bold">
                      {ultimaAvaliacao.resultados.massaGorda} kg
                    </Text>
                  </Flex>
                </Flex>
              </Flex>

              <Flex flex={1} direction="column" gap={4}>
                <Flex justify="space-between">
                  <Text color="gray.600">% Gordura:</Text>
                  <Text fontWeight="bold">
                    {ultimaAvaliacao.resultados.percentualGordura}%
                  </Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.600">Massa Magra:</Text>
                  <Text fontWeight="bold">
                    {ultimaAvaliacao.resultados.massaMagra} kg
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Box>
        )}

        {/* Histórico de Avaliações */}
        <Flex
          bg="white"
          borderRadius="xl"
          shadow="sm"
          border="1px"
          borderColor="gray.200"
          p={6}
          w={["50%"]}
          direction={"column"}
        >
          {/* Historico de Avaliações */}
          <Flex align="center" gap={3} mb={4}>
            <Box
              w={10}
              h={10}
              bg="blue.50"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="blue.500"
            >
              <FiCalendar size={20} />
            </Box>
            <Heading size="md" color="gray.800">
              Histórico de Avaliações
            </Heading>
          </Flex>

          {avaliacoes.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={12}
              color="gray.500"
            >
              <FiUser size={48} />
              <Text mt={4} fontSize="lg" fontWeight="medium">
                Nenhuma avaliação encontrada
              </Text>
              <Text fontSize="sm">Clique em "Nova Avaliação" para começar</Text>
            </Flex>
          ) : (
            <Stack gap={3} w={"100%"} h={"auto"}>
              {avaliacoes.map((avaliacao: any, index) => {
                const avaliacaoAnterior = avaliacoes[index + 1];
                const bgColor = index % 2 === 0 ? "gray.50" : "white";

                return (
                  <Box
                    key={avaliacao.id}
                    bg={bgColor}
                    borderRadius="lg"
                    p={4}
                    border="1px"
                    borderColor="gray.100"
                    cursor="pointer"
                    onClick={() => toggleExpand(avaliacao.id)}
                  >
                    <Flex w={["100%"]} justifyContent="space-around">
                      {/* data da avaliacao */}
                      <Flex align="center" gap={4} mb={3}>
                        <Text fontWeight="bold" color="gray.800">
                          {formatarData(avaliacao.criadoEm)}
                        </Text>
                      </Flex>

                      <Flex direction="column" gap={2} w={["50%"]}>
                        <Flex align="center" gap={2}>
                          <Text fontSize="sm" color="gray.600">
                            Peso:
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {avaliacao.peso} kg
                          </Text>
                          {avaliacaoAnterior && (
                            <Icon
                              as={
                                getTendencia(
                                  avaliacao.peso,
                                  avaliacaoAnterior.peso
                                ).icon
                              }
                              color={
                                getTendencia(
                                  avaliacao.peso,
                                  avaliacaoAnterior.peso
                                ).color
                              }
                              boxSize={3}
                            />
                          )}
                        </Flex>
                        <Flex align="center" gap={2}>
                          <Text fontSize="sm" color="gray.600">
                            % Gordura:
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {avaliacao.resultados.percentualGordura}%
                          </Text>
                          {avaliacaoAnterior && (
                            <Icon
                              as={
                                getTendencia(
                                  avaliacao.resultados.percentualGordura,
                                  avaliacaoAnterior.resultados.percentualGordura
                                ).icon
                              }
                              color={
                                getTendencia(
                                  avaliacao.resultados.percentualGordura,
                                  avaliacaoAnterior.resultados.percentualGordura
                                ).color
                              }
                              boxSize={3}
                            />
                          )}
                        </Flex>

                        <Flex align="center" gap={2}>
                          <Text fontSize="sm" color="gray.600">
                            Massa Magra:
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {avaliacao.resultados.massaMagra} kg
                          </Text>
                          {avaliacaoAnterior && (
                            <Icon
                              as={
                                getTendencia(
                                  avaliacao.resultados.massaMagra,
                                  avaliacaoAnterior.resultados.massaMagra
                                ).icon
                              }
                              color={
                                getTendencia(
                                  avaliacao.resultados.massaMagra,
                                  avaliacaoAnterior.resultados.massaMagra
                                ).color
                              }
                              boxSize={3}
                            />
                          )}
                        </Flex>
                        <Flex align="center" gap={2}>
                          <Text fontSize="sm" color="gray.600">
                            Massa Gorda:
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {avaliacao.resultados.massaGorda} kg
                          </Text>
                          {avaliacaoAnterior && (
                            <Icon
                              as={
                                getTendencia(
                                  avaliacao.resultados.massaGorda,
                                  avaliacaoAnterior.resultados.massaGorda
                                ).icon
                              }
                              color={
                                getTendencia(
                                  avaliacao.resultados.massaGorda,
                                  avaliacaoAnterior.resultados.massaGorda
                                ).color
                              }
                              boxSize={3}
                            />
                          )}
                        </Flex>

                        <Collapse
                          in={expandedIds.includes(avaliacao.id)}
                          animateOpacity
                        >
                          <Flex gap={6}>
                            <Flex direction={"column"} my={2}>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" fontWeight="medium">
                                  Medidas (cm):
                                </Text>
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Abdômen:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.medidas.abdomen} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.medidas.abdomen,
                                        avaliacaoAnterior.medidas.abdomen
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.medidas.abdomen,
                                        avaliacaoAnterior.medidas.abdomen
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Cintura:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.medidas.cintura} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.medidas.cintura,
                                        avaliacaoAnterior.medidas.cintura
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.medidas.cintura,
                                        avaliacaoAnterior.medidas.cintura
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Quadril:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.medidas.quadril} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.medidas.quadril,
                                        avaliacaoAnterior.medidas.quadril
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.medidas.quadril,
                                        avaliacaoAnterior.medidas.quadril
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Torax:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.dobras.coxa} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.dobras.coxa,
                                        avaliacaoAnterior.dobras.coxa
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.dobras.coxa,
                                        avaliacaoAnterior.dobras.coxa
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Subescapular:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.dobras.subescapular} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.dobras.subescapular,
                                        avaliacaoAnterior.dobras.subescapular
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.dobras.subescapular,
                                        avaliacaoAnterior.dobras.subescapular
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Supra Ilíaca:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.dobras.suprailiaca} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.dobras.suprailiaca,
                                        avaliacaoAnterior.dobras.suprailiaca
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.dobras.suprailiaca,
                                        avaliacaoAnterior.dobras.suprailiaca
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Tríceps:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.dobras.triceps} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.dobras.triceps,
                                        avaliacaoAnterior.dobras.triceps
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.dobras.triceps,
                                        avaliacaoAnterior.dobras.triceps
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                            </Flex>

                            <Flex direction={"column"} my={2}>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" fontWeight="medium">
                                  Dobras (mm):
                                </Text>
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Abdômen:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.dobras.abdominal} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.dobras.abdominal,
                                        avaliacaoAnterior.dobras.abdominal
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.dobras.abdominal,
                                        avaliacaoAnterior.dobras.abdominal
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Axilar:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.dobras.axilarMedia} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.dobras.axilarMedia,
                                        avaliacaoAnterior.dobras.axilarMedia
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.dobras.axilarMedia,
                                        avaliacaoAnterior.dobras.axilarMedia
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Bíceps:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.dobras.biceps} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.dobras.biceps,
                                        avaliacaoAnterior.dobras.biceps
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.dobras.biceps,
                                        avaliacaoAnterior.dobras.biceps
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Coxa:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.dobras.coxa} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.dobras.coxa,
                                        avaliacaoAnterior.dobras.coxa
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.dobras.coxa,
                                        avaliacaoAnterior.dobras.coxa
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Braço Direito:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.medidas.bracoDireito} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.medidas.bracoDireito,
                                        avaliacaoAnterior.medidas.bracoDireito
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.medidas.bracoDireito,
                                        avaliacaoAnterior.medidas.bracoDireito
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Braço Esquerdo:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.medidas.bracoEsquerdo} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.medidas.bracoEsquerdo,
                                        avaliacaoAnterior.medidas.bracoEsquerdo
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.medidas.bracoEsquerdo,
                                        avaliacaoAnterior.medidas.bracoEsquerdo
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Coxa Direita:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.medidas.coxaEsquerda} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.medidas.coxaEsquerda,
                                        avaliacaoAnterior.medidas.coxaEsquerda
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.medidas.coxaEsquerda,
                                        avaliacaoAnterior.medidas.coxaEsquerda
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Coxa Esquerda:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.medidas.coxaEsquerda} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.medidas.coxaEsquerda,
                                        avaliacaoAnterior.medidas.coxaEsquerda
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.medidas.coxaEsquerda,
                                        avaliacaoAnterior.medidas.coxaEsquerda
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Panturrilha Direita:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.medidas.panturrilhaDireita} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.medidas.panturrilhaDireita,
                                        avaliacaoAnterior.medidas
                                          .panturrilhaDireita
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.medidas.panturrilhaDireita,
                                        avaliacaoAnterior.medidas
                                          .panturrilhaDireita
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                              <Flex align="center" gap={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Panturrilha Esquerda:
                                </Text>
                                <Text fontSize="sm" fontWeight="medium">
                                  {avaliacao.medidas.panturrilhaEsquerda} kg
                                </Text>
                                {avaliacaoAnterior && (
                                  <Icon
                                    as={
                                      getTendencia(
                                        avaliacao.medidas.panturrilhaEsquerda,
                                        avaliacaoAnterior.medidas
                                          .panturrilhaEsquerda
                                      ).icon
                                    }
                                    color={
                                      getTendencia(
                                        avaliacao.medidas.panturrilhaEsquerda,
                                        avaliacaoAnterior.medidas
                                          .panturrilhaEsquerda
                                      ).color
                                    }
                                    boxSize={3}
                                  />
                                )}
                              </Flex>
                            </Flex>
                          </Flex>
                        </Collapse>
                      </Flex>

                      <Button
                        variant="ghost"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDeleteAvaliacao(avaliacao.id)}
                        disabled={isDeleting === avaliacao.id}
                      >
                        {isDeleting === avaliacao.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <FiTrash2 size={16} />
                        )}
                      </Button>
                    </Flex>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Flex>
      </Stack>
    </Box>
  );
};

export default AvaliacoesCliente;
