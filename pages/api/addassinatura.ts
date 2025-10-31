// pages/api/addassinatura.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

interface AssinaturaData {
  clienteId: string;
  clienteNome: string;
  clienteCpf: string;
  planoId: string;
  planoNome: string;
  valorPlano: number;
  periodoPlano: number;
  dataInicio: string;
  dataFim: string;
  status: 'ativa' | 'pausada' | 'cancelada' | 'expirada';
  criadoEm: string;
  atualizadoEm: string;
}

interface RequestBody {
  mesAno: string;
  assinatura: AssinaturaData;
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
  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido. Use POST.',
    });
  }

  try {
    const { mesAno, assinatura }: RequestBody = req.body;

    // Validações
    if (!mesAno) {
      return res.status(400).json({
        success: false,
        message: 'O campo mesAno é obrigatório.',
      });
    }

    if (!assinatura) {
      return res.status(400).json({
        success: false,
        message: 'Os dados da assinatura são obrigatórios.',
      });
    }

    // Validar campos obrigatórios da assinatura
    const camposObrigatorios = [
      'clienteId',
      'clienteNome',
      'planoId',
      'planoNome',
      'valorPlano',
      'periodoPlano',
      'dataInicio',
      'dataFim',
    ];

    for (const campo of camposObrigatorios) {
      if (!assinatura[campo as keyof AssinaturaData]) {
        return res.status(400).json({
          success: false,
          message: `O campo ${campo} é obrigatório.`,
        });
      }
    }

    // Obter instância do Firestore
    const db = firebaseAdmin.firestore();

    // Verificar se já existe assinatura ativa para este cliente no mês
    const assinaturasRef = db
      .collection('admin')
      .doc('assinaturas')
      .collection(mesAno);

    const assinaturaExistente = await assinaturasRef
      .where('clienteId', '==', assinatura.clienteId)
      .where('status', '==', 'ativa')
      .get();

    if (!assinaturaExistente.empty) {
      return res.status(400).json({
        success: false,
        message: 'Cliente já possui uma assinatura ativa neste mês.',
      });
    }

    // Adicionar assinatura ao Firestore
    const novaAssinatura = await assinaturasRef.add({
      ...assinatura,
      criadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Assinatura criada com ID: ${novaAssinatura.id}`);

    return res.status(201).json({
      success: true,
      message: 'Assinatura criada com sucesso!',
      data: {
        id: novaAssinatura.id,
        ...assinatura,
      },
    });

  } catch (error: any) {
    console.error('Erro ao criar assinatura:', error);

    // Tratamento de erros específicos do Firebase
    let errorMessage = 'Erro interno do servidor.';
    let statusCode = 500;
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Permissão negada para criar assinatura.';
      statusCode = 403;
    } else if (error.code === 'unavailable') {
      errorMessage = 'Serviço temporariamente indisponível.';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: 'Erro ao criar assinatura.',
      error: errorMessage,
    });
  }
}
