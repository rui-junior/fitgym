import { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Heading,
  Text,
  Stack,
  Separator,
  NativeSelect,
  Textarea
} from '@chakra-ui/react';
import {
  FiUser,
  FiActivity,
  FiSave,
  FiX,
  FiArrowLeft,
  FiTarget,
  FiMaximize
} from 'react-icons/fi';

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

interface FormData {
  peso: string;
  altura: string;
  sexo: 'masculino' | 'feminino' | '';
  // 7 dobras cutâneas para Pollock
  triceps: string;
  subescapular: string;
  biceps: string;
  axilarMedia: string;
  suprailiaca: string;
  abdominal: string;
  coxa: string;
  // Medidas corporais adicionais
  torax: string;
  cintura: string;
  quadril: string;
  abdomen: string;
  bracoDireito: string;
  bracoEsquerdo: string;
  coxaDireita: string;
  coxaEsquerda: string;
  panturrilhaDireita: string;
  panturrilhaEsquerda: string;
  observacoes: string;
}

interface FormErrors {
  peso?: string;
  altura?: string;
  sexo?: string;
  triceps?: string;
  subescapular?: string;
  biceps?: string;
  axilarMedia?: string;
  suprailiaca?: string;
  abdominal?: string;
  coxa?: string;
  torax?: string;
  cintura?: string;
  quadril?: string;
  abdomen?: string;
  bracoDireito?: string;
  bracoEsquerdo?: string;
  coxaDireita?: string;
  coxaEsquerda?: string;
  panturrilhaDireita?: string;
  panturrilhaEsquerda?: string;
}

interface NovaAvaliacaoProps {
  cliente: Cliente;
  onBack: () => void;
  onAvaliacaoSalva: () => void;
}

