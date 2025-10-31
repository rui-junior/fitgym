import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  IconButton,
  createToaster,
  Toaster,
  Field,
} from "@chakra-ui/react";

import { useState } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";

interface AddDespesaProps {
  onBack: () => void;
}

const toaster = createToaster({
  placement: "top-end",
  pauseOnPageIdle: true,
});

export default function AddDespesa({ onBack }: AddDespesaProps) {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [categoria, setCategoria] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!descricao.trim()) {
      toaster.create({
        title: "Erro de validação",
        description: "Descrição (tipo de despesa) é obrigatória.",
        type: "error",
        duration: 3000,
      });
      return;
    }

    if (!valor || isNaN(parseFloat(valor))) {
      toaster.create({
        title: "Erro de validação",
        description: "Valor deve ser um número válido.",
        type: "error",
        duration: 3000,
      });
      return;
    }

    if (!dataVencimento) {
      toaster.create({
        title: "Erro de validação",
        description: "Data de vencimento é obrigatória.",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/adddespesa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descricao: descricao.trim(),
          valor: parseFloat(valor),
          dataVencimento: dataVencimento,
          categoria: categoria.trim() || "Geral",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toaster.create({
          title: "Despesa adicionada",
          description: "A despesa foi cadastrada com sucesso.",
          type: "success",
          duration: 3000,
        });

        // Limpar formulário
        setDescricao("");
        setValor("");
        setDataVencimento("");
        setCategoria("");

        // Voltar para a lista após 1 segundo
        setTimeout(() => {
          onBack();
        }, 1000);
      } else {
        toaster.create({
          title: "Erro ao adicionar",
          description: result.message || "Ocorreu um erro ao adicionar a despesa.",
          type: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
      toaster.create({
        title: "Erro ao adicionar",
        description: "Ocorreu um erro ao adicionar a despesa.",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* <Toaster toaster={toaster} /> */}

      <Box w="100%" minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
        <Box maxW="800px" mx="auto">
          {/* Header */}
          <Flex align="center" gap={3} mb={6}>
            <IconButton
              aria-label="Voltar"
              onClick={onBack}
              variant="ghost"
              size="lg"
              disabled={isLoading}
            >
              <FiArrowLeft />
            </IconButton>
            <Box>
              <Heading size="lg" color="gray.800">
                Nova Despesa
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Cadastre uma nova despesa no sistema
              </Text>
            </Box>
          </Flex>

          {/* Formulário */}
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            p={{ base: 6, md: 8 }}
          >
            <form onSubmit={handleSubmit}>
              <Stack gap={6}>
                {/* Descrição/Tipo de Despesa */}
                <Field.Root>
                  <Field.Label
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                  >
                    Tipo de Despesa *
                  </Field.Label>
                  <Input
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Aluguel, Energia, Internet, etc."
                    size="lg"
                    disabled={isLoading}
                  />
                  <Field.HelperText fontSize="xs" color="gray.500">
                    Informe o tipo ou descrição da despesa
                  </Field.HelperText>
                </Field.Root>

                {/* Categoria */}
                <Field.Root>
                  <Field.Label
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                  >
                    Categoria
                  </Field.Label>
                  <Input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Ex: Operacional, Pessoal, Marketing, etc."
                    size="lg"
                    disabled={isLoading}
                  />
                  <Field.HelperText fontSize="xs" color="gray.500">
                    Opcional - Categoria para organização (padrão: Geral)
                  </Field.HelperText>
                </Field.Root>

                {/* Valor */}
                <Field.Root>
                  <Field.Label
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                  >
                    Valor *
                  </Field.Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="0.00"
                    size="lg"
                    disabled={isLoading}
                  />
                  <Field.HelperText fontSize="xs" color="gray.500">
                    Valor da despesa em reais (R$)
                  </Field.HelperText>
                </Field.Root>

                {/* Data de Vencimento */}
                <Field.Root>
                  <Field.Label
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.700"
                  >
                    Data de Vencimento *
                  </Field.Label>
                  <Input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    size="lg"
                    disabled={isLoading}
                  />
                  <Field.HelperText fontSize="xs" color="gray.500">
                    Data em que a despesa vence
                  </Field.HelperText>
                </Field.Root>

                {/* Botões */}
                <Flex gap={4} justify="flex-end" mt={4}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onBack}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="red"
                    size="lg"
                    // isLoading={isLoading}
                    loadingText="Salvando..."
                  >
                    <Flex align="center" gap={2}>
                      <FiSave />
                      Salvar Despesa
                    </Flex>
                  </Button>
                </Flex>
              </Stack>
            </form>
          </Box>

          {/* Informações adicionais */}
          <Box
            mt={6}
            p={4}
            bg="blue.50"
            borderRadius="lg"
            border="1px"
            borderColor="blue.200"
          >
            <Text fontSize="sm" color="blue.800" fontWeight="medium" mb={2}>
              💡 Dica
            </Text>
            <Text fontSize="xs" color="blue.700">
              A despesa será organizada automaticamente no mês/ano de vencimento.
              Você poderá lançar o pagamento posteriormente quando a despesa for
              quitada.
            </Text>
          </Box>
        </Box>
      </Box>
    </>
  );
}
