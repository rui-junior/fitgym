import { useState } from "react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { destroyCookie } from "nookies";
import { firebaseAdmin } from "../../firebase/firebaseAdmin"; // Ajuste o caminho se necessário

import {
  Flex,
  Box,
  Text,
  Button,
  Stack,
  Avatar,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import {
  FiMenu,
  FiHome,
  FiCalendar,
  FiDollarSign,
  FiActivity,
  FiHeart,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

import Avaliacoes from "./client/Avaliacoes";

const MeuPlanoComponent = () => (
  <Box p={6}>
    <Heading size="md">Detalhes do Seu Plano</Heading>
    <Text mt={2}>Aqui o cliente verá informações sobre o plano atual, data de vencimento, etc.</Text>
  </Box>
);
const TreinosComponent = () => (
  <Box p={6}>
    <Heading size="md">Seus Treinos</Heading>
    <Text mt={2}>Lista de treinos, treinos do dia, etc.</Text>
  </Box>
);
// const AvaliacoesComponent = () => (
//   <Box p={6}>
//     <Heading size="md">Suas Avaliações Físicas</Heading>
//     <Text mt={2}>Histórico de avaliações, gráficos de progresso, etc.</Text>
//   </Box>
// );
const PagamentosComponent = () => (
  <Box p={6}>
    <Heading size="md">Seu Histórico de Pagamentos</Heading>
    <Text mt={2}>Faturas, status de pagamento, etc.</Text>
  </Box>
);

// --- PÁGINA PRINCIPAL DO DASHBOARD DO CLIENTE ---

export default function ClientDashboard() {
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const [currentComponent, setCurrentComponent] = useState(<MeuPlanoComponent />);
  const [activeItem, setActiveItem] = useState("Meu Plano");
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuExpanded(!isMenuExpanded);
  };

  const handleLogout = () => {
    // Deleta o cookie "token"
    destroyCookie(null, "token", { path: "/" });
    // Redireciona para a raiz do projeto
    router.push("/");
  };

  // Itens de menu para o cliente
  const menuItems = [
    { icon: FiUser, label: "Meu Plano", link: MeuPlanoComponent },
    { icon: FiActivity, label: "Treinos", link: TreinosComponent },
    { icon: FiHeart, label: "Avaliações", link: Avaliacoes },
    { icon: FiDollarSign, label: "Pagamentos", link: PagamentosComponent },
  ];

  const handleMenuClick = (
    ComponentToRender: React.ComponentType,
    label: string
  ) => {
    setCurrentComponent(<ComponentToRender />);
    setActiveItem(label);
  };

  return (
    <Flex w="100vw" h="100vh" overflow="hidden">
      {/* SIDEBAR */}
      <Flex
        w={isMenuExpanded ? "280px" : "80px"}
        minW={isMenuExpanded ? "280px" : "80px"}
        h="100vh"
        direction="column"
        bg="gray.800"
        transition="min-width 0.3s ease"
        borderRight="1px"
        borderColor="gray.700"
        flexShrink={0}
      >
        {/* Header do Menu */}
        <Flex
          p={4}
          align="center"
          justify={isMenuExpanded ? "space-between" : "center"}
          borderBottom="1px"
          borderColor="gray.700"
          minH="70px"
          flexShrink={0}
        >
          {isMenuExpanded && (
            <Flex align="center" gap={3}>
              <Box
                w={10}
                h={10}
                bg="blue.500"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <FiActivity size={24} color="white" />
              </Box>
              <Box>
                <Text color="white" fontWeight="bold" fontSize="lg">
                  FitGym
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Área do Cliente
                </Text>
              </Box>
            </Flex>
          )}
          <Button
            onClick={toggleMenu}
            variant="ghost"
            size="sm"
            color="gray.400"
            _hover={{ color: "white", bg: "gray.700" }}
            p={2}
          >
            <FiMenu size={20} />
          </Button>
        </Flex>

        {/* Itens de Navegação */}
        <Flex direction="column" p={4} flex={1} overflow="auto">
          <Stack gap={2}>
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant={activeItem === item.label ? "solid" : "ghost"}
                bg={activeItem === item.label ? "blue.500" : "transparent"}
                color={activeItem === item.label ? "white" : "gray.400"}
                _hover={{
                  bg: activeItem === item.label ? "blue.600" : "gray.700",
                  color: "white",
                }}
                justifyContent={isMenuExpanded ? "flex-start" : "center"}
                w="full"
                h={12}
                px={isMenuExpanded ? 4 : 2}
                onClick={() => handleMenuClick(item.link, item.label)}
              >
                <Flex align="center" gap={3}>
                  <item.icon size={20} />
                  {isMenuExpanded && item.label}
                </Flex>
              </Button>
            ))}
          </Stack>
        </Flex>

        {/* Perfil do Usuário */}
        <Box p={4} borderTop="1px" borderColor="gray.700" flexShrink={0}>
          <Flex
            bg={isMenuExpanded ? "gray.700" : "transparent"}
            p={isMenuExpanded ? 3 : 0}
            borderRadius="lg"
            align="center"
            justify={isMenuExpanded ? "space-between" : "center"}
            gap={3}
          >
            {/* <Avatar name="Rui Junior" src="URL_DO_AVATAR_AQUI" size="sm" /> */}
            {isMenuExpanded && (
              <Box flex={1}>
                <Text color="white" fontSize="sm" fontWeight="medium">
                  Rui Junior
                </Text>
                <Text color="gray.400" fontSize="xs">
                  Cliente
                </Text>
              </Box>
            )}
            <IconButton
              aria-label="Logout"
              // icon={<FiLogOut size={18} />}
              size="sm"
              variant="ghost"
              color="gray.400"
              _hover={{ color: "white", bg: "gray.600" }}
              onClick={handleLogout}
            >
              <FiLogOut size={18} />
            </IconButton>

          </Flex>
        </Box>
      </Flex>



      {/* ÁREA DE CONTEÚDO */}
      <Flex
        flex={1}
        h="100vh"
        direction="column"
        bg="gray.50"
        overflow="hidden"
      >
        {/* Header do Conteúdo */}
        <Flex
          bg="white"
          px={6}
          py={4}
          borderBottom="1px"
          borderColor="gray.200"
          align="center"
          justify="space-between"
          minH="70px"
          flexShrink={0}
        >
          <Box>
            <Heading size="lg" color="gray.800">
              {activeItem}
            </Heading>
            <Text color="gray.600" fontSize="sm">
              {`Visualize os detalhes de ${activeItem.toLowerCase()}`}
            </Text>
          </Box>
          <Flex align="center" gap={4}>
            <Text fontSize="sm" color="gray.600">
              Hoje, 29 Set 2025
            </Text>
          </Flex>
        </Flex>

        {/* Conteúdo Dinâmico */}
        <Box flex={1} overflow="auto" bg="gray.50">
          {currentComponent}
        </Box>
      </Flex>
    </Flex>
  );
}

// --- VALIDAÇÃO NO SERVIDOR (getServerSideProps) ---

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const token = context.req.cookies.token;

  if (!token) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

    // Se o usuário tiver a claim 'admin', ele não deveria estar aqui.
    // Redireciona para o dashboard de admin.
    if (decodedToken.admin === true) {
      return {
        redirect: {
          permanent: false,
          destination: "/dashboard/admin",
        },
      };
    }

    // Se o token for válido e o usuário NÃO for admin, permite o acesso.
    return {
      props: {}, // Retorne props com dados do usuário se necessário
    };
  } catch (error) {
    console.error("Erro de verificação de token:", error);
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };
  }
}

