// pages/api/saveconfiguracoes.ts

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
  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido. Use POST.',
    });
  }

  try {
    const configData: ConfiguracoesData = req.body;

    // Validações básicas
    if (!configData.nomeEstabelecimento) {
      return res.status(400).json({
        success: false,
        message: 'Nome do estabelecimento é obrigatório.',
      });
    }

    if (!configData.email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório.',
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(configData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido.',
      });
    }

    // Obter instância do Firestore
    const db = firebaseAdmin.firestore();

    // Referência ao documento de configurações em admin/configuracoes
    const configRef = db
      .collection('admin')
      .doc('configuracoes');

    // Preparar dados para salvar
    const dataToSave = {
      ...configData,
      atualizadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    };

    // Salvar ou atualizar configurações
    await configRef.set(dataToSave, { merge: true });

    return res.status(200).json({
      success: true,
      message: 'Configurações salvas com sucesso.',
    });

  } catch (error: any) {
    console.error('Erro ao salvar configurações:', error);

    // Tratamento de erros específicos do Firebase
    let errorMessage = 'Erro interno do servidor.';
    let statusCode = 500;
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Permissão negada para salvar os dados.';
      statusCode = 403;
    } else if (error.code === 'unavailable') {
      errorMessage = 'Serviço temporariamente indisponível.';
      statusCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: 'Erro ao salvar configurações.',
      error: errorMessage,
    });
  }
}
