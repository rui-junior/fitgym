import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

interface DobrasCutaneas {
  triceps: number;
  subescapular: number;
  biceps: number;
  axilarMedia: number;
  suprailiaca: number;
  abdominal: number;
  coxa: number;
}

interface MedidasCorporais {
  torax?: number | null;
  cintura?: number | null;
  quadril?: number | null;
  abdomen?: number | null;
  bracoDireito?: number | null;
  bracoEsquerdo?: number | null;
  coxaDireita?: number | null;
  coxaEsquerda?: number | null;
  panturrilhaDireita?: number | null;
  panturrilhaEsquerda?: number | null;
}

interface ResultadosAvaliacao {
  imc: number;
  percentualGordura: number;
  massaGorda: number;
  massaMagra: number;
}

interface RequestBody {
  cpf: string;
  peso: number;
  altura: number;
  sexo: 'masculino' | 'feminino';
  dobras: DobrasCutaneas;
  medidas: MedidasCorporais;
  resultados: ResultadosAvaliacao;
  observacoes?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {


  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }

  try {
    const {
      cpf,
      peso,
      altura,
      sexo,
      dobras,
      medidas,
      resultados,
      observacoes
    }: RequestBody = req.body;

    // Validação do CPF
    if (!cpf || typeof cpf !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'CPF é obrigatório e deve ser uma string.'
      });
    }

    // Limpar CPF (remover formatação)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      return res.status(400).json({
        success: false,
        message: 'CPF deve ter 11 dígitos.'
      });
    }

    const somaDobras = Object.values(dobras).reduce((sum, valor) => sum + valor, 0);

    const db = firebaseAdmin.firestore();

    const clientDataAvaliation = {
      cpf: cpfLimpo,
      peso,
      altura,
      sexo,
      dobras: {
        triceps: dobras.triceps,
        subescapular: dobras.subescapular,
        biceps: dobras.biceps,
        axilarMedia: dobras.axilarMedia,
        suprailiaca: dobras.suprailiaca,
        abdominal: dobras.abdominal,
        coxa: dobras.coxa,
        soma: somaDobras
      },
      medidas: {
        torax: medidas.torax || null,
        cintura: medidas.cintura || null,
        quadril: medidas.quadril || null,
        abdomen: medidas.abdomen || null,
        bracoDireito: medidas.bracoDireito || null,
        bracoEsquerdo: medidas.bracoEsquerdo || null,
        coxaDireita: medidas.coxaDireita || null,
        coxaEsquerda: medidas.coxaEsquerda || null,
        panturrilhaDireita: medidas.panturrilhaDireita || null,
        panturrilhaEsquerda: medidas.panturrilhaEsquerda || null
      },
      resultados: {
        imc: resultados.imc,
        percentualGordura: resultados.percentualGordura,
        massaGorda: resultados.massaGorda,
        massaMagra: resultados.massaMagra
      },
      observacoes: observacoes || '',
      criadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      atualizadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    };

    console.log('[API] Criando avaliação para CPF:', cpfLimpo);

    // Salvar no novo caminho: clientes/avaliacoes/{cpf}/iddaavaliação
    // O Firebase gerará automaticamente o ID da avaliação
    const avaliacaoRef = await db
      .collection('clientes')
      .doc('avaliacoes')
      .collection(cpfLimpo)
      .add(clientDataAvaliation);

    console.log('[API] Avaliação criada com ID:', avaliacaoRef.id);

    return res.status(201).json({
      success: true,
      message: 'Avaliação criada com sucesso',
      data: {
        avaliacaoId: avaliacaoRef.id,
        clienteCpf: cpfLimpo,
        resultados: clientDataAvaliation.resultados,
        criadoEm: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Erro ao criar avaliação:', error);

    let errorMessage = 'Erro interno do servidor.';
    let statusCode = 500;
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Permissão negada. Verifique as regras do Firestore.';
      statusCode = 403;
    } else if (error.code === 'not-found') {
      errorMessage = 'Documento não encontrado.';
      statusCode = 404;
    } else if (error.code === 'already-exists') {
      errorMessage = 'Avaliação já existe para este cliente.';
      statusCode = 409;
    } else if (error.code === 'invalid-argument') {
      errorMessage = 'Dados inválidos fornecidos.';
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(statusCode).json({
      success: false,
      message: 'Erro ao salvar avaliação.',
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
