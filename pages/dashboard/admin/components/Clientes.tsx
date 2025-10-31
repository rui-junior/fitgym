import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useState } from "react";
import { FiUserCheck, FiUserPlus, FiUsers } from "react-icons/fi";

import AddCliente from "./content/AddCliente";
import ListaClientes from "./content/ListaClientes"

export default function Clientes() {
  // Corrigido: currentComponent deve armazenar JSX, não string
  const [currentComponent, setCurrentComponent] = useState<any>(<ListaClientes />);
  const [activeItem, setActiveItem] = useState("Clientes");

  const menuItems = [
    { icon: FiUserPlus, label: "Novo Cliente", active: false, link: AddCliente },
    { icon: FiUsers, label: 'Lista de Clientes', active: false, link: ListaClientes }
  ];

  // Corrigido: função agora renderiza o componente corretamente
  const handleMenuClick = (
    ComponentToRender: React.ComponentType,
    label: string
  ) => {
    setCurrentComponent(<ComponentToRender />);
    setActiveItem(label);
  };

  return (
    <Flex
      w={"100%"}
      h={"100%"}
      position={"relative"}
      top={"0px"}
      left={"0px"}
      direction={"column"}
      bg="gray.50"
    >
      {/* Header com botões de navegação */}
      <Flex
        w={"100%"}
        position={"relative"}
        top={"0px"}
        left={"0px"}
        padding={"20px"}
        bg="white" // Mudado de blue para branco
        borderBottom="1px"
        borderColor="gray.200"
        gap={2}
      >
        {menuItems.map((item, index) => (
          <Button
            key={index}
            variant={activeItem === item.label ? "solid" : "outline"}
            colorScheme="blue"
            size="lg"
            _hover={{
              bg: activeItem === item.label ? "blue.600" : "blue.50",
            }}
            maxW="300px"
            h={12} // Reduzido altura
            fontSize="md"
            fontWeight="medium"
            onClick={() => handleMenuClick(item.link, item.label)}
          >
            <item.icon size={20} style={{ marginRight: 8 }} />
            {item.label}
          </Button>
        ))}
      </Flex>

      {/* Área de conteúdo */}
      <Flex
        top={"0px"}
        left={"0px"}
        w={"100%"}
        h={"100%"}
        bg="gray.50"
        py={6}
        justifyContent={'center'}
      >
        {/* Renderiza o componente ativo ou mensagem padrão */}
        {currentComponent}
      </Flex>
    </Flex>
  );
}
