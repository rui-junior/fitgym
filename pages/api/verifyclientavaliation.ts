import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

const db = firebaseAdmin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método não permitido.' 
    });
  }

  const { cpf } = req.body;

  if (!cpf) {
    return res.status(400).json({
      success: false,
      error: 'CPF não informado.'
    });
  }

  try {
    // Validação e limpeza do CPF
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      return res.status(400).json({
        success: false,
        error: 'CPF deve ter 11 dígitos.'
      });
    }

    // console.log('[API] Buscando avaliações para CPF:', cpfLimpo);

    // Novo caminho: clientes/avaliacoes/{cpf}/{id}
    const avaliacoesRef = db
      .collection('clientes')
      .doc('avaliacoes')
      .collection(cpfLimpo);

    const snapshot = await avaliacoesRef
      .orderBy('atualizadoEm', 'desc') // mais recentes primeiro
      .get();

    if (snapshot.empty) {
      // console.log('[API] Nenhuma avaliação encontrada para CPF:', cpfLimpo);
      return res.status(200).json({
        success: true,
        message: 'Nenhuma avaliação encontrada',
        data: {
          avaliacoes: [],
          total: 0,
          ultimaAvaliacao: null
        }
      });
    }

    const avaliacoes = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        criadoEm: data.criadoEm?.toDate?.()?.toISOString() || null,
        atualizadoEm: data.atualizadoEm?.toDate?.()?.toISOString() || null,
      };
    });

    // console.log(`[API] ${avaliacoes.length} avaliações encontradas para CPF:`, cpfLimpo);

    return res.status(200).json({
      success: true,
      message: `${avaliacoes.length} avaliações encontradas`,
      data: {
        avaliacoes,
        total: avaliacoes.length,
        ultimaAvaliacao: avaliacoes[0]
      }
    });

  } catch (error: any) {
    // console.error('[API] Erro ao buscar avaliações:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}
