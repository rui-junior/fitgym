// pages/api/processfinancas.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

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
    // Obter instância do Firestore
    const db = firebaseAdmin.firestore();

    // Obter mês e ano atuais
    const now = new Date();
    const mesAtual = now.getMonth() + 1; // Mês atual (1-12)
    const anoAtual = now.getFullYear();
    const mesAno = `${String(mesAtual).padStart(2, '0')}-${anoAtual}`; // Formato: mm-aaaa

    // Buscar todos os clientes ativos
    const clientesRef = db.collection('admin').doc('clientes').collection('clientes');
    const querySnapshot = await clientesRef.where('ativo', '==', true).get();

    if (querySnapshot.empty) {
      return res.status(200).json({
        success: true,
        message: 'Nenhum cliente ativo encontrado.',
        data: { processados: 0 },
      });
    }

    let processados = 0;
    const batch = db.batch();

    // Processar cada cliente
    for (const doc of querySnapshot.docs) {
      const cliente = doc.data();
      
      // Verificar se tem data de pagamento
      if (!cliente.dataPagamento) {
        continue;
      }

      // Calcular data de vencimento baseada na data de pagamento e período do plano
      const dataPagamento = new Date(cliente.dataPagamento);
      const periodoPlano = cliente.plano?.periodo || 0;
      
      if (periodoPlano === 0) {
        continue;
      }

      const dataVencimento = new Date(dataPagamento);
      dataVencimento.setMonth(dataVencimento.getMonth() + periodoPlano);

      // Verificar se vence no mês atual
      const mesVencimento = dataVencimento.getMonth() + 1;
      const anoVencimento = dataVencimento.getFullYear();

      if (mesVencimento === mesAtual && anoVencimento === anoAtual) {
        // Preparar dados para salvar em finanças
        const financaData = {
          cpf: cliente.cpf,
          nome: cliente.nome,
          plano: cliente.plano?.nome || '',
          valorPlano: cliente.plano?.valor || 0,
          periodoPlano: cliente.plano?.periodo || 0,
          dataVencimento: dataVencimento.toISOString().split('T')[0],
          mesAno: mesAno,
          criadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          atualizadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        };

        // Adicionar ao batch para salvar em admin/financas/{mm-aaaa}/{cpf}
        const financaRef = db
          .collection('admin')
          .doc('financas')
          .collection(mesAno)
          .doc(cliente.cpf);

        batch.set(financaRef, financaData, { merge: true });
        processados++;
      }
    }

    // Executar batch
    if (processados > 0) {
      await batch.commit();
    }

    return res.status(200).json({
      success: true,
      message: `${processados} cliente${processados !== 1 ? 's' : ''} processado${processados !== 1 ? 's' : ''} para o período ${mesAno}`,
      data: { processados, mesAno },
    });

  } catch (error: any) {
    console.error('Erro ao processar finanças:', error);

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
      message: 'Erro ao processar finanças.',
      error: errorMessage,
    });
  }
}

