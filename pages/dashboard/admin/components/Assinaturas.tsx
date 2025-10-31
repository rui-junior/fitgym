import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
  Badge,
  Portal,
  CloseButton,
  Input,
} from "@chakra-ui/react";

import { Dialog } from "@chakra-ui/react";

import { useEffect, useState } from "react";
import AddAssinatura from "./content/AddAssinatura";

import { FiPlus, FiUsers, FiTrash2 } from "react-icons/fi";

interface AssinaturaData {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteCpf: string;
  planoId: string;
  planoNome: string;
  valorPlano: number;
  periodoPlano: number;
  dataInicio: string;
  dataFim: string;
  status: "ativa" | "pausada" | "cancelada" | "expirada";
  criadoEm: any;
  atualizadoEm: any;
}

type ViewType = "lista" | "adicionar";

export default function Assinaturas() {
  const [assinaturas, setAssinaturas] = useState<AssinaturaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>("lista");
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para mês/ano selecionado - formato do input: aaaa-mm
  const hoje = new Date();
  const anoAtual = String(hoje.getFullYear());
  const mesAtual = String(hoje.getMonth() + 1).padStart(2, "0");
  const [mesAnoInput, setMesAnoInput] = useState(`${anoAtual}-${mesAtual}`);

  // Converter formato do input (aaaa-mm) para formato Firebase (mm-aaaa)
  const converterParaFormatoFirebase = (inputValue: string): string => {
    const [ano, mes] = inputValue.split("-");
    return `${mes}-${ano}`;
  };

  // Buscar assinaturas do mês/ano selecionado
  const fetchAssinaturas = async () => {
    setIsLoading(true);
    try {
      const mesAnoFirebase = converterParaFormatoFirebase(mesAnoInput);
      
      const response = await fetch("/api/verifyassinatura", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mesAno: mesAnoFirebase,
        }),
      });
      const result = await response.json();

      if (result.success) {
        setAssinaturas(result.data);
      } else {
        console.error("Erro ao buscar assinaturas:", result.message);
      }
    } catch (error) {
      console.error("Erro ao buscar assinaturas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssinaturas();
  }, [mesAnoInput]);

  function formatarData(dataISO: string): string {
    const data = new Date(dataISO);
    if (isNaN(data.getTime())) return "Data inválida";
    return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "ativa":
        return "green";
      case "pausada":
        return "yellow";
      case "cancelada":
        return "red";
      case "expirada":
        return "gray";
      default:
        return "blue";
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case "ativa":
        return "Ativa";
      case "pausada":
        return "Pausada";
      case "cancelada":
        return "Cancelada";
      case "expirada":
        return "Expirada";
      default:
        return status;
    }
  }

  const handleAddAssinatura = () => {
    setCurrentView("adicionar");
  };

  const handleBack = () => {
    setCurrentView("lista");
    // Recarregar lista após voltar
    fetchAssinaturas();
  };

  const handleDelete = async (assinaturaId: string) => {
    setIsDeleting(true);

    try {
      const mesAnoFirebase = converterParaFormatoFirebase(mesAnoInput);
      
      const response = await fetch("/api/deleteassinatura", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assinaturaId,
          mesAno: mesAnoFirebase,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Assinatura excluída com sucesso!");
        // Recarregar lista
        fetchAssinaturas();
      } else {
        console.error("Erro ao excluir assinatura:", result.message);
        alert(
          "Erro ao excluir assinatura: " +
            (result.message || "Erro desconhecido")
        );
      }
    } catch (error) {
      console.error("Erro ao excluir assinatura:", error);
      alert(
        "Erro ao excluir assinatura. Verifique o console para mais detalhes."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Converter mesAnoInput para exibição
  const getMesAnoExibicao = () => {
    const [ano, mes] = mesAnoInput.split("-");
    const data = new Date(parseInt(ano), parseInt(mes) - 1);
    return data.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  };

  if (currentView === "adicionar") {
    const mesAnoFirebase = converterParaFormatoFirebase(mesAnoInput);
    return <AddAssinatura onBack={handleBack} mesAno={mesAnoFirebase} />;
  }

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
            Gerenciamento de Assinaturas
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {assinaturas.length} assinatura{assinaturas.length !== 1 ? "s" : ""}{" "}
            em {getMesAnoExibicao()}
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

          <Button colorScheme="blue" size="lg" onClick={handleAddAssinatura}>
            <Flex align="center" gap={2}>
              <FiPlus size={20} />
              Nova Assinatura
            </Flex>
          </Button>
        </Flex>
      </Flex>

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
              <Text color="gray.600">Carregando assinaturas...</Text>
            </Flex>
          </Flex>
        ) : assinaturas.length === 0 ? (
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
                Nenhuma assinatura encontrada
              </Heading>
              <Text color="gray.500" fontSize="sm" mb={4}>
                Não há assinaturas cadastradas para este mês
              </Text>
              <Button colorScheme="blue" onClick={handleAddAssinatura}>
                <Flex align="center" gap={2}>
                  <FiPlus size={18} />
                  Criar primeira assinatura
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
                <Box flex="2">
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
                    Início
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    Fim
                  </Text>
                </Box>
                <Box flex="0.5">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    Ações
                  </Text>
                </Box>
              </Flex>
            </Box>

            {/* Lista */}
            <Stack gap={0}>
              {assinaturas.map((assinatura: AssinaturaData) => {
                return (
                  <Box key={assinatura.id}>
                    {/* Desktop */}
                    <Box
                      p={4}
                      borderBottom="1px"
                      borderColor="gray.100"
                      _hover={{ bg: "gray.50" }}
                      transition="all 0.2s"
                      display={{ base: "none", lg: "block" }}
                    >
                      <Flex align="center" gap={4}>
                        <Box flex="2">
                          <Text
                            fontWeight="medium"
                            color="gray.800"
                            fontSize="sm"
                          >
                            {assinatura.clienteNome}
                          </Text>
                          <Badge
                            colorScheme={getStatusColor(assinatura.status)}
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            {getStatusLabel(assinatura.status)}
                          </Badge>
                        </Box>

                        <Box flex="2">
                          <Text
                            fontWeight="medium"
                            color="gray.700"
                            fontSize="sm"
                          >
                            {assinatura.planoNome} - {assinatura.periodoPlano}{" "}
                            dias
                          </Text>
                        </Box>

                        <Box flex="1">
                          <Text
                            fontWeight="medium"
                            color="gray.700"
                            fontSize="sm"
                          >
                            R$ {assinatura.valorPlano.toFixed(2)}
                          </Text>
                        </Box>

                        <Box flex="1">
                          <Text
                            fontWeight="medium"
                            color="gray.700"
                            fontSize="sm"
                          >
                            {formatarData(assinatura.dataInicio)}
                          </Text>
                        </Box>

                        <Box flex="1">
                          <Text
                            fontWeight="medium"
                            color="gray.700"
                            fontSize="sm"
                          >
                            {formatarData(assinatura.dataFim)}
                          </Text>
                        </Box>

                        <Box flex="0.5">
                          <Dialog.Root role="alertdialog">
                            <Dialog.Trigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                              >
                                <FiTrash2 size={14} />
                              </Button>
                            </Dialog.Trigger>
                            <Portal>
                              <Dialog.Backdrop />
                              <Dialog.Positioner>
                                <Dialog.Content>
                                  <Dialog.Header>
                                    <Dialog.Title>
                                      Excluir Assinatura
                                    </Dialog.Title>
                                  </Dialog.Header>
                                  <Dialog.Body>
                                    <Text>
                                      Tem certeza que deseja excluir a
                                      assinatura de{" "}
                                      <strong>{assinatura.clienteNome}</strong>?
                                    </Text>
                                    <Text mt={2} fontSize="sm" color="gray.600">
                                      Esta ação não pode ser desfeita.
                                    </Text>
                                  </Dialog.Body>
                                  <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                      <Button variant="outline">
                                        Cancelar
                                      </Button>
                                    </Dialog.ActionTrigger>
                                    <Button
                                      colorPalette="red"
                                      onClick={() =>
                                        handleDelete(assinatura.id)
                                      }
                                      loading={isDeleting}
                                    >
                                      Excluir
                                    </Button>
                                  </Dialog.Footer>
                                  <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" />
                                  </Dialog.CloseTrigger>
                                </Dialog.Content>
                              </Dialog.Positioner>
                            </Portal>
                          </Dialog.Root>
                        </Box>
                      </Flex>
                    </Box>

                    {/* Mobile */}
                    <Box
                      p={4}
                      borderBottom="1px"
                      borderColor="gray.100"
                      display={{ base: "block", lg: "none" }}
                    >
                      <Flex direction="column" gap={3}>
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Text fontWeight="medium" color="gray.800">
                              {assinatura.clienteNome}
                            </Text>
                            <Text color="gray.500" fontSize="xs">
                              {assinatura.clienteCpf}
                            </Text>
                          </Box>
                          <Flex align="center" gap={2}>
                            <Badge
                              colorScheme={getStatusColor(assinatura.status)}
                              fontSize="xs"
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {getStatusLabel(assinatura.status)}
                            </Badge>
                            <Dialog.Root role="alertdialog">
                              <Dialog.Trigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                >
                                  <FiTrash2 size={14} />
                                </Button>
                              </Dialog.Trigger>
                              <Portal>
                                <Dialog.Backdrop />
                                <Dialog.Positioner>
                                  <Dialog.Content>
                                    <Dialog.Header>
                                      <Dialog.Title>
                                        Excluir Assinatura
                                      </Dialog.Title>
                                    </Dialog.Header>
                                    <Dialog.Body>
                                      <Text>
                                        Tem certeza que deseja excluir a
                                        assinatura de{" "}
                                        <strong>
                                          {assinatura.clienteNome}
                                        </strong>
                                        ?
                                      </Text>
                                      <Text
                                        mt={2}
                                        fontSize="sm"
                                        color="gray.600"
                                      >
                                        Esta ação não pode ser desfeita.
                                      </Text>
                                    </Dialog.Body>
                                    <Dialog.Footer>
                                      <Dialog.ActionTrigger asChild>
                                        <Button variant="outline">
                                          Cancelar
                                        </Button>
                                      </Dialog.ActionTrigger>
                                      <Button
                                        colorPalette="red"
                                        onClick={() =>
                                          handleDelete(assinatura.id)
                                        }
                                        loading={isDeleting}
                                      >
                                        Excluir
                                      </Button>
                                    </Dialog.Footer>
                                    <Dialog.CloseTrigger asChild>
                                      <CloseButton size="sm" />
                                    </Dialog.CloseTrigger>
                                  </Dialog.Content>
                                </Dialog.Positioner>
                              </Portal>
                            </Dialog.Root>
                          </Flex>
                        </Flex>
                        <Stack gap={2} fontSize="sm">
                          <Flex justify="space-between">
                            <Text color="gray.500">Plano:</Text>
                            <Text color="gray.800">{assinatura.planoNome}</Text>
                          </Flex>

                          <Flex justify="space-between">
                            <Text color="gray.500">Valor:</Text>
                            <Text color="gray.800">
                              R$ {assinatura.valorPlano.toFixed(2)}
                            </Text>
                          </Flex>

                          <Flex justify="space-between">
                            <Text color="gray.500">Período:</Text>
                            <Text color="gray.800">
                              {assinatura.periodoPlano} dias
                            </Text>
                          </Flex>

                          <Flex justify="space-between">
                            <Text color="gray.500">Início:</Text>
                            <Text color="gray.800">
                              {formatarData(assinatura.dataInicio)}
                            </Text>
                          </Flex>

                          <Flex justify="space-between">
                            <Text color="gray.500">Fim:</Text>
                            <Text color="gray.800">
                              {formatarData(assinatura.dataFim)}
                            </Text>
                          </Flex>
                        </Stack>
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
