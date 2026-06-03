// ============================================================
// MergeKit — Supabase generisani tipovi
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      merge_sessions: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          session_name: string;
          source_files: Json;
          merged_result: Json;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          session_name: string;
          source_files: Json;
          merged_result: Json;
          notes?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          session_name?: string;
          source_files?: Json;
          merged_result?: Json;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'merge_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      uploaded_files: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          filename: string;
          file_type: string;
          raw_content: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          filename: string;
          file_type: string;
          raw_content: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string | null;
          filename?: string;
          file_type?: string;
          raw_content?: string;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'uploaded_files_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'merge_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'uploaded_files_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      flavor_aliases: {
        Row: {
          id: string;
          canonical: string;
          aliases: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          canonical: string;
          aliases?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          canonical?: string;
          aliases?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
