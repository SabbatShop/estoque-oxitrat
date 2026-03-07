export interface MateriaPrima {
  id: string;
  nome: string;
  massa: number;
  densidade: number;
  volume: number;
  preco: number;
  data_entrada: string;
  created_at?: string;
}

export interface Ingrediente {
  id_local: string;
  estoque_id: string;
  litros: number | '';
}

export interface ProdutoAcabado {
  id: string;
  codigo?: string;
  nome: string;
  massa_total: number;
  volume_total: number;
  densidade_final: number;
}

export interface Cliente {
  id: string;
  nome_empresa: string;
}

export interface Venda {
  id: string;
  created_at: string;
  quantidade_kg: number;
  valor_venda: number;
  clientes: { nome_empresa: string } | null;
  produtos_acabados: { nome: string } | null;
}
