import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Input,
  Grid,
  GridItem,
  NativeSelect,
  Dialog,
  Portal,
  CloseButton,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiCreditCard,
  FiSave,
  FiX,
  FiDollarSign,
} from "react-icons/fi";

interface FormData {
  atualizadoEm: string;
  cpf: string;
  criadoEm: string;
  dataVencimento: string;
  mesAno: string;
  nome: string;
  periodoPlano: number;
  plano: string;
  valorPlano: number;
  dataPagamento?: string;
}

interface FormErrors {
  plano?: string;
  dataPagamento?: string;
}

interface EditarFinancaProps {
  financa: FormData;
  onBack: () => void;
}

interface PlanoProps {
  id: string;
  nome: string;
  periodo: number;
  valor: number;
}

const EditarFinanca = ({ financa, onBack }: EditarFinancaProps) => {
  const [formData, setFormData] = useState<FormData>({
    atualizadoEm: financa.atualizadoEm || "",
    cpf: financa.cpf || "",
    criadoEm: financa.criadoEm || "",
    dataVencimento: financa.dataVencimento || "",
    mesAno: financa.mesAno || "",
    nome: financa.nome || "",
    periodoPlano: financa.periodoPlano || 0,
    plano: financa.plano || "",
    valorPlano: financa.valorPlano || 0,
    dataPagamento: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [planos, setPlanos] = useState<PlanoProps[]>([]);
  const vencido = isVencido(financa.dataVencimento);
  const dataFormatada = formatarData(financa.dataVencimento);

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

  useEffect(() => {
    if (financa) {
      setFormData({
        atualizadoEm: financa.atualizadoEm || "",
        cpf: financa.cpf || "",
        criadoEm: financa.criadoEm || "",
        dataVencimento: financa.dataVencimento || "",
        mesAno: financa.mesAno || "",
        nome: financa.nome || "",
        periodoPlano: financa.periodoPlano || 0,
        plano: financa.plano || "",
        valorPlano: financa.valorPlano || 0,
        dataPagamento: "",
      });
    }
  }, [financa]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    const newErrors: FormErrors = {};

    if (!formData.plano) {
      newErrors.plano = "Selecione um plano.";
    }

    if (!formData.dataPagamento) {
      newErrors.dataPagamento = "A data de pagamento é obrigatória.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // Buscar informações do plano selecionado
      const planoSelecionado = planos.find((p) => p.id === formData.plano);

      if (!planoSelecionado) {
        alert("Plano selecionado não encontrado.");
        setIsLoading(false);
        return;
      }

      // Calcular nova data de vencimento baseada na data de pagamento
      const dataPagamento = new Date(formData.dataPagamento || "");
      const novaDataVencimento = new Date(dataPagamento);
      novaDataVencimento.setMonth(
        novaDataVencimento.getMonth() + planoSelecionado.periodo
      );

      // Monta o payload com os dados atualizados
      const payload = {
        cpf: formData.cpf,
        mesAno: formData.mesAno,
        plano: planoSelecionado.nome,
        valorPlano: planoSelecionado.valor,
        periodoPlano: planoSelecionado.periodo,
        dataPagamento: formData.dataPagamento,
        dataVencimento: novaDataVencimento.toISOString().split("T")[0],
      };

      // Chamada para a API de edição de finanças
      const response = await fetch("/api/editfinanca", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error(
          "[EditarFinanca] Erro ao atualizar finança:",
          result.message
        );
        alert(result.message || "Erro ao atualizar finança.");
        setIsLoading(false);
        return;
      }

      alert("Pagamento registrado com sucesso!");
      onBack();
    } catch (error) {
      console.error("[EditarFinanca] Erro de rede ou servidor:", error);
      alert(
        "Ocorreu um erro ao tentar atualizar a finança. Tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Resetar formulário para valores originais
    setFormData({
      atualizadoEm: financa.atualizadoEm || "",
      cpf: financa.cpf || "",
      criadoEm: financa.criadoEm || "",
      dataVencimento: financa.dataVencimento || "",
      mesAno: financa.mesAno || "",
      nome: financa.nome || "",
      periodoPlano: financa.periodoPlano || 0,
      plano: financa.plano || "",
      valorPlano: financa.valorPlano || 0,
      dataPagamento: "",
    });
    setErrors({});
    onBack();
  };

  return (
    <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
      {/* Header */}
      <Flex align="center" gap={4} mb={6}>
        <Button
          variant="ghost"
          colorScheme="gray"
          onClick={() => {
            onBack();
          }}
          size="lg"
        >
          <Flex align="center" gap={2}>
            <FiArrowLeft size={20} />
            Voltar
          </Flex>
        </Button>

        <Box>
          <Heading size="lg" color="gray.800">
            Lançar Pagamento
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Altere as informações de pagamento de {financa.nome}
          </Text>
        </Box>
      </Flex>

      {/* Formulário */}
      <Flex justify="center">
        <Box
          as="form"
          onSubmit={handleSubmit}
          bg="white"
          borderRadius="xl"
          shadow="sm"
          border="1px"
          borderColor="gray.200"
          p={8}
          w="100%"
          maxW="800px"
        >
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            {/* Nome Completo */}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <Box>
                <Text color="gray.700" fontWeight="medium" mb={2}>
                  <Flex align="center" gap={2}>
                    <FiUser size={16} />
                    Nome Completo
                  </Flex>
                </Text>
                <Input
                  type="text"
                  value={formData.nome}
                  disabled
                  placeholder="Digite o nome completo"
                  size="lg"
                  bg="gray.100"
                  border="1px"
                  borderColor="gray.200"
                  color="gray.500"
                  cursor="not-allowed"
                />
              </Box>
            </GridItem>

            {/* CPF (não editável) */}
            <GridItem>
              <Box>
                <Text color="gray.700" fontWeight="medium" mb={2}>
                  <Flex align="center" gap={2}>
                    <FiCreditCard size={16} />
                    CPF
                  </Flex>
                </Text>
                <Input
                  type="text"
                  value={formData.cpf.replace(
                    /(\d{3})(\d{3})(\d{3})(\d{2})/,
                    "$1.$2.$3-$4"
                  )}
                  disabled
                  size="lg"
                  bg="gray.100"
                  border="1px"
                  borderColor="gray.200"
                  color="gray.500"
                  cursor="not-allowed"
                />
              </Box>
            </GridItem>

            {/* Plano */}
            <GridItem>
              <Box>
                <Text color="gray.700" fontWeight="medium" mb={2}>
                  <Flex align="center" gap={2}>
                    <FiCreditCard size={16} />
                    Plano
                  </Flex>
                </Text>
                <NativeSelect.Root size="lg" width="100%">
                  <NativeSelect.Field
                    value={formData.plano}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        plano: e.target.value,
                      }));
                    }}
                    bg="gray.50"
                    border="1px"
                    borderColor={errors.plano ? "red.300" : "gray.200"}
                    _hover={{
                      borderColor: errors.plano ? "red.400" : "gray.300",
                    }}
                    _focus={{
                      borderColor: errors.plano ? "red.500" : "blue.500",
                      bg: "white",
                    }}
                  >
                    <option value="">Selecione um plano</option>
                    {planos.map((plano: PlanoProps) => (
                      <option key={plano.id} value={plano.id}>
                        {plano.nome} - R$ {plano.valor.toFixed(2)} ({plano.periodo}{" "}
                        {plano.periodo === 1 ? "mês" : "meses"})
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>

                {errors.plano && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.plano}
                  </Text>
                )}
              </Box>
            </GridItem>

            {/* Data de Vencimento */}
            <GridItem>
              <Box>
                <Text color="gray.700" fontWeight="medium" mb={2}>
                  <Flex align="center" gap={2}>
                    <FiCalendar size={16} />
                    Data de Vencimento Atual
                  </Flex>
                </Text>
                <Text
                  fontWeight="medium"
                  color={vencido ? "red.500" : "gray.700"}
                  fontSize="lg"
                  mt={3}
                >
                  {dataFormatada}
                </Text>
              </Box>
            </GridItem>

            {/* Registrar Pagamento */}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <Box>
                <Text color="gray.700" fontWeight="medium" mb={2}>
                  <Flex align="center" gap={2}>
                    <FiDollarSign size={16} />
                    Registrar Pagamento
                  </Flex>
                </Text>
                <Text color="gray.500" fontSize="sm" mb={2}>
                  Informe a data em que o pagamento foi realizado.
                </Text>

                <Input
                  type="date"
                  value={formData.dataPagamento}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dataPagamento: e.target.value,
                    }))
                  }
                  size="lg"
                  bg="gray.50"
                  border="1px"
                  borderColor={errors.dataPagamento ? "red.300" : "gray.200"}
                  _hover={{
                    borderColor: errors.dataPagamento ? "red.400" : "gray.300",
                  }}
                  _focus={{
                    borderColor: errors.dataPagamento ? "red.500" : "blue.500",
                    bg: "white",
                  }}
                  max={new Date().toISOString().split("T")[0]}
                />

                {errors.dataPagamento && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.dataPagamento}
                  </Text>
                )}
              </Box>
            </GridItem>

            {/* Botões */}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <Flex gap={4} justify="flex-end" mt={6}>
                <Button
                  variant="outline"
                  colorScheme="gray"
                  size="lg"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <Flex align="center" gap={2}>
                    <FiX size={16} />
                    Cancelar
                  </Flex>
                </Button>

                {/* Dialog de Confirmação */}
                <Dialog.Root role="alertdialog">
                  <Dialog.Trigger asChild>
                    <Button colorScheme="blue" size="lg" disabled={isLoading}>
                      <Flex align="center" gap={2}>
                        <FiSave size={16} />
                        {isLoading ? "Salvando..." : "Salvar Alterações"}
                      </Flex>
                    </Button>
                  </Dialog.Trigger>

                  <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                      <Dialog.Content>
                        <Dialog.Header>
                          <Dialog.Title>Confirmar Alterações</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                          <Text>
                            Tem certeza que deseja salvar as alterações feitas
                            para <strong>{financa.nome}</strong>?
                          </Text>
                        </Dialog.Body>

                        <Dialog.Footer>
                          <Dialog.ActionTrigger asChild>
                            <Button variant="outline">Cancelar</Button>
                          </Dialog.ActionTrigger>

                          <Button
                            colorPalette="blue"
                            onClick={async () => {
                              await handleSubmit(new Event("submit") as any);
                            }}
                          >
                            Confirmar
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
            </GridItem>
          </Grid>
        </Box>
      </Flex>
    </Box>
  );
};

export default EditarFinanca;

