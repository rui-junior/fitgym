import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Heading,
  Text,
  Stack,
  Separator,
} from "@chakra-ui/react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiCreditCard,
  FiSave,
  FiX,
} from "react-icons/fi";

interface FormData {
  nome: string;
  email: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  cpf?: string;
  celular?: string;
  dataNascimento?: string;
}

const AddClienteForm = () => {
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    cpf: "",
    celular: "",
    dataNascimento: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Validações
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, "");
    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cleanCPF[i]) * (10 - i);
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cleanCPF[i]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cleanCPF[10]);
  };

  const validateCelular = (celular: string) =>
    /^\(\d{2}\)\s9\d{4}-\d{4}$/.test(celular);

  const validateDataNascimento = (data: string) => {
    if (!data) return false;
    const today = new Date();
    const birth = new Date(data);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const adjustedAge =
      monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())
        ? age - 1
        : age;
    return adjustedAge >= 16 && adjustedAge <= 100;
  };

  const formatCPF = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  const formatCelular = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    else if (formData.nome.trim().length < 2)
      newErrors.nome = "Nome deve ter pelo menos 2 caracteres";
    if (!formData.email.trim()) newErrors.email = "Email é obrigatório";
    else if (!validateEmail(formData.email)) newErrors.email = "Email inválido";
    if (!formData.cpf.trim()) newErrors.cpf = "CPF é obrigatório";
    else if (!validateCPF(formData.cpf)) newErrors.cpf = "CPF inválido";
    if (!formData.celular.trim()) newErrors.celular = "Celular é obrigatório";
    else if (!validateCelular(formData.celular))
      newErrors.celular = "Celular inválido (ex: (11) 99999-9999)";
    if (!formData.dataNascimento)
      newErrors.dataNascimento = "Data de nascimento é obrigatória";
    else if (!validateDataNascimento(formData.dataNascimento))
      newErrors.dataNascimento = "Idade deve estar entre 16 e 100 anos";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    if (field === "cpf") formattedValue = formatCPF(value);
    else if (field === "celular") formattedValue = formatCelular(value);
    setFormData((prev) => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/createuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.message);
      setShowSuccess(true);
      setFormData({
        nome: "",
        email: "",
        cpf: "",
        celular: "",
        dataNascimento: "",
      });
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      nome: "",
      email: "",
      cpf: "",
      celular: "",
      dataNascimento: "",
    });
    setErrors({});
  };

  return (
    <Flex
      bg="white"
      p={{ base: 6, md: 8 }}
      direction="column"
      borderRadius="xl"
      shadow="sm"
      border="1px"
      borderColor="gray.200"
      maxW={{ base: "100%", sm: "500px", md: "700px" }}
    >
      <Flex align="center" gap={3} mb={6}>
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
          <FiUser size={24} />
        </Box>
        <Box>
          <Heading size="lg" color="gray.800">
            Adicionar Cliente
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Preencha os dados do novo cliente
          </Text>
        </Box>
      </Flex>

      <Separator mb={6} />

      {showSuccess && (
        <Box
          bg="green.50"
          border="1px"
          borderColor="green.200"
          borderRadius="lg"
          p={4}
          mb={6}
        >
          <Text color="green.700" fontWeight="medium">
            Cliente cadastrado com sucesso!
          </Text>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap={6}>
          {/* Nome */}
          <Box>
            <Text mb={2}>
              <Flex align="center" gap={2}>
                <FiUser size={16} /> Nome Completo
              </Flex>
            </Text>
            <Input
              value={formData.nome}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              placeholder="Digite o nome completo"
              size="lg"
              bg="gray.50"
            />
            {errors.nome && (
              <Text color="red.500" fontSize="sm">
                {errors.nome}
              </Text>
            )}
          </Box>

          {/* Email e CPF */}
          <Flex direction={{ base: "column", md: "row" }} gap={6}>
            <Box flex={1}>
              <Text mb={2}>
                <Flex align="center" gap={2}>
                  <FiMail size={16} /> Email
                </Flex>
              </Text>
              <Input
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Digite o email"
                size="lg"
                bg="gray.50"
              />
              {errors.email && (
                <Text color="red.500" fontSize="sm">
                  {errors.email}
                </Text>
              )}
            </Box>

            <Box flex={1}>
              <Text mb={2}>
                <Flex align="center" gap={2}>
                  <FiCreditCard size={16} /> CPF
                </Flex>
              </Text>
              <Input
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                placeholder="000.000.000-00"
                size="lg"
                bg="gray.50"
                maxLength={14}
              />
              {errors.cpf && (
                <Text color="red.500" fontSize="sm">
                  {errors.cpf}
                </Text>
              )}
            </Box>
          </Flex>

          {/* Celular e Data de Nascimento */}
          <Flex direction={{ base: "column", md: "row" }} gap={6}>
            <Box flex={1}>
              <Text mb={2}>
                <Flex align="center" gap={2}>
                  <FiPhone size={16} /> Celular
                </Flex>
              </Text>
              <Input
                value={formData.celular}
                onChange={(e) => handleInputChange("celular", e.target.value)}
                placeholder="(11) 99999-9999"
                size="lg"
                bg="gray.50"
                maxLength={15}
              />
              {errors.celular && (
                <Text color="red.500" fontSize="sm">
                  {errors.celular}
                </Text>
              )}
            </Box>

            <Box flex={1}>
              <Text mb={2}>
                <Flex align="center" gap={2}>
                  <FiCalendar size={16} /> Data de Nascimento
                </Flex>
              </Text>
              <Input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) =>
                  handleInputChange("dataNascimento", e.target.value)
                }
                size="lg"
                bg="gray.50"
              />
              {errors.dataNascimento && (
                <Text color="red.500" fontSize="sm">
                  {errors.dataNascimento}
                </Text>
              )}
            </Box>
          </Flex>

          <Separator variant="dashed" />

          <Flex direction={{ base: "column", sm: "row" }} gap={4} pt={4}>
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              disabled={isLoading}
            >
              <Flex align="center" gap={2}>
                <FiSave /> {isLoading ? "Salvando..." : "Salvar Cliente"}
              </Flex>
            </Button>

            <Button
              onClick={handleClear}
              type="button"
              variant="outline"
              size="lg"
              disabled={isLoading}
            >
              <Flex align="center" gap={2}>
                <FiX /> Limpar
              </Flex>
            </Button>
          </Flex>
        </Stack>
      </form>
    </Flex>
  );
};

export default AddClienteForm;
