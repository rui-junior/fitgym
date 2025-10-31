import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

const db = firebaseAdmin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método não permitido. Use DELETE.' 
    });
  }

  try {
    const { cpf, avaliacaoId } = req.body;

    // Validar dados obrigatórios
    if (!cpf || typeof cpf !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'CPF é obrigatório'
      });
    }

    if (!avaliacaoId || typeof avaliacaoId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ID da avaliação é obrigatório'
      });
    }

    // Referência da avaliação no Firestore
    const avaliacaoRef = db
      .collection('clientes')
      .doc('avaliacoes')
      .collection(cpf)
      .doc(avaliacaoId);

    // Verificar se a avaliação existe
    const avaliacaoDoc = await avaliacaoRef.get();
    
    if (!avaliacaoDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Avaliação não encontrada'
      });
    }

    // Deletar a avaliação
    await avaliacaoRef.delete();

    return res.status(200).json({
      success: true,
      message: 'Avaliação deletada com sucesso',
      data: {
        cpf,
        avaliacaoId,
        deletadoEm: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[API] Erro ao deletar avaliação:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}
