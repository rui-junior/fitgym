import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Input,
  Stack,
  Spinner,
  Badge,
  Dialog,
  Portal,
  CloseButton,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiRefreshCw,
  FiUserPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";

// Importar componentes
import DetalhesCliente from "./DetalhesCliente";
import EditarCliente from "./EditarCliente";
import HistoricoCliente from "./HistoricoCliente";
import AvaliacoesCliente from "./AvaliacoesCliente";
import NovaAvaliacao from "./NovaAvaliacao";

import { Cliente } from "./types/ClientTypes";
// interface Cliente {
//   id: string;
//   uid: string;
//   nome: string;
//   email: string;
//   cpf: string;
//   celular: string;
//   dataNascimento: string;
//   dataPagamento: string;
//   criadoEm: any;
//   atualizadoEm: any;
//   ativo: boolean;
//   plano: string;
//   status: string;
// }



// Componente Avatar customizado
const CustomAvatar = ({
  name,
  size = "sm",
  bg = "blue.500",
  color = "white",
}: {
  name: string;
  size?: string;
  bg?: string;
  color?: string;
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeMap = {
    sm: { w: 8, h: 8, fontSize: "sm" },
    md: { w: 12, h: 12, fontSize: "md" },
    lg: { w: 20, h: 20, fontSize: "xl" },
  };

  const avatarSize = sizeMap[size as keyof typeof sizeMap] || sizeMap.sm;

  return (
    <Box
      w={avatarSize.w}
      h={avatarSize.h}
      bg={bg}
      color={color}
      borderRadius="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontWeight="bold"
      fontSize={avatarSize.fontSize}
    >
      {getInitials(name)}
    </Box>
  );
};

type ViewType =
  | "lista"
  | "detalhes"
  | "editar"
  | "historico"
  | "avaliacoes"
  | "nova-avaliacao";

const ListaClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>("lista");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Função para buscar clientes
  const fetchClientes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/verifyclient");
      const result = await response.json();

      if (result.success) {
        setClientes(result.data);
        setClientesFiltrados(result.data);
      } else {
        console.error("Erro ao buscar clientes:", result.message);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Função para filtrar clientes
  useEffect(() => {
    if (!searchTerm) {
      setClientesFiltrados(clientes);
    } else {
      const filtered = clientes.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cliente.cpf.includes(searchTerm) ||
          cliente.celular.includes(searchTerm)
      );
      setClientesFiltrados(filtered);
    }
  }, [searchTerm, clientes]);

  // Função para obter nome resumido
  const getShortName = (fullName: string) => {
    const words = fullName.trim().split(" ");
    if (words.length === 1) {
      return words[0];
    }
    return `${words[0]} ${words[words.length - 1]}`;
  };

  // Função para formatar CPF
  const formatCPF = (cpf: string) => {
    if (!cpf) return "";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  // Função para formatar celular
  const formatCelular = (celular: string) => {
    if (!celular) return "";
    const clean = celular.replace(/\D/g, "");
    if (clean.length === 11) {
      return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return celular;
  };

  // Função para formatar data
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";

    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else if (timestamp._seconds) {
        date = new Date(timestamp._seconds * 1000);
      } else {
        date = new Date(timestamp);
      }

      return date.toLocaleDateString("pt-BR");
    } catch (error) {
      return "N/A";
    }
  };

  // Função para excluir cliente
  const handleDelete = async (cliente: Cliente) => {
  try {
    const response = await fetch("/api/deletecliente", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cpf: cliente.cpf }),
    });

    const result = await response.json();

    if (result.success) {
      // Remove o cliente da lista local usando CPF como identificador
      setClientes((prev) => prev.filter((c) => c.cpf !== cliente.cpf));
      fetchClientes();
      console.log(`✅ Cliente ${cliente.nome} excluído com sucesso`);
    } else {
      console.error(`❌ Erro ao excluir cliente: ${result.message}`);
      fetchClientes();
    }
  } catch (error) {
    console.error("❌ Erro ao excluir cliente:", error);
    fetchClientes();
  }
};


  // Funções de navegação
  const handleViewDetails = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setCurrentView("detalhes");
  };

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setCurrentView("editar");
  };

  const handleHistorico = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setCurrentView("historico");
  };

  const handleAvaliacoes = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setCurrentView("avaliacoes");
  };

  const handleNovaAvaliacao = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setCurrentView("nova-avaliacao");
  };

  const handleBack = () => {
    setCurrentView("lista");
    setSelectedCliente(null);
    // Recarregar lista após voltar
    fetchClientes();
  };

  const handleClienteAtualizado = (clienteAtualizado: Cliente) => {
    // Atualizar cliente na lista local usando CPF como identificador
    setClientes((prev) =>
      prev.map((c) => (c.cpf === clienteAtualizado.cpf ? clienteAtualizado : c))
    );
    setSelectedCliente(clienteAtualizado);
  };

  const handleAvaliacaoSalva = () => {
    // Callback para quando uma avaliação é salva
    // Pode ser usado para atualizar dados ou mostrar notificações
    console.log("Avaliação salva com sucesso");
  };

  // Renderização condicional baseada na view atual
  if (currentView === "detalhes" && selectedCliente) {
    return (
      <DetalhesCliente
        cliente={selectedCliente}
        onBack={handleBack}
        onEdit={handleEdit}
        onHistorico={handleHistorico}
        onAvaliacoes={handleAvaliacoes}
        onClienteAtualizado={handleClienteAtualizado}
      />
    );
  }

  if (currentView === "editar" && selectedCliente) {
    return (
      <EditarCliente
        cliente={selectedCliente}
        onBack={handleBack}
        onClienteAtualizado={handleClienteAtualizado}
      />
    );
  }

  if (currentView === "historico" && selectedCliente) {
    return <HistoricoCliente cliente={selectedCliente} onBack={handleBack} />;
  }

  if (currentView === "avaliacoes" && selectedCliente) {
    return (
      <AvaliacoesCliente
        cliente={selectedCliente}
        onBack={handleBack}
        onNovaAvaliacao={handleNovaAvaliacao}
      />
    );
  }

  if (currentView === "nova-avaliacao" && selectedCliente) {
    return (
      <NovaAvaliacao
        cliente={selectedCliente}
        onBack={handleBack}
        onAvaliacaoSalva={handleAvaliacaoSalva}
      />
    );
  }

  // View da lista (padrão)
  return (
    <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
      {/* Header */}
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        gap={4}
        mb={8}
      >
        <Box>
          <Heading size="lg" color="gray.800" mb={2}>
            Lista de Clientes
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {clientesFiltrados.length} cliente(s) encontrado(s)
          </Text>
        </Box>

        <Flex gap={3} direction={{ base: "column", sm: "row" }}>
          <Button
            variant="outline"
            colorScheme="gray"
            onClick={fetchClientes}
            disabled={isLoading}
            w={{ base: "100%", md: "auto" }}
          >
            <Flex align="center" gap={2}>
              <FiRefreshCw size={16} />
              Atualizar
            </Flex>
          </Button>

          {/* <Button
            colorScheme="blue"
            w={{ base: "100%", md: "auto" }}
            onClick={() => {
              console.log('Novo cliente');
            }}
          >
            <Flex align="center" gap={2}>
              <FiUserPlus size={16} />
              Novo Cliente
            </Flex>
          </Button> */}
        </Flex>
      </Flex>

      {/* Barra de Pesquisa */}
      <Box mb={6}>
        <Input
          placeholder="Pesquisar por nome, email, CPF ou celular..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="lg"
          bg="white"
          border="1px"
          borderColor="gray.200"
          _focus={{
            borderColor: "blue.500",
            bg: "white",
          }}
        />
      </Box>

      {/* Conteúdo Principal */}
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
              <Text color="gray.600">Carregando clientes...</Text>
            </Flex>
          </Flex>
        ) : clientesFiltrados.length === 0 ? (
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
                {searchTerm
                  ? "Nenhum cliente encontrado"
                  : "Nenhum cliente cadastrado"}
              </Heading>
              <Text color="gray.500" fontSize="sm">
                {searchTerm
                  ? "Tente ajustar os termos da pesquisa"
                  : "Comece cadastrando seu primeiro cliente"}
              </Text>
            </Box>
          </Flex>
        ) : (
          <>
            {/* Header da Tabela - Desktop */}
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
                <Box flex="1.5">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    Contato
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    CPF
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    Data Nasc.
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    Cadastrado
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" color="gray.700" fontSize="sm">
                    Ações
                  </Text>
                </Box>
              </Flex>
            </Box>

            {/* Lista de Clientes */}
            <Stack gap={0}>
              {clientesFiltrados.map((cliente) => (
                <Box key={cliente.cpf}>
                  {/* Layout Desktop */}
                  <Box
                    p={4}
                    borderBottom="1px"
                    borderColor="gray.100"
                    _hover={{ bg: "gray.50" }}
                    transition="all 0.2s"
                    display={{ base: "none", lg: "block" }}
                  >
                    <Flex align="center" gap={4}>
                      {/* Cliente */}
                      <Box flex="2">
                        <Flex align="center" gap={3}>
                          <CustomAvatar name={cliente.nome} />
                          <Box>
                            <Text fontWeight="medium" color="gray.800">
                              {getShortName(cliente.nome)}
                            </Text>
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              truncate
                              maxW="200px"
                            >
                              {cliente.email}
                            </Text>
                          </Box>
                        </Flex>
                      </Box>

                      {/* Contato */}
                      <Box flex="1.5">
                        <Text fontSize="sm" color="gray.800">
                          {formatCelular(cliente.celular)}
                        </Text>
                      </Box>

                      {/* CPF */}
                      <Box flex="1">
                        <Text fontSize="sm" color="gray.800" fontFamily="mono">
                          {formatCPF(cliente.cpf)}
                        </Text>
                      </Box>

                      {/* Data Nascimento */}
                      <Box flex="1">
                        <Text fontSize="sm" color="gray.800">
                          {cliente.dataNascimento
                            ? new Date(
                                cliente.dataNascimento
                              ).toLocaleDateString("pt-BR")
                            : "N/A"}
                        </Text>
                      </Box>

                      {/* Cadastrado */}
                      <Box flex="1">
                        <Text fontSize="sm" color="gray.800">
                          {formatDate(cliente.criadoEm)}
                        </Text>
                      </Box>

                      {/* Ações */}
                      <Box flex="1">
                        <Flex gap={2}>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleViewDetails(cliente)}
                          >
                            <FiEye size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleEdit(cliente)}
                          >
                            <FiEdit size={14} />
                          </Button>
                          <Box>
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
                                      <Dialog.Title>Excluir Cliente</Dialog.Title>
                                    </Dialog.Header>
                                    <Dialog.Body>
                                      <Text>
                                        Tem certeza que deseja excluir o cliente{" "}
                                        <strong>{cliente.nome}</strong>?
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
                                        onClick={() => handleDelete(cliente)}
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
                    </Flex>
                  </Box>

                  {/* Layout Mobile */}
                  <Box
                    p={4}
                    borderBottom="1px"
                    borderColor="gray.100"
                    display={{ base: "block", lg: "none" }}
                  >
                    <Flex direction="column" gap={3}>
                      {/* Header do Card Mobile */}
                      <Flex align="center" justify="space-between">
                        <Flex align="center" gap={3}>
                          <CustomAvatar name={cliente.nome} />
                          <Box>
                            <Text fontWeight="medium" color="gray.800">
                              {getShortName(cliente.nome)}
                            </Text>
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              truncate
                              maxW="150px"
                            >
                              {cliente.email}
                            </Text>
                          </Box>
                        </Flex>

                        <Flex gap={1}>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleViewDetails(cliente)}
                          >
                            <FiEye size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleEdit(cliente)}
                          >
                            <FiEdit size={14} />
                          </Button>
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
                                    <Dialog.Title>Excluir Cliente</Dialog.Title>
                                  </Dialog.Header>
                                  <Dialog.Body>
                                    <Text>
                                      Tem certeza que deseja excluir o cliente{" "}
                                      <strong>{cliente.nome}</strong>?
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
                                      onClick={() => handleDelete(cliente)}
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

                      {/* Informações do Card Mobile */}
                      <Stack gap={2} fontSize="sm">
                        <Flex justify="space-between">
                          <Text color="gray.500">Celular:</Text>
                          <Text color="gray.800">
                            {formatCelular(cliente.celular)}
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="gray.500">CPF:</Text>
                          <Text color="gray.800" fontFamily="mono">
                            {formatCPF(cliente.cpf)}
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="gray.500">Nascimento:</Text>
                          <Text color="gray.800">
                            {cliente.dataNascimento
                              ? new Date(
                                  cliente.dataNascimento
                                ).toLocaleDateString("pt-BR")
                              : "N/A"}
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="gray.500">Cadastrado:</Text>
                          <Text color="gray.800">
                            {formatDate(cliente.criadoEm)}
                          </Text>
                        </Flex>
                      </Stack>
                    </Flex>
                  </Box>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ListaClientes;

