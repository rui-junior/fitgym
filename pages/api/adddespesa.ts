// pages/api/adddespesa.ts
// API para adicionar uma nova despesa

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
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido. Use POST.',
    });
  }

  try {
    const { descricao, valor, dataVencimento, categoria } = req.body;

    // Validar campos obrigatórios
    if (!descricao) {
      return res.status(400).json({
        success: false,
        message: 'Descrição (tipo de despesa) é obrigatória.',
      });
    }

    if (!valor || isNaN(parseFloat(valor))) {
      return res.status(400).json({
        success: false,
        message: 'Valor é obrigatório e deve ser um número válido.',
      });
    }

    if (!dataVencimento) {
      return res.status(400).json({
        success: false,
        message: 'Data de vencimento é obrigatória.',
      });
    }

    // Extrair mês e ano da data de vencimento
    const dataVenc = new Date(dataVencimento);
    if (isNaN(dataVenc.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Data de vencimento inválida.',
      });
    }

    const mes = String(dataVenc.getMonth() + 1).padStart(2, '0');
    const ano = String(dataVenc.getFullYear());
    const mesAnoFormatado = `${mes}-${ano}`;
    const mesAnoDisplay = `${mes}/${ano}`;

    const db = firebaseAdmin.firestore();

    // CAMINHO: admin/financas/despesa/{mm-aaaa}/lancamentos
    const despesasRef = db
      .collection('admin')
      .doc('financas')
      .collection('despesa')
      .doc(mesAnoFormatado)
      .collection('lancamentos');

    // Criar nova despesa
    const novaDespesa = {
      descricao: descricao.trim(),
      valor: parseFloat(valor),
      dataVencimento: dataVencimento,
      categoria: categoria?.trim() || 'Geral',
      mesAno: mesAnoDisplay,
      pago: false,
      dataPagamento: null,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    // Adicionar ao Firestore
    const docRef = await despesasRef.add(novaDespesa);

    return res.status(201).json({
      success: true,
      message: 'Despesa adicionada com sucesso.',
      data: {
        id: docRef.id,
        ...novaDespesa,
      },
    });

  } catch (error: any) {
    console.error('Erro ao adicionar despesa:', error);

    let errorMessage = 'Erro interno do servidor.';
    let statusCode = 500;

    if (error.code === 'permission-denied') {
      errorMessage = 'Permissão negada para adicionar dados.';
      statusCode = 403;
    } else if (error.code === 'unavailable') {
      errorMessage = 'Serviço temporariamente indisponível.';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: 'Erro ao adicionar despesa.',
      error: errorMessage,
    });
  }
}
