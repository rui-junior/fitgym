// pages/api/verifyassinatura.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

interface Assinatura {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteCpf: string;
  planoId: string;
  planoNome: string;
  valorPlano: number;
  periodoPlano: number;
  dataInicio: string;
  dataFim: string;
  status: 'ativa' | 'pausada' | 'cancelada' | 'expirada';
  criadoEm: any;
  atualizadoEm: any;
}

interface RequestBody {
  mesAno?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: Assinatura[];
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
    // Obter mês/ano do body ou usar o atual
    const { mesAno }: RequestBody = req.body;
    
    let mesAnoFormatado: string;
    
    if (mesAno && typeof mesAno === 'string') {
      // Já está no formato mm-aaaa
      mesAnoFormatado = mesAno;
    } else {
      // Usar mês/ano atual se não fornecido
      const hoje = new Date();
      const mes = String(hoje.getMonth() + 1).padStart(2, '0');
      const ano = String(hoje.getFullYear());
      mesAnoFormatado = `${mes}-${ano}`;
    }

    // Obter instância do Firestore
    const db = firebaseAdmin.firestore();

    // Buscar assinaturas do mês/ano em admin/assinaturas/mm-aaaa
    const assinaturasRef = db
      .collection('admin')
      .doc('assinaturas')
      .collection(mesAnoFormatado);
    
    // Ordenar por data de criação (mais recentes primeiro)
    const querySnapshot = await assinaturasRef.orderBy('criadoEm', 'desc').get();

    if (querySnapshot.empty) {
      return res.status(200).json({
        success: true,
        message: `Nenhuma assinatura encontrada para ${mesAnoFormatado}.`,
        data: [],
      });
    }

    // Processar dados das assinaturas
    const assinaturas: Assinatura[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Validar se os campos obrigatórios existem
      if (data.clienteNome && data.planoNome) {
        assinaturas.push({
          id: doc.id,
          clienteId: data.clienteId || '',
          clienteNome: data.clienteNome,
          clienteCpf: data.clienteCpf || '',
          planoId: data.planoId || '',
          planoNome: data.planoNome,
          valorPlano: data.valorPlano || 0,
          periodoPlano: data.periodoPlano || 30,
          dataInicio: data.dataInicio || '',
          dataFim: data.dataFim || '',
          status: data.status || 'ativa',
          criadoEm: data.criadoEm,
          atualizadoEm: data.atualizadoEm,
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: `${assinaturas.length} assinatura${assinaturas.length !== 1 ? 's' : ''} encontrada${assinaturas.length !== 1 ? 's' : ''} para ${mesAnoFormatado}`,
      data: assinaturas,
    });

  } catch (error: any) {
    console.error('Erro ao buscar assinaturas:', error);

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
      message: 'Erro ao buscar assinaturas.',
      error: errorMessage,
    });
  }
}
