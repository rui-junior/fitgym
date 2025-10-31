// pages/api/deleteuser.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Apenas aceitar método DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido. Use DELETE.',
    });
  }

  try {
    const { cpf } = req.body;

    // Validar se CPF foi fornecido
    if (!cpf) {
      return res.status(400).json({
        success: false,
        message: 'CPF é obrigatório.',
        error: 'Campo cpf não fornecido',
      });
    }

    // Validar formato do CPF (apenas números)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      return res.status(400).json({
        success: false,
        message: 'CPF deve ter 11 dígitos.',
        error: 'CPF inválido',
      });
    }

    // Obter instâncias do Firebase
    const auth = firebaseAdmin.auth();
    const db = firebaseAdmin.firestore();

    console.log(`🔍 Iniciando exclusão do cliente com CPF: ${cpfLimpo}`);

    // 1. Buscar dados do cliente no Firestore usando CPF como identificador
    const clienteRef = db
      .collection('clientes')
      .doc('clientes')
      .collection('clientes')
      .doc(cpfLimpo);
    
    const clienteDoc = await clienteRef.get();

    if (!clienteDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado.',
        error: 'Cliente não existe no banco de dados',
      });
    }

    const clienteData = clienteDoc.data();
    const uid = clienteData?.uid;
    const email = clienteData?.email;
    const nome = clienteData?.nome;

    console.log(`✅ Cliente encontrado: ${nome} (${email}) - UID: ${uid}`);

    // 2. Excluir usuário do Firebase Authentication (se existir UID)
    if (uid) {
      try {
        await auth.deleteUser(uid);
        console.log(`✅ Usuário ${uid} excluído do Firebase Auth`);
      } catch (authError: any) {
        console.warn(`⚠️ Erro ao excluir usuário do Auth (pode não existir): ${authError.message}`);
        // Continuar mesmo se não conseguir excluir do Auth
      }
    }

    // 3. Excluir documento do cliente em clientes/clientes/clientes/{cpf}
    await clienteRef.delete();
    console.log(`✅ Documento do cliente excluído (clientes/clientes/clientes/${cpfLimpo})`);

    // 4. Excluir documento em admin/clientes/clientes/{cpf}
    try {
      const adminClienteRef = db
        .collection('admin')
        .doc('clientes')
        .collection('clientes')
        .doc(cpfLimpo);
      
      await adminClienteRef.delete();
      console.log(`✅ Documento do cliente excluído (admin/clientes/clientes/${cpfLimpo})`);
    } catch (adminError: any) {
      console.warn(`⚠️ Erro ao excluir admin/clientes/clientes/${cpfLimpo}: ${adminError.message}`);
    }

    // 5. Excluir índices por email (se existir)
    if (email) {
      try {
        // Excluir índice em admin/indices/emails/{email}
        const adminEmailIndexRef = db
          .collection('admin')
          .doc('indices')
          .collection('emails')
          .doc(email.toLowerCase());
        
        await adminEmailIndexRef.delete();
        console.log(`✅ Índice por email excluído (admin/indices/emails/${email})`);

        // Excluir índice em indices/emails/emails/{email}
        const emailIndexRef = db
          .collection('indices')
          .doc('emails')
          .collection('emails')
          .doc(email.toLowerCase());
        
        await emailIndexRef.delete();
        console.log(`✅ Índice por email excluído (indices/emails/emails/${email})`);
      } catch (indexError: any) {
        console.warn(`⚠️ Erro ao excluir índices de email: ${indexError.message}`);
      }
    }

    console.log(`✅ Cliente "${nome}" (CPF: ${cpfLimpo}) foi excluído completamente do sistema`);

    return res.status(200).json({
      success: true,
      message: `Cliente "${nome}" foi excluído com sucesso.`,
    });

  } catch (error: any) {
    console.error('❌ Erro ao excluir cliente:', error);

    // Tratamento de erros específicos do Firebase
    let errorMessage = 'Erro interno do servidor.';
    let statusCode = 500;

    if (error.code === 'permission-denied') {
      errorMessage = 'Permissão negada para excluir dados.';
      statusCode = 403;
    } else if (error.code === 'unavailable') {
      errorMessage = 'Serviço temporariamente indisponível.';
      statusCode = 503;
    } else if (error.code === 'not-found') {
      errorMessage = 'Cliente não encontrado.';
      statusCode = 404;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: 'Erro ao excluir cliente.',
      error: errorMessage,
    });
  }
}

