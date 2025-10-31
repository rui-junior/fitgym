import { NextApiRequest, NextApiResponse } from 'next';
import { firebaseAdmin } from '../../firebase/firebaseAdmin';

const auth = firebaseAdmin.auth();
const db = firebaseAdmin.firestore();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apenas métodos PUT são permitidos
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido. Use PUT.'
    });
  }


  try {
    const { cpf, tipo, uid, ...dadosAtualizacao } = req.body;

    // Validação do CPF
    if (!cpf || typeof cpf !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'CPF é obrigatório e deve ser uma string.'
      });
    }

    // Validação do tipo de operação
    if (!tipo || !['completa', 'status'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de operação deve ser "completa" ou "status".'
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

    // console.log(`[API] Iniciando ${tipo === 'completa' ? 'edição completa' : 'alteração de status'} para CPF:`, cpfLimpo);

    // Buscar o documento do cliente no Firestore
    const clienteRef = db.collection('admin').doc('clientes').collection('clientes').doc(cpfLimpo);
    const clienteDoc = await clienteRef.get();

    if (!clienteDoc.exists) {
      console.log('[API] Cliente não encontrado no Firestore');
      return res.status(404).json({
        success: false,
        message: 'Cliente não encontrado.'
      });
    }

    const clienteAtual = clienteDoc.data();
    console.log('[API] Cliente encontrado:', clienteAtual?.nome);

    // Verificar se o cliente tem UID para atualização dupla
    const clienteUid = clienteAtual?.uid;
    if (!clienteUid) {
      console.log('[API] Cliente não possui UID - apenas atualização em admin será realizada');
    }

    // Função para limpar valores undefined de um objeto
    const limparUndefined = (obj: any): any => {
      const objLimpo: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          objLimpo[key] = value;
        }
      }
      return objLimpo;
    };

    // Preparar dados para atualização baseado no tipo
    let dadosParaAtualizar: any = {
      atualizadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    };

    if (tipo === 'status') {
      // Alteração apenas do status
      if (typeof dadosAtualizacao.ativo !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Para alteração de status, o campo "ativo" deve ser um boolean.'
        });
      }

      dadosParaAtualizar.ativo = dadosAtualizacao.ativo;
      dadosParaAtualizar.status = dadosAtualizacao.ativo ? 'ativo' : 'inativo';

      console.log('[API] Alterando status para:', dadosAtualizacao.ativo ? 'ativo' : 'inativo');

    } else if (tipo === 'completa') {
      // Edição completa - validar campos obrigatórios
      const { nome, email, celular, dataNascimento, dataPagamento } = dadosAtualizacao;

      if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres.'
        });
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório e deve ter formato válido.'
        });
      }

      if (!celular || typeof celular !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Celular é obrigatório.'
        });
      }

      if (!dataPagamento || typeof dataPagamento !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'dataPagamento é obrigatório.'
        });
      }

      if (!dataNascimento || typeof dataNascimento !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Data de nascimento é obrigatória.'
        });
      }

      // Verificar se o email já existe em outro cliente (se mudou)
      if (email !== clienteAtual?.email) {
        const emailRef = db.collection('admin').doc('indices').collection('emails').doc(email);
        const emailDoc = await emailRef.get();

        if (emailDoc.exists && emailDoc.data()?.cpf !== cpfLimpo) {
          return res.status(400).json({
            success: false,
            message: 'Este email já está sendo usado por outro cliente.'
          });
        }
      }

      // Preparar dados para edição completa - apenas campos definidos
      dadosParaAtualizar = {
        ...dadosParaAtualizar,
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        celular: celular.trim(),
        dataNascimento: dataNascimento.trim(),
        dataPagamento: dataPagamento.trim(),
        // Manter campos que não devem ser alterados, mas apenas se não forem undefined
        cpf: clienteAtual?.cpf,
        uid: clienteAtual?.uid,
        criadoEm: clienteAtual?.criadoEm,
        ativo: clienteAtual?.ativo,
        status: clienteAtual?.status
      };

      // Adicionar plano apenas se existir e não for undefined
      // Atualizar plano se enviado no corpo da requisição
      if (dadosAtualizacao.plano && typeof dadosAtualizacao.plano === "object") {
        const { nome, valor, periodo } = dadosAtualizacao.plano;

        if (!nome || typeof nome !== "string") {
          return res.status(400).json({
            success: false,
            message: 'O campo plano.nome é obrigatório e deve ser uma string.'
          });
        }

        if (valor === undefined || typeof valor !== "number") {
          return res.status(400).json({
            success: false,
            message: 'O campo plano.valor é obrigatório e deve ser um número.'
          });
        }

        if (periodo === undefined || typeof periodo !== "number") {
          return res.status(400).json({
            success: false,
            message: 'O campo plano.periodo é obrigatório e deve ser um número (em dias ou meses).'
          });
        }

        dadosParaAtualizar.plano = {
          nome: nome.trim(),
          valor,
          periodo
        };
      } else {
        // Se não vier plano novo, manter o atual
        dadosParaAtualizar.plano = clienteAtual?.plano || null;
      }


      console.log('[API] Realizando edição completa dos dados');
    }

    // Limpar valores undefined antes de atualizar
    const dadosLimpos = limparUndefined(dadosParaAtualizar);

    // Atualizar documento no Firestore (admin/clientes/clientes/{cpf})
    await clienteRef.update(dadosLimpos);
    console.log('[API] Documento atualizado em admin/clientes/clientes/' + cpfLimpo);

    // Atualizar também em clientes/clientes/{uid} se o UID existir
    if (clienteUid) {
      try {
        const clienteUidRef = db.collection('clientes').doc('clientes').collection('clientes').doc(clienteUid);

        // Verificar se o documento existe antes de tentar atualizar
        const clienteUidDoc = await clienteUidRef.get();
        if (clienteUidDoc.exists) {
          await clienteUidRef.update(dadosLimpos);
          console.log('[API] Documento atualizado em clientes/clientes/' + clienteUid);
        } else {
          console.log('[API] Documento não existe em clientes/clientes/' + clienteUid + ' - criando novo documento');
          await clienteUidRef.set(dadosLimpos);
        }
      } catch (uidError) {
        console.error('[API] Erro ao atualizar documento por UID:', uidError);
        // Não falhar a operação principal, apenas logar o erro
      }
    }

    // Se foi edição completa e o email mudou, atualizar índice de emails
    if (tipo === 'completa' && dadosAtualizacao.email !== clienteAtual?.email) {
      // Remover índice antigo
      if (clienteAtual?.email) {
        const emailAntigoRef = db.collection('admin').doc('indices').collection('emails').doc(clienteAtual.email);
        await emailAntigoRef.delete();
        console.log('[API] Índice de email antigo removido');
      }

      // Criar novo índice
      const novoEmailRef = db.collection('admin').doc('indices').collection('emails').doc(dadosAtualizacao.email);
      await novoEmailRef.set({
        cpf: cpfLimpo,
        uid: clienteAtual?.uid,
        nome: dadosAtualizacao.nome,
        criadoEm: firebaseAdmin.firestore.FieldValue.serverTimestamp()
      });
      console.log('[API] Novo índice de email criado');
    }

    // Se foi edição completa, atualizar também no Firebase Authentication
    if (tipo === 'completa' && clienteAtual?.uid) {
      try {
        await auth.updateUser(clienteAtual.uid, {
          email: dadosAtualizacao.email,
          displayName: dadosAtualizacao.nome
        });
        console.log('[API] Usuário atualizado no Firebase Auth');
      } catch (authError) {
        console.error('[API] Erro ao atualizar Firebase Auth:', authError);
        // Não falhar a operação por erro no Auth, apenas logar
      }
    }

    // Buscar dados atualizados para retornar
    const clienteAtualizadoDoc = await clienteRef.get();
    const clienteAtualizado = clienteAtualizadoDoc.data();

    console.log(`[API] ${tipo === 'completa' ? 'Edição completa' : 'Alteração de status'} realizada com sucesso`);

    return res.status(200).json({
      success: true,
      message: tipo === 'completa'
        ? 'Cliente editado com sucesso!'
        : `Cliente ${dadosAtualizacao.ativo ? 'ativado' : 'desativado'} com sucesso!`,
      data: {
        ...clienteAtualizado,
        id: cpfLimpo
      }
    });

  } catch (error) {
    console.error('[API] Erro ao editar cliente:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao editar cliente.',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
