import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Grid,
  GridItem,
  Dialog,
  Portal,
  CloseButton,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiCreditCard,
  FiClock,
  FiEdit,
  FiActivity,
  FiUserX,
} from "react-icons/fi";
// Importação de Clientes foi removida, assumindo que não é utilizada no componente

interface Cliente {
  id: string;
  uid: string;
  nome: string;
  email: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
  // NOVO CAMPO ADICIONADO AQUI
  dataPagamento: string; // Vencimento do plano (idealmente uma string ISO ou algo que Date consiga ler)
  criadoEm: any;
  atualizadoEm: any;
  ativo: boolean;
  plano: string;
  status: string;
}

interface DetalhesClienteProps {
  cliente: Cliente;
  onBack: () => void;
  onEdit: (cliente: Cliente) => void;
  onHistorico: (cliente: Cliente) => void;
  onAvaliacoes: (cliente: Cliente) => void;
  onClienteAtualizado: (clienteAtualizado: Cliente) => void;
}

// Componente Avatar customizado (mantido inalterado)
const CustomAvatar = ({
  name,
  size = "lg",
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
    xl: { w: 24, h: 24, fontSize: "2xl" },
  };

  const avatarSize = sizeMap[size as keyof typeof sizeMap] || sizeMap.lg;

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

const DetalhesCliente = ({
  cliente,
  onBack,
  onEdit,
  onHistorico,
  onAvaliacoes,
  onClienteAtualizado,
}: any) => {
  const [isDesativando, setIsDesativando] = useState(false);

  // Função para formatar data (mantida inalterada)
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

      // Adicionado um pequeno tratamento para ignorar a hora em datas de nascimento/cadastro se for o caso
      // Para o contexto do sistema, manteremos o formato completo por enquanto
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(",", ""); // Remove a vírgula se houver

    } catch (error) {
      return "N/A";
    }
  };
  
  // Função para formatar data sem a hora
  const formatShortDate = (dateString: string | undefined): string => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        // Formato DD/MM/AAAA
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch (error) {
        return "Data Inválida";
    }
  };

  /**
   * Função para verificar e formatar a data de pagamento
   * Retorna um objeto com a data formatada, o status (vencido, vence hoje, ok) e as cores de destaque.
   */
  const checkPaymentStatus = (dateString: string | undefined) => {
    const formattedDate = formatShortDate(dateString);
    if (!dateString || formattedDate === "N/A" || formattedDate === "Data Inválida") {
      return {
        date: formattedDate,
        statusText: "Não Informado",
        color: "gray.500",
        bgColor: "gray.50",
        icon: FiCalendar,
      };
    }

    try {
      // Cria uma data apenas com a parte da data, ignorando o fuso horário para comparação mais simples
      const expiryDate = new Date(dateString);
      expiryDate.setHours(0, 0, 0, 0); // Zera o horário para comparar apenas a data

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Status
      let statusText = "Em dia";
      let color = "green.600";
      let bgColor = "green.50";
      let icon = FiCalendar;

      if (expiryDate.getTime() < today.getTime()) {
        statusText = "VENCIDO!";
        color = "red.600";
        bgColor = "red.50";
      } else if (expiryDate.getTime() === today.getTime()) {
        statusText = "Vence Hoje!";
        color = "orange.600";
        bgColor = "orange.50";
      } else {
        // Verifica se faltam menos de 5 dias (opcional, mas útil)
        const diffTime = Math.abs(expiryDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 5) {
          statusText = `Vence em ${diffDays} dias`;
          color = "yellow.700";
          bgColor = "yellow.50";
        }
      }

      return {
        date: formattedDate,
        statusText: statusText,
        color: color,
        bgColor: bgColor,
        icon: FiCalendar,
      };
    } catch (error) {
      return {
        date: formattedDate,
        statusText: "Erro na Data",
        color: "gray.500",
        bgColor: "gray.50",
        icon: FiCalendar,
      };
    }
  };

  // Funções de formatação (mantidas inalteradas)
  const formatCPF = (cpf: string) => {
    if (!cpf) return "N/A";
    //... (mantido)
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatCelular = (celular: string) => {
    if (!celular) return "N/A";
    //... (mantido)
    const clean = celular.replace(/\D/g, "");
    if (clean.length === 11) {
      return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    return celular;
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "N/A";
    //... (mantido)
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }

      return `${age} anos`;
    } catch (error) {
      return "N/A";
    }
  };

  // Função para desativar/ativar cliente (mantida inalterada)
  const handleToggleStatus = async () => {
    //... (mantido)
    const novoStatus = !cliente.ativo;
    const acao = novoStatus ? "ativar" : "desativar";

    setIsDesativando(true);

    try {
      const response = await fetch("/api/editclient", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: cliente.cpf,
          tipo: "status",
          ativo: novoStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Atualizar cliente local
        const clienteAtualizado = {
          ...cliente,
          ativo: novoStatus,
          status: novoStatus ? "ativo" : "inativo",
        };

        onClienteAtualizado(clienteAtualizado);
        onBack();
      }
    } catch (error) {
      console.error(`Erro ao ${acao} cliente:`, error);
      // alert(`Erro ao ${acao} cliente. Tente novamente.`);
    } finally {
      setIsDesativando(false);
    }
  };

  const paymentStatus = checkPaymentStatus(cliente.dataPagamento);

  // console.log(cliente);

  return (
    <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
      {/* Header com botão voltar (mantido inalterado) */}
      <Flex align="center" gap={4} mb={6}>
        <Button variant="ghost" colorScheme="gray" onClick={onBack} size="lg">
          <Flex align="center" gap={2}>
            <FiArrowLeft size={20} />
            Voltar
          </Flex>
        </Button>

        <Box>
          <Heading size="lg" color="gray.800">
            Detalhes do Cliente
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Informações completas do cliente
          </Text>
        </Box>
      </Flex>

      <Flex justifyContent={"center"} pb={6}>
        {/* Card Principal (mantido inalterado) */}
        <Box
          bg="white"
          borderRadius="xl"
          shadow="sm"
          border="1px"
          borderColor="gray.200"
          overflow="hidden"
          w={["100%", "100%", "80%", "80%", "60%"]}
        >
          {/* Header do Card com Avatar (mantido inalterado) */}
          <Box px={8} py={4}>
            <Flex
              align="center"
              gap={6}
              direction={{ base: "column", md: "row" }}
            >
              <CustomAvatar
                name={cliente.nome}
                size="md"
                bg="white"
                color="blue.500"
              />
              <Box textAlign={{ base: "center", md: "left" }}>
                <Heading size="xl" mb={2} color={"#000000"}>
                  {cliente.nome}
                </Heading>
                <Text fontSize="lg" opacity={0.9} color={"#000000"}>
                  {cliente.email}
                </Text>
                <Text fontSize="md" opacity={0.8} mt={1} color={"#000000"}>
                  Cliente desde {formatDate(cliente.criadoEm).split(" ")[0]}
                </Text>
              </Box>
            </Flex>
          </Box>

          {/* Conteúdo do Card */}
          <Box px={8} py={2} pb={5}>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
              {/* Informações Pessoais (mantido inalterado) */}
              <GridItem>
                <Heading size="md" color="gray.800" mb={6}>
                  <Flex align="center" gap={3}>
                    <Box
                      w={10}
                      h={10}
                      bg="blue.50"
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="blue.500"
                    >
                      <FiUser size={20} />
                    </Box>
                    Informações Pessoais
                  </Flex>
                </Heading>

                <Flex direction="column" gap={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Nome Completo
                    </Text>
                    <Text fontSize="lg" color="gray.800" fontWeight="medium">
                      {cliente.nome}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      CPF
                    </Text>
                    <Text
                      fontSize="lg"
                      color="gray.800"
                      fontWeight="medium"
                      fontFamily="mono"
                    >
                      {formatCPF(cliente.cpf)}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      Data de Nascimento
                    </Text>
                    <Flex align="center" gap={3}>
                      <Text fontSize="lg" color="gray.800" fontWeight="medium">
                        {cliente.dataNascimento
                          ? new Date(cliente.dataNascimento).toLocaleDateString(
                              "pt-BR"
                            )
                          : "N/A"}
                      </Text>
                      <Text
                        fontSize="sm"
                        color="gray.500"
                        bg="gray.100"
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        {calculateAge(cliente.dataNascimento)}
                      </Text>
                    </Flex>
                  </Box>
                </Flex>
              </GridItem>

              {/* Informações de Contato (mantido inalterado) */}
              <GridItem>
                <Heading size="md" color="gray.800" mb={6}>
                  <Flex align="center" gap={3}>
                    <Box
                      w={10}
                      h={10}
                      bg="green.50"
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="green.500"
                    >
                      <FiPhone size={20} />
                    </Box>
                    Informações de Contato
                  </Flex>
                </Heading>

                <Flex direction="column" gap={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      <Flex align="center" gap={2}>
                        <FiMail size={14} />
                        E-mail
                      </Flex>
                    </Text>
                    <Text fontSize="lg" color="gray.800" fontWeight="medium">
                      {cliente.email}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      <Flex align="center" gap={2}>
                        <FiPhone size={14} />
                        Celular
                      </Flex>
                    </Text>
                    <Text fontSize="lg" color="gray.800" fontWeight="medium">
                      {formatCelular(cliente.celular)}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.500" mb={1}>
                      UID
                    </Text>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      fontFamily="mono"
                      bg="gray.100"
                      p={2}
                      borderRadius="md"
                    >
                      {cliente.uid}
                    </Text>
                  </Box>
                </Flex>
              </GridItem>
            </Grid>

            {/* Informações do Sistema - Adicionando dataPagamento */}
            <Box mt={8} pt={8} borderTop="1px" borderColor="gray.200">
              <Heading size="md" color="gray.800" mb={6}>
                <Flex align="center" gap={3}>
                  <Box
                    w={10}
                    h={10}
                    bg="purple.50"
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="purple.500"
                  >
                    <FiClock size={20} />
                  </Box>
                  Informações do Sistema
                </Flex>
              </Heading>

              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
                gap={6}
              >
                {/* Data de Cadastro */}
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Data de Cadastro
                  </Text>
                  <Text fontSize="md" color="gray.800" fontWeight="medium">
                    {formatDate(cliente.criadoEm)}
                  </Text>
                </Box>

                {/* Última Atualização */}
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Última Atualização
                  </Text>
                  <Text fontSize="md" color="gray.800" fontWeight="medium">
                    {formatDate(cliente.atualizadoEm)}
                  </Text>
                </Box>

                {/* Status da Conta */}
                <Box>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    Status da Conta
                  </Text>
                  <Flex align="center" gap={2}>
                    <Box
                      w={3}
                      h={3}
                      bg={cliente.ativo ? "green.500" : "red.500"}
                      borderRadius="full"
                    />
                    <Text fontSize="md" color="gray.800" fontWeight="medium">
                      {cliente.ativo ? "Ativa" : "Inativa"}
                    </Text>
                  </Flex>
                </Box>
              </Grid>
              
              
            </Box>

            {/* Botões de Ação (mantido inalterado) */}
            <Flex
              gap={4}
              mt={8}
              pt={6}
              borderTop="1px"
              borderColor="gray.200"
              wrap="wrap"
            >
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() => onEdit(cliente)}
              >
                <Flex align="center" gap={2}>
                  <FiEdit size={16} />
                  Editar Cliente
                </Flex>
              </Button>

              <Button
                variant="outline"
                colorScheme="green"
                size="lg"
                onClick={() => onHistorico(cliente)}
              >
                <Flex align="center" gap={2}>
                  <FiCalendar size={16} />
                  Ver Histórico
                </Flex>
              </Button>

              <Button
                variant="outline"
                colorScheme="purple"
                size="lg"
                onClick={() => onAvaliacoes(cliente)}
              >
                <Flex align="center" gap={2}>
                  <FiActivity size={16} />
                  Avaliações
                </Flex>
              </Button>

              <Box>
                {/* Lógica de Ativar/Desativar embutida no Diálogo (mantido inalterado) */}
                <Dialog.Root role="alertdialog">
                  <Dialog.Trigger asChild>
                    <Button
                      size="lg"
                      variant="outline"
                      colorScheme="red"
                      disabled={isDesativando}
                    >
                      <Flex align="center" gap={2}>
                        <FiUserX size={16} />
                        {isDesativando
                          ? cliente.ativo
                            ? "Desativando..."
                            : "Ativando..."
                          : cliente.ativo
                          ? "Desativar Cliente"
                          : "Ativar Cliente"}
                      </Flex>
                    </Button>
                  </Dialog.Trigger>
                  <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                      <Dialog.Content>
                        <Dialog.Header>
                          <Dialog.Title>
                            {cliente.ativo ? "Desativar Cliente" : "Ativar Cliente"}
                          </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                          <Text>
                            Tem certeza que deseja{" "}
                            {cliente.ativo ? "desativar" : "ativar"} o cliente{" "}
                            <strong>{cliente.nome}</strong>?
                          </Text>
                        </Dialog.Body>
                        <Dialog.Footer>
                          <Dialog.ActionTrigger asChild>
                            <Button variant="outline">Cancelar</Button>
                          </Dialog.ActionTrigger>
                          <Button
                            colorPalette={cliente.ativo ? "red" : "green"}
                            onClick={() => handleToggleStatus()}
                          >
                            {cliente.ativo ? "Desativar" : "Ativar"}
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
        </Box>
      </Flex>
    </Box>
  );
};

export default DetalhesCliente;