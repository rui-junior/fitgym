import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  Spinner,
  Alert,
} from "@chakra-ui/react";
import { Field } from "@chakra-ui/react/field";
import {
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { auth } from "../../firebase/firebase";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
  checkActionCode,
} from "firebase/auth";

export default function AuthAction() {
  const router = useRouter();
  const { mode, oobCode, continueUrl, lang } = router.query;

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Para reset de senha
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    if (!mode || !oobCode) {
      setError("Link inválido ou expirado.");
      setIsLoading(false);
      return;
    }

    handleAction();
  }, [router.isReady, mode, oobCode]);

  const handleAction = async () => {
    setIsLoading(true);
    setError("");

    try {
      switch (mode) {
        case "resetPassword":
          await handleResetPasswordVerification();
          break;
        case "verifyEmail":
          await handleVerifyEmail();
          break;
        case "recoverEmail":
          await handleRecoverEmail();
          break;
        default:
          setError("Ação não reconhecida.");
      }
    } catch (err: any) {
      console.error("Erro ao processar ação:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordVerification = async () => {
    try {
      const userEmail = await verifyPasswordResetCode(auth, oobCode as string);
      setEmail(userEmail);
    } catch (err: any) {
      throw err;
    }
  };

  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validações
    if (!newPassword) {
      setError("Por favor, digite uma nova senha.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setIsProcessing(true);

    try {
      await confirmPasswordReset(auth, oobCode as string, newPassword);
      setSuccess("Senha alterada com sucesso!");

      // Redirecionar após 3 segundos
      setTimeout(() => {
        if (continueUrl) {
          window.location.href = continueUrl as string;
        } else {
          router.push("/login");
        }
      }, 3000);
    } catch (err: any) {
      console.error("Erro ao confirmar nova senha:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await applyActionCode(auth, oobCode as string);
      setSuccess("Email verificado com sucesso!");

      setTimeout(() => {
        if (continueUrl) {
          window.location.href = continueUrl as string;
        } else {
          router.push("/login");
        }
      }, 3000);
    } catch (err: any) {
      throw err;
    }
  };

  const handleRecoverEmail = async () => {
    try {
      const info = await checkActionCode(auth, oobCode as string);
      const restoredEmail = info.data.email;

      await applyActionCode(auth, oobCode as string);
      setSuccess(`Email restaurado para: ${restoredEmail}`);

      setTimeout(() => {
        if (continueUrl) {
          window.location.href = continueUrl as string;
        } else {
          router.push("/login");
        }
      }, 3000);
    } catch (err: any) {
      throw err;
    }
  };

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case "auth/expired-action-code":
        return "Este link expirou. Solicite um novo link de redefinição de senha.";
      case "auth/invalid-action-code":
        return "Link inválido ou já utilizado.";
      case "auth/user-disabled":
        return "Esta conta foi desativada.";
      case "auth/user-not-found":
        return "Usuário não encontrado.";
      case "auth/weak-password":
        return "A senha é muito fraca. Use uma senha mais forte.";
      default:
        return "Ocorreu um erro. Tente novamente.";
    }
  };

  if (isLoading) {
    return (
      <Flex w="100vw" h="100vh" bg="gray.50" justify="center" align="center">
        <Flex direction="column" align="center" gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600" fontSize="lg">
            Verificando...
          </Text>
        </Flex>
      </Flex>
    );
  }

  if (error && !email) {
    return (
      <Flex w="100vw" h="100vh" bg="gray.50" justify="center" align="center">
        <Box
          bg="white"
          borderRadius="xl"
          shadow="lg"
          p={8}
          maxW="500px"
          w="90%"
        >
          <Flex direction="column" align="center" gap={4}>
            <Box bg="red.100" p={4} borderRadius="full">
              <FiAlertCircle size={48} color="#e53e3e" />
            </Box>
            <Heading size="lg" color="gray.800">
              Erro
            </Heading>
            <Text color="gray.600" textAlign="center">
              {error}
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => router.push("/login")}
              mt={4}
            >
              Voltar para Login
            </Button>
          </Flex>
        </Box>
      </Flex>
    );
  }

  if (success) {
    return (
      <Flex w="100vw" h="100vh" bg="gray.50" justify="center" align="center">
        <Box
          bg="white"
          borderRadius="xl"
          shadow="lg"
          p={8}
          maxW="500px"
          w="90%"
        >
          <Flex direction="column" align="center" gap={4}>
            <Box bg="green.100" p={4} borderRadius="full">
              <FiCheckCircle size={48} color="#38a169" />
            </Box>
            <Heading size="lg" color="gray.800">
              Sucesso!
            </Heading>
            <Text color="gray.600" textAlign="center">
              {success}
            </Text>
            <Text color="gray.500" fontSize="sm" textAlign="center">
              Redirecionando...
            </Text>
          </Flex>
        </Box>
      </Flex>
    );
  }

  // Formulário de Reset de Senha
  if (mode === "resetPassword" && email) {
    return (
      <Flex
        w="100vw"
        minH="100vh"
        bg="gray.50"
        justify="center"
        align="center"
        py={8}
      >
        <Box
          bg="white"
          borderRadius="xl"
          shadow="lg"
          p={8}
          maxW="500px"
          w="90%"
        >
          <Flex direction="column" align="center" gap={6}>
            {/* Logo/Ícone */}
            <Box bg="blue.100" p={4} borderRadius="full">
              <FiLock size={48} color="#3182ce" />
            </Box>

            {/* Título */}
            <Box textAlign="center">
              <Heading size="lg" color="gray.800" mb={2}>
                Redefinir Senha
              </Heading>
              <Text color="gray.600" fontSize="sm">
                para <strong>{email}</strong>
              </Text>
            </Box>

            {/* Erro */}
            {error && (
              <Box
                bg="red.50"
                border="1px"
                borderColor="red.200"
                borderRadius="lg"
                p={3}
                w="100%"
              >
                <Flex align="center" gap={2}>
                  <FiAlertCircle color="#e53e3e" />
                  <Text color="red.700" fontSize="sm">
                    {error}
                  </Text>
                </Flex>
              </Box>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmitNewPassword} style={{ width: "100%" }}>
              <Stack gap={4} w="100%">
                <Field.Root required>
                  <Field.Label>Nova Senha</Field.Label>
                  <Flex position="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      size="lg"
                      placeholder="Mínimo 6 caracteres"
                      bg="white"
                      borderColor="gray.300"
                      pr="50px"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px #3182ce",
                      }}
                      disabled={isProcessing}
                    />
                    <Button
                      type="button"
                      position="absolute"
                      right="2"
                      top="50%"
                      transform="translateY(-50%)"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isProcessing}
                    >
                      {showPassword ? (
                        <FiEyeOff size={20} />
                      ) : (
                        <FiEye size={20} />
                      )}
                    </Button>
                  </Flex>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Use uma senha forte com letras, números e símbolos
                  </Text>
                </Field.Root>

                <Field.Root required>
                  <Field.Label>Confirmar Nova Senha</Field.Label>
                  <Flex position="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      size="lg"
                      placeholder="Digite a senha novamente"
                      bg="white"
                      borderColor="gray.300"
                      pr="50px"
                      _hover={{ borderColor: "gray.400" }}
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px #3182ce",
                      }}
                      disabled={isProcessing}
                    />
                    <Button
                      type="button"
                      position="absolute"
                      right="2"
                      top="50%"
                      transform="translateY(-50%)"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={isProcessing}
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff size={20} />
                      ) : (
                        <FiEye size={20} />
                      )}
                    </Button>
                  </Flex>
                </Field.Root>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="100%"
                  mt={4}
                  loading={isProcessing}
                  loadingText="Salvando..."
                >
                  Redefinir Senha
                </Button>
              </Stack>
            </form>

            {/* Link de volta */}
            <Text color="gray.500" fontSize="sm" textAlign="center">
              Lembrou sua senha?{" "}
              <Button
                // variant="link"
                colorScheme="blue"
                size="sm"
                onClick={() => router.push("/login")}
              >
                Fazer login
              </Button>
            </Text>
          </Flex>
        </Box>
      </Flex>
    );
  }

  return null;
}
