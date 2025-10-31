import { useState, useEffect } from 'react';
import { Box, Button, Flex, Heading, Text, Stack, Spinner } from '@chakra-ui/react';
import { FiArrowLeft, FiClock, FiUser, FiActivity, FiCalendar } from 'react-icons/fi';

interface Cliente {
  id: string;
  uid: string;
  nome: string;
  email: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
  criadoEm: any;
  atualizadoEm: any;
  ativo: boolean;
  plano: string;
  status: string;
}

interface HistoricoItem {
  id: string;
  tipo: string;
  descricao: string;
  data: string;
  detalhes?: string;
}

interface HistoricoClienteProps {
  cliente: Cliente;
  onBack: () => void;
}

const HistoricoCliente = ({ cliente, onBack }: any) => {
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar histórico do cliente
  const fetchHistorico = async () => {
    setIsLoading(true);
    try {
      // Simular dados de histórico (substituir por API real)
      const mockHistorico: HistoricoItem[] = [
        {
          id: '1',
          tipo: 'cadastro',
          descricao: 'Cliente cadastrado no sistema',
          data: cliente.criadoEm,
          detalhes: 'Cadastro inicial realizado'
        },
        {
          id: '2',
          tipo: 'avaliacao',
          descricao: 'Avaliação física realizada',
          data: '2025-09-20T10:30:00Z',
          detalhes: 'Primeira avaliação física completa'
        },
        {
          id: '3',
          tipo: 'treino',
          descricao: 'Plano de treino atualizado',
          data: '2025-09-18T14:15:00Z',
          detalhes: 'Treino adaptado para objetivos específicos'
        },
        {
          id: '4',
          tipo: 'pagamento',
          descricao: 'Pagamento mensalidade',
          data: '2025-09-15T09:00:00Z',
          detalhes: 'Mensalidade setembro/2025 - R$ 89,90'
        },
        {
          id: '5',
          tipo: 'presenca',
          descricao: 'Check-in na academia',
          data: '2025-09-23T07:30:00Z',
          detalhes: 'Treino de musculação - 1h30min'
        }
      ];

      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHistorico(mockHistorico);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, []);

  // Função para formatar data
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
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
      
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Função para obter ícone por tipo
  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'cadastro':
        return <FiUser size={16} />;
      case 'avaliacao':
        return <FiActivity size={16} />;
      case 'treino':
        return <FiActivity size={16} />;
      case 'pagamento':
        return <FiCalendar size={16} />;
      case 'presenca':
        return <FiClock size={16} />;
      default:
        return <FiClock size={16} />;
    }
  };

  // Função para obter cor por tipo
  const getColorByType = (tipo: string) => {
    switch (tipo) {
      case 'cadastro':
        return 'blue';
      case 'avaliacao':
        return 'green';
      case 'treino':
        return 'purple';
      case 'pagamento':
        return 'orange';
      case 'presenca':
        return 'teal';
      default:
        return 'gray';
    }
  };

  return (
    <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
      {/* Header com botão voltar */}
      <Flex align="center" gap={4} mb={6}>
        <Button
          variant="ghost"
          colorScheme="gray"
          onClick={onBack}
          size="lg"
        >
          <Flex align="center" gap={2}>
            <FiArrowLeft size={20} />
            Voltar
          </Flex>
        </Button>
        
        <Box>
          <Heading size="lg" color="gray.800">
            Histórico do Cliente
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {cliente.nome} - Atividades e eventos
          </Text>
        </Box>
      </Flex>

      <Flex justifyContent="center">
        <Box w={["100%", "80%", "70%"]} maxW="800px">
          {/* Card Principal */}
          <Box 
            bg="white" 
            borderRadius="xl" 
            shadow="sm" 
            border="1px" 
            borderColor="gray.200" 
            p={8}
          >
            {/* Header do Card */}
            <Flex align="center" gap={4} mb={8} pb={6} borderBottom="1px" borderColor="gray.200">
              <Box
                w={12}
                h={12}
                bg="blue.50"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="blue.500"
              >
                <FiClock size={24} />
              </Box>
              <Box>
                <Heading size="md" color="gray.800">
                  Histórico de Atividades
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Cronologia de eventos do cliente
                </Text>
              </Box>
            </Flex>

            {/* Conteúdo */}
            {isLoading ? (
              <Flex justify="center" align="center" py={12}>
                <Flex direction="column" align="center" gap={4}>
                  <Spinner size="lg" color="blue.500" />
                  <Text color="gray.600">Carregando histórico...</Text>
                </Flex>
              </Flex>
            ) : historico.length === 0 ? (
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
                    <FiClock size={32} />
                  </Box>
                  <Heading size="md" color="gray.600" mb={2}>
                    Nenhum histórico encontrado
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    Este cliente ainda não possui atividades registradas
                  </Text>
                </Box>
              </Flex>
            ) : (
              <Stack gap={0}>
                {historico.map((item, index) => (
                  <Box key={item.id} position="relative">
                    {/* Linha vertical (exceto no último item) */}
                    {index < historico.length - 1 && (
                      <Box
                        position="absolute"
                        left="20px"
                        top="40px"
                        bottom="-20px"
                        w="2px"
                        bg="gray.200"
                        zIndex={0}
                      />
                    )}
                    
                    {/* Item do histórico */}
                    <Flex gap={4} p={4} position="relative" zIndex={1}>
                      {/* Ícone */}
                      <Box
                        w={10}
                        h={10}
                        bg={`${getColorByType(item.tipo)}.50`}
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color={`${getColorByType(item.tipo)}.500`}
                        border="3px solid"
                        borderColor="white"
                        shadow="sm"
                        flexShrink={0}
                      >
                        {getIconByType(item.tipo)}
                      </Box>

                      {/* Conteúdo */}
                      <Box flex={1} pt={1}>
                        <Flex justify="space-between" align="start" mb={2}>
                          <Box>
                            <Text fontWeight="medium" color="gray.800" fontSize="md">
                              {item.descricao}
                            </Text>
                            {item.detalhes && (
                              <Text color="gray.600" fontSize="sm" mt={1}>
                                {item.detalhes}
                              </Text>
                            )}
                          </Box>
                          <Text color="gray.500" fontSize="xs" flexShrink={0} ml={4}>
                            {formatDate(item.data)}
                          </Text>
                        </Flex>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            )}

            {/* Botões de Ação */}
            <Flex gap={4} mt={8} pt={6} borderTop="1px" borderColor="gray.200">
              <Button
                colorScheme="blue"
                variant="outline"
                size="lg"
                onClick={() => {
                  fetchHistorico();
                }}
                disabled={isLoading}
              >
                <Flex align="center" gap={2}>
                  <FiClock size={16} />
                  Atualizar Histórico
                </Flex>
              </Button>

              <Button
                colorScheme="green"
                size="lg"
                onClick={() => {
                  console.log('Exportar histórico:', cliente.id);
                }}
              >
                <Flex align="center" gap={2}>
                  <FiCalendar size={16} />
                  Exportar Relatório
                </Flex>
              </Button>
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default HistoricoCliente;
