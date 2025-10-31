// pages/api/verifyreceita.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

interface RequestBody {
  mesAno?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido. Use POST.',
    });
  }

  try {
    const db = firebaseAdmin.firestore();

    // Obter mês/ano do body ou usar o atual
    const { mesAno }: RequestBody = req.body;
    
    let mesAnoFormatado: string;
    
    if (mesAno && typeof mesAno === 'string') {
      // Converter formato mm/aaaa para mm-aaaa
      mesAnoFormatado = mesAno.replace('/', '-');
    } else {
      // Usar mês/ano atual se não fornecido
      const hoje = new Date();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ano = String(hoje.getFullYear());
      mesAnoFormatado = `${mes}-${ano}`;
    }

    // CAMINHO: admin/financas/receita/{mm-aaaa}/lancamentos
    const financasRef = db
      .collection('admin')
      .doc('financas')
      .collection('receita') // coleção 'receita'
      .doc(mesAnoFormatado) // documento para o mês/ano
      .collection('lancamentos'); // subcoleção para lançamentos do mês

    const snapshot = await financasRef.get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        message: 'Nenhuma finança encontrada para o período.',
        data: [],
      });
    }

    const financas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({
      success: true,
      data: financas,
    });

  } catch (error: any) {
    console.error('Erro ao buscar finanças:', error);

    let errorMessage = 'Erro interno do servidor.';
    let statusCode = 500;

    if (error.code === 'permission-denied') {
      errorMessage = 'Permissão negada para acessar dados.';
      statusCode = 403;
    } else if (error.code === 'unavailable') {
      errorMessage = 'Serviço temporariamente indisponível.';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: 'Erro ao buscar finanças.',
      error: errorMessage,
    });
  }
}
