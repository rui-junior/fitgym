// pages/api/atualizafinancas.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

interface RequestBody {
  id?: string; // ID do documento (opcional, usado para receitas não vinculadas a CPF)
  cpf: string;
  mesAno: string;
  dataPagamento: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Apenas aceitar método PUT ou PATCH
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido. Use PUT ou PATCH.',
    });
  }

  try {
    const { id, cpf, mesAno, dataPagamento }: RequestBody = req.body;

    if (!mesAno) {
      return res.status(400).json({
        success: false,
        message: 'O campo mesAno é obrigatório.',
      });
    }

    if (!dataPagamento) {
      return res.status(400).json({
        success: false,
        message: 'O campo dataPagamento é obrigatório.',
      });
    }

    // Obter instância do Firestore
    const db = firebaseAdmin.firestore();

    // Converter mesAno para formato MM-AAAA se necessário
    const mesAnoFormatado = mesAno.replace(/\//g, '-');

    // Referência do registro financeiro
    // Caminho: admin/financas/{MM-AAAA}/{CPF ou ID}
    // Se ID for fornecido, usa o ID; caso contrário, usa o CPF
    const documentId: any = cpf || id
    
    const financaRef = db
      .collection('admin')
      .doc('financas')
      .collection('receita') // ← NOVO: Adiciona coleção 'receita'
      .doc(mesAnoFormatado) // documento para o mês/ano
      .collection('lancamentos') // subcoleção para lançamentos do mês
      .doc(documentId);

    // Verificar se o registro existe
    // const financaDoc = await financaRef.get();

    // if (!financaDoc.exists) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'Registro financeiro não encontrado.',
    //   });
    // }

    // const financaData = financaDoc.data();
    // if (!financaData) {
    //   return res.status(500).json({
    //     success: false,
    //     message: 'Dados do registro financeiro inválidos.',
    //   });
    // }

    // Atualizar registro financeiro com dados de pagamento
    await financaRef.update({
      pago: true,
      dataPagamento: dataPagamento,
      atualizadoEm: new Date().toISOString(),
    });


    return res.status(200).json({
      success: true,
      message: 'Pagamento registrado com sucesso!',
      data: {
        documentId: documentId,
        mesAno: mesAnoFormatado,
        pago: true,
        dataPagamento: dataPagamento,
      },
    });

  } catch (error: any) {
    console.error('Erro ao atualizar finança:', error);

    // Tratamento de erros específicos do Firebase
    let errorMessage = 'Erro interno do servidor.';
    let statusCode = 500;
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Permissão negada para atualizar dados.';
      statusCode = 403;
    } else if (error.code === 'unavailable') {
      errorMessage = 'Serviço temporariamente indisponível.';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: 'Erro ao registrar pagamento.',
      error: errorMessage,
    });
  }
}
