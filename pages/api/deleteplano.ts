import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido. Use DELETE.'
    });
  }
  
  const db = firebaseAdmin.firestore();
  
  try {
    const { id } = req.body;

    // Validar ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'ID do plano é obrigatório'
      });
    }

    // Verificar se o plano existe
    const planoRef = db
      .collection('admin')
      .doc('planos')
      .collection('items')
      .doc(id);

    const planoDoc = await planoRef.get();

    if (!planoDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Plano não encontrado'
      });
    }

    // Deletar o plano
    await planoRef.delete();

    return res.status(200).json({
      success: true,
      message: 'Plano deletado com sucesso',
      data: { id }
    });

  } catch (error) {
    console.error('Erro ao deletar plano:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}
