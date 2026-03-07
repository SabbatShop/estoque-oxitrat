import { supabase } from '../supabaseClient';

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

export const estoqueService = {
  async getAll(): Promise<MateriaPrima[]> {
    const { data, error } = await supabase
      .from('estoque')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async add(item: Omit<MateriaPrima, 'id' | 'created_at'>): Promise<MateriaPrima> {
    const { data, error } = await supabase
      .from('estoque')
      .insert([item])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, item: Partial<MateriaPrima>): Promise<MateriaPrima> {
    const { data, error } = await supabase
      .from('estoque')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('estoque')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
};
