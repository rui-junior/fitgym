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

  const {
    nome,
    mesAno,
    cpf,
    plano,
    valorPlano,
    periodoPlano,
    dataVencimento
  } = req.body;

  try {
    // Validações obrigatórias
    if (!nome) {
      return res.status(400).json({
        success: false,
        error: 'O campo nome é obrigatório.'
      });
    }

    if (!mesAno) {
      return res.status(400).json({
        success: false,
        error: 'O campo mesAno é obrigatório.'
      });
    }

    if (!plano) {
      return res.status(400).json({
        success: false,
        error: 'O campo plano é obrigatório.'
      });
    }

    if (!valorPlano) {
      return res.status(400).json({
        success: false,
        error: 'O campo valorPlano é obrigatório.'
      });
    }

    if (!dataVencimento) {
      return res.status(400).json({
        success: false,
        error: 'O campo dataVencimento é obrigatório.'
      });
    }

    // Converter MM/AAAA para MM-AAAA (substituir / por -)
    // Firestore não permite "/" em nomes de coleções
    const mesAnoFormatado = mesAno.replace(/\//g, '-');

    // Criar dados financeiros
    const financaData = {
      nome,
      cpf: cpf || null, // CPF é opcional
      plano,
      valorPlano,
      periodoPlano: periodoPlano || 30,
      dataVencimento,
      mesAno: mesAno, // Salvar o formato original também
      pago: false,
      dataPagamento: null,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };

    // Determinar o ID do documento
    // Se CPF fornecido, usar CPF como ID
    // Se não, gerar ID automático
    let docRef;

    if (cpf) {
      // Usar CPF como ID do documento
      docRef = db
        .collection('admin')
        .doc('financas')
        .collection('receita') // ← NOVO: Adiciona coleção 'receita'
        .doc(mesAnoFormatado) // documento para o mês/ano
        .collection('lancamentos') // subcoleção para lançamentos do mês
        .doc(cpf);

      await docRef.set(financaData);
    } else {
      // Gerar ID automático para lançamentos sem CPF
      docRef = db
        .collection('admin')
        .doc('financas')
        .collection('receita') // ← NOVO: Adiciona coleção 'receita'
        .doc(mesAnoFormatado) // documento para o mês/ano
        .collection('lancamentos') // subcoleção para lançamentos do mês

        .doc(); // Gera ID automático

      await docRef.set(financaData);
    }

    return res.status(201).json({
      success: true,
      message: 'Registro financeiro criado com sucesso',
      data: {
        id: docRef.id,
        ...financaData
      }
    });

  } catch (error) {
    console.error('Erro ao criar registro financeiro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

