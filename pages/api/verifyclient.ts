// pages/api/verifyclient.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

interface Cliente {
  id: string; // CPF (ID do documento)
  uid: string;
  nome: string;
  email: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
  dataPagamento: string;
  criadoEm: any;
  atualizadoEm: any;
  ativo: boolean;
  plano: string;
  status: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: Cliente[];
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
    const clientesRef = db.collection('admin').doc('clientes').collection('clientes');
    
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
    const clientes: Cliente[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Validar se os campos obrigatórios existem
      if (data.nome && data.email && data.cpf) {
        clientes.push({
          id: doc.id, // CPF (ID do documento)
          uid: data.uid || '',
          nome: data.nome,
          email: data.email,
          cpf: data.cpf,
          celular: data.celular || '',
          dataNascimento: data.dataNascimento || '',
          dataPagamento: data.dataPagamento || '',
          criadoEm: data.criadoEm,
          atualizadoEm: data.atualizadoEm,
          ativo: data.ativo !== undefined ? data.ativo : true,
          plano: data.plano || 'básico',
          status: data.status || 'ativo',
        });
      }
    });

    // console.log(`Encontrados ${clientes.length} clientes no banco de dados`);

    return res.status(200).json({
      success: true,
      message: `${clientes.length} cliente${clientes.length !== 1 ? 's' : ''} encontrado${clientes.length !== 1 ? 's' : ''}`,
      data: clientes,
    });

  } catch (error: any) {
    console.error('Erro ao buscar clientes:', error);

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
      message: 'Erro ao buscar clientes.',
      error: errorMessage,
    });
  }
}
