import { Box, Button, Flex, Heading, Text, Grid, SimpleGrid } from "@chakra-ui/react";
import { useState } from "react";
import Receita from "./content/Receita";
import Despesa from "./content/Despesa";
import Balanco from "./content/Balanco";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiArrowRight,
  FiBarChart2,
} from "react-icons/fi";

type ViewType = "home" | "receita" | "despesa" | "balanco";

export default function Financas() {
  const [currentView, setCurrentView] = useState<ViewType>("home");

  const handleNavigateToReceita = () => {
    setCurrentView("receita");
  };

  const handleNavigateToDespesa = () => {
    setCurrentView("despesa");
  };

  const handleNavigateToBalanco = () => {
    setCurrentView("balanco");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
  };

  // Se estiver na view de Receita, renderizar o componente Receita
  if (currentView === "receita") {
    return <Receita onBack={handleBackToHome} />;
  }

  // Se estiver na view de Despesa, renderizar o componente Despesa
  if (currentView === "despesa") {
    return <Despesa onBack={handleBackToHome} />;
  }

  // Se estiver na view de Balanço, renderizar o componente Balanco
  if (currentView === "balanco") {
    return <Balanco onBack={handleBackToHome} />;
  }

  // View Home - Página inicial com botões de navegação
  return (
    <Box w="100%" minH="100vh" bg="gray.50" p={{ base: 4, md: 8 }}>
      <Flex direction="column" align="center" justify="center" minH="80vh">
        <Box textAlign="center" mb={12}>
          <Flex justify="center" mb={4}>
            <Box
              bg="blue.500"
              p={4}
              borderRadius="full"
              color="white"
              boxShadow="lg"
            >
              <FiDollarSign size={48} />
            </Box>
          </Flex>
          <Heading size="2xl" color="gray.800" mb={3}>
            Gerenciamento Financeiro
          </Heading>
          <Text color="gray.600" fontSize="lg" maxW="600px" mx="auto">
            Controle completo das suas receitas e despesas em um só lugar.
            Escolha uma opção abaixo para começar.
          </Text>
        </Box>

        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          gap={6}
          w="100%"
          maxW="1200px"
        >
          {/* Card Receitas */}
          <Box
            bg="white"
            borderRadius="2xl"
            shadow="xl"
            border="1px"
            borderColor="gray.200"
            p={8}
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-8px)",
              shadow: "2xl",
              borderColor: "green.300",
            }}
            cursor="pointer"
            onClick={handleNavigateToReceita}
          >
            <Flex direction="column" align="center" textAlign="center" gap={4}>
              <Box
                bg="green.100"
                p={4}
                borderRadius="full"
                color="green.600"
              >
                <FiTrendingUp size={40} />
              </Box>
              <Heading size="lg" color="gray.800">
                Receitas
              </Heading>
              <Text color="gray.600" fontSize="md">
                Gerencie suas cobranças, acompanhe pagamentos recebidos e
                controle o fluxo de entrada de recursos.
              </Text>
              <Button
                colorScheme="green"
                size="lg"
                w="full"
                mt={2}
              >
                Acessar Receitas
                <FiArrowRight />
              </Button>
            </Flex>
          </Box>

          {/* Card Despesas */}
          <Box
            bg="white"
            borderRadius="2xl"
            shadow="xl"
            border="1px"
            borderColor="gray.200"
            p={8}
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-8px)",
              shadow: "2xl",
              borderColor: "red.300",
            }}
            cursor="pointer"
            onClick={handleNavigateToDespesa}
          >
            <Flex direction="column" align="center" textAlign="center" gap={4}>
              <Box
                bg="red.100"
                p={4}
                borderRadius="full"
                color="red.600"
              >
                <FiTrendingDown size={40} />
              </Box>
              <Heading size="lg" color="gray.800">
                Despesas
              </Heading>
              <Text color="gray.600" fontSize="md">
                Controle suas contas a pagar, registre pagamentos e mantenha
                suas despesas organizadas.
              </Text>
              <Button
                colorScheme="red"
                size="lg"
                w="full"
                mt={2}
              >
                Acessar Despesas
                <FiArrowRight />
              </Button>
            </Flex>
          </Box>

          {/* Card Balanço */}
          <Box
            bg="white"
            borderRadius="2xl"
            shadow="xl"
            border="1px"
            borderColor="gray.200"
            p={8}
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-8px)",
              shadow: "2xl",
              borderColor: "blue.300",
            }}
            cursor="pointer"
            onClick={handleNavigateToBalanco}
          >
            <Flex direction="column" align="center" textAlign="center" gap={4}>
              <Box
                bg="blue.100"
                p={4}
                borderRadius="full"
                color="blue.600"
              >
                <FiBarChart2 size={40} />
              </Box>
              <Heading size="lg" color="gray.800">
                Balanço
              </Heading>
              <Text color="gray.600" fontSize="md">
                Visualize o resumo financeiro mensal com receitas, despesas e
                saldo. Exporte relatórios em CSV.
              </Text>
              <Button
                colorScheme="blue"
                size="lg"
                w="full"
                mt={2}
              >
                Acessar Balanço
                <FiArrowRight />
              </Button>
            </Flex>
          </Box>
        </SimpleGrid>
      </Flex>
    </Box>
  );
}
