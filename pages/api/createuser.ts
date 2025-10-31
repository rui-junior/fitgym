// pages/api/createuser.ts

import { NextApiRequest, NextApiResponse } from "next";
import { firebaseAdmin } from "../../firebase/firebaseAdmin";

interface ClienteData {
  nome: string;
  email: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    uid: string;
    clienteId: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Método não permitido. Use POST.",
    });
  }

  try {
    const { nome, email, cpf, celular, dataNascimento }: ClienteData = req.body;

    if (!nome || !email || !cpf || !celular || !dataNascimento) {
      return res.status(400).json({
        success: false,
        message: "Todos os campos são obrigatórios.",
      });
    }

    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      return res.status(400).json({
        success: false,
        message: "CPF deve ter 11 dígitos numéricos.",
      });
    }

    const auth = firebaseAdmin.auth();
    const db = firebaseAdmin.firestore();
    const emailKey = email.toLowerCase().trim();

    // 🔹 Verificar se já existe usuário com este e-mail no Auth
    let existingUser = null;
    try {
      existingUser = await auth.getUserByEmail(emailKey);
      console.log("⚠️ E-mail já existe no Auth, usuário será recriado:", emailKey);
      await auth.deleteUser(existingUser.uid); // Deleta usuário antigo
    } catch (error: any) {
      if (error.code !== "auth/user-not-found") throw error;
    }

    // 🔹 Verificar se CPF já existe no Firestore
    const cpfExistente = await db
      .collection("clientes")
      .doc("clientes")
      .collection("clientes")
      .doc(cpfLimpo)
      .get();

    if (cpfExistente.exists) {
      return res.status(409).json({
        success: false,
        message: "CPF já está cadastrado no sistema.",
      });
    }

    // 🔹 Criar novo usuário no Firebase Auth
    const userRecord = await auth.createUser({
      email: emailKey,
      password: cpfLimpo,
      displayName: nome.trim(),
      disabled: false,
    });

    const clienteData = {
      uid: userRecord.uid,
      nome: nome.trim(),
      email: emailKey,
      cpf: cpfLimpo,
      celular: celular.trim(),
      dataNascimento,
      criadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      ativo: true,
    };

    // 🔹 Salvar dados em todas as coleções necessárias
    await Promise.all([
      db
        .collection("clientes")
        .doc("clientes")
        .collection("clientes")
        .doc(cpfLimpo)
        .set(clienteData),
      db
        .collection("indices")
        .doc("emails")
        .collection("emails")
        .doc(emailKey)
        .set({
          uid: userRecord.uid,
          cpf: cpfLimpo,
          nome: nome.trim(),
          criadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        }),
      db
        .collection("admin")
        .doc("clientes")
        .collection("clientes")
        .doc(cpfLimpo)
        .set(clienteData),
      db
        .collection("admin")
        .doc("indices")
        .collection("emails")
        .doc(emailKey)
        .set({
          cpf: cpfLimpo,
          uid: userRecord.uid,
          nome: nome.trim(),
          criadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        }),
    ]);

    await auth.setCustomUserClaims(userRecord.uid, {
      role: "cliente",
      cpf: cpfLimpo,
    });

    console.log(`✅ Cliente criado/recriado: ${nome} (${emailKey})`);

    return res.status(201).json({
      success: true,
      message: "Cliente cadastrado com sucesso!",
      data: { uid: userRecord.uid, clienteId: cpfLimpo },
    });
  } catch (error: any) {
    console.error("❌ Erro ao criar cliente:", error);

    let errorMessage = "Erro interno do servidor.";
    let statusCode = 500;

    switch (error.code) {
      case "auth/email-already-exists":
        errorMessage = "E-mail já está em uso.";
        statusCode = 409;
        break;
      case "auth/invalid-email":
        errorMessage = "E-mail inválido.";
        statusCode = 400;
        break;
      case "auth/weak-password":
      case "auth/invalid-password":
        errorMessage = "Senha inválida (CPF deve ter 11 dígitos).";
        statusCode = 400;
        break;
      default:
        if (error.message) errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: "Erro ao cadastrar cliente.",
      error: errorMessage,
    });
  }
}
