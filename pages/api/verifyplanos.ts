// pages/api/verifyclient.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

interface Planos {
  id: string;
  nome: string;
  valor: number;
  periodo: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: Planos[];
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

    // Buscar todos os clientes na coleção admin/clientes/clientes
    const clientesRef = db.collection('admin').doc('planos').collection('items');
    
    // Ordenar por data de criação (mais recentes primeiro)
    const querySnapshot = await clientesRef.orderBy('criadoEm', 'desc').get();

    if (querySnapshot.empty) {
      return res.status(200).json({
        success: true,
        message: 'Nenhum cliente encontrado.',
        data: [],
      });
    }

    // Processar dados dos clientes
    const planos: Planos[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Validar se os campos obrigatórios existem
      if (data.nome) {
        planos.push({
          id: doc.id, 
          // uid: data.uid || '',
          nome: data.nome,
          valor: data.valor,
          periodo: data.periodo
        });
      }
    });


    return res.status(200).json({
      success: true,
      message: `${planos.length} plano${planos.length !== 1 ? 's' : ''} encontrado${planos.length !== 1 ? 's' : ''}`,
      data: planos,
    });

  } catch (error: any) {
    console.error('Erro ao buscar plano:', error);

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
      message: 'Erro ao buscar planos.',
      error: errorMessage,
    });
  }
}
