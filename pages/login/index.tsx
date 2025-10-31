"use client";

import { useState } from "react";
import { useRouter } from "next/router";

import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  // InputRightElement,
  Link,
  Text,
} from "@chakra-ui/react";

// import { database } from "../../../firebase/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  getAuth,
  getIdToken,
  deleteUser,
  signOut,
} from "firebase/auth";

import { auth } from "../../firebase/firebase"; // Importando a configuração do Firebase
import { firebaseAdmin } from "../../firebase/firebaseAdmin";

import { setCookie } from "nookies";

// import "../../styles/Colors.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();



  const Login = async () => {
    if (!email || !password) {
      setTimeout(() => {
        setMessage("");
      }, 4000);

      setMessage("Complete corretamente os campos.");
      return;
    }

    // const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {

        const token = await userCredential.user.getIdToken();
        const tokenResult = await userCredential.user.getIdTokenResult(true);

        setCookie(null, "token", token, {
          // maxAge: 60,
          path: "/",
        });

        if(tokenResult.claims.admin){
          router.push("/dashboard/admin")
          return
        }

        router.push('/dashboard');
      })
      .catch((error) => {
        if (error.message == "Firebase: Error (auth/invalid-credential).") {
          setTimeout(() => {
            setError("");
            setEmail("");
            setPassword("");
          }, 4000);

          setError("Email ou Senha incorretos");
          return;
        }
        // error.message == "Firebase: Error (auth/invalid-credential)."
        //   ? setError("Email ou Senha incorretos")
        //   : setError("");
        // console.log(error.message);
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  };

  return (
    <Flex
      //   bg={"red"}
      w={["100vw"]}
      h={"100vh"}
      justifyContent={"center"}
      align={"center"}
    >
      <Flex
        // bg="blue"
        position={"absolute"}
        top={"10px"}
        left={"10px"}
        w={["150px"]}
      >
        <Link href="/">retorna</Link>
      </Flex>
      <Flex
        // bg="blue"
        w={["550px"]}
        h={["550px"]}
        justifyContent={"center"}
        align={"center"}
        flexDirection={"column"}
      >
        <Text fontSize="4xl" letterSpacing={"0.6rem"}>
          Login
        </Text>
        <Text fontSize="1xl">Seu acesso rápido e seguro</Text>

        {message != "" ? (
          <Flex
            w={"350px"}
            h={"80px"}
            // style={{ background:"var(--roxo1)"}}
            bg={"#ff5252"}
            // mt={"25px"}
            px={"25px"}
            py={"5px"}
            mt={"15px"}
            rounded={"3px"}
            justifyContent={"center"}
            align={"center"}
          >
            <Text fontSize={"sm"} color={"#fff"}>
              {message}
            </Text>
          </Flex>
        ) : (
          <></>
        )}

        {message == "" ? (
          <>
            <Flex
              mt="35px"
              w={"100%"}
              justifyContent={"center"}
              align={"center"}
              flexDirection={"column"}
              //   bg="red"
            >
              <Input
                type="email"
                placeholder="Email"
                w={["350px"]}
                bg="white"
                color="black"
                borderColor="gray.300"
                borderWidth="1px" // Borda mais fina
                fontSize="sm" // Tamanho da letra menor
                _focus={{
                  borderColor: "black", // Muda a cor da borda para preta ao focar
                  boxShadow: "0 0 0 1px black", // Adiciona uma sombra de borda preta
                }}
                _hover={{
                  borderColor: "gray.500", // Quando o mouse passa sobre o campo
                }}
                size="lg" // Tamanho do input
                borderRadius="md" // Bordas arredondadas
                p={4} // Padding do input
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </Flex>

            <Flex
              mt="15px"
              w={"100%"}
              justifyContent={"center"}
              align={"center"}
              flexDirection={"column"}
              //   bg="red"
            >
              <InputGroup width="350px">
                {/* Definindo a largura do input */}
                <Input
                  type="password"
                  placeholder="Senha"
                  bg="white"
                  color="black"
                  borderColor="gray.300"
                  borderWidth="1px" // Borda fina
                  fontSize="sm" // Tamanho da letra menor
                  _focus={{
                    borderColor: "black", // Muda a cor da borda para preta ao focar
                    boxShadow: "0 0 0 1px black", // Adiciona uma sombra de borda preta
                  }}
                  _hover={{
                    borderColor: "gray.500", // Quando o mouse passa sobre o campo
                  }}
                  size="lg" // Tamanho do input
                  borderRadius="md" // Bordas arredondadas
                  p={4} // Padding do input
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </InputGroup>

              {error != "" ? (
                <Flex
                  w={"350px"}
                  h={"50px"}
                  // style={{ background:"var(--roxo1)"}}
                  bg={"#ff5252"}
                  // mt={"25px"}
                  px={"25px"}
                  py={"5px"}
                  mt={"15px"}
                  rounded={"3px"}
                  justifyContent={"center"}
                  align={"center"}
                >
                  <Text fontSize={"sm"} color={"#fff"}>
                    {error}
                  </Text>
                </Flex>
              ) : (
                <></>
              )}

              <Link
                href="#"
                // color="blue.500"
                style={{ color: "var(--black" }}
                fontSize="sm"
                display="block" // Faz o link ocupar uma linha inteira
                textAlign="right" // Alinha o texto à direita
                _hover={{ textDecoration: "underline" }}
                mt={2} // Adiciona margem superior para separar do input
              >
                Esqueceu sua senha?
              </Link>
            </Flex>

            {error == "" ? (
              <>
                <Flex mt="20px">
                  <Button
                    w={"350px"}
                    h={"50px"}
                    bg="roxo1"
                    color={"white"}
                    onClick={Login}
                    // variant={"buttonFundoBranco"}
                  >
                    Login
                  </Button>
                </Flex>

                <Flex mt={2}>
                  <Text
                    // style={{ color: "var(--black" }}
                    fontSize="sm"
                    display="block" // Faz o link ocupar uma linha inteira
                    // textAlign="right" // Alinha o texto à direita
                    // _hover={{ textDecoration: "underline" }}
                  >
                    Não tem uma conta?{" "}
                    <Link
                      href="/register"
                      _hover={{ textDecoration: "underline" }}
                    >
                      Faça seu Cadastro!
                    </Link>
                  </Text>
                </Flex>
              </>
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}
      </Flex>
    </Flex>
  );
}

export async function getServerSideProps(context: any) {
  const token = context.req.cookies.token;

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

    return {
      redirect: {
        permanent: false,
        destination: "/dashboard",
      },
      props: {},
    };
  } catch (error: any) {
    if (error.code != undefined) {
      return { props: {} };
    }
  }
}
