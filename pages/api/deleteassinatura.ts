// pages/api/deleteassinatura.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

interface RequestBody {
  assinaturaId: string;
  mesAno: string;
}

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
    const { assinaturaId, mesAno }: RequestBody = req.body;

    // Validações
    if (!assinaturaId) {
      return res.status(400).json({
        success: false,
        message: 'O campo assinaturaId é obrigatório.',
      });
    }

    if (!mesAno) {
      return res.status(400).json({
        success: false,
        message: 'O campo mesAno é obrigatório.',
      });
    }

    // Obter instância do Firestore
    const db = firebaseAdmin.firestore();

    // Referência da assinatura
    const assinaturaRef = db
      .collection('admin')
      .doc('assinaturas')
      .collection(mesAno)
      .doc(assinaturaId);

    // Verificar se a assinatura existe
    const assinaturaDoc = await assinaturaRef.get();

    if (!assinaturaDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Assinatura não encontrada.',
      });
    }

    // Excluir assinatura
    await assinaturaRef.delete();

    console.log(`Assinatura ${assinaturaId} excluída com sucesso`);

    return res.status(200).json({
      success: true,
      message: 'Assinatura excluída com sucesso!',
    });

  } catch (error: any) {
    console.error('Erro ao excluir assinatura:', error);

    // Tratamento de erros específicos do Firebase
    let errorMessage = 'Erro interno do servidor.';
    let statusCode = 500;
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Permissão negada para excluir assinatura.';
      statusCode = 403;
    } else if (error.code === 'unavailable') {
      errorMessage = 'Serviço temporariamente indisponível.';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: 'Erro ao excluir assinatura.',
      error: errorMessage,
    });
  }
}

