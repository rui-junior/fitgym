"use client";

import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  SimpleGrid,
  Text,
  Flex,
  Spinner,
  Dialog,
  Portal,
  CloseButton,
  Stack,
} from "@chakra-ui/react";

import { Field } from "@chakra-ui/react/field";
import { FiTrash2, FiPackage, FiUsers } from "react-icons/fi";
import { useEffect, useState } from "react";

interface Plano {
  id: number;
  nome: string;
  valor: number;
  periodo: number;
}

interface novoPlano {
  nome: string;
  valor: number;
  periodo: number;
}

export default function Planos() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [novoPlano, setNovoPlano] = useState<novoPlano>({
    nome: "",
    valor: 0,
    periodo: 0,
  });

  const fetchPlanos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/verifyplanos");
      const result = await response.json();

      if (result.success) {
        setPlanos(result.data);
      } else {
        console.error("Erro ao buscar planos:", result.message);
      }
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanos();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNovoPlano((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/addplano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoPlano),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message);
      fetchPlanos();
    } catch (error) {
      console.error("Erro ao cadastrar plano:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/deleteplano`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (response.ok && result.success) fetchPlanos();
    } catch (error) {
      console.error("Erro ao excluir plano:", error);
    }
  };

  const formatarValor = (valor: number): string =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

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
            Gerenciamento de Planos
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {planos.length} plano(s) cadastrado(s)
          </Text>
        </Box>

        {/* <Button colorScheme="blue" onClick={fetchPlanos} isLoading={isLoading}>
          Atualizar
        </Button> */}
      </Flex>

      {/* Formulário de Cadastro */}
      <Box
        p={6}
        shadow="sm"
        border="1px"
        borderColor="gray.200"
        borderRadius="xl"
        bg="white"
        mb={10}
      >
        <Heading as="h2" size="md" mb={4}>
          Cadastrar Novo Plano
        </Heading>
        <form onSubmit={handleSubmit}>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <Field.Root required>
              <Field.Label>Nome do Plano</Field.Label>
              <Input
                name="nome"
                placeholder="Ex: Plano Mensal"
                value={novoPlano.nome}
                onChange={handleInputChange}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>Valor (R$)</Field.Label>
              <Input
                name="valor"
                type="number"
                step="0.01"
                value={novoPlano.valor}
                onChange={handleInputChange}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>Período (dias)</Field.Label>
              <Input
                name="periodo"
                type="number"
                step="1"
                value={novoPlano.periodo}
                onChange={handleInputChange}
              />
            </Field.Root>
          </SimpleGrid>

          <Button mt={6} colorScheme="blue" type="submit">
            Cadastrar Plano
          </Button>
        </form>
      </Box>

      {/* Lista de Planos */}
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
              <Text color="gray.600">Carregando planos...</Text>
            </Flex>
          </Flex>
        ) : planos.length === 0 ? (
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
                Nenhum plano encontrado
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Comece cadastrando seu primeiro plano
              </Text>
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
                    Período
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
              {planos.map((plano) => (
                <Box key={plano.id}>
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
                        <Text fontWeight="medium" color="gray.800">
                          {plano.nome}
                        </Text>
                      </Box>
                      <Box flex="1">
                        <Text color="gray.800">
                          {formatarValor(plano.valor)}
                        </Text>
                      </Box>
                      <Box flex="1">
                        <Text color="gray.800">{plano.periodo} dias</Text>
                      </Box>
                      <Box flex="1">
                        <Dialog.Root role="alertdialog">
                          <Dialog.Trigger asChild>
                            <Button size="sm" variant="ghost" colorScheme="red">
                              <FiTrash2 size={14} />
                            </Button>
                          </Dialog.Trigger>
                          <Portal>
                            <Dialog.Backdrop />
                            <Dialog.Positioner>
                              <Dialog.Content>
                                <Dialog.Header>
                                  <Dialog.Title>Excluir Plano</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body>
                                  <Text>
                                    Tem certeza que deseja excluir o plano{" "}
                                    <strong>{plano.nome}</strong>?
                                  </Text>
                                </Dialog.Body>
                                <Dialog.Footer>
                                  <Dialog.ActionTrigger asChild>
                                    <Button variant="outline">Cancelar</Button>
                                  </Dialog.ActionTrigger>
                                  <Button
                                    colorPalette="red"
                                    onClick={() => handleDelete(plano.id)}
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
                        <Text fontWeight="medium" color="gray.800">
                          {plano.nome}
                        </Text>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(plano.id)}
                        >
                          <FiTrash2 size={14} />
                        </Button>
                      </Flex>
                      <Stack gap={2} fontSize="sm">
                        <Flex justify="space-between">
                          <Text color="gray.500">Valor:</Text>
                          <Text color="gray.800">
                            {formatarValor(plano.valor)}
                          </Text>
                        </Flex>
                        <Flex justify="space-between">
                          <Text color="gray.500">Período:</Text>
                          <Text color="gray.800">{plano.periodo} dias</Text>
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
}
