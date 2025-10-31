import { useState, useEffect } from 'react';
import { Box, Button, Flex, Heading, Text, Input, Grid, GridItem } from '@chakra-ui/react';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiCreditCard, FiSave, FiX } from 'react-icons/fi';

import { Cliente } from './types/ClientTypes';

interface FormData {
  nome: string;
  email: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
  dataPagamento?: string;
  uid: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  cpf?: string; // ✅ Adicionado para corresponder a FormData
  celular?: string;
  dataNascimento?: string;
}

interface EditarClienteProps {
  cliente: Cliente;
  onBack: () => void;
  onClienteAtualizado: (clienteAtualizado: Cliente) => void; // ✅ Adicionada esta prop
}

const EditarCliente = ({ cliente, onBack, onClienteAtualizado }: EditarClienteProps) => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    cpf: '',
    celular: '',
    dataNascimento: '',
    dataPagamento: '',
    uid: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Preencher formulário com dados do cliente
  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        email: cliente.email || '',
        cpf: cliente.cpf || '',
        celular: cliente.celular || '',
        dataNascimento: cliente.dataNascimento || '',
        uid: cliente.uid || " "
      });
    }
  }, [cliente]);

  // Função para formatar celular
  const formatCelular = (value: string): string => {
    const cleanValue = value.replace(/\D/g, "");
    
    if (cleanValue.length <= 2) {
      return cleanValue;
    } else if (cleanValue.length <= 7) {
      return cleanValue.replace(/(\d{2})(\d)/, "($1) $2");
    } else if (cleanValue.length <= 11) {
      return cleanValue.replace(/(\d{2})(\d{5})(\d)/, "($1) $2-$3");
    } else {
      return cleanValue.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
  };

  // Função para validar celular
  const validateCelular = (celular: string): boolean => {
    const cleanPhone = celular.replace(/\D/g, "");
    
    if (cleanPhone.length !== 11) {
      return false;
    }
    
    // Verificar se o terceiro dígito é 9 (padrão celular)
    if (cleanPhone.charAt(2) !== '9') {
      return false;
    }
    
    // Lista de DDDs válidos do Brasil
    const validDDDs = [
      '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
      '21', '22', '24', // RJ
      '27', '28', // ES
      '31', '32', '33', '34', '35', '37', '38', // MG
      '41', '42', '43', '44', '45', '46', // PR
      '47', '48', '49', // SC
      '51', '53', '54', '55', // RS
      '61', // DF
      '62', '64', // GO
      '63', // TO
      '65', '66', // MT
      '67', // MS
      '68', // AC
      '69', // RO
      '71', '73', '74', '75', '77', // BA
      '79', // SE
      '81', '87', // PE
      '82', // AL
      '83', // PB
      '84', // RN
      '85', '88', // CE
      '86', '89', // PI
      '91', '93', '94', // PA
      '92', '97', // AM
      '95', // RR
      '96', // AP
      '98', '99' // MA
    ];
    
    const ddd = cleanPhone.substring(0, 2);
    return validDDDs.includes(ddd);
  };

  // Função para lidar com mudanças nos inputs
  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    
    if (field === 'celular') {
      processedValue = formatCelular(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    // ✅ Type safety: verificar se o campo existe em FormErrors
    if (field in errors && errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Função para validar formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    // Validar celular
    if (!formData.celular.trim()) {
      newErrors.celular = 'Celular é obrigatório';
    } else if (!validateCelular(formData.celular)) {
      const cleanPhone = formData.celular.replace(/\D/g, "");
      if (cleanPhone.length !== 11) {
        newErrors.celular = 'Celular deve ter 11 dígitos';
      } else if (cleanPhone.charAt(2) !== '9') {
        newErrors.celular = 'Celular deve começar com 9 após o DDD';
      } else {
        newErrors.celular = 'DDD inválido';
      }
    }

    // Validar data de nascimento
    if (!formData.dataNascimento.trim()) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória';
    } else {
      const birthDate = new Date(formData.dataNascimento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 16 || age > 100) {
        newErrors.dataNascimento = 'Idade deve estar entre 16 e 100 anos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Função para submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/editclient', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf: cliente.cpf,
          tipo: 'completa',
          uid: formData.uid,
          nome: formData.nome.trim(),
          email: formData.email.toLowerCase().trim(),
          celular: formData.celular.trim(),
          dataNascimento: formData.dataNascimento.trim()
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Criar cliente atualizado para callback
        const clienteAtualizado: Cliente = {
          ...cliente,
          nome: formData.nome.trim(),
          email: formData.email.toLowerCase().trim(),
          celular: formData.celular.trim(),
          dataNascimento: formData.dataNascimento.trim(),
          atualizadoEm: new Date()
        };

        // Chamar callback para atualizar lista
        onClienteAtualizado(clienteAtualizado);
        
        // alert('Cliente editado com sucesso!');
        onBack();
      }
    } catch (error) {
      console.error('Erro ao editar cliente:', error);
      // alert('Erro ao editar cliente. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para cancelar edição
  const handleCancel = () => {
    // const hasChanges = 
    //   formData.nome !== cliente.nome ||
    //   formData.email !== cliente.email ||
    //   formData.celular !== cliente.celular ||
    //   formData.dataNascimento !== cliente.dataNascimento;

    // if (hasChanges) {
    //   const confirmacao = window.confirm(
    //     'Você tem alterações não salvas. Tem certeza que deseja cancelar?'
    //   );
    //   if (!confirmacao) return;
    // }

    onBack();
  };

  return (
    <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
      {/* Header */}
      <Flex align="center" gap={4} mb={6}>
        <Button
          variant="ghost"
          colorScheme="gray"
          onClick={handleCancel}
          size="lg"
        >
          <Flex align="center" gap={2}>
            <FiArrowLeft size={20} />
            Voltar
          </Flex>
        </Button>
        
        <Box>
          <Heading size="lg" color="gray.800">
            Editar Cliente
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Altere as informações do cliente {cliente.nome}
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
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder="Digite o nome completo"
                  size="lg"
                  bg="gray.50"
                  border="1px"
                  borderColor={errors.nome ? "red.300" : "gray.200"}
                  _hover={{
                    borderColor: errors.nome ? "red.400" : "gray.300",
                  }}
                  _focus={{
                    borderColor: errors.nome ? "red.500" : "blue.500",
                    bg: "white",
                  }}
                />
                {errors.nome && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.nome}
                  </Text>
                )}
              </Box>
            </GridItem>

            {/* Email */}
            <GridItem>
              <Box>
                <Text color="gray.700" fontWeight="medium" mb={2}>
                  <Flex align="center" gap={2}>
                    <FiMail size={16} />
                    Email
                  </Flex>
                </Text>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="exemplo@email.com"
                  size="lg"
                  bg="gray.50"
                  border="1px"
                  borderColor={errors.email ? "red.300" : "gray.200"}
                  _hover={{
                    borderColor: errors.email ? "red.400" : "gray.300",
                  }}
                  _focus={{
                    borderColor: errors.email ? "red.500" : "blue.500",
                    bg: "white",
                  }}
                />
                {errors.email && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.email}
                  </Text>
                )}
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
                  value={formData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  disabled
                  size="lg"
                  bg="gray.100"
                  border="1px"
                  borderColor="gray.200"
                  color="gray.500"
                  cursor="not-allowed"
                />
                <Text color="gray.500" fontSize="xs" mt={1}>
                  CPF não pode ser alterado
                </Text>
              </Box>
            </GridItem>

            {/* Celular */}
            <GridItem>
              <Box>
                <Text color="gray.700" fontWeight="medium" mb={2}>
                  <Flex align="center" gap={2}>
                    <FiPhone size={16} />
                    Celular
                  </Flex>
                </Text>
                <Input
                  type="text"
                  value={formData.celular}
                  onChange={(e) => handleInputChange("celular", e.target.value)}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  size="lg"
                  bg="gray.50"
                  border="1px"
                  borderColor={errors.celular ? "red.300" : "gray.200"}
                  _hover={{
                    borderColor: errors.celular ? "red.400" : "gray.300",
                  }}
                  _focus={{
                    borderColor: errors.celular ? "red.500" : "blue.500",
                    bg: "white",
                  }}
                />
                {errors.celular && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.celular}
                  </Text>
                )}
              </Box>
            </GridItem>

            {/* Data de Nascimento */}
            <GridItem>
              <Box>
                <Text color="gray.700" fontWeight="medium" mb={2}>
                  <Flex align="center" gap={2}>
                    <FiCalendar size={16} />
                    Data de Nascimento
                  </Flex>
                </Text>
                <Input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
                  size="lg"
                  bg="gray.50"
                  border="1px"
                  borderColor={errors.dataNascimento ? "red.300" : "gray.200"}
                  _hover={{
                    borderColor: errors.dataNascimento ? "red.400" : "gray.300",
                  }}
                  _focus={{
                    borderColor: errors.dataNascimento ? "red.500" : "blue.500",
                    bg: "white",
                  }}
                />
                {errors.dataNascimento && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.dataNascimento}
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

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  disabled={isLoading}
                >
                  <Flex align="center" gap={2}>
                    <FiSave size={16} />
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </Flex>
                </Button>
              </Flex>
            </GridItem>
          </Grid>
        </Box>
      </Flex>
    </Box>
  );
};

export default EditarCliente;
