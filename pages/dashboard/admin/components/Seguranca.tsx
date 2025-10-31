"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";

import { Field } from "@chakra-ui/react/field";

import { useState } from "react";
import { FiLock, FiMail, FiShield } from "react-icons/fi";
import { auth } from "../../../../firebase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

// Inline simple toaster fallback
type ToastOptions = {
  title?: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
};

const toaster = {
  create: (opts: ToastOptions) => {
    if (typeof window !== "undefined") {
      console.log("[toaster]", opts.type, opts.title, opts.description);
      alert(`${opts.type?.toUpperCase()}: ${opts.title}\n${opts.description}`);
    }
  },
};

function Toaster({
  toaster: _t,
  children,
}: {
  toaster?: typeof toaster;
  children?: any;
}) {
  return <>{children}</>;
}

export default function Seguranca() {
  const [email, setEmail] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    if (!email) {
      toaster.create({
        title: "Campo obrigatório",
        description: "Por favor, informe o email cadastrado.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toaster.create({
        title: "Email inválido",
        description: "Por favor, informe um email válido.",
        type: "warning",
        duration: 3000,
      });
      return;
    }

    setIsSending(true);

    try {
      // Enviar email de redefinição de senha
      await sendPasswordResetEmail(auth, email);

      toaster.create({
        title: "Email enviado!",
        description:
          "Verifique sua caixa de entrada. Enviamos um link para redefinir sua senha.",
        type: "success",
        duration: 7000,
      });

      // Limpar campo
      setEmail("");
    } catch (error: any) {
      console.error("Erro ao enviar email de redefinição:", error);

      let errorMessage = "Ocorreu um erro ao enviar o email.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "Nenhum usuário encontrado com este email.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
      }

      toaster.create({
        title: "Erro ao enviar email",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Toaster toaster={toaster}>{() => null}</Toaster>
      <Box w="100%" h="100%" p={{ base: 4, md: 6 }} bg="gray.50">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          gap={4}
          mb={8}
        >
          <Box>
            <Heading size="lg" color="gray.800" mb={2}>
              Segurança da Conta
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Gerencie a segurança e redefinição de senha
            </Text>
          </Box>
        </Flex>

        <Flex w={"100%"} h={"100%"} justify={"center"} align={"flex-start"}>
          <Box
            bg="white"
            borderRadius="xl"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
            w="100%"
            maxW="700px"
            p={{ base: 4, md: 8 }}
          >
            <Stack gap={8}>
              {/* Seção: Informações */}
              <Box>
                <Flex align="center" gap={2} mb={4}>
                  <FiShield size={24} color="#3182ce" />
                  <Heading size="md" color="gray.700">
                    Redefinição de Senha
                  </Heading>
                </Flex>

                <Box
                  bg="blue.50"
                  border="1px"
                  borderColor="blue.200"
                  borderRadius="lg"
                  p={4}
                  mb={6}
                >
                  <Flex align="flex-start" gap={3}>
                    <FiMail size={20} color="#3182ce" />
                    <Box>
                      <Text color="blue.800" fontWeight="medium" mb={2}>
                        Como funciona?
                      </Text>
                      <Text color="blue.700" fontSize="sm" lineHeight="1.6">
                        1. Digite o email cadastrado na sua conta
                        <br />
                        2. Clique em "Enviar Email de Redefinição"
                        <br />
                        3. Verifique sua caixa de entrada
                        <br />
                        4. Clique no link recebido por email
                        <br />
                        5. Defina sua nova senha na página do Firebase
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                <Text color="gray.600" fontSize="sm" mb={6}>
                  Por questões de segurança, a redefinição de senha é feita
                  através de um link enviado para o seu email. Este método
                  garante que apenas você, o proprietário da conta, possa
                  alterar a senha.
                </Text>
              </Box>

              {/* Formulário */}
              <form onSubmit={handleSendPasswordReset}>
                <Stack gap={6}>
                  <Box>
                    <Flex align="center" gap={2} mb={4}>
                      <FiLock size={20} color="#e53e3e" />
                      <Heading size="md" color="gray.700">
                        Solicitar Redefinição
                      </Heading>
                    </Flex>

                    <Field.Root required>
                      <Field.Label>Email da Conta</Field.Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        size="lg"
                        placeholder="seu@email.com"
                        bg="white"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px #3182ce",
                        }}
                        disabled={isSending}
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Digite o email que você usa para fazer login
                      </Text>
                    </Field.Root>
                  </Box>

                  {/* Botão Enviar */}
                  <Flex justify="flex-end" pt={4}>
                    <Button
                      type="submit"
                      colorScheme="red"
                      size="lg"
                      loading={isSending}
                      loadingText="Enviando email..."
                      minW="250px"
                    >
                      <Flex align="center" gap={2}>
                        <FiMail size={20} />
                        Enviar Email de Redefinição
                      </Flex>
                    </Button>
                  </Flex>
                </Stack>
              </form>

              {/* Aviso de Segurança */}
              <Box
                bg="yellow.50"
                border="1px"
                borderColor="yellow.200"
                borderRadius="lg"
                p={4}
              >
                <Flex align="flex-start" gap={3}>
                  <FiShield size={20} color="#d69e2e" />
                  <Box>
                    <Text color="yellow.800" fontWeight="medium" mb={2}>
                      Dica de Segurança
                    </Text>
                    <Text color="yellow.700" fontSize="sm" lineHeight="1.6">
                      • Nunca compartilhe o link de redefinição com ninguém
                      <br />
                      • O link expira após algumas horas
                      <br />
                      • Se não solicitou, ignore o email
                      <br />• Use uma senha forte com letras, números e
                      símbolos
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </Stack>
          </Box>
        </Flex>
      </Box>
    </>
  );
}
