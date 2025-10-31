// pages/api/getconfiguracoes.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

interface ConfiguracoesData {
  nomeEstabelecimento: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  descricao: string;
  atualizadoEm?: any;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: ConfiguracoesData;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Apenas aceitar método GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido. Use GET.',
    });
  }

  try {
    // Obter instância do Firestore
    const db = firebaseAdmin.firestore();

    // Buscar configurações em admin/documentos/configuracoes
    const configRef = db
      .collection('admin')
      .doc('configuracoes')
    //   .collection('configuracoes')
    //   .doc('dados');

    const configDoc = await configRef.get();

    if (!configDoc.exists) {
      // Se não existir, retornar dados vazios (primeira vez)
      return res.status(200).json({
        success: true,
        message: 'Nenhuma configuração encontrada. Configure pela primeira vez.',
        data: {
          nomeEstabelecimento: '',
          cnpj: '',
          email: '',
          telefone: '',
          endereco: '',
          cidade: '',
          estado: '',
          cep: '',
          descricao: '',
        },
      });
    }

    const data = configDoc.data() as ConfiguracoesData;

    return res.status(200).json({
      success: true,
      message: 'Configurações carregadas com sucesso.',
      data: data,
    });

  } catch (error: any) {
    console.error('Erro ao buscar configurações:', error);

    // Tratamento de erros específicos do Firebase
    let errorMessage = 'Erro interno do servidor.';
    let statusCode = 500;
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Permissão negada para acessar os dados.';
      statusCode = 403;
    } else if (error.code === 'unavailable') {
      errorMessage = 'Serviço temporariamente indisponível.';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: 'Erro ao buscar configurações.',
      error: errorMessage,
    });
  }
}
