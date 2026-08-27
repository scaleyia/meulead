export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      campanha_alvos: {
        Row: {
          campanha_id: string
          enviado_em: string | null
          id: string
          lead_id: string | null
          organizacao_id: string
          sessao_id: string | null
          status: string
          telefone: string | null
        }
        Insert: {
          campanha_id: string
          enviado_em?: string | null
          id?: string
          lead_id?: string | null
          organizacao_id: string
          sessao_id?: string | null
          status?: string
          telefone?: string | null
        }
        Update: {
          campanha_id?: string
          enviado_em?: string | null
          id?: string
          lead_id?: string | null
          organizacao_id?: string
          sessao_id?: string | null
          status?: string
          telefone?: string | null
        }
        Relationships: []
      }
      campanha_sessoes: {
        Row: {
          campanha_id: string
          id: string
          organizacao_id: string
          sessao_id: string
        }
        Insert: {
          campanha_id: string
          id?: string
          organizacao_id: string
          sessao_id: string
        }
        Update: {
          campanha_id?: string
          id?: string
          organizacao_id?: string
          sessao_id?: string
        }
        Relationships: []
      }
      campanhas: {
        Row: {
          agendada_para: string | null
          criado_em: string
          followup_dias: number | null
          followup_enviado: boolean
          followup_mensagem: string | null
          id: string
          intervalo_max: number
          intervalo_min: number
          limite_diario: number
          lista_id: string | null
          mensagem: string
          modo_envio: string
          nome: string
          organizacao_id: string
          status: string
        }
        Insert: {
          agendada_para?: string | null
          criado_em?: string
          followup_dias?: number | null
          followup_enviado?: boolean
          followup_mensagem?: string | null
          id?: string
          intervalo_max?: number
          intervalo_min?: number
          limite_diario?: number
          lista_id?: string | null
          mensagem?: string
          modo_envio?: string
          nome: string
          organizacao_id: string
          status?: string
        }
        Update: {
          agendada_para?: string | null
          criado_em?: string
          followup_dias?: number | null
          followup_enviado?: boolean
          followup_mensagem?: string | null
          id?: string
          intervalo_max?: number
          intervalo_min?: number
          limite_diario?: number
          lista_id?: string | null
          mensagem?: string
          modo_envio?: string
          nome?: string
          organizacao_id?: string
          status?: string
        }
        Relationships: []
      }
      contatos: {
        Row: {
          criado_em: string
          email: string | null
          id: string
          lead_id: string | null
          nome: string | null
          organizacao_id: string
          telefone: string | null
        }
        Insert: {
          criado_em?: string
          email?: string | null
          id?: string
          lead_id?: string | null
          nome?: string | null
          organizacao_id: string
          telefone?: string | null
        }
        Update: {
          criado_em?: string
          email?: string | null
          id?: string
          lead_id?: string | null
          nome?: string | null
          organizacao_id?: string
          telefone?: string | null
        }
        Relationships: []
      }
      jobs_apify: {
        Row: {
          apify_run_id: string | null
          criado_em: string
          erro: string | null
          id: string
          lista_id: string | null
          localizacao: string | null
          organizacao_id: string
          origem: string
          quantidade: number
          resultado_count: number
          status: string
          termo_busca: string | null
        }
        Insert: {
          apify_run_id?: string | null
          criado_em?: string
          erro?: string | null
          id?: string
          lista_id?: string | null
          localizacao?: string | null
          organizacao_id: string
          origem: string
          quantidade?: number
          resultado_count?: number
          status?: string
          termo_busca?: string | null
        }
        Update: {
          apify_run_id?: string | null
          criado_em?: string
          erro?: string | null
          id?: string
          lista_id?: string | null
          localizacao?: string | null
          organizacao_id?: string
          origem?: string
          quantidade?: number
          resultado_count?: number
          status?: string
          termo_busca?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          ads_run_google: string | null
          ads_run_meta: string | null
          anuncia_google: boolean | null
          anuncia_meta: boolean | null
          bio: string | null
          categoria: string | null
          criado_em: string
          dados_brutos: Json | null
          dono_buscado: boolean
          email: string | null
          empresa: string | null
          endereco: string | null
          foto_perfil: string | null
          id: string
          instagram: string | null
          lista_id: string | null
          nome: string | null
          nota: number | null
          organizacao_id: string
          origem: string
          posts: number | null
          seguidores: number | null
          site_analisado: boolean
          site_carga_ms: number | null
          site_score: number | null
          status_crm: string | null
          no_crm: boolean
          telefone: string | null
          tem_whatsapp: boolean | null
          total_avaliacoes: number | null
          verificado: boolean | null
          website: string | null
        }
        Insert: {
          ads_run_google?: string | null
          ads_run_meta?: string | null
          anuncia_google?: boolean | null
          anuncia_meta?: boolean | null
          bio?: string | null
          categoria?: string | null
          criado_em?: string
          dados_brutos?: Json | null
          dono_buscado?: boolean
          email?: string | null
          empresa?: string | null
          endereco?: string | null
          foto_perfil?: string | null
          id?: string
          instagram?: string | null
          lista_id?: string | null
          nome?: string | null
          nota?: number | null
          organizacao_id: string
          origem?: string
          posts?: number | null
          seguidores?: number | null
          site_analisado?: boolean
          site_carga_ms?: number | null
          site_score?: number | null
          status_crm?: string | null
          no_crm?: boolean
          telefone?: string | null
          tem_whatsapp?: boolean | null
          total_avaliacoes?: number | null
          verificado?: boolean | null
          website?: string | null
        }
        Update: {
          ads_run_google?: string | null
          ads_run_meta?: string | null
          anuncia_google?: boolean | null
          anuncia_meta?: boolean | null
          bio?: string | null
          categoria?: string | null
          criado_em?: string
          dados_brutos?: Json | null
          dono_buscado?: boolean
          email?: string | null
          empresa?: string | null
          endereco?: string | null
          foto_perfil?: string | null
          id?: string
          instagram?: string | null
          lista_id?: string | null
          nome?: string | null
          nota?: number | null
          organizacao_id?: string
          origem?: string
          posts?: number | null
          seguidores?: number | null
          site_analisado?: boolean
          site_carga_ms?: number | null
          site_score?: number | null
          status_crm?: string | null
          no_crm?: boolean
          telefone?: string | null
          tem_whatsapp?: boolean | null
          total_avaliacoes?: number | null
          verificado?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      listas: {
        Row: {
          cnae: string | null
          criado_em: string
          dono_processado: boolean
          dono_run_id: string | null
          id: string
          municipio_ibge: string | null
          nome: string
          organizacao_id: string
          origem: string | null
          uf: string | null
        }
        Insert: {
          cnae?: string | null
          criado_em?: string
          dono_processado?: boolean
          dono_run_id?: string | null
          id?: string
          municipio_ibge?: string | null
          nome: string
          organizacao_id: string
          origem?: string | null
          uf?: string | null
        }
        Update: {
          cnae?: string | null
          criado_em?: string
          dono_processado?: boolean
          dono_run_id?: string | null
          id?: string
          municipio_ibge?: string | null
          nome?: string
          organizacao_id?: string
          origem?: string | null
          uf?: string | null
        }
        Relationships: []
      }
      membros: {
        Row: {
          criado_em: string
          organizacao_id: string
          papel: string
          usuario_id: string
        }
        Insert: {
          criado_em?: string
          organizacao_id: string
          papel?: string
          usuario_id: string
        }
        Update: {
          criado_em?: string
          organizacao_id?: string
          papel?: string
          usuario_id?: string
        }
        Relationships: []
      }
      creditos_transacoes: {
        Row: {
          criado_em: string
          descricao: string | null
          id: string
          organizacao_id: string
          quantidade: number
          saldo_apos: number
          tipo: string
        }
        Insert: {
          criado_em?: string
          descricao?: string | null
          id?: string
          organizacao_id: string
          quantidade: number
          saldo_apos: number
          tipo: string
        }
        Update: {
          criado_em?: string
          descricao?: string | null
          id?: string
          organizacao_id?: string
          quantidade?: number
          saldo_apos?: number
          tipo?: string
        }
        Relationships: []
      }
      interessados: {
        Row: {
          criado_em: string
          email: string
          empresa: string | null
          estimativa: number | null
          id: string
          nome: string | null
          origem: string | null
          segmento: string | null
          telefone: string | null
          uf: string | null
        }
        Insert: {
          criado_em?: string
          email: string
          empresa?: string | null
          estimativa?: number | null
          id?: string
          nome?: string | null
          origem?: string | null
          segmento?: string | null
          telefone?: string | null
          uf?: string | null
        }
        Update: {
          criado_em?: string
          email?: string
          empresa?: string | null
          estimativa?: number | null
          id?: string
          nome?: string | null
          origem?: string | null
          segmento?: string | null
          telefone?: string | null
          uf?: string | null
        }
        Relationships: []
      }
      organizacoes: {
        Row: {
          creditos_extra: number
          creditos_plano: number
          creditos_renovam_em: string
          criado_em: string
          id: string
          nome: string
          plano: string
          stripe_customer_id: string | null
        }
        Insert: {
          creditos_extra?: number
          creditos_plano?: number
          creditos_renovam_em?: string
          criado_em?: string
          id?: string
          nome: string
          plano?: string
          stripe_customer_id?: string | null
        }
        Update: {
          creditos_extra?: number
          creditos_plano?: number
          creditos_renovam_em?: string
          criado_em?: string
          id?: string
          nome?: string
          plano?: string
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          creditos: number
          criado_em: string
          id: string
          organizacao_id: string
          plano: string | null
          status: string
          stripe_session_id: string
          tipo: string | null
          valor: number
        }
        Insert: {
          creditos?: number
          criado_em?: string
          id?: string
          organizacao_id: string
          plano?: string | null
          status?: string
          stripe_session_id: string
          tipo?: string | null
          valor?: number
        }
        Update: {
          creditos?: number
          criado_em?: string
          id?: string
          organizacao_id?: string
          plano?: string | null
          status?: string
          stripe_session_id?: string
          tipo?: string | null
          valor?: number
        }
        Relationships: []
      }
      sessoes_whatsapp: {
        Row: {
          aquecimento_ativo: boolean
          aquecimento_config: Json | null
          criado_em: string
          id: string
          instancia: string
          nome: string
          numero: string | null
          organizacao_id: string
          status: string
        }
        Insert: {
          aquecimento_ativo?: boolean
          aquecimento_config?: Json | null
          criado_em?: string
          id?: string
          instancia: string
          nome: string
          numero?: string | null
          organizacao_id: string
          status?: string
        }
        Update: {
          aquecimento_ativo?: boolean
          aquecimento_config?: Json | null
          criado_em?: string
          id?: string
          instancia?: string
          nome?: string
          numero?: string | null
          organizacao_id?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      organizacao_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
