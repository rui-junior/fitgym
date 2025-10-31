import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

const db = firebaseAdmin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido. Use POST.'
    });
  }

  const { nome: nomeString, valor: valorString, periodo: periodoString } = req.body;


  const valor = parseFloat(valorString);
  const periodo = parseInt(periodoString, 10);
  const nome = nomeString;


  try {
    // Validar dados obrigatórios

    if (!nome || typeof nome !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Nome é obrigatório'
      });
    }

    // Corrigido: Validar se é um número válido após a conversão (usando isNaN)
    if (isNaN(periodo) || periodo <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Período deve ser um número inteiro positivo (dias).'
      });
    }

    // Corrigido: Validar se é um número válido após a conversão (usando isNaN)
    if (isNaN(valor) || valor <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor deve ser um número positivo.'
      });
    }

    // Criar novo plano no Firestore
    const planoData = {
      nome,
      periodo, // Agora é um number
      valor, // Agora é um number
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };

    const planoRef = await db
      .collection('admin')
      .doc('planos')
      .collection('items')
      .add(planoData);

    return res.status(201).json({
      success: true,
      message: 'Plano criado com sucesso',
      data: {
        id: planoRef.id,
        ...planoData
      }
    });

  } catch (error) {
    console.error('Erro ao criar plano:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}