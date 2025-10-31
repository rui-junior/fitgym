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
  Textarea,
} from "@chakra-ui/react";

import { Field } from "@chakra-ui/react/field";

import { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";

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
      alert(`${opts.type?.toUpperCase()}: ${opts.title}\n${opts.description}`);
    }
  },
};

function Toaster({
  toaster: _t,
  children,
}: {
  toaster?: typeof toaster;
  children?: any;
}) {
  return <>{children}</>;
}

interface ConfiguracoesData {
  nomeEstabelecimento: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  descricao: string;
}

export default function Configuracoes() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<ConfiguracoesData>({
    nomeEstabelecimento: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    descricao: "",
  });

  // Buscar configurações existentes
  const fetchConfiguracoes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/getconfiguracoes");
      const result = await response.json();

      if (result.success && result.data) {
        setFormData(result.data);
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!formData.nomeEstabelecimento) {
      toaster.create({
        title: "Campo obrigatório",
        description: "Por favor, informe o nome do estabelecimento.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    if (!formData.email) {
      toaster.create({
        title: "Campo obrigatório",
        description: "Por favor, informe o email.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/saveconfiguracoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toaster.create({
          title: "Configurações salvas!",
          description: "As configurações foram atualizadas com sucesso.",
          type: "success",
          duration: 5000,
        });
      } else {
        toaster.create({
          title: "Erro ao salvar",
          description:
            result.message || "Ocorreu um erro ao salvar as configurações.",
          type: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toaster.create({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof ConfiguracoesData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <Toaster toaster={toaster}>{() => null}</Toaster>
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
              Configurações do Estabelecimento
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Gerencie as informações da sua academia
            </Text>
          </Box>
        </Flex>

        <Flex w={"100%"} h={"100%"} justify={"center"} align={"flex-start"}>
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            w="100%"
            maxW="900px"
            p={{ base: 4, md: 8 }}
          >
            {isLoading ? (
              <Flex justify="center" align="center" py={12}>
                <Flex direction="column" align="center" gap={4}>
                  <Spinner size="lg" color="blue.500" />
                  <Text color="gray.600">Carregando configurações...</Text>
                </Flex>
              </Flex>
            ) : (
              <form onSubmit={handleSubmit}>
                <Stack gap={6}>
                  {/* Seção: Informações Básicas */}
                  <Box>
                    <Flex align="center" gap={2} mb={4}>
                      {/* <FiBuilding size={20} color="#3182ce" /> */}
                      <Heading size="md" color="gray.700">
                        Informações Básicas
                      </Heading>
                    </Flex>

                    <Stack gap={4}>
                      <Field.Root required>
                        <Field.Label>Nome do Estabelecimento</Field.Label>
                        <Input
                          type="text"
                          value={formData.nomeEstabelecimento}
                          onChange={(e) =>
                            handleInputChange(
                              "nomeEstabelecimento",
                              e.target.value
                            )
                          }
                          size="lg"
                          placeholder="Ex: FitGym Academia"
                          bg="white"
                          borderColor="gray.300"
                          _hover={{ borderColor: "gray.400" }}
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px #3182ce",
                          }}
                        />
                      </Field.Root>

                      <Flex gap={4} direction={{ base: "column", md: "row" }}>
                        <Field.Root flex="1">
                          <Field.Label>CNPJ</Field.Label>
                          <Input
                            type="text"
                            value={formData.cnpj}
                            onChange={(e) =>
                              handleInputChange("cnpj", e.target.value)
                            }
                            size="lg"
                            placeholder="00.000.000/0000-00"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px #3182ce",
                            }}
                          />
                        </Field.Root>

                        <Field.Root flex="1" required>
                          <Field.Label>Email</Field.Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            size="lg"
                            placeholder="contato@fitgym.com"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px #3182ce",
                            }}
                          />
                        </Field.Root>

                        <Field.Root flex="1">
                          <Field.Label>Telefone</Field.Label>
                          <Input
                            type="tel"
                            value={formData.telefone}
                            onChange={(e) =>
                              handleInputChange("telefone", e.target.value)
                            }
                            size="lg"
                            placeholder="(00) 00000-0000"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px #3182ce",
                            }}
                          />
                        </Field.Root>
                      </Flex>
                    </Stack>
                  </Box>

                  {/* Seção: Endereço */}
                  <Box pt={4} borderTop="1px" borderColor="gray.200">
                    <Heading size="md" color="gray.700" mb={4}>
                      Endereço
                    </Heading>

                    <Stack gap={4}>
                      <Field.Root>
                        <Field.Label>Endereço Completo</Field.Label>
                        <Input
                          type="text"
                          value={formData.endereco}
                          onChange={(e) =>
                            handleInputChange("endereco", e.target.value)
                          }
                          size="lg"
                          placeholder="Rua, número, complemento"
                          bg="white"
                          borderColor="gray.300"
                          _hover={{ borderColor: "gray.400" }}
                          _focus={{
                            borderColor: "blue.500",
                            boxShadow: "0 0 0 1px #3182ce",
                          }}
                        />
                      </Field.Root>

                      <Flex gap={4} direction={{ base: "column", md: "row" }}>
                        <Field.Root flex="2">
                          <Field.Label>Cidade</Field.Label>
                          <Input
                            type="text"
                            value={formData.cidade}
                            onChange={(e) =>
                              handleInputChange("cidade", e.target.value)
                            }
                            size="lg"
                            placeholder="São Paulo"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px #3182ce",
                            }}
                          />
                        </Field.Root>

                        <Field.Root flex="1">
                          <Field.Label>Estado</Field.Label>
                          <Input
                            type="text"
                            value={formData.estado}
                            onChange={(e) =>
                              handleInputChange("estado", e.target.value)
                            }
                            size="lg"
                            placeholder="SP"
                            maxLength={2}
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px #3182ce",
                            }}
                          />
                        </Field.Root>

                        <Field.Root flex="1">
                          <Field.Label>CEP</Field.Label>
                          <Input
                            type="text"
                            value={formData.cep}
                            onChange={(e) =>
                              handleInputChange("cep", e.target.value)
                            }
                            size="lg"
                            placeholder="00000-000"
                            bg="white"
                            borderColor="gray.300"
                            _hover={{ borderColor: "gray.400" }}
                            _focus={{
                              borderColor: "blue.500",
                              boxShadow: "0 0 0 1px #3182ce",
                            }}
                          />
                        </Field.Root>
                      </Flex>
                    </Stack>
                  </Box>

                  {/* Seção: Descrição */}
                  <Box pt={4} borderTop="1px" borderColor="gray.200">
                    <Heading size="md" color="gray.700" mb={4}>
                      Sobre o Estabelecimento
                    </Heading>

                    <Field.Root>
                      <Field.Label>Descrição</Field.Label>
                      <Textarea
                        value={formData.descricao}
                        onChange={(e) =>
                          handleInputChange("descricao", e.target.value)
                        }
                        size="lg"
                        placeholder="Descreva brevemente sua academia..."
                        rows={4}
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px #3182ce",
                        }}
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Esta descrição pode ser usada em relatórios e documentos
                      </Text>
                    </Field.Root>
                  </Box>

                  {/* Botão Salvar */}
                  <Flex justify="flex-end" pt={4}>
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      loading={isSaving}
                      loadingText="Salvando..."
                      minW="200px"
                    >
                      <Flex align="center" gap={2}>
                        <FiSave size={20} />
                        Salvar Configurações
                      </Flex>
                    </Button>
                  </Flex>
                </Stack>
              </form>
            )}
          </Box>
        </Flex>
      </Box>
    </>
  );
}