const NovaAvaliacao = ({ cliente, onBack, onAvaliacaoSalva }: any) => {
  
  
  const [formData, setFormData] = useState<FormData>({
    peso: '',
    altura: '',
    sexo: '',
    triceps: '',
    subescapular: '',
    biceps: '',
    axilarMedia: '',
    suprailiaca: '',
    abdominal: '',
    coxa: '',
    torax: '',
    cintura: '',
    quadril: '',
    abdomen: '',
    bracoDireito: '',
    bracoEsquerdo: '',
    coxaDireita: '',
    coxaEsquerda: '',
    panturrilhaDireita: '',
    panturrilhaEsquerda: '',
    observacoes: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resultados, setResultados] = useState<{
    imc: number;
    percentualGordura: number;
    massaGorda: number;
    massaMagra: number;
  } | null>(null);

  // Calcular idade
  const calcularIdade = (dataNascimento: string): number => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  // Calcular IMC
  const calcularIMC = (peso: number, altura: number): number => {
    const alturaMetros = altura / 100;
    return Number((peso / (alturaMetros * alturaMetros)).toFixed(1));
  };

  // Fórmula Pollock 7 dobras para percentual de gordura
  const calcularPercentualGordura = (
    idade: number,
    sexo: 'masculino' | 'feminino',
    somaDobras: number
  ): number => {
    let densidadeCorporal: number;
    
    if (sexo === 'masculino') {
      // Fórmula para homens (Pollock & Jackson, 1980)
      densidadeCorporal = 1.112 - (0.00043499 * somaDobras) + 
                         (0.00000055 * Math.pow(somaDobras, 2)) - 
                         (0.00028826 * idade);
    } else {
      // Fórmula para mulheres (Pollock & Jackson, 1980)
      densidadeCorporal = 1.097 - (0.00046971 * somaDobras) + 
                         (0.00000056 * Math.pow(somaDobras, 2)) - 
                         (0.00012828 * idade);
    }
    
    // Conversão da densidade corporal para percentual de gordura (Siri, 1961)
    const percentualGordura = ((4.95 / densidadeCorporal) - 4.5) * 100;
    
    return Number(Math.max(0, percentualGordura).toFixed(1));
  };

  // Calcular resultados
  const calcularResultados = () => {
    const peso = parseFloat(formData.peso);
    const altura = parseFloat(formData.altura);
    const idade = calcularIdade(cliente.dataNascimento);
    
    // Soma das 7 dobras
    const somaDobras = 
      parseFloat(formData.triceps) +
      parseFloat(formData.subescapular) +
      parseFloat(formData.biceps) +
      parseFloat(formData.axilarMedia) +
      parseFloat(formData.suprailiaca) +
      parseFloat(formData.abdominal) +
      parseFloat(formData.coxa);

    const imc = calcularIMC(peso, altura);
    const percentualGordura = calcularPercentualGordura(idade, formData.sexo as 'masculino' | 'feminino', somaDobras);
    const massaGorda = Number((peso * percentualGordura / 100).toFixed(1));
    const massaMagra = Number((peso - massaGorda).toFixed(1));

    setResultados({
      imc,
      percentualGordura,
      massaGorda,
      massaMagra
    });
  };

  // Validar formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.peso || parseFloat(formData.peso) <= 0) {
      newErrors.peso = 'Peso é obrigatório e deve ser maior que 0';
    }

    if (!formData.altura || parseFloat(formData.altura) <= 0) {
      newErrors.altura = 'Altura é obrigatória e deve ser maior que 0';
    }

    if (!formData.sexo) {
      newErrors.sexo = 'Sexo é obrigatório';
    }

    // Validar dobras cutâneas (obrigatórias para cálculo)
    const dobras = ['triceps', 'subescapular', 'biceps', 'axilarMedia', 'suprailiaca', 'abdominal', 'coxa'];
    dobras.forEach(dobra => {
      const valor = formData[dobra as keyof FormData] as string;
      if (!valor || parseFloat(valor) < 0) {
        newErrors[dobra as keyof FormErrors] = 'Valor obrigatório e deve ser ≥ 0';
      }
    });

    // Medidas corporais são opcionais, mas se preenchidas devem ser válidas
    const medidas = ['torax', 'cintura', 'quadril', 'abdomen', 'bracoDireito', 'bracoEsquerdo', 'coxaDireita', 'coxaEsquerda', 'panturrilhaDireita', 'panturrilhaEsquerda'];
    medidas.forEach(medida => {
      const valor = formData[medida as keyof FormData] as string;
      if (valor && parseFloat(valor) < 0) {
        newErrors[medida as keyof FormErrors] = 'Valor deve ser ≥ 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Lidar com mudanças nos inputs
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo
    if (field in errors && errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Recalcular resultados se todos os campos obrigatórios estão preenchidos
    if (field !== 'observacoes') {
      setTimeout(() => {
        const updatedFormData = { ...formData, [field]: value };
        const allRequiredFieldsFilled = 
          updatedFormData.peso && 
          updatedFormData.altura && 
          updatedFormData.sexo &&
          updatedFormData.triceps &&
          updatedFormData.subescapular &&
          updatedFormData.biceps &&
          updatedFormData.axilarMedia &&
          updatedFormData.suprailiaca &&
          updatedFormData.abdominal &&
          updatedFormData.coxa;

        if (allRequiredFieldsFilled) {
          calcularResultados();
        }
      }, 100);
    }
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  if (!resultados) {
    alert('Erro: Resultados não calculados');
    return;
  }

  setIsLoading(true);

  try {
    
    const requestBody = {
      cpf: cliente.cpf,
      peso: parseFloat(formData.peso),
      altura: parseFloat(formData.altura),
      sexo: formData.sexo,
      dobras: {
        triceps: parseFloat(formData.triceps),
        subescapular: parseFloat(formData.subescapular),
        biceps: parseFloat(formData.biceps),
        axilarMedia: parseFloat(formData.axilarMedia),
        suprailiaca: parseFloat(formData.suprailiaca),
        abdominal: parseFloat(formData.abdominal),
        coxa: parseFloat(formData.coxa)
      },
      medidas: {
        torax: formData.torax ? parseFloat(formData.torax) : null,
        cintura: formData.cintura ? parseFloat(formData.cintura) : null,
        quadril: formData.quadril ? parseFloat(formData.quadril) : null,
        abdomen: formData.abdomen ? parseFloat(formData.abdomen) : null,
        bracoDireito: formData.bracoDireito ? parseFloat(formData.bracoDireito) : null,
        bracoEsquerdo: formData.bracoEsquerdo ? parseFloat(formData.bracoEsquerdo) : null,
        coxaDireita: formData.coxaDireita ? parseFloat(formData.coxaDireita) : null,
        coxaEsquerda: formData.coxaEsquerda ? parseFloat(formData.coxaEsquerda) : null,
        panturrilhaDireita: formData.panturrilhaDireita ? parseFloat(formData.panturrilhaDireita) : null,
        panturrilhaEsquerda: formData.panturrilhaEsquerda ? parseFloat(formData.panturrilhaEsquerda) : null
      },
      resultados,
      observacoes: formData.observacoes.trim()
    };


    const response = await fetch('/api/createavaliation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // VERIFICAR SE A RESPOSTA É JSON
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Resposta não é JSON:', textResponse);
      throw new Error('Erro interno do servidor. Verifique os logs.');
    }

    // ✅ PROCESSAR RESPOSTA JSON
    const result = await response.json();

    if (!response.ok) {
      // Se a API retornou um erro estruturado
      if (result.error) {
        throw new Error(result.error);
      } else if (result.message) {
        throw new Error(result.message);
      } else {
        throw new Error(`Erro HTTP ${response.status}`);
      }
    }

    // ✅ VERIFICAR SE A RESPOSTA INDICA SUCESSO
    if (result.success === false) {
      throw new Error(result.error || result.message || 'Erro desconhecido da API');
    }
    
    // Chamar callbacks para atualizar a interface
    onAvaliacaoSalva();
    onBack();

  } catch (error: any) {
    // console.error('Erro ao salvar avaliação:', error);
    
    // ✅ TRATAMENTO DE ERRO MAIS ESPECÍFICO
    let errorMessage = 'Erro desconhecido';
    
    if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    } else if (error.message.includes('NetworkError')) {
      errorMessage = 'Erro de rede. Tente novamente em alguns segundos.';
    } else if (error.message.includes('HTML em vez de JSON') || error.message.includes('Erro interno do servidor')) {
      errorMessage = 'Erro interno do servidor. Contate o suporte técnico.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    alert(`Erro ao salvar avaliação: ${errorMessage}`);
  } finally {
    setIsLoading(false);
  }
};




  const idade = calcularIdade(cliente.dataNascimento);

  return (
    <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
      {/* Header */}
      <Flex align="center" justify="space-between" mb={6}>
        <Flex align="center" gap={4}>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Flex align="center" gap={2}>
              <FiArrowLeft size={16} />
              Voltar
            </Flex>
          </Button>
          <Box>
            <Heading size="lg" color="gray.800">
              Nova Avaliação Física
            </Heading>
            <Text color="gray.600" fontSize="sm">
              {cliente.nome} • {idade} anos
            </Text>
          </Box>
        </Flex>
      </Flex>

      <Box
        bg="white"
        borderRadius="xl"
        shadow="sm"
        border="1px"
        borderColor="gray.200"
        p={{ base: 6, md: 8 }}
        maxW="1200px"
        mx="auto"
      >
        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            {/* Dados Básicos */}
            <Box>
              <Flex align="center" gap={3} mb={4}>
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
                <Heading size="md" color="gray.800">
                  Dados Básicos
                </Heading>
              </Flex>

              <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
                <Box flex={1}>
                  <Text color="gray.700" fontWeight="medium" mb={2}>
                    Peso (kg) *
                  </Text>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.peso}
                    onChange={(e) => handleInputChange('peso', e.target.value)}
                    placeholder="Ex: 70.5"
                    size="lg"
                    bg="gray.50"
                    border="1px"
                    borderColor={errors.peso ? 'red.300' : 'gray.200'}
                  />
                  {errors.peso && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.peso}
                    </Text>
                  )}
                </Box>

                <Box flex={1}>
                  <Text color="gray.700" fontWeight="medium" mb={2}>
                    Altura (cm) *
                  </Text>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.altura}
                    onChange={(e) => handleInputChange('altura', e.target.value)}
                    placeholder="Ex: 175"
                    size="lg"
                    bg="gray.50"
                    border="1px"
                    borderColor={errors.altura ? 'red.300' : 'gray.200'}
                  />
                  {errors.altura && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.altura}
                    </Text>
                  )}
                </Box>

                <Box flex={1}>
                  <Text color="gray.700" fontWeight="medium" mb={2}>
                    Sexo *
                  </Text>
                  <NativeSelect.Root
                    size="lg"
                    bg="gray.50"
                    border="1px"
                    borderColor={errors.sexo ? 'red.300' : 'gray.200'}
                  >
                    <NativeSelect.Field
                      value={formData.sexo}
                      onChange={(e) => handleInputChange('sexo', e.target.value)}
                      placeholder="Selecione o sexo"
                    >
                      <option value="">Selecione o sexo</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  {errors.sexo && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.sexo}
                    </Text>
                  )}
                </Box>
              </Flex>
            </Box>

            <Separator />

            {/* Medidas Corporais */}
            <Box>
              <Flex align="center" gap={3} mb={4}>
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
                  <FiMaximize size={20} />
                </Box>
                <Box>
                  <Heading size="md" color="gray.800">
                    Medidas Corporais (cm)
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    Medidas opcionais para acompanhamento
                  </Text>
                </Box>
              </Flex>

              <Stack gap={4}>
                {/* Primeira linha - Tronco */}
                <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Tórax
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.torax}
                      onChange={(e) => handleInputChange('torax', e.target.value)}
                      placeholder="cm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.torax ? 'red.300' : 'gray.200'}
                    />
                  </Box>

                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Cintura
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.cintura}
                      onChange={(e) => handleInputChange('cintura', e.target.value)}
                      placeholder="cm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.cintura ? 'red.300' : 'gray.200'}
                    />
                  </Box>

                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Quadril
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.quadril}
                      onChange={(e) => handleInputChange('quadril', e.target.value)}
                      placeholder="cm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.quadril ? 'red.300' : 'gray.200'}
                    />
                  </Box>

                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Abdômen
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.abdomen}
                      onChange={(e) => handleInputChange('abdomen', e.target.value)}
                      placeholder="cm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.abdomen ? 'red.300' : 'gray.200'}
                    />
                  </Box>
                </Flex>

                {/* Segunda linha - Braços */}
                <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Braço Direito
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.bracoDireito}
                      onChange={(e) => handleInputChange('bracoDireito', e.target.value)}
                      placeholder="cm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.bracoDireito ? 'red.300' : 'gray.200'}
                    />
                  </Box>

                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Braço Esquerdo
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.bracoEsquerdo}
                      onChange={(e) => handleInputChange('bracoEsquerdo', e.target.value)}
                      placeholder="cm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.bracoEsquerdo ? 'red.300' : 'gray.200'}
                    />
                  </Box>

                  <Box flex={2}></Box> {/* Espaço vazio */}
                </Flex>

                {/* Terceira linha - Pernas */}
                <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Coxa Direita
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.coxaDireita}
                      onChange={(e) => handleInputChange('coxaDireita', e.target.value)}
                      placeholder="cm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.coxaDireita ? 'red.300' : 'gray.200'}
                    />
                  </Box>

                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Coxa Esquerda
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.coxaEsquerda}
                      onChange={(e) => handleInputChange('coxaEsquerda', e.target.value)}
                      placeholder="cm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.coxaEsquerda ? 'red.300' : 'gray.200'}
                    />
                  </Box>

                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Panturrilha Direita
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.panturrilhaDireita}
                      onChange={(e) => handleInputChange('panturrilhaDireita', e.target.value)}
                      placeholder="cm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.panturrilhaDireita ? 'red.300' : 'gray.200'}
                    />
                  </Box>

                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Panturrilha Esquerda
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.panturrilhaEsquerda}
                      onChange={(e) => handleInputChange('panturrilhaEsquerda', e.target.value)}
                      placeholder="cm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.panturrilhaEsquerda ? 'red.300' : 'gray.200'}
                    />
                  </Box>
                </Flex>
              </Stack>
            </Box>

            <Separator />

            {/* Dobras Cutâneas */}
            <Box>
              <Flex align="center" gap={3} mb={4}>
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
                  <FiActivity size={20} />
                </Box>
                <Box>
                  <Heading size="md" color="gray.800">
                    Dobras Cutâneas (mm) *
                  </Heading>
                  <Text color="gray.600" fontSize="sm">
                    Protocolo Pollock 7 dobras - obrigatório para cálculo
                  </Text>
                </Box>
              </Flex>

              <Stack gap={4}>
                {/* Primeira linha */}
                <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Tríceps *
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.triceps}
                      onChange={(e) => handleInputChange('triceps', e.target.value)}
                      placeholder="mm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.triceps ? 'red.300' : 'gray.200'}
                    />
                    {errors.triceps && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.triceps}
                      </Text>
                    )}
                  </Box>

                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Subescapular *
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.subescapular}
                      onChange={(e) => handleInputChange('subescapular', e.target.value)}
                      placeholder="mm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.subescapular ? 'red.300' : 'gray.200'}
                    />
                    {errors.subescapular && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.subescapular}
                      </Text>
                    )}
                  </Box>

                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Bíceps *
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.biceps}
                      onChange={(e) => handleInputChange('biceps', e.target.value)}
                      placeholder="mm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.biceps ? 'red.300' : 'gray.200'}
                    />
                    {errors.biceps && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.biceps}
                      </Text>
                    )}
                  </Box>
                </Flex>

                {/* Segunda linha */}
                <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Axilar Média *
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.axilarMedia}
                      onChange={(e) => handleInputChange('axilarMedia', e.target.value)}
                      placeholder="mm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.axilarMedia ? 'red.300' : 'gray.200'}
                    />
                    {errors.axilarMedia && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.axilarMedia}
                      </Text>
                    )}
                  </Box>

                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Supra-ilíaca *
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.suprailiaca}
                      onChange={(e) => handleInputChange('suprailiaca', e.target.value)}
                      placeholder="mm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.suprailiaca ? 'red.300' : 'gray.200'}
                    />
                    {errors.suprailiaca && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.suprailiaca}
                      </Text>
                    )}
                  </Box>

                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Abdominal *
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.abdominal}
                      onChange={(e) => handleInputChange('abdominal', e.target.value)}
                      placeholder="mm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.abdominal ? 'red.300' : 'gray.200'}
                    />
                    {errors.abdominal && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.abdominal}
                      </Text>
                    )}
                  </Box>
                </Flex>

                {/* Terceira linha */}
                <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                  <Box flex={1}>
                    <Text color="gray.700" fontWeight="medium" mb={2}>
                      Coxa *
                    </Text>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.coxa}
                      onChange={(e) => handleInputChange('coxa', e.target.value)}
                      placeholder="mm"
                      size="lg"
                      bg="gray.50"
                      borderColor={errors.coxa ? 'red.300' : 'gray.200'}
                    />
                    {errors.coxa && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.coxa}
                      </Text>
                    )}
                  </Box>
                  <Box flex={2}></Box> {/* Espaço vazio */}
                </Flex>
              </Stack>
            </Box>

            {/* Resultados Calculados */}
            {resultados && (
              <>
                <Separator />
                <Box>
                  <Flex align="center" gap={3} mb={4}>
                    <Box
                      w={10}
                      h={10}
                      bg="orange.50"
                      borderRadius="lg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="orange.500"
                    >
                      <FiTarget size={20} />
                    </Box>
                    <Heading size="md" color="gray.800">
                      Resultados Calculados
                    </Heading>
                  </Flex>

                  <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
                    <Box flex={1}>
                      <Text color="gray.600" fontSize="sm">IMC</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {resultados.imc}
                      </Text>
                    </Box>
                    <Box flex={1}>
                      <Text color="gray.600" fontSize="sm">% Gordura</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                        {resultados.percentualGordura}%
                      </Text>
                    </Box>
                    <Box flex={1}>
                      <Text color="gray.600" fontSize="sm">Massa Magra</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {resultados.massaMagra} kg
                      </Text>
                    </Box>
                    <Box flex={1}>
                      <Text color="gray.600" fontSize="sm">Massa Gorda</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="red.600">
                        {resultados.massaGorda} kg
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </>
            )}

            <Separator />

            {/* Observações */}
            <Box>
              <Text color="gray.700" fontWeight="medium" mb={2}>
                Observações (opcional)
              </Text>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações sobre a avaliação..."
                size="lg"
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                rows={4}
              />
            </Box>

            {/* Botões */}
            <Flex
              direction={{ base: 'column', sm: 'row' }}
              gap={4}
              pt={4}
              justify="center"
            >
              <Button
                type="submit"
                colorScheme="green"
                size="lg"
                disabled={isLoading || !resultados}
                w={{ base: '100%', sm: 'auto' }}
                minW={{ sm: '200px' }}
              >
                <Flex align="center" gap={2}>
                  <FiSave size={16} />
                  {isLoading ? 'Salvando...' : 'Salvar Avaliação'}
                </Flex>
              </Button>

              <Button
                type="button"
                variant="outline"
                colorScheme="gray"
                size="lg"
                onClick={onBack}
                disabled={isLoading}
                w={{ base: '100%', sm: 'auto' }}
                minW={{ sm: '150px' }}
              >
                <Flex align="center" gap={2}>
                  <FiX size={16} />
                  Cancelar
                </Flex>
              </Button>
            </Flex>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default NovaAvaliacao;
