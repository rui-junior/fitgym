import { firebaseAdmin } from "../../../firebase/firebaseAdmin";
import { getDatabase, ref, onValue } from "firebase/database";
import { app, auth, database } from "../../../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { parseCookies, destroyCookie } from "nookies";
import { GetServerSidePropsContext } from "next";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiCreditCard,
  FiActivity,
  FiSettings,
  FiUser,
  FiEdit3,
  FiLogOut,
  FiShield
} from "react-icons/fi";
import { signOut } from "firebase/auth";

import DashboardComponent from "./components/Dashboard";
import Clientes from "./components/Clientes";
import Planos from "./components/Planos";
import Assinaturas from "./components/Assinaturas";
import Financas from "./components/Financas";
import Configuracoes from "./components/Configuracoes";
import Seguranca from "./components/Seguranca";

interface DecodedToken {
  email?: string;
  admin?: boolean;
  user_id?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const [currentComponent, setCurrentComponent] = useState(
    <DashboardComponent />
  );
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [userEmail, setUserEmail] = useState<string>("");

  // Decodificar token e obter email do usuário
  useEffect(() => {
    const decodeToken = () => {
      try {
        const cookies = parseCookies();
        const token = cookies.token;

        if (token) {
          // Decodificar o token JWT (parte do payload)
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );

          const decoded: DecodedToken = JSON.parse(jsonPayload);
          
          if (decoded.email) {
            setUserEmail(decoded.email);
          }
        }
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
      }
    };

    decodeToken();
  }, []);

  const toggleMenu = () => {
    setIsMenuExpanded(!isMenuExpanded);
  };

  const menuItems = [
    {
      icon: FiHome,
      label: "Dashboard",
      active: false,
      link: DashboardComponent,
    },
    { icon: FiUsers, label: "Clientes", active: false, link: Clientes },
    { icon: FiCreditCard, label: "Planos", active: false, link: Planos },
    { icon: FiEdit3, label: "Assinaturas", active: false, link: Assinaturas },
    { icon: FiDollarSign, label: "Finanças", active: false, link: Financas },
    { icon: FiShield, label: "Segurança", active: false, link: Seguranca }
  ];

  const handleMenuClick = (
    ComponentToRender: React.ComponentType,
    label: string
  ) => {
    setCurrentComponent(<ComponentToRender />);
    setActiveItem(label);
  };

  const handleConfiguracoesClick = () => {
    setCurrentComponent(<Configuracoes />);
    setActiveItem("Configurações");
  };

  const handleLogout = async () => {
    try {
      // Fazer logout do Firebase
      await signOut(auth);
      
      // Apagar cookie do token
      destroyCookie(null, "token", {
        path: "/",
      });

      // Recarregar a página (vai redirecionar para login via getServerSideProps)
      window.location.reload();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, apagar cookie e recarregar
      destroyCookie(null, "token", {
        path: "/",
      });
      window.location.reload();
    }
  };

  return (
    <Flex w="100vw" h="100vh" overflow="hidden">
      {/* SIDEBAR - 25% da tela */}
      <Flex
        w={isMenuExpanded ? "80px" : "80px"}
        minW={isMenuExpanded ? "280px" : "80px"}
        h="100vh"
        direction="column"
        bg="gray.800"
        transition="all 0.3s ease"
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
                  Admin Panel
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

        {/* Navigation Items */}
        <Flex
          direction="column"
          p={4}
          flex={1}
          overflow="auto"
        >
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

        {/* User Profile - Expanded */}
        {isMenuExpanded && (
          <Box
            p={4}
            borderTop="1px"
            borderColor="gray.700"
            flexShrink={0}
          >
            <Flex
              bg="gray.700"
              p={3}
              borderRadius="lg"
              align="center"
              gap={2}
            >
              <Box flex={1} overflow="hidden">
                <Text 
                  color="white" 
                  fontSize="sm" 
                  fontWeight="medium"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {userEmail || "Carregando..."}
                </Text>
                <Text 
                  color="red.400" 
                  fontSize="xs"
                  cursor="pointer"
                  _hover={{ color: "red.300", textDecoration: "underline" }}
                  onClick={handleLogout}
                >
                  Sair
                </Text>
              </Box>
              <IconButton
                aria-label="Configurações"
                size="sm"
                variant="ghost"
                color="gray.400"
                _hover={{ color: "white", bg: "gray.600" }}
                onClick={handleConfiguracoesClick}
              >
                <FiSettings size={18} />
              </IconButton>
            </Flex>
          </Box>
        )}

        {/* User Profile - Collapsed */}
        {!isMenuExpanded && (
          <Box
            p={4}
            borderTop="1px"
            borderColor="gray.700"
            flexShrink={0}
          >
            <Stack gap={2}>
              <Flex justify="center">
                <IconButton
                  aria-label="Configurações"
                  size="sm"
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: "white", bg: "gray.700" }}
                  onClick={handleConfiguracoesClick}
                >
                  <FiSettings size={20} />
                </IconButton>
              </Flex>
              <Flex justify="center">
                <IconButton
                  aria-label="Sair"
                  size="sm"
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: "red.400", bg: "gray.700" }}
                  onClick={handleLogout}
                >
                  <FiLogOut size={20} />
                </IconButton>
              </Flex>
            </Stack>
          </Box>
        )}
      </Flex>

      {/* ÁREA DE CONTEÚDO - 75% da tela */}
      <Flex
        flex={1}
        h="100vh"
        direction="column"
        bg="gray.50"
        overflow="hidden"
      >
        {/* Top Header */}
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
              {activeItem === "Dashboard" 
                ? "Visão geral da academia" 
                : activeItem === "Configurações"
                ? "Gerencie as informações do estabelecimento"
                : activeItem === "Segurança"
                ? "Gerencie a segurança da sua conta"
                : `Gerenciar ${activeItem.toLowerCase()}`
              }
            </Text>
          </Box>

          <Flex align="center" gap={4}>
            <Text fontSize="sm" color="gray.600">
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </Flex>
        </Flex>

        {/* Dashboard Content - Área com scroll */}
        <Box
          flex={1}
          overflow="auto"
          bg="gray.50"
        >
          {currentComponent}
        </Box>
      </Flex>
    </Flex>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // 1. Pega o token do cookie do request
  const token = context.req.cookies.token;

  // Se não houver token, redireciona para o login imediatamente
  if (!token) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };
  }

  try {
    // 2. Verifica o token usando o Firebase Admin SDK
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

    // 3. Verifica se o usuário tem o claim 'admin'
    // A verificação `!!decodedToken.admin` é mais segura do que apenas `decodedToken.admin`
    // pois garante que o valor seja explicitamente `true`.
    if (!decodedToken.admin === true) {
      // Se for admin, redireciona para o dashboard de admin
      return {
        redirect: {
          permanent: false,
          destination: "/dashboard",
        },
      };
    }

    // 4. Se o token for válido e o usuário NÃO for admin, permite o acesso à página.
    // É crucial retornar as props (mesmo que vazias) para renderizar a página.
    return {
      props: {}, // Usuário autenticado e na página correta.
    };
  } catch (error) {
    // 5. Se o token for inválido ou expirado (o verifyIdToken vai falhar),
    // redireciona para a página de login.
    console.error("Erro de verificação de token:", error);
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };
  }
}
