// pages/api/deletedespesa.ts
// API para excluir uma despesa específica

import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido. Use DELETE.',
    });
  }

  try {
    const { id, mesAno } = req.body;

    // Validar campos obrigatórios
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID da despesa é obrigatório.',
      });
    }

    if (!mesAno) {
      return res.status(400).json({
        success: false,
        message: 'Mês/Ano (mesAno) é obrigatório.',
      });
    }

    const db = firebaseAdmin.firestore();

    // Formatar mesAno para o padrão mm-aaaa
    const mesAnoFormatado = mesAno.replace('/', '-');

    // CAMINHO: admin/financas/despesa/{mm-aaaa}/lancamentos/{id}
    const despesaRef = db
      .collection('admin')
      .doc('financas')
      .collection('despesa')
      .doc(mesAnoFormatado)
      .collection('lancamentos')
      .doc(id);

    // Verificar se a despesa existe
    const despesaDoc = await despesaRef.get();

    if (!despesaDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Despesa não encontrada.',
      });
    }

    const despesaData = despesaDoc.data();

    // Deletar a despesa
    await despesaRef.delete();

    return res.status(200).json({
      success: true,
      message: 'Despesa excluída com sucesso.',
      data: {
        id: despesaDoc.id,
        ...despesaData
      },
    });

  } catch (error: any) {
    console.error('Erro ao excluir despesa:', error);

    let errorMessage = 'Erro interno do servidor.';
    let statusCode = 500;

    if (error.code === 'permission-denied') {
      errorMessage = 'Permissão negada para excluir dados.';
      statusCode = 403;
    } else if (error.code === 'unavailable') {
      errorMessage = 'Serviço temporariamente indisponível.';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: 'Erro ao excluir despesa.',
      error: errorMessage,
    });
  }
}
