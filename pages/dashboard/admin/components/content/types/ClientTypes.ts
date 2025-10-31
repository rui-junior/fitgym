// types/Cliente.ts
// Interface compartilhada para o tipo Cliente em todo o sistema

export interface Timestamp {
  _seconds: number;
  _nanoseconds: number;
}

export interface Plano {
  id: string;
  nome: string;
  periodo: number;
  valor: number;
}

export interface Cliente {
  id: string;
  uid: string;
  nome: string;
  email: string;
  cpf: string;
  celular: string;
  dataNascimento: string;
  dataPagamento: string;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
  ativo: boolean;
  plano: Plano;
  status: string;
}

// Interface para avaliações físicas
export interface Avaliacao {
  id: string;
  peso: number;
  altura: number;
  imc: number;
  percentualGordura: number;
  massaMagra: number;
  massaGorda: number;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

// Interface para dobras cutâneas
export interface DobrasCutaneas {
  triceps: number;
  subescapular: number;
  biceps: number;
  axilarMedia: number;
  suprailiaca: number;
  abdominal: number;
  coxa: number;
}

// Interface para resultados calculados
export interface ResultadosAvaliacao {
  imc: number;
  percentualGordura: number;
  massaGorda: number;
  massaMagra: number;
}

// Props para componentes de avaliação
export interface AvaliacoesClienteProps {
  cliente: Cliente;
  onBack: () => void;
  onNovaAvaliacao: (cliente: Cliente) => void;
}

export interface NovaAvaliacaoProps {
  cliente: Cliente;
  onBack: () => void;
  onAvaliacaoSalva: () => void;
}

export interface DetalhesClienteProps {
  cliente: Cliente;
  onBack: () => void;
  onEdit: (cliente: Cliente) => void;
  onHistorico: (cliente: Cliente) => void;
  onAvaliacoes: (cliente: Cliente) => void;
  onClienteAtualizado: (cliente: Cliente) => void;
}

export interface EditarClienteProps {
  cliente: Cliente;
  onBack: () => void;
  onClienteAtualizado: (cliente: Cliente) => void;
}

export interface HistoricoClienteProps {
  cliente: Cliente;
  onBack: () => void;
}

// Tipos para views de navegação
export type ViewType = 'lista' | 'detalhes' | 'editar' | 'historico' | 'avaliacoes' | 'nova-avaliacao';

// Tipos para formulários
export interface FormDataAvaliacao {
  peso: string;
  altura: string;
  sexo: 'masculino' | 'feminino' | '';
  triceps: string;
  subescapular: string;
  biceps: string;
  axilarMedia: string;
  suprailiaca: string;
  abdominal: string;
  coxa: string;
  observacoes: string;
}

export interface FormErrorsAvaliacao {
  peso?: string;
  altura?: string;
  sexo?: string;
  triceps?: string;
  subescapular?: string;
  biceps?: string;
  axilarMedia?: string;
  suprailiaca?: string;
  abdominal?: string;
  coxa?: string;
}

/**
 * INSTRUÇÕES DE USO:
 * 
 * 1. Importe as interfaces necessárias em cada componente:
 *    import { Cliente, AvaliacoesClienteProps } from '../types/Cliente';
 * 
 * 2. Use as interfaces consistentemente em todos os componentes:
 *    - ListaClientes.tsx
 *    - AvaliacoesCliente.tsx
 *    - NovaAvaliacao.tsx
 *    - DetalhesCliente.tsx
 *    - EditarCliente.tsx
 *    - HistoricoCliente.tsx
 * 
 * 3. Isso garante que todas as props sejam compatíveis e evita erros TypeScript
 * 
 * 4. Se precisar adicionar novas propriedades ao Cliente, faça apenas neste arquivo
 */
