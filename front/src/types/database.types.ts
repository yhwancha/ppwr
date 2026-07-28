export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  ppwr: {
    Tables: {
      AssessmentResult: {
        Row: {
          assessed_at: string
          created_at: string
          customer_role: string | null
          doc_td_status: string
          id: number
          minimization_status: string
          missing_evidence_count: number
          next_action: string | null
          product_id: number
          readiness_score: number | null
          recyclability_status: string
          result_data: Json | null
          risk_component_count: number
          risk_grade: string | null
          updated_at: string
        }
        Insert: {
          assessed_at?: string
          created_at?: string
          customer_role?: string | null
          doc_td_status?: string
          id?: number
          minimization_status?: string
          missing_evidence_count?: number
          next_action?: string | null
          product_id: number
          readiness_score?: number | null
          recyclability_status?: string
          result_data?: Json | null
          risk_component_count?: number
          risk_grade?: string | null
          updated_at?: string
        }
        Update: {
          assessed_at?: string
          created_at?: string
          customer_role?: string | null
          doc_td_status?: string
          id?: number
          minimization_status?: string
          missing_evidence_count?: number
          next_action?: string | null
          product_id?: number
          readiness_score?: number | null
          recyclability_status?: string
          result_data?: Json | null
          risk_component_count?: number
          risk_grade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "AssessmentResult_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      ComponentInstance: {
        Row: {
          component_id: number
          created_at: string
          id: number
          packaging_level: number | null
          packaging_set_id: number | null
          product_id: number
          quantity: number
          removable: boolean | null
          role: string | null
          total_weight: number | null
          updated_at: string
          weight_per_unit: number | null
        }
        Insert: {
          component_id: number
          created_at?: string
          id?: number
          packaging_level?: number | null
          packaging_set_id?: number | null
          product_id: number
          quantity?: number
          removable?: boolean | null
          role?: string | null
          total_weight?: number | null
          updated_at?: string
          weight_per_unit?: number | null
        }
        Update: {
          component_id?: number
          created_at?: string
          id?: number
          packaging_level?: number | null
          packaging_set_id?: number | null
          product_id?: number
          quantity?: number
          removable?: boolean | null
          role?: string | null
          total_weight?: number | null
          updated_at?: string
          weight_per_unit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ComponentInstance_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "ComponentMaster"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ComponentInstance_packaging_set_id_fkey"
            columns: ["packaging_set_id"]
            isOneToOne: false
            referencedRelation: "PackagingSet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ComponentInstance_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      ComponentMaster: {
        Row: {
          compostability_status: string
          created_at: string
          heavy_metal_status: string
          id: number
          material_summary: string | null
          name: string
          owner_user_id: number | null
          pfas_status: string
          recycled_content: number | null
          supplier_id: number | null
          type: string | null
          updated_at: string
        }
        Insert: {
          compostability_status?: string
          created_at?: string
          heavy_metal_status?: string
          id?: number
          material_summary?: string | null
          name: string
          owner_user_id?: number | null
          pfas_status?: string
          recycled_content?: number | null
          supplier_id?: number | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          compostability_status?: string
          created_at?: string
          heavy_metal_status?: string
          id?: number
          material_summary?: string | null
          name?: string
          owner_user_id?: number | null
          pfas_status?: string
          recycled_content?: number | null
          supplier_id?: number | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ComponentMaster_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "Supplier"
            referencedColumns: ["id"]
          },
        ]
      }
      ConsultationRequest: {
        Row: {
          assessment_id: number | null
          assigned_admin_id: number | null
          created_at: string
          id: number
          message: string | null
          owner_user_id: number
          preferred_datetime: string | null
          product_id: number | null
          request_type: string
          status: string
          updated_at: string
        }
        Insert: {
          assessment_id?: number | null
          assigned_admin_id?: number | null
          created_at?: string
          id?: number
          message?: string | null
          owner_user_id: number
          preferred_datetime?: string | null
          product_id?: number | null
          request_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          assessment_id?: number | null
          assigned_admin_id?: number | null
          created_at?: string
          id?: number
          message?: string | null
          owner_user_id?: number
          preferred_datetime?: string | null
          product_id?: number | null
          request_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ConsultationRequest_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "AssessmentResult"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ConsultationRequest_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      EvidenceDocument: {
        Row: {
          created_at: string
          document_type: string | null
          expiry_date: string | null
          file_name: string | null
          file_url: string | null
          id: number
          issue_date: string | null
          linked_entity_id: number | null
          linked_entity_type: string
          owner_user_id: number
          status: string
          supplier_id: number | null
          updated_at: string
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_type?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: number
          issue_date?: string | null
          linked_entity_id?: number | null
          linked_entity_type?: string
          owner_user_id: number
          status?: string
          supplier_id?: number | null
          updated_at?: string
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string | null
          expiry_date?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: number
          issue_date?: string | null
          linked_entity_id?: number | null
          linked_entity_type?: string
          owner_user_id?: number
          status?: string
          supplier_id?: number | null
          updated_at?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "EvidenceDocument_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "Supplier"
            referencedColumns: ["id"]
          },
        ]
      }
      ImprovementRequest: {
        Row: {
          assessment_id: number | null
          component_instance_id: number | null
          created_at: string
          id: number
          improvement_goal: string | null
          owner_user_id: number
          product_id: number | null
          restudio_project_id: number | null
          status: string
          target_description: string | null
          updated_at: string
        }
        Insert: {
          assessment_id?: number | null
          component_instance_id?: number | null
          created_at?: string
          id?: number
          improvement_goal?: string | null
          owner_user_id: number
          product_id?: number | null
          restudio_project_id?: number | null
          status?: string
          target_description?: string | null
          updated_at?: string
        }
        Update: {
          assessment_id?: number | null
          component_instance_id?: number | null
          created_at?: string
          id?: number
          improvement_goal?: string | null
          owner_user_id?: number
          product_id?: number | null
          restudio_project_id?: number | null
          status?: string
          target_description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ImprovementRequest_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "AssessmentResult"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ImprovementRequest_component_instance_id_fkey"
            columns: ["component_instance_id"]
            isOneToOne: false
            referencedRelation: "ComponentInstance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ImprovementRequest_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      Material: {
        Row: {
          coating: string | null
          colorant: string | null
          component_id: number
          created_at: string
          id: number
          layer_type: string | null
          material_name: string | null
          material_type: string | null
          recycled_content: number | null
          updated_at: string
        }
        Insert: {
          coating?: string | null
          colorant?: string | null
          component_id: number
          created_at?: string
          id?: number
          layer_type?: string | null
          material_name?: string | null
          material_type?: string | null
          recycled_content?: number | null
          updated_at?: string
        }
        Update: {
          coating?: string | null
          colorant?: string | null
          component_id?: number
          created_at?: string
          id?: number
          layer_type?: string | null
          material_name?: string | null
          material_type?: string | null
          recycled_content?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Material_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "ComponentMaster"
            referencedColumns: ["id"]
          },
        ]
      }
      Notification: {
        Row: {
          body: string | null
          created_at: string
          id: number
          is_read: boolean
          link_url: string | null
          read_at: string | null
          related_entity_id: number | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: number
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: number
          is_read?: boolean
          link_url?: string | null
          read_at?: string | null
          related_entity_id?: number | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id: number
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: number
          is_read?: boolean
          link_url?: string | null
          read_at?: string | null
          related_entity_id?: number | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: number
        }
        Relationships: []
      }
      PackagingSet: {
        Row: {
          created_at: string
          has_primary: boolean
          has_secondary: boolean
          has_tertiary: boolean
          id: number
          minimization_status: string
          packaging_to_product_ratio: number | null
          product_id: number
          recyclability_status: string
          total_packaging_weight: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          has_primary?: boolean
          has_secondary?: boolean
          has_tertiary?: boolean
          id?: number
          minimization_status?: string
          packaging_to_product_ratio?: number | null
          product_id: number
          recyclability_status?: string
          total_packaging_weight?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          has_primary?: boolean
          has_secondary?: boolean
          has_tertiary?: boolean
          id?: number
          minimization_status?: string
          packaging_to_product_ratio?: number | null
          product_id?: number
          recyclability_status?: string
          total_packaging_weight?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "PackagingSet_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      Product: {
        Row: {
          category: string | null
          contact_sensitive: boolean
          content_form: string | null
          created_at: string
          customer_role: string | null
          eu_annual_volume: number | null
          eu_launch_countries: string | null
          eu_launch_date: string | null
          eu_launch_note: string | null
          eu_market_status: string | null
          gross_depth: number | null
          gross_dim_unit: string | null
          gross_height: number | null
          gross_weight: number | null
          gross_weight_unit: string | null
          gross_width: number | null
          hs_code: string | null
          id: number
          identifier_no: string | null
          manufacturing_country: string | null
          memo: string | null
          model_name: string | null
          name: string
          name_ko: string | null
          net_depth: number | null
          net_dim_unit: string | null
          net_height: number | null
          net_weight: number | null
          net_weight_unit: string | null
          net_width: number | null
          owner_user_id: number
          sales_channel: string | null
          sku: string | null
          source: string
          status: string
          storage_condition: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          contact_sensitive?: boolean
          content_form?: string | null
          created_at?: string
          customer_role?: string | null
          eu_annual_volume?: number | null
          eu_launch_countries?: string | null
          eu_launch_date?: string | null
          eu_launch_note?: string | null
          eu_market_status?: string | null
          gross_depth?: number | null
          gross_dim_unit?: string | null
          gross_height?: number | null
          gross_weight?: number | null
          gross_weight_unit?: string | null
          gross_width?: number | null
          hs_code?: string | null
          id?: number
          identifier_no?: string | null
          manufacturing_country?: string | null
          memo?: string | null
          model_name?: string | null
          name: string
          name_ko?: string | null
          net_depth?: number | null
          net_dim_unit?: string | null
          net_height?: number | null
          net_weight?: number | null
          net_weight_unit?: string | null
          net_width?: number | null
          owner_user_id: number
          sales_channel?: string | null
          sku?: string | null
          source?: string
          status?: string
          storage_condition?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          contact_sensitive?: boolean
          content_form?: string | null
          created_at?: string
          customer_role?: string | null
          eu_annual_volume?: number | null
          eu_launch_countries?: string | null
          eu_launch_date?: string | null
          eu_launch_note?: string | null
          eu_market_status?: string | null
          gross_depth?: number | null
          gross_dim_unit?: string | null
          gross_height?: number | null
          gross_weight?: number | null
          gross_weight_unit?: string | null
          gross_width?: number | null
          hs_code?: string | null
          id?: number
          identifier_no?: string | null
          manufacturing_country?: string | null
          memo?: string | null
          model_name?: string | null
          name?: string
          name_ko?: string | null
          net_depth?: number | null
          net_dim_unit?: string | null
          net_height?: number | null
          net_weight?: number | null
          net_weight_unit?: string | null
          net_width?: number | null
          owner_user_id?: number
          sales_channel?: string | null
          sku?: string | null
          source?: string
          status?: string
          storage_condition?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      Report: {
        Row: {
          assessment_id: number | null
          content: Json | null
          created_at: string
          file_url: string | null
          id: number
          issued_at: string | null
          product_id: number
          report_type: string
          status: string
          updated_at: string
        }
        Insert: {
          assessment_id?: number | null
          content?: Json | null
          created_at?: string
          file_url?: string | null
          id?: number
          issued_at?: string | null
          product_id: number
          report_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          assessment_id?: number | null
          content?: Json | null
          created_at?: string
          file_url?: string | null
          id?: number
          issued_at?: string | null
          product_id?: number
          report_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Report_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "AssessmentResult"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Report_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "Product"
            referencedColumns: ["id"]
          },
        ]
      }
      Supplier: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          id: number
          name: string
          notes: string | null
          owner_user_id: number | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: number
          name: string
          notes?: string | null
          owner_user_id?: number | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          id?: number
          name?: string
          notes?: string | null
          owner_user_id?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_id: { Args: never; Returns: number }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      Ad: {
        Row: {
          ad_group_id: string
          ad_id: string
          ad_name: string
          ad_type: string
          created_at: string
          description: string | null
          destination_url: string
          headline: string | null
          image_url: string | null
          platform: string
          status: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          ad_group_id: string
          ad_id: string
          ad_name: string
          ad_type: string
          created_at: string
          description?: string | null
          destination_url: string
          headline?: string | null
          image_url?: string | null
          platform: string
          status: string
          updated_at: string
          video_url?: string | null
        }
        Update: {
          ad_group_id?: string
          ad_id?: string
          ad_name?: string
          ad_type?: string
          created_at?: string
          description?: string | null
          destination_url?: string
          headline?: string | null
          image_url?: string | null
          platform?: string
          status?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_ad_group_id_fkey"
            columns: ["ad_group_id"]
            isOneToOne: false
            referencedRelation: "AdGroup"
            referencedColumns: ["ad_group_id"]
          },
        ]
      }
      AdAccount: {
        Row: {
          account_id: string
          account_name: string
          created_at: string
          currency: string
          is_active: boolean
          platform: string
          timezone: string
        }
        Insert: {
          account_id: string
          account_name: string
          created_at?: string
          currency: string
          is_active?: boolean
          platform: string
          timezone: string
        }
        Update: {
          account_id?: string
          account_name?: string
          created_at?: string
          currency?: string
          is_active?: boolean
          platform?: string
          timezone?: string
        }
        Relationships: []
      }
      AdCampaign: {
        Row: {
          account_id: string
          budget_daily: number | null
          budget_total: number | null
          campaign_id: string
          campaign_name: string
          campaign_type: string | null
          created_at: string
          end_date: string | null
          objective: string | null
          platform: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          budget_daily?: number | null
          budget_total?: number | null
          campaign_id: string
          campaign_name: string
          campaign_type?: string | null
          created_at: string
          end_date?: string | null
          objective?: string | null
          platform: string
          start_date: string
          status: string
          updated_at: string
        }
        Update: {
          account_id?: string
          budget_daily?: number | null
          budget_total?: number | null
          campaign_id?: string
          campaign_name?: string
          campaign_type?: string | null
          created_at?: string
          end_date?: string | null
          objective?: string | null
          platform?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaigns_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "AdAccount"
            referencedColumns: ["account_id"]
          },
        ]
      }
      AdClick: {
        Row: {
          ad_group_id: string | null
          campaign_id: string | null
          click_id: string
          click_platform: string
          click_time: string
          creative_id: string | null
          session_id: string
        }
        Insert: {
          ad_group_id?: string | null
          campaign_id?: string | null
          click_id: string
          click_platform: string
          click_time: string
          creative_id?: string | null
          session_id: string
        }
        Update: {
          ad_group_id?: string | null
          campaign_id?: string | null
          click_id?: string
          click_platform?: string
          click_time?: string
          creative_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_clicks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "TrackingSession"
            referencedColumns: ["session_id"]
          },
        ]
      }
      AdConversionMetric: {
        Row: {
          ad_id: string
          campaign_id: string
          conversion_name: string
          conversion_value: number | null
          conversions: number
          date: string
          id: number
          platform: string
        }
        Insert: {
          ad_id: string
          campaign_id: string
          conversion_name: string
          conversion_value?: number | null
          conversions?: number
          date: string
          id?: number
          platform: string
        }
        Update: {
          ad_id?: string
          campaign_id?: string
          conversion_name?: string
          conversion_value?: number | null
          conversions?: number
          date?: string
          id?: number
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_conversion_metrics_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "Ad"
            referencedColumns: ["ad_id"]
          },
        ]
      }
      AdDailyMetric: {
        Row: {
          ad_group_id: string
          ad_id: string
          campaign_id: string
          clicks: number
          cost: number
          cpc: number | null
          cpm: number | null
          ctr: number | null
          date: string
          frequency: number | null
          id: number
          impressions: number
          platform: string
          reach: number | null
        }
        Insert: {
          ad_group_id: string
          ad_id: string
          campaign_id: string
          clicks?: number
          cost?: number
          cpc?: number | null
          cpm?: number | null
          ctr?: number | null
          date: string
          frequency?: number | null
          id?: number
          impressions?: number
          platform: string
          reach?: number | null
        }
        Update: {
          ad_group_id?: string
          ad_id?: string
          campaign_id?: string
          clicks?: number
          cost?: number
          cpc?: number | null
          cpm?: number | null
          ctr?: number | null
          date?: string
          frequency?: number | null
          id?: number
          impressions?: number
          platform?: string
          reach?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_daily_metrics_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "Ad"
            referencedColumns: ["ad_id"]
          },
        ]
      }
      AdEngagementMetric: {
        Row: {
          ad_id: string
          campaign_id: string
          comments: number | null
          date: string
          id: number
          likes: number | null
          platform: string
          saves: number | null
          shares: number | null
          video_avg_watch_sec: number | null
          video_views: number | null
          video_views_100: number | null
          video_views_25: number | null
          video_views_50: number | null
          video_views_75: number | null
        }
        Insert: {
          ad_id: string
          campaign_id: string
          comments?: number | null
          date: string
          id?: number
          likes?: number | null
          platform: string
          saves?: number | null
          shares?: number | null
          video_avg_watch_sec?: number | null
          video_views?: number | null
          video_views_100?: number | null
          video_views_25?: number | null
          video_views_50?: number | null
          video_views_75?: number | null
        }
        Update: {
          ad_id?: string
          campaign_id?: string
          comments?: number | null
          date?: string
          id?: number
          likes?: number | null
          platform?: string
          saves?: number | null
          shares?: number | null
          video_avg_watch_sec?: number | null
          video_views?: number | null
          video_views_100?: number | null
          video_views_25?: number | null
          video_views_50?: number | null
          video_views_75?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_engagement_metrics_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "Ad"
            referencedColumns: ["ad_id"]
          },
        ]
      }
      AdGroup: {
        Row: {
          ad_group_id: string
          ad_group_name: string
          bid_amount: number | null
          bid_strategy: string | null
          campaign_id: string
          created_at: string
          platform: string
          status: string
          targeting_type: string | null
          updated_at: string
        }
        Insert: {
          ad_group_id: string
          ad_group_name: string
          bid_amount?: number | null
          bid_strategy?: string | null
          campaign_id: string
          created_at: string
          platform: string
          status: string
          targeting_type?: string | null
          updated_at: string
        }
        Update: {
          ad_group_id?: string
          ad_group_name?: string
          bid_amount?: number | null
          bid_strategy?: string | null
          campaign_id?: string
          created_at?: string
          platform?: string
          status?: string
          targeting_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_groups_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "AdCampaign"
            referencedColumns: ["campaign_id"]
          },
        ]
      }
      AdHourlyMetric: {
        Row: {
          ad_id: string
          campaign_id: string
          clicks: number
          cost: number
          date: string
          hour: number
          id: number
          impressions: number
          platform: string
        }
        Insert: {
          ad_id: string
          campaign_id: string
          clicks?: number
          cost?: number
          date: string
          hour: number
          id?: number
          impressions?: number
          platform: string
        }
        Update: {
          ad_id?: string
          campaign_id?: string
          clicks?: number
          cost?: number
          date?: string
          hour?: number
          id?: number
          impressions?: number
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_hourly_metrics_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "Ad"
            referencedColumns: ["ad_id"]
          },
        ]
      }
      AdminInvitation: {
        Row: {
          accepted_at: string | null
          assigned_role: Database["public"]["Enums"]["UserRole"]
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          created_user_id: number | null
          deleted_at: string | null
          email_sent_count: number | null
          expires_at: string
          id: number
          invitation_token: string
          invited_by: number | null
          invited_by_name: string | null
          invited_department: string | null
          invited_email: string
          invited_name: string | null
          invited_phone: string | null
          invited_role: string | null
          last_email_sent_at: string | null
          permission_group_id: number | null
          status: Database["public"]["Enums"]["InvitationStatus"]
          token: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_role: Database["public"]["Enums"]["UserRole"]
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_user_id?: number | null
          deleted_at?: string | null
          email_sent_count?: number | null
          expires_at: string
          id?: never
          invitation_token: string
          invited_by?: number | null
          invited_by_name?: string | null
          invited_department?: string | null
          invited_email: string
          invited_name?: string | null
          invited_phone?: string | null
          invited_role?: string | null
          last_email_sent_at?: string | null
          permission_group_id?: number | null
          status: Database["public"]["Enums"]["InvitationStatus"]
          token?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          assigned_role?: Database["public"]["Enums"]["UserRole"]
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_user_id?: number | null
          deleted_at?: string | null
          email_sent_count?: number | null
          expires_at?: string
          id?: never
          invitation_token?: string
          invited_by?: number | null
          invited_by_name?: string | null
          invited_department?: string | null
          invited_email?: string
          invited_name?: string | null
          invited_phone?: string | null
          invited_role?: string | null
          last_email_sent_at?: string | null
          permission_group_id?: number | null
          status?: Database["public"]["Enums"]["InvitationStatus"]
          token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "AdminInvitation_created_user_id_fkey"
            columns: ["created_user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AdminInvitation_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "AdminProfile"
            referencedColumns: ["id"]
          },
        ]
      }
      AdminNotification: {
        Row: {
          created_at: string | null
          flow_project_id: string | null
          id: number
          message: string
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string | null
          flow_project_id?: string | null
          id?: never
          message: string
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string | null
          flow_project_id?: string | null
          id?: never
          message?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      AdminNotificationRead: {
        Row: {
          admin_id: number | null
          id: number
          is_read: boolean | null
          notification_id: number | null
          read_at: string | null
        }
        Insert: {
          admin_id?: number | null
          id?: never
          is_read?: boolean | null
          notification_id?: number | null
          read_at?: string | null
        }
        Update: {
          admin_id?: number | null
          id?: never
          is_read?: boolean | null
          notification_id?: number | null
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AdminNotificationRead_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "AdminProfile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AdminNotificationRead_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "AdminNotification"
            referencedColumns: ["id"]
          },
        ]
      }
      AdminProfile: {
        Row: {
          assigned_role: Database["public"]["Enums"]["UserRole"] | null
          auth_id: string
          company_department: string | null
          company_role: string | null
          email: string
          id: number
          invite_cancel_date: string | null
          invited_date: string | null
          is_active: boolean
          name: string | null
          permission_group_id: number | null
          phone: string | null
        }
        Insert: {
          assigned_role?: Database["public"]["Enums"]["UserRole"] | null
          auth_id: string
          company_department?: string | null
          company_role?: string | null
          email: string
          id?: never
          invite_cancel_date?: string | null
          invited_date?: string | null
          is_active?: boolean
          name?: string | null
          permission_group_id?: number | null
          phone?: string | null
        }
        Update: {
          assigned_role?: Database["public"]["Enums"]["UserRole"] | null
          auth_id?: string
          company_department?: string | null
          company_role?: string | null
          email?: string
          id?: never
          invite_cancel_date?: string | null
          invited_date?: string | null
          is_active?: boolean
          name?: string | null
          permission_group_id?: number | null
          phone?: string | null
        }
        Relationships: []
      }
      AdSyncConfig: {
        Row: {
          account_id: string
          data_start_date: string
          error_message: string | null
          failure_count: number
          is_active: boolean
          last_sync_at: string | null
          last_sync_status: string
          platform: string
          secret_ref: string
          sync_interval: string
        }
        Insert: {
          account_id: string
          data_start_date: string
          error_message?: string | null
          failure_count?: number
          is_active?: boolean
          last_sync_at?: string | null
          last_sync_status?: string
          platform: string
          secret_ref: string
          sync_interval: string
        }
        Update: {
          account_id?: string
          data_start_date?: string
          error_message?: string | null
          failure_count?: number
          is_active?: boolean
          last_sync_at?: string | null
          last_sync_status?: string
          platform?: string
          secret_ref?: string
          sync_interval?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_sync_config_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "AdAccount"
            referencedColumns: ["account_id"]
          },
        ]
      }
      AttributionConfig: {
        Row: {
          attribution_model: string
          attribution_window_days: number
          channel_type: string
        }
        Insert: {
          attribution_model?: string
          attribution_window_days: number
          channel_type: string
        }
        Update: {
          attribution_model?: string
          attribution_window_days?: number
          channel_type?: string
        }
        Relationships: []
      }
      CarbonReport: {
        Row: {
          admin_id: number | null
          certifications: Json | null
          created_at: string
          date: string | null
          id: number
          processed_at: string | null
          project_id: number
          purpose: string | null
          quality_standard: string | null
          recycling_contribution: string | null
          rejection_reason: string | null
          status: string
          updated_at: string
          usage_precautions: string | null
          user_id: number
        }
        Insert: {
          admin_id?: number | null
          certifications?: Json | null
          created_at?: string
          date?: string | null
          id?: never
          processed_at?: string | null
          project_id: number
          purpose?: string | null
          quality_standard?: string | null
          recycling_contribution?: string | null
          rejection_reason?: string | null
          status: string
          updated_at?: string
          usage_precautions?: string | null
          user_id: number
        }
        Update: {
          admin_id?: number | null
          certifications?: Json | null
          created_at?: string
          date?: string | null
          id?: never
          processed_at?: string | null
          project_id?: number
          purpose?: string | null
          quality_standard?: string | null
          recycling_contribution?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          usage_precautions?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "CarbonReport_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "AdminProfile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CarbonReport_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CarbonReport_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      CarbonReportAttachment: {
        Row: {
          carbon_report_id: number
          created_at: string | null
          filename: string
          filepath: string
          filesize: number
          id: number
        }
        Insert: {
          carbon_report_id: number
          created_at?: string | null
          filename: string
          filepath: string
          filesize: number
          id?: number
        }
        Update: {
          carbon_report_id?: number
          created_at?: string | null
          filename?: string
          filepath?: string
          filesize?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "CarbonReportAttachment_carbon_report_id_fkey"
            columns: ["carbon_report_id"]
            isOneToOne: false
            referencedRelation: "CarbonReport"
            referencedColumns: ["id"]
          },
        ]
      }
      CertificationAttachments: {
        Row: {
          attachment_name: string
          attachment_type: string | null
          attachment_url: string
          azure_blob_name: string
          azure_blob_url: string
          carbon_report_id: number
          certification_id: string
          created_at: string | null
          file_size: number | null
          id: number
          updated_at: string | null
        }
        Insert: {
          attachment_name: string
          attachment_type?: string | null
          attachment_url: string
          azure_blob_name: string
          azure_blob_url: string
          carbon_report_id: number
          certification_id: string
          created_at?: string | null
          file_size?: number | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          attachment_name?: string
          attachment_type?: string | null
          attachment_url?: string
          azure_blob_name?: string
          azure_blob_url?: string
          carbon_report_id?: number
          certification_id?: string
          created_at?: string | null
          file_size?: number | null
          id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "CertificationAttachments_carbon_report_id_fkey"
            columns: ["carbon_report_id"]
            isOneToOne: false
            referencedRelation: "CarbonReport"
            referencedColumns: ["id"]
          },
        ]
      }
      ChannelAttribution: {
        Row: {
          campaign: string | null
          channel_group: string
          content: string | null
          medium: string
          session_id: string
          source: string
          term: string | null
        }
        Insert: {
          campaign?: string | null
          channel_group: string
          content?: string | null
          medium: string
          session_id: string
          source: string
          term?: string | null
        }
        Update: {
          campaign?: string | null
          channel_group?: string
          content?: string | null
          medium?: string
          session_id?: string
          source?: string
          term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_attribution_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: true
            referencedRelation: "TrackingSession"
            referencedColumns: ["session_id"]
          },
        ]
      }
      EmailVerification: {
        Row: {
          code: string
          createdat: string | null
          email: string
          id: number
          updatedat: string | null
          validto: string
        }
        Insert: {
          code: string
          createdat?: string | null
          email: string
          id?: never
          updatedat?: string | null
          validto: string
        }
        Update: {
          code?: string
          createdat?: string | null
          email?: string
          id?: never
          updatedat?: string | null
          validto?: string
        }
        Relationships: []
      }
      homepage_management: {
        Row: {
          created_at: string
          cumulative_carbon_reduction: number
          id: number
          monthly_carbon_reduction: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          cumulative_carbon_reduction: number
          id?: number
          monthly_carbon_reduction: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          cumulative_carbon_reduction?: number
          id?: number
          monthly_carbon_reduction?: number
          updated_at?: string
        }
        Relationships: []
      }
      HomepageManagement: {
        Row: {
          created_at: string
          cumulative_carbon_reduction: number
          id: number
          month: number
          monthly_carbon_reduction: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          cumulative_carbon_reduction: number
          id?: never
          month: number
          monthly_carbon_reduction: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          cumulative_carbon_reduction?: number
          id?: never
          month?: number
          monthly_carbon_reduction?: number
          updated_at?: string
        }
        Relationships: []
      }
      InblogPost: {
        Row: {
          authors: string[]
          canonical_url: string | null
          content_html: string | null
          created_at: string
          cta_color: string | null
          cta_link: string | null
          cta_text: string | null
          cta_text_color: string | null
          deleted_at: string | null
          description: string | null
          id: number
          image_blurhash: string | null
          image_url: string | null
          inblog_id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string
          raw_data: Json | null
          slug: string | null
          synced_at: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          authors?: string[]
          canonical_url?: string | null
          content_html?: string | null
          created_at?: string
          cta_color?: string | null
          cta_link?: string | null
          cta_text?: string | null
          cta_text_color?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: number
          image_blurhash?: string | null
          image_url?: string | null
          inblog_id: string
          meta_description?: string | null
          meta_title?: string | null
          published_at: string
          raw_data?: Json | null
          slug?: string | null
          synced_at?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          authors?: string[]
          canonical_url?: string | null
          content_html?: string | null
          created_at?: string
          cta_color?: string | null
          cta_link?: string | null
          cta_text?: string | null
          cta_text_color?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: number
          image_blurhash?: string | null
          image_url?: string | null
          inblog_id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string
          raw_data?: Json | null
          slug?: string | null
          synced_at?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      InblogSyncLog: {
        Row: {
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: number
          items_deleted: number
          items_total: number
          items_upserted: number
          started_at: string
          status: string
        }
        Insert: {
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: number
          items_deleted?: number
          items_total?: number
          items_upserted?: number
          started_at?: string
          status: string
        }
        Update: {
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: number
          items_deleted?: number
          items_total?: number
          items_upserted?: number
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      IndustryType: {
        Row: {
          code: string
          created_at: string
          deleted_at: string | null
          id: number
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deleted_at?: string | null
          id?: number
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deleted_at?: string | null
          id?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      Inquiry: {
        Row: {
          completed_at: string | null
          content: string
          created_at: string | null
          deleted_at: string | null
          id: number
          inquiry_type: string
          manager_id: number | null
          priority: string | null
          status: Database["public"]["Enums"]["InquiryStatus"] | null
          title: string
          updated_at: string | null
          user_id: number
        }
        Insert: {
          completed_at?: string | null
          content: string
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          inquiry_type: string
          manager_id?: number | null
          priority?: string | null
          status?: Database["public"]["Enums"]["InquiryStatus"] | null
          title: string
          updated_at?: string | null
          user_id: number
        }
        Update: {
          completed_at?: string | null
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          inquiry_type?: string
          manager_id?: number | null
          priority?: string | null
          status?: Database["public"]["Enums"]["InquiryStatus"] | null
          title?: string
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Inquiry_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "AdminProfile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Inquiry_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      InquiryAttachment: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          filename: string
          filepath: string
          filesize: number
          id: number
          inquiry_id: number
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          filename: string
          filepath: string
          filesize: number
          id?: number
          inquiry_id: number
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          filename?: string
          filepath?: string
          filesize?: number
          id?: number
          inquiry_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "InquiryAttachment_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "Inquiry"
            referencedColumns: ["id"]
          },
        ]
      }
      InquiryComment: {
        Row: {
          admin_id: number | null
          comment: string
          created_at: string | null
          deleted_at: string | null
          id: number
          inquiry_id: number
          user_id: number | null
        }
        Insert: {
          admin_id?: number | null
          comment: string
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          inquiry_id: number
          user_id?: number | null
        }
        Update: {
          admin_id?: number | null
          comment?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          inquiry_id?: number
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "InquiryComment_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "AdminProfile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "InquiryComment_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "Inquiry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "InquiryComment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      InquiryCommentAttachmentFile: {
        Row: {
          created_at: string
          filename: string
          filepath: string
          filesize: number
          id: number
          inquiry_comment_id: number
          mime_type: string | null
        }
        Insert: {
          created_at?: string
          filename: string
          filepath: string
          filesize: number
          id?: never
          inquiry_comment_id: number
          mime_type?: string | null
        }
        Update: {
          created_at?: string
          filename?: string
          filepath?: string
          filesize?: number
          id?: never
          inquiry_comment_id?: number
          mime_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "InquiryCommentAttachmentFile_inquiry_comment_id_fkey"
            columns: ["inquiry_comment_id"]
            isOneToOne: false
            referencedRelation: "InquiryComment"
            referencedColumns: ["id"]
          },
        ]
      }
      InvitationEmailLog: {
        Row: {
          created_at: string
          delivery_status: string | null
          email_subject: string | null
          email_type: string
          failure_reason: string | null
          id: number
          invitation_id: number
          recipient_email: string
          sent_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_status?: string | null
          email_subject?: string | null
          email_type: string
          failure_reason?: string | null
          id?: never
          invitation_id: number
          recipient_email: string
          sent_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_status?: string | null
          email_subject?: string | null
          email_type?: string
          failure_reason?: string | null
          id?: never
          invitation_id?: number
          recipient_email?: string
          sent_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "InvitationEmailLog_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "AdminInvitation"
            referencedColumns: ["id"]
          },
        ]
      }
      PasswordResetToken: {
        Row: {
          code: string
          created_at: string | null
          email: string
          id: number
          token: string
          updated_at: string | null
          validTo: string
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          id?: number
          token: string
          updated_at?: string | null
          validTo: string
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          id?: number
          token?: string
          updated_at?: string | null
          validTo?: string
        }
        Relationships: []
      }
      Permission: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          icon_file: string | null
          icon_folder: string | null
          id: number
          is_active: boolean | null
          permission_key: string
          permission_name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          icon_file?: string | null
          icon_folder?: string | null
          id?: number
          is_active?: boolean | null
          permission_key: string
          permission_name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          icon_file?: string | null
          icon_folder?: string | null
          id?: number
          is_active?: boolean | null
          permission_key?: string
          permission_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      PermissionGroup: {
        Row: {
          created_at: string | null
          description: string | null
          group_name: string
          icon_file: string | null
          icon_folder: string | null
          id: number
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          group_name: string
          icon_file?: string | null
          icon_folder?: string | null
          id?: number
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          group_name?: string
          icon_file?: string | null
          icon_folder?: string | null
          id?: number
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      PermissionGroupPermission: {
        Row: {
          created_at: string | null
          group_id: number
          id: number
          permission_id: number
        }
        Insert: {
          created_at?: string | null
          group_id: number
          id?: number
          permission_id: number
        }
        Update: {
          created_at?: string | null
          group_id?: number
          id?: number
          permission_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "PermissionGroupPermission_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "PermissionGroup"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PermissionGroupPermission_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "Permission"
            referencedColumns: ["id"]
          },
        ]
      }
      PhoneVerification: {
        Row: {
          code: string
          created_at: string | null
          id: number
          phone: string
          updated_at: string | null
          validTo: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: number
          phone: string
          updated_at?: string | null
          validTo: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: number
          phone?: string
          updated_at?: string | null
          validTo?: string
        }
        Relationships: []
      }
      Product: {
        Row: {
          area: number | null
          height: number | null
          id: number
          width: number | null
        }
        Insert: {
          area?: number | null
          height?: number | null
          id?: number
          width?: number | null
        }
        Update: {
          area?: number | null
          height?: number | null
          id?: number
          width?: number | null
        }
        Relationships: []
      }
      ProductType: {
        Row: {
          code: string
          created_at: string | null
          deleted_at: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      Project: {
        Row: {
          completion_status: Database["public"]["Enums"]["ProjectCompletionStatus"]
          created_at: string | null
          deleted_at: string | null
          end_date: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          flow_project_id: string | null
          id: number
          industry_type_id: number | null
          is_archive: boolean | null
          iteration: number | null
          material: string | null
          organize_iteration: number
          original_project_id: number | null
          product_area: number | null
          product_height: number | null
          product_length: number | null
          product_quantity: number | null
          product_type_id: number | null
          product_weight: number | null
          product_width: number | null
          project_number: string | null
          quotation: string | null
          quotation_id: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["ProjectStatus"]
          updated_at: string | null
          user_company: number | null
          user_id: number | null
        }
        Insert: {
          completion_status?: Database["public"]["Enums"]["ProjectCompletionStatus"]
          created_at?: string | null
          deleted_at?: string | null
          end_date?: string | null
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          flow_project_id?: string | null
          id?: number
          industry_type_id?: number | null
          is_archive?: boolean | null
          iteration?: number | null
          material?: string | null
          organize_iteration: number
          original_project_id?: number | null
          product_area?: number | null
          product_height?: number | null
          product_length?: number | null
          product_quantity?: number | null
          product_type_id?: number | null
          product_weight?: number | null
          product_width?: number | null
          project_number?: string | null
          quotation?: string | null
          quotation_id?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["ProjectStatus"]
          updated_at?: string | null
          user_company?: number | null
          user_id?: number | null
        }
        Update: {
          completion_status?: Database["public"]["Enums"]["ProjectCompletionStatus"]
          created_at?: string | null
          deleted_at?: string | null
          end_date?: string | null
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          flow_project_id?: string | null
          id?: number
          industry_type_id?: number | null
          is_archive?: boolean | null
          iteration?: number | null
          material?: string | null
          organize_iteration?: number
          original_project_id?: number | null
          product_area?: number | null
          product_height?: number | null
          product_length?: number | null
          product_quantity?: number | null
          product_type_id?: number | null
          product_weight?: number | null
          product_width?: number | null
          project_number?: string | null
          quotation?: string | null
          quotation_id?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["ProjectStatus"]
          updated_at?: string | null
          user_company?: number | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_industry_type_id_fkey"
            columns: ["industry_type_id"]
            isOneToOne: false
            referencedRelation: "IndustryType"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Project_original_project_id_fkey"
            columns: ["original_project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "ProductType"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Project_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "Quotation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_user_company_fkey"
            columns: ["user_company"]
            isOneToOne: false
            referencedRelation: "UserCompany"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ProjectAddress: {
        Row: {
          address: string | null
          address_city: string | null
          address_detail: string | null
          address_optional: string | null
          address_postcode: string | null
          address_type: Database["public"]["Enums"]["AddressType"]
          country: string | null
          created_at: string | null
          deleted_at: string | null
          id: number
          is_primary: boolean | null
          project_id: number
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_city?: string | null
          address_detail?: string | null
          address_optional?: string | null
          address_postcode?: string | null
          address_type: Database["public"]["Enums"]["AddressType"]
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: never
          is_primary?: boolean | null
          project_id: number
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_city?: string | null
          address_detail?: string | null
          address_optional?: string | null
          address_postcode?: string | null
          address_type?: Database["public"]["Enums"]["AddressType"]
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: never
          is_primary?: boolean | null
          project_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ProjectAddress_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      ProjectAssign: {
        Row: {
          admin_id: number
          created_at: string | null
          id: number
          project_id: number
          role: Database["public"]["Enums"]["ProjectAssignRole"]
          updated_at: string | null
        }
        Insert: {
          admin_id: number
          created_at?: string | null
          id?: number
          project_id: number
          role: Database["public"]["Enums"]["ProjectAssignRole"]
          updated_at?: string | null
        }
        Update: {
          admin_id?: number
          created_at?: string | null
          id?: number
          project_id?: number
          role?: Database["public"]["Enums"]["ProjectAssignRole"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ProjectAssign_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "AdminProfile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ProjectAssign_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      ProjectAttachment: {
        Row: {
          approve: boolean
          approved_by: string | null
          approved_title: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: number
          is_final: boolean | null
          project_id: number
          project_status: Database["public"]["Enums"]["ProjectStatus"]
          title: string
          updated_at: string
        }
        Insert: {
          approve?: boolean
          approved_by?: string | null
          approved_title?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          is_final?: boolean | null
          project_id: number
          project_status: Database["public"]["Enums"]["ProjectStatus"]
          title: string
          updated_at?: string
        }
        Update: {
          approve?: boolean
          approved_by?: string | null
          approved_title?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: number
          is_final?: boolean | null
          project_id?: number
          project_status?: Database["public"]["Enums"]["ProjectStatus"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ProjectAttachment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      ProjectAttachmentFile: {
        Row: {
          filename: string
          filepath: string
          filesize: number
          id: number
          project_attachment_id: number
        }
        Insert: {
          filename: string
          filepath: string
          filesize: number
          id?: number
          project_attachment_id: number
        }
        Update: {
          filename?: string
          filepath?: string
          filesize?: number
          id?: number
          project_attachment_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ProjectAttachmentFile_project_attachment_id_fkey"
            columns: ["project_attachment_id"]
            isOneToOne: false
            referencedRelation: "ProjectAttachment"
            referencedColumns: ["id"]
          },
        ]
      }
      ProjectComment: {
        Row: {
          author: string | null
          comment: string | null
          created_at: string
          deleted_at: string | null
          id: number
          is_read_by_admin: boolean | null
          is_read_by_user: boolean | null
          profile_pk: number
          project_id: number
          project_status: Database["public"]["Enums"]["ProjectStatus"] | null
          user_id: number | null
          user_profile_type: Database["public"]["Enums"]["UserProfile"]
        }
        Insert: {
          author?: string | null
          comment?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: number
          is_read_by_admin?: boolean | null
          is_read_by_user?: boolean | null
          profile_pk: number
          project_id: number
          project_status?: Database["public"]["Enums"]["ProjectStatus"] | null
          user_id?: number | null
          user_profile_type?: Database["public"]["Enums"]["UserProfile"]
        }
        Update: {
          author?: string | null
          comment?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: number
          is_read_by_admin?: boolean | null
          is_read_by_user?: boolean | null
          profile_pk?: number
          project_id?: number
          project_status?: Database["public"]["Enums"]["ProjectStatus"] | null
          user_id?: number | null
          user_profile_type?: Database["public"]["Enums"]["UserProfile"]
        }
        Relationships: [
          {
            foreignKeyName: "ProjectComment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ProjectComment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ProjectCommentAttachmentFile: {
        Row: {
          comment_id: number
          filename: string
          filepath: string
          filesize: number
          id: number
        }
        Insert: {
          comment_id: number
          filename: string
          filepath: string
          filesize: number
          id?: number
        }
        Update: {
          comment_id?: number
          filename?: string
          filepath?: string
          filesize?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ProjectCommentAttachmentFile_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "ProjectComment"
            referencedColumns: ["id"]
          },
        ]
      }
      ProjectDeliveryAddress: {
        Row: {
          address1: string | null
          address2: string | null
          created_at: string
          delivery_country: string | null
          delivery_region: string | null
          id: number
          post_number: string | null
          project_id: number
          updated_at: string
        }
        Insert: {
          address1?: string | null
          address2?: string | null
          created_at: string
          delivery_country?: string | null
          delivery_region?: string | null
          id?: number
          post_number?: string | null
          project_id: number
          updated_at: string
        }
        Update: {
          address1?: string | null
          address2?: string | null
          created_at?: string
          delivery_country?: string | null
          delivery_region?: string | null
          id?: number
          post_number?: string | null
          project_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ProjectDeliveryAddress_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      ProjectLog: {
        Row: {
          created_at: string
          id: number
          message: string
          project_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          message: string
          project_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          message?: string
          project_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ProjectLog_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      ProjectStatusTimeline: {
        Row: {
          created_at: string
          end_date: string | null
          id: number
          project_id: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["ProjectStatus"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: number
          project_id?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["ProjectStatus"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: number
          project_id?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["ProjectStatus"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ProjectStatusTimeline_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      Quotation: {
        Row: {
          area: number | null
          created_at: string | null
          delivery_country: string | null
          delivery_region: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          height: number | null
          id: number
          industry_type_id: number
          length: number | null
          material: string | null
          product_type_id: number
          project_number: string | null
          quantity: number | null
          updated_at: string | null
          user_id: number
          width: number | null
        }
        Insert: {
          area?: number | null
          created_at?: string | null
          delivery_country?: string | null
          delivery_region?: string | null
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          height?: number | null
          id?: number
          industry_type_id: number
          length?: number | null
          material?: string | null
          product_type_id: number
          project_number?: string | null
          quantity?: number | null
          updated_at?: string | null
          user_id: number
          width?: number | null
        }
        Update: {
          area?: number | null
          created_at?: string | null
          delivery_country?: string | null
          delivery_region?: string | null
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          height?: number | null
          id?: number
          industry_type_id?: number
          length?: number | null
          material?: string | null
          product_type_id?: number
          project_number?: string | null
          quantity?: number | null
          updated_at?: string | null
          user_id?: number
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Quotation_industry_type_id_fkey"
            columns: ["industry_type_id"]
            isOneToOne: false
            referencedRelation: "IndustryType"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Quotation_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "ProductType"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Quotation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      QuotationAttachment: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          filename: string
          filepath: string
          filesize: number
          id: number
          quotation_id: number
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          filename: string
          filepath: string
          filesize: number
          id?: number
          quotation_id: number
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          filename?: string
          filepath?: string
          filesize?: number
          id?: number
          quotation_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "QuotationAttachment_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "Quotation"
            referencedColumns: ["id"]
          },
        ]
      }
      RolePermission: {
        Row: {
          assigned_at: string | null
          assigned_by: number | null
          created_at: string | null
          id: number
          is_active: boolean | null
          permission_id: number
          role: Database["public"]["Enums"]["UserRole"]
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          permission_id: number
          role: Database["public"]["Enums"]["UserRole"]
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          permission_id?: number
          role?: Database["public"]["Enums"]["UserRole"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "RolePermission_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "Permission"
            referencedColumns: ["id"]
          },
        ]
      }
      sku_management: {
        Row: {
          applied_material: string | null
          barcode: string | null
          box_quantity: number | null
          cbm: number | null
          color_coating: string | null
          components: string | null
          created_at: string | null
          design_cost: number | null
          existing_material: string | null
          hs_code: string | null
          id: string
          manufacturer: string | null
          mold_cost: number | null
          nc_engraving: string | null
          notes: string | null
          other_cost: number | null
          pallet_count: number | null
          perforation: string | null
          product_group: string | null
          product_info_package: string | null
          product_name: string
          project_number: string | null
          quotation_number: string | null
          sample_cost: number | null
          sample_cost_refund: string | null
          selling_price: number | null
          tariff: number | null
          tariff_rate: number | null
          total_logistics_cost: number | null
          transport_method: string | null
          unit_price: number | null
          updated_at: string | null
          vat: number | null
          warehouse: string | null
        }
        Insert: {
          applied_material?: string | null
          barcode?: string | null
          box_quantity?: number | null
          cbm?: number | null
          color_coating?: string | null
          components?: string | null
          created_at?: string | null
          design_cost?: number | null
          existing_material?: string | null
          hs_code?: string | null
          id?: string
          manufacturer?: string | null
          mold_cost?: number | null
          nc_engraving?: string | null
          notes?: string | null
          other_cost?: number | null
          pallet_count?: number | null
          perforation?: string | null
          product_group?: string | null
          product_info_package?: string | null
          product_name: string
          project_number?: string | null
          quotation_number?: string | null
          sample_cost?: number | null
          sample_cost_refund?: string | null
          selling_price?: number | null
          tariff?: number | null
          tariff_rate?: number | null
          total_logistics_cost?: number | null
          transport_method?: string | null
          unit_price?: number | null
          updated_at?: string | null
          vat?: number | null
          warehouse?: string | null
        }
        Update: {
          applied_material?: string | null
          barcode?: string | null
          box_quantity?: number | null
          cbm?: number | null
          color_coating?: string | null
          components?: string | null
          created_at?: string | null
          design_cost?: number | null
          existing_material?: string | null
          hs_code?: string | null
          id?: string
          manufacturer?: string | null
          mold_cost?: number | null
          nc_engraving?: string | null
          notes?: string | null
          other_cost?: number | null
          pallet_count?: number | null
          perforation?: string | null
          product_group?: string | null
          product_info_package?: string | null
          product_name?: string
          project_number?: string | null
          quotation_number?: string | null
          sample_cost?: number | null
          sample_cost_refund?: string | null
          selling_price?: number | null
          tariff?: number | null
          tariff_rate?: number | null
          total_logistics_cost?: number | null
          transport_method?: string | null
          unit_price?: number | null
          updated_at?: string | null
          vat?: number | null
          warehouse?: string | null
        }
        Relationships: []
      }
      SKUAttachment: {
        Row: {
          azure_blob_name: string
          azure_blob_url: string
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: number
          sku_id: number
          updated_at: string
        }
        Insert: {
          azure_blob_name: string
          azure_blob_url: string
          created_at?: string
          file_name: string
          file_size: number
          file_type: string
          id?: number
          sku_id: number
          updated_at?: string
        }
        Update: {
          azure_blob_name?: string
          azure_blob_url?: string
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: number
          sku_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "SKUAttachment_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "SKUDetail"
            referencedColumns: ["id"]
          },
        ]
      }
      SKUDetail: {
        Row: {
          applied_material: string | null
          barcode: string | null
          box_quantity: number | null
          cbm: number | null
          co2_reduction: number | null
          components: string | null
          created_at: string | null
          customs_duty: number | null
          design_cost: number | null
          duty_rate: number | null
          estimate_number: string | null
          existing_material: string | null
          hs_code: string | null
          id: number
          logistics_cost_total: number | null
          manufacturer: string | null
          margin_amount: number | null
          margin_total: number | null
          mold_cost: number | null
          moq: number | null
          notes: string | null
          other_cost: number | null
          pallet_quantity: number | null
          paper_mold_adhesive: boolean | null
          paper_mold_coating: string | null
          paper_mold_color: string | null
          paper_mold_cutting_method: string | null
          paper_mold_printing: boolean | null
          plastic_color_coating: string | null
          plastic_nc_engraving: boolean | null
          plastic_punching: boolean | null
          product_group: string | null
          product_in_price_mold: number | null
          product_in_price_without_mold: number | null
          product_info_package: string | null
          product_name: string
          profit_rate: number | null
          project_id: number | null
          remarks: string | null
          sample_cost: number | null
          sample_refund_cost: boolean | null
          shipping_cost: number | null
          total_cost: number | null
          transportation_method: string | null
          unit_price: number | null
          updated_at: string | null
          vat: number | null
          warehouse_location: string | null
        }
        Insert: {
          applied_material?: string | null
          barcode?: string | null
          box_quantity?: number | null
          cbm?: number | null
          co2_reduction?: number | null
          components?: string | null
          created_at?: string | null
          customs_duty?: number | null
          design_cost?: number | null
          duty_rate?: number | null
          estimate_number?: string | null
          existing_material?: string | null
          hs_code?: string | null
          id?: number
          logistics_cost_total?: number | null
          manufacturer?: string | null
          margin_amount?: number | null
          margin_total?: number | null
          mold_cost?: number | null
          moq?: number | null
          notes?: string | null
          other_cost?: number | null
          pallet_quantity?: number | null
          paper_mold_adhesive?: boolean | null
          paper_mold_coating?: string | null
          paper_mold_color?: string | null
          paper_mold_cutting_method?: string | null
          paper_mold_printing?: boolean | null
          plastic_color_coating?: string | null
          plastic_nc_engraving?: boolean | null
          plastic_punching?: boolean | null
          product_group?: string | null
          product_in_price_mold?: number | null
          product_in_price_without_mold?: number | null
          product_info_package?: string | null
          product_name: string
          profit_rate?: number | null
          project_id?: number | null
          remarks?: string | null
          sample_cost?: number | null
          sample_refund_cost?: boolean | null
          shipping_cost?: number | null
          total_cost?: number | null
          transportation_method?: string | null
          unit_price?: number | null
          updated_at?: string | null
          vat?: number | null
          warehouse_location?: string | null
        }
        Update: {
          applied_material?: string | null
          barcode?: string | null
          box_quantity?: number | null
          cbm?: number | null
          co2_reduction?: number | null
          components?: string | null
          created_at?: string | null
          customs_duty?: number | null
          design_cost?: number | null
          duty_rate?: number | null
          estimate_number?: string | null
          existing_material?: string | null
          hs_code?: string | null
          id?: number
          logistics_cost_total?: number | null
          manufacturer?: string | null
          margin_amount?: number | null
          margin_total?: number | null
          mold_cost?: number | null
          moq?: number | null
          notes?: string | null
          other_cost?: number | null
          pallet_quantity?: number | null
          paper_mold_adhesive?: boolean | null
          paper_mold_coating?: string | null
          paper_mold_color?: string | null
          paper_mold_cutting_method?: string | null
          paper_mold_printing?: boolean | null
          plastic_color_coating?: string | null
          plastic_nc_engraving?: boolean | null
          plastic_punching?: boolean | null
          product_group?: string | null
          product_in_price_mold?: number | null
          product_in_price_without_mold?: number | null
          product_info_package?: string | null
          product_name?: string
          profit_rate?: number | null
          project_id?: number | null
          remarks?: string | null
          sample_cost?: number | null
          sample_refund_cost?: boolean | null
          shipping_cost?: number | null
          total_cost?: number | null
          transportation_method?: string | null
          unit_price?: number | null
          updated_at?: string | null
          vat?: number | null
          warehouse_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "SKUDetail_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      SkuManagement: {
        Row: {
          applied_material: string | null
          barcode: string | null
          box_quantity: number | null
          cbm: number | null
          color_coating: string | null
          components: string | null
          created_at: string | null
          design_cost: number | null
          existing_material: string | null
          hs_code: string | null
          id: number
          manufacturer: string | null
          mold_cost: number | null
          nc_engraving: string | null
          notes: string | null
          other_cost: number | null
          pallet_count: number | null
          perforation: string | null
          product_group: string | null
          product_info_package: string | null
          product_name: string
          project_id: number
          project_number: string | null
          quotation_number: string | null
          sample_cost: number | null
          sample_cost_refund: string | null
          selling_price: number | null
          tariff: number | null
          tariff_rate: number | null
          total_logistics_cost: number | null
          transport_method: string | null
          unit_price: number | null
          updated_at: string | null
          vat: number | null
          warehouse: string | null
        }
        Insert: {
          applied_material?: string | null
          barcode?: string | null
          box_quantity?: number | null
          cbm?: number | null
          color_coating?: string | null
          components?: string | null
          created_at?: string | null
          design_cost?: number | null
          existing_material?: string | null
          hs_code?: string | null
          id?: never
          manufacturer?: string | null
          mold_cost?: number | null
          nc_engraving?: string | null
          notes?: string | null
          other_cost?: number | null
          pallet_count?: number | null
          perforation?: string | null
          product_group?: string | null
          product_info_package?: string | null
          product_name: string
          project_id: number
          project_number?: string | null
          quotation_number?: string | null
          sample_cost?: number | null
          sample_cost_refund?: string | null
          selling_price?: number | null
          tariff?: number | null
          tariff_rate?: number | null
          total_logistics_cost?: number | null
          transport_method?: string | null
          unit_price?: number | null
          updated_at?: string | null
          vat?: number | null
          warehouse?: string | null
        }
        Update: {
          applied_material?: string | null
          barcode?: string | null
          box_quantity?: number | null
          cbm?: number | null
          color_coating?: string | null
          components?: string | null
          created_at?: string | null
          design_cost?: number | null
          existing_material?: string | null
          hs_code?: string | null
          id?: never
          manufacturer?: string | null
          mold_cost?: number | null
          nc_engraving?: string | null
          notes?: string | null
          other_cost?: number | null
          pallet_count?: number | null
          perforation?: string | null
          product_group?: string | null
          product_info_package?: string | null
          product_name?: string
          project_id?: number
          project_number?: string | null
          quotation_number?: string | null
          sample_cost?: number | null
          sample_cost_refund?: string | null
          selling_price?: number | null
          tariff?: number | null
          tariff_rate?: number | null
          total_logistics_cost?: number | null
          transport_method?: string | null
          unit_price?: number | null
          updated_at?: string | null
          vat?: number | null
          warehouse?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "SkuManagement_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      TrackingEvent: {
        Row: {
          anonymous_id: string
          event_id: string
          event_name: string
          event_params: Json | null
          event_timestamp: string
          page_title: string | null
          page_url: string
          session_id: string
        }
        Insert: {
          anonymous_id: string
          event_id: string
          event_name: string
          event_params?: Json | null
          event_timestamp: string
          page_title?: string | null
          page_url: string
          session_id: string
        }
        Update: {
          anonymous_id?: string
          event_id?: string
          event_name?: string
          event_params?: Json | null
          event_timestamp?: string
          page_title?: string | null
          page_url?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_anonymous_id_fkey"
            columns: ["anonymous_id"]
            isOneToOne: false
            referencedRelation: "TrackingUser"
            referencedColumns: ["anonymous_id"]
          },
          {
            foreignKeyName: "tracking_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "TrackingSession"
            referencedColumns: ["session_id"]
          },
        ]
      }
      TrackingSession: {
        Row: {
          anonymous_id: string
          browser: string
          device: string
          entry_time: string
          exit_page: string
          exit_time: string
          is_new_user: boolean
          landing_page: string
          os: string
          referrer: string | null
          screen_resolution: string | null
          session_duration_sec: number | null
          session_id: string
          session_number: number
        }
        Insert: {
          anonymous_id: string
          browser: string
          device: string
          entry_time: string
          exit_page: string
          exit_time: string
          is_new_user: boolean
          landing_page: string
          os: string
          referrer?: string | null
          screen_resolution?: string | null
          session_duration_sec?: number | null
          session_id: string
          session_number: number
        }
        Update: {
          anonymous_id?: string
          browser?: string
          device?: string
          entry_time?: string
          exit_page?: string
          exit_time?: string
          is_new_user?: boolean
          landing_page?: string
          os?: string
          referrer?: string | null
          screen_resolution?: string | null
          session_duration_sec?: number | null
          session_id?: string
          session_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "tracking_sessions_anonymous_id_fkey"
            columns: ["anonymous_id"]
            isOneToOne: false
            referencedRelation: "TrackingUser"
            referencedColumns: ["anonymous_id"]
          },
        ]
      }
      TrackingUser: {
        Row: {
          anonymous_id: string
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          anonymous_id: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          anonymous_id?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      User: {
        Row: {
          age_agreed: boolean
          auth_id: string | null
          country_code: string | null
          created_at: string
          email: string | null
          id: number
          is_active: boolean
          marketing_email_agreed: boolean | null
          marketing_phone_agreed: boolean | null
          name: string | null
          phone: string | null
          privacy_agreed: boolean
          role: Database["public"]["Enums"]["UserRole"]
          terms_agreed: boolean
          updated_at: string
        }
        Insert: {
          age_agreed?: boolean
          auth_id?: string | null
          country_code?: string | null
          created_at: string
          email?: string | null
          id?: number
          is_active?: boolean
          marketing_email_agreed?: boolean | null
          marketing_phone_agreed?: boolean | null
          name?: string | null
          phone?: string | null
          privacy_agreed?: boolean
          role: Database["public"]["Enums"]["UserRole"]
          terms_agreed?: boolean
          updated_at: string
        }
        Update: {
          age_agreed?: boolean
          auth_id?: string | null
          country_code?: string | null
          created_at?: string
          email?: string | null
          id?: number
          is_active?: boolean
          marketing_email_agreed?: boolean | null
          marketing_phone_agreed?: boolean | null
          name?: string | null
          phone?: string | null
          privacy_agreed?: boolean
          role?: Database["public"]["Enums"]["UserRole"]
          terms_agreed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      UserAddress: {
        Row: {
          address_city: string | null
          address_options: string | null
          address_type: Database["public"]["Enums"]["AddressType"] | null
          address1: string | null
          address2: string | null
          country: string | null
          created_at: string
          id: number
          post_number: string | null
          user_id: number
        }
        Insert: {
          address_city?: string | null
          address_options?: string | null
          address_type?: Database["public"]["Enums"]["AddressType"] | null
          address1?: string | null
          address2?: string | null
          country?: string | null
          created_at: string
          id?: number
          post_number?: string | null
          user_id: number
        }
        Update: {
          address_city?: string | null
          address_options?: string | null
          address_type?: Database["public"]["Enums"]["AddressType"] | null
          address1?: string | null
          address2?: string | null
          country?: string | null
          created_at?: string
          id?: number
          post_number?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "UserAddress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      UserCompany: {
        Row: {
          company_department: string | null
          company_name: string | null
          company_role: string | null
          id: number
          user_id: number
        }
        Insert: {
          company_department?: string | null
          company_name?: string | null
          company_role?: string | null
          id?: number
          user_id: number
        }
        Update: {
          company_department?: string | null
          company_name?: string | null
          company_role?: string | null
          id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "UserCompany_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      AdConversionMetricsWithCost: {
        Row: {
          ad_id: string | null
          campaign_id: string | null
          conversion_name: string | null
          conversion_value: number | null
          conversions: number | null
          cost: number | null
          cpa: number | null
          date: string | null
          id: number | null
          platform: string | null
          roas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_conversion_metrics_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "Ad"
            referencedColumns: ["ad_id"]
          },
        ]
      }
    }
    Functions: {
      get_projects_with_old_unread_comments: {
        Args: never
        Returns: Database["public"]["CompositeTypes"]["project_with_assigns"][]
        SetofOptions: {
          from: "*"
          to: "project_with_assigns"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_projects_with_old_unread_user_comments: {
        Args: never
        Returns: Database["public"]["CompositeTypes"]["project_with_user"][]
        SetofOptions: {
          from: "*"
          to: "project_with_user"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_projects_with_unread_comments: {
        Args: never
        Returns: {
          completion_status: Database["public"]["Enums"]["ProjectCompletionStatus"]
          created_at: string | null
          deleted_at: string | null
          end_date: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          flow_project_id: string | null
          id: number
          industry_type_id: number | null
          is_archive: boolean | null
          iteration: number | null
          material: string | null
          organize_iteration: number
          original_project_id: number | null
          product_area: number | null
          product_height: number | null
          product_length: number | null
          product_quantity: number | null
          product_type_id: number | null
          product_weight: number | null
          product_width: number | null
          project_number: string | null
          quotation: string | null
          quotation_id: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["ProjectStatus"]
          updated_at: string | null
          user_company: number | null
          user_id: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "Project"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_service_role_key: { Args: never; Returns: string }
      get_supabase_url: { Args: never; Returns: string }
      get_user_id_by_email: {
        Args: { email: string }
        Returns: {
          id: string
        }[]
      }
      invoke_sync_ads: { Args: { task: string }; Returns: number }
      invoke_sync_inblog: { Args: never; Returns: number }
      validate_certifications_format: {
        Args: { certifications: Json }
        Returns: boolean
      }
      vault_create_secret: {
        Args: { secret_name: string; secret_value: string }
        Returns: string
      }
      vault_read_secret: { Args: { secret_name: string }; Returns: string }
      vault_update_secret: {
        Args: { secret_name: string; secret_value: string }
        Returns: boolean
      }
    }
    Enums: {
      AddressType: "domestic" | "international"
      InquiryStatus: "waiting" | "completed" | "replying"
      InvitationStatus: "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED"
      ProjectAssignRole: "manager" | "client"
      ProjectCompletionStatus: "not_started" | "in_progress" | "complete"
      ProjectStatus:
        | "QUOTE_REQUEST"
        | "QUOTE"
        | "CONTRACT"
        | "PLANNING"
        | "DESIGN"
        | "PROTOTYPE"
        | "PRODUCT_DEVELOPMENT"
        | "PRODUCTION"
        | "DELIVERY"
        | "ARCHIVED"
        | "COMPLETE"
      UserProfile: "user" | "admin"
      UserRole: "superadmin" | "admin" | "user"
    }
    CompositeTypes: {
      project_with_assigns: {
        project: Json | null
        project_assigns: Json | null
      }
      project_with_user: {
        project: Json | null
        user_profile: Json | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  ppwr: {
    Enums: {},
  },
  public: {
    Enums: {
      AddressType: ["domestic", "international"],
      InquiryStatus: ["waiting", "completed", "replying"],
      InvitationStatus: ["PENDING", "ACCEPTED", "EXPIRED", "CANCELLED"],
      ProjectAssignRole: ["manager", "client"],
      ProjectCompletionStatus: ["not_started", "in_progress", "complete"],
      ProjectStatus: [
        "QUOTE_REQUEST",
        "QUOTE",
        "CONTRACT",
        "PLANNING",
        "DESIGN",
        "PROTOTYPE",
        "PRODUCT_DEVELOPMENT",
        "PRODUCTION",
        "DELIVERY",
        "ARCHIVED",
        "COMPLETE",
      ],
      UserProfile: ["user", "admin"],
      UserRole: ["superadmin", "admin", "user"],
    },
  },
} as const

