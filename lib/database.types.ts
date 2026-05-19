// lib/database.types.ts
// Explicit types — no Omit<Row,...> to avoid circular inference issues with the Supabase client

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          phone: string | null;
          first_name: string;
          last_name: string;
          full_name: string;
          role: 'student' | 'member' | 'leader' | 'teacher' | 'admin' | 'pastor';
          status: 'pending' | 'active' | 'suspended' | 'inactive';
          avatar_url: string | null;
          gender: 'male' | 'female' | null;
          date_of_birth: string | null;
          address: string | null;
          occupation: string | null;
          marital_status: 'single' | 'married' | 'widowed' | 'divorced' | null;
          branch: string;
          crosspoint_zone: 'south' | 'east' | 'north' | 'west' | null;
          joined_ruach_date: string | null;
          is_in_crosspoint: boolean;
          member_id: string | null;
          member_since: string | null;
          connect_cohort_id: string | null;
          connect_graduated_at: string | null;
          is_legacy_member: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          phone?: string | null;
          first_name?: string;
          last_name?: string;
          full_name?: string;
          role?: 'student' | 'member' | 'leader' | 'teacher' | 'admin' | 'pastor';
          status?: 'pending' | 'active' | 'suspended' | 'inactive';
          avatar_url?: string | null;
          gender?: 'male' | 'female' | null;
          date_of_birth?: string | null;
          address?: string | null;
          occupation?: string | null;
          marital_status?: 'single' | 'married' | 'widowed' | 'divorced' | null;
          branch?: string;
          crosspoint_zone?: 'south' | 'east' | 'north' | 'west' | null;
          joined_ruach_date?: string | null;
          is_in_crosspoint?: boolean;
          member_id?: string | null;
          member_since?: string | null;
          connect_cohort_id?: string | null;
          connect_graduated_at?: string | null;
          is_legacy_member?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone?: string | null;
          first_name?: string;
          last_name?: string;
          full_name?: string;
          role?: 'student' | 'member' | 'leader' | 'teacher' | 'admin' | 'pastor';
          status?: 'pending' | 'active' | 'suspended' | 'inactive';
          avatar_url?: string | null;
          gender?: 'male' | 'female' | null;
          date_of_birth?: string | null;
          address?: string | null;
          occupation?: string | null;
          marital_status?: 'single' | 'married' | 'widowed' | 'divorced' | null;
          branch?: string;
          crosspoint_zone?: 'south' | 'east' | 'north' | 'west' | null;
          joined_ruach_date?: string | null;
          is_in_crosspoint?: boolean;
          member_id?: string | null;
          member_since?: string | null;
          connect_cohort_id?: string | null;
          connect_graduated_at?: string | null;
          is_legacy_member?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      connect_cohorts: {
        Row: {
          id: string;
          name: string;
          year: number;
          cohort_number: number;
          description: string | null;
          start_date: string;
          end_date: string;
          registration_deadline: string;
          status: 'draft' | 'registration-open' | 'active' | 'completed' | 'cancelled';
          teacher_id: string | null;
          assistant_teacher_ids: string[];
          whatsapp_link: string | null;
          max_capacity: number;
          enrolled_count: number;
          min_attendance_percent: number;
          min_exam_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          year: number;
          cohort_number: number;
          description?: string | null;
          start_date: string;
          end_date: string;
          registration_deadline: string;
          status?: 'draft' | 'registration-open' | 'active' | 'completed' | 'cancelled';
          teacher_id?: string | null;
          assistant_teacher_ids?: string[];
          whatsapp_link?: string | null;
          max_capacity?: number;
          enrolled_count?: number;
          min_attendance_percent?: number;
          min_exam_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          year?: number;
          cohort_number?: number;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          registration_deadline?: string;
          status?: 'draft' | 'registration-open' | 'active' | 'completed' | 'cancelled';
          teacher_id?: string | null;
          assistant_teacher_ids?: string[];
          whatsapp_link?: string | null;
          max_capacity?: number;
          enrolled_count?: number;
          min_attendance_percent?: number;
          min_exam_score?: number;
        };
      };

      connect_sessions: {
        Row: {
          id: string;
          cohort_id: string;
          session_number: number;
          title: string;
          description: string | null;
          date: string;
          start_time: string;
          end_time: string;
          type: 'physical' | 'virtual';
          meeting_link: string | null;
          venue: string | null;
          notes: string | null;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          cohort_id: string;
          session_number: number;
          title: string;
          description?: string | null;
          date: string;
          start_time: string;
          end_time: string;
          type?: 'physical' | 'virtual';
          meeting_link?: string | null;
          venue?: string | null;
          notes?: string | null;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          cohort_id?: string;
          session_number?: number;
          title?: string;
          description?: string | null;
          date?: string;
          start_time?: string;
          end_time?: string;
          type?: 'physical' | 'virtual';
          meeting_link?: string | null;
          venue?: string | null;
          notes?: string | null;
          is_completed?: boolean;
        };
      };

      connect_resources: {
        Row: {
          id: string;
          session_id: string;
          title: string;
          type: 'pdf' | 'video' | 'link' | 'document';
          url: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          title: string;
          type: 'pdf' | 'video' | 'link' | 'document';
          url: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          title?: string;
          type?: 'pdf' | 'video' | 'link' | 'document';
          url?: string;
        };
      };

      connect_students: {
        Row: {
          id: string;
          user_id: string;
          cohort_id: string;
          admission_number: string;
          preferred_class_type: 'physical' | 'virtual';
          accepted_jesus: 'yes' | 'no' | 'not-sure';
          status: 'registered' | 'enrolled' | 'in-progress' | 'completed' | 'failed' | 'dropped';
          enrolled_at: string;
          total_attendance_percent: number;
          average_exam_score: number;
          can_graduate: boolean;
          graduated_at: string | null;
          certificate_issued: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cohort_id: string;
          admission_number: string;
          preferred_class_type?: 'physical' | 'virtual';
          accepted_jesus?: 'yes' | 'no' | 'not-sure';
          status?: 'registered' | 'enrolled' | 'in-progress' | 'completed' | 'failed' | 'dropped';
          enrolled_at?: string;
          total_attendance_percent?: number;
          average_exam_score?: number;
          can_graduate?: boolean;
          graduated_at?: string | null;
          certificate_issued?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cohort_id?: string;
          admission_number?: string;
          preferred_class_type?: 'physical' | 'virtual';
          accepted_jesus?: 'yes' | 'no' | 'not-sure';
          status?: 'registered' | 'enrolled' | 'in-progress' | 'completed' | 'failed' | 'dropped';
          enrolled_at?: string;
          total_attendance_percent?: number;
          average_exam_score?: number;
          can_graduate?: boolean;
          graduated_at?: string | null;
          certificate_issued?: boolean;
        };
      };

      connect_attendance: {
        Row: {
          id: string;
          student_id: string;
          session_id: string;
          present: boolean;
          marked_by: string | null;
          marked_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          session_id: string;
          present?: boolean;
          marked_by?: string | null;
          marked_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          session_id?: string;
          present?: boolean;
          marked_by?: string | null;
          marked_at?: string;
        };
      };

      connect_warnings: {
        Row: {
          id: string;
          student_id: string;
          type: 'attendance' | 'exam' | 'general';
          message: string;
          sent_by: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          type: 'attendance' | 'exam' | 'general';
          message: string;
          sent_by?: string | null;
          sent_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          type?: 'attendance' | 'exam' | 'general';
          message?: string;
          sent_by?: string | null;
          sent_at?: string;
        };
      };

      connect_exams: {
        Row: {
          id: string;
          cohort_id: string;
          session_id: string | null;
          title: string;
          description: string | null;
          total_marks: number;
          passing_marks: number;
          duration_minutes: number;
          available_from: string | null;
          available_until: string | null;
          status: 'draft' | 'published' | 'closed';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cohort_id: string;
          session_id?: string | null;
          title: string;
          description?: string | null;
          total_marks?: number;
          passing_marks?: number;
          duration_minutes?: number;
          available_from?: string | null;
          available_until?: string | null;
          status?: 'draft' | 'published' | 'closed';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cohort_id?: string;
          session_id?: string | null;
          title?: string;
          description?: string | null;
          total_marks?: number;
          passing_marks?: number;
          duration_minutes?: number;
          available_from?: string | null;
          available_until?: string | null;
          status?: 'draft' | 'published' | 'closed';
          created_by?: string | null;
        };
      };

      connect_exam_questions: {
        Row: {
          id: string;
          exam_id: string;
          question_number: number;
          type: 'multiple-choice' | 'true-false';
          question: string;
          options: string[];
          correct_answer: number;
          marks: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          question_number: number;
          type: 'multiple-choice' | 'true-false';
          question: string;
          options: string[];
          correct_answer: number;
          marks?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          question_number?: number;
          type?: 'multiple-choice' | 'true-false';
          question?: string;
          options?: string[];
          correct_answer?: number;
          marks?: number;
        };
      };

      connect_exam_results: {
        Row: {
          id: string;
          exam_id: string;
          student_id: string;
          score: number;
          total_marks: number;
          percentage: number;
          passed: boolean;
          submitted_at: string;
          graded_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          student_id: string;
          score?: number;
          total_marks: number;
          percentage?: number;
          passed?: boolean;
          submitted_at?: string;
          graded_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          student_id?: string;
          score?: number;
          total_marks?: number;
          percentage?: number;
          passed?: boolean;
          submitted_at?: string;
          graded_at?: string;
        };
      };

      connect_exam_answers: {
        Row: {
          id: string;
          result_id: string;
          question_id: string;
          selected_answer: number;
        };
        Insert: {
          id?: string;
          result_id: string;
          question_id: string;
          selected_answer: number;
        };
        Update: {
          id?: string;
          result_id?: string;
          question_id?: string;
          selected_answer?: number;
        };
      };

      legacy_member_requests: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          email: string;
          phone: string;
          cohort_attended: string;
          year_joined: number;
          years_as_member: number;
          branch: string;
          crosspoint_zone: string | null;
          additional_info: string | null;
          status: 'pending' | 'verified' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_notes: string | null;
          assigned_member_id: string | null;
          requested_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          email: string;
          phone: string;
          cohort_attended: string;
          year_joined: number;
          years_as_member: number;
          branch: string;
          crosspoint_zone?: string | null;
          additional_info?: string | null;
          status?: 'pending' | 'verified' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
          assigned_member_id?: string | null;
          requested_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          email?: string;
          phone?: string;
          cohort_attended?: string;
          year_joined?: number;
          years_as_member?: number;
          branch?: string;
          crosspoint_zone?: string | null;
          additional_info?: string | null;
          status?: 'pending' | 'verified' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
          assigned_member_id?: string | null;
        };
      };

      discipleship_courses: {
        Row: {
          id: string;
          level: 1 | 2 | 3;
          title: string;
          description: string;
          total_sessions: number;
          duration_weeks: number;
          prerequisite_level: 1 | 2 | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          level: 1 | 2 | 3;
          title: string;
          description: string;
          total_sessions: number;
          duration_weeks: number;
          prerequisite_level?: 1 | 2 | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          level?: 1 | 2 | 3;
          title?: string;
          description?: string;
          total_sessions?: number;
          duration_weeks?: number;
          prerequisite_level?: 1 | 2 | null;
        };
      };

      discipleship_cohorts: {
        Row: {
          id: string;
          course_id: string;
          level: 1 | 2 | 3;
          name: string;
          year: number;
          start_date: string;
          end_date: string;
          registration_deadline: string;
          schedule: string;
          teacher_id: string | null;
          assistant_teacher_ids: string[];
          whatsapp_link: string | null;
          max_capacity: number;
          enrolled_count: number;
          status: 'draft' | 'registration-open' | 'active' | 'completed';
          min_attendance_percent: number;
          min_exam_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          level: 1 | 2 | 3;
          name: string;
          year: number;
          start_date: string;
          end_date: string;
          registration_deadline: string;
          schedule: string;
          teacher_id?: string | null;
          assistant_teacher_ids?: string[];
          whatsapp_link?: string | null;
          max_capacity?: number;
          enrolled_count?: number;
          status?: 'draft' | 'registration-open' | 'active' | 'completed';
          min_attendance_percent?: number;
          min_exam_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          level?: 1 | 2 | 3;
          name?: string;
          year?: number;
          start_date?: string;
          end_date?: string;
          registration_deadline?: string;
          schedule?: string;
          teacher_id?: string | null;
          assistant_teacher_ids?: string[];
          whatsapp_link?: string | null;
          max_capacity?: number;
          enrolled_count?: number;
          status?: 'draft' | 'registration-open' | 'active' | 'completed';
          min_attendance_percent?: number;
          min_exam_score?: number;
        };
      };

      discipleship_sessions: {
        Row: {
          id: string;
          cohort_id: string;
          session_number: number;
          title: string;
          description: string | null;
          date: string;
          start_time: string;
          end_time: string;
          type: 'physical' | 'virtual';
          meeting_link: string | null;
          venue: string | null;
          notes: string | null;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          cohort_id: string;
          session_number: number;
          title: string;
          description?: string | null;
          date: string;
          start_time: string;
          end_time: string;
          type?: 'physical' | 'virtual';
          meeting_link?: string | null;
          venue?: string | null;
          notes?: string | null;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          cohort_id?: string;
          session_number?: number;
          title?: string;
          description?: string | null;
          date?: string;
          start_time?: string;
          end_time?: string;
          type?: 'physical' | 'virtual';
          meeting_link?: string | null;
          venue?: string | null;
          notes?: string | null;
          is_completed?: boolean;
        };
      };

      discipleship_resources: {
        Row: {
          id: string;
          session_id: string;
          title: string;
          type: 'pdf' | 'video' | 'link' | 'document';
          url: string;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          title: string;
          type: 'pdf' | 'video' | 'link' | 'document';
          url: string;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          title?: string;
          type?: 'pdf' | 'video' | 'link' | 'document';
          url?: string;
        };
      };

      discipleship_students: {
        Row: {
          id: string;
          user_id: string;
          cohort_id: string;
          level: 1 | 2 | 3;
          admission_number: string;
          status: 'registered' | 'enrolled' | 'in-progress' | 'completed' | 'failed' | 'dropped';
          enrolled_at: string;
          total_attendance_percent: number;
          average_exam_score: number;
          can_graduate: boolean;
          graduated_at: string | null;
          certificate_issued: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cohort_id: string;
          level: 1 | 2 | 3;
          admission_number: string;
          status?: 'registered' | 'enrolled' | 'in-progress' | 'completed' | 'failed' | 'dropped';
          enrolled_at?: string;
          total_attendance_percent?: number;
          average_exam_score?: number;
          can_graduate?: boolean;
          graduated_at?: string | null;
          certificate_issued?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cohort_id?: string;
          level?: 1 | 2 | 3;
          admission_number?: string;
          status?: 'registered' | 'enrolled' | 'in-progress' | 'completed' | 'failed' | 'dropped';
          enrolled_at?: string;
          total_attendance_percent?: number;
          average_exam_score?: number;
          can_graduate?: boolean;
          graduated_at?: string | null;
          certificate_issued?: boolean;
        };
      };

      discipleship_attendance: {
        Row: {
          id: string;
          student_id: string;
          session_id: string;
          present: boolean;
          marked_by: string | null;
          marked_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          session_id: string;
          present?: boolean;
          marked_by?: string | null;
          marked_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          session_id?: string;
          present?: boolean;
          marked_by?: string | null;
          marked_at?: string;
        };
      };

      discipleship_warnings: {
        Row: {
          id: string;
          student_id: string;
          type: 'attendance' | 'exam' | 'general';
          message: string;
          sent_by: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          type: 'attendance' | 'exam' | 'general';
          message: string;
          sent_by?: string | null;
          sent_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          type?: 'attendance' | 'exam' | 'general';
          message?: string;
          sent_by?: string | null;
          sent_at?: string;
        };
      };

      discipleship_exams: {
        Row: {
          id: string;
          cohort_id: string;
          session_id: string | null;
          level: 1 | 2 | 3;
          title: string;
          description: string | null;
          total_marks: number;
          passing_marks: number;
          duration_minutes: number;
          available_from: string | null;
          available_until: string | null;
          status: 'draft' | 'published' | 'closed';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cohort_id: string;
          session_id?: string | null;
          level: 1 | 2 | 3;
          title: string;
          description?: string | null;
          total_marks?: number;
          passing_marks?: number;
          duration_minutes?: number;
          available_from?: string | null;
          available_until?: string | null;
          status?: 'draft' | 'published' | 'closed';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cohort_id?: string;
          session_id?: string | null;
          level?: 1 | 2 | 3;
          title?: string;
          description?: string | null;
          total_marks?: number;
          passing_marks?: number;
          duration_minutes?: number;
          available_from?: string | null;
          available_until?: string | null;
          status?: 'draft' | 'published' | 'closed';
          created_by?: string | null;
        };
      };

      discipleship_exam_questions: {
        Row: {
          id: string;
          exam_id: string;
          question_number: number;
          type: 'multiple-choice' | 'true-false';
          question: string;
          options: string[];
          correct_answer: number;
          marks: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          question_number: number;
          type: 'multiple-choice' | 'true-false';
          question: string;
          options: string[];
          correct_answer: number;
          marks?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          question_number?: number;
          type?: 'multiple-choice' | 'true-false';
          question?: string;
          options?: string[];
          correct_answer?: number;
          marks?: number;
        };
      };

      discipleship_exam_results: {
        Row: {
          id: string;
          exam_id: string;
          student_id: string;
          score: number;
          total_marks: number;
          percentage: number;
          passed: boolean;
          submitted_at: string;
          graded_at: string;
        };
        Insert: {
          id?: string;
          exam_id: string;
          student_id: string;
          score?: number;
          total_marks: number;
          percentage?: number;
          passed?: boolean;
          submitted_at?: string;
          graded_at?: string;
        };
        Update: {
          id?: string;
          exam_id?: string;
          student_id?: string;
          score?: number;
          total_marks?: number;
          percentage?: number;
          passed?: boolean;
          submitted_at?: string;
          graded_at?: string;
        };
      };

      discipleship_exam_answers: {
        Row: {
          id: string;
          result_id: string;
          question_id: string;
          selected_answer: number;
        };
        Insert: {
          id?: string;
          result_id: string;
          question_id: string;
          selected_answer: number;
        };
        Update: {
          id?: string;
          result_id?: string;
          question_id?: string;
          selected_answer?: number;
        };
      };

      discipleship_legacy_requests: {
        Row: {
          id: string;
          user_id: string | null;
          level: number;
          cohort_name: string;
          year_completed: number;
          teacher_name: string | null;
          additional_info: string | null;
          status: 'pending' | 'verified' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_notes: string | null;
          requested_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          level: number;
          cohort_name: string;
          year_completed: number;
          teacher_name?: string | null;
          additional_info?: string | null;
          status?: 'pending' | 'verified' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
          requested_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          level?: number;
          cohort_name?: string;
          year_completed?: number;
          teacher_name?: string | null;
          additional_info?: string | null;
          status?: 'pending' | 'verified' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_notes?: string | null;
        };
      };

      crosspoints: {
        Row: {
          id: string;
          name: string;
          zone: 'south' | 'east' | 'north' | 'west';
          area: string;
          location: string;
          status: 'active' | 'inactive' | 'forming';
          max_members: number;
          member_count: number;
          leader_id: string | null;
          assistant_id: string | null;
          treasurer_id: string | null;
          meeting_day: string | null;
          meeting_time: string | null;
          venue: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          zone: 'south' | 'east' | 'north' | 'west';
          area: string;
          location: string;
          status?: 'active' | 'inactive' | 'forming';
          max_members?: number;
          member_count?: number;
          leader_id?: string | null;
          assistant_id?: string | null;
          treasurer_id?: string | null;
          meeting_day?: string | null;
          meeting_time?: string | null;
          venue?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          zone?: 'south' | 'east' | 'north' | 'west';
          area?: string;
          location?: string;
          status?: 'active' | 'inactive' | 'forming';
          max_members?: number;
          member_count?: number;
          leader_id?: string | null;
          assistant_id?: string | null;
          treasurer_id?: string | null;
          meeting_day?: string | null;
          meeting_time?: string | null;
          venue?: string | null;
        };
      };

      crosspoint_memberships: {
        Row: {
          id: string;
          user_id: string;
          crosspoint_id: string;
          role: 'member' | 'leader' | 'assistant' | 'treasurer';
          joined_date: string;
          status: 'active' | 'inactive';
        };
        Insert: {
          id?: string;
          user_id: string;
          crosspoint_id: string;
          role?: 'member' | 'leader' | 'assistant' | 'treasurer';
          joined_date?: string;
          status?: 'active' | 'inactive';
        };
        Update: {
          id?: string;
          user_id?: string;
          crosspoint_id?: string;
          role?: 'member' | 'leader' | 'assistant' | 'treasurer';
          joined_date?: string;
          status?: 'active' | 'inactive';
        };
      };

      transfer_requests: {
        Row: {
          id: string;
          user_id: string;
          from_crosspoint_id: string;
          to_crosspoint_id: string;
          reason: string;
          status: 'pending' | 'approved' | 'declined';
          request_date: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          from_crosspoint_id: string;
          to_crosspoint_id: string;
          reason: string;
          status?: 'pending' | 'approved' | 'declined';
          request_date?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          from_crosspoint_id?: string;
          to_crosspoint_id?: string;
          reason?: string;
          status?: 'pending' | 'approved' | 'declined';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };

      departments: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          leader_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          leader_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          leader_id?: string | null;
        };
      };

      department_memberships: {
        Row: {
          id: string;
          user_id: string;
          department_id: string;
          role: 'member' | 'leader' | 'assistant';
          sub_team_id: string | null;
          joined_date: string;
          status: 'active' | 'inactive';
        };
        Insert: {
          id?: string;
          user_id: string;
          department_id: string;
          role?: 'member' | 'leader' | 'assistant';
          sub_team_id?: string | null;
          joined_date?: string;
          status?: 'active' | 'inactive';
        };
        Update: {
          id?: string;
          user_id?: string;
          department_id?: string;
          role?: 'member' | 'leader' | 'assistant';
          sub_team_id?: string | null;
          joined_date?: string;
          status?: 'active' | 'inactive';
        };
      };

      department_join_requests: {
        Row: {
          id: string;
          user_id: string;
          department_id: string;
          sub_team_id: string | null;
          message: string | null;
          status: 'pending' | 'approved' | 'declined';
          request_date: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          department_id: string;
          sub_team_id?: string | null;
          message?: string | null;
          status?: 'pending' | 'approved' | 'declined';
          request_date?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          department_id?: string;
          sub_team_id?: string | null;
          message?: string | null;
          status?: 'pending' | 'approved' | 'declined';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
      };

      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: 'church-wide' | 'department' | 'crosspoint';
          department_id: string | null;
          crosspoint_id: string | null;
          start_date: string;
          end_date: string | null;
          time: string | null;
          venue: string | null;
          capacity: number | null;
          requires_registration: boolean;
          registered_count: number;
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type: 'church-wide' | 'department' | 'crosspoint';
          department_id?: string | null;
          crosspoint_id?: string | null;
          start_date: string;
          end_date?: string | null;
          time?: string | null;
          venue?: string | null;
          capacity?: number | null;
          requires_registration?: boolean;
          registered_count?: number;
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: 'church-wide' | 'department' | 'crosspoint';
          department_id?: string | null;
          crosspoint_id?: string | null;
          start_date?: string;
          end_date?: string | null;
          time?: string | null;
          venue?: string | null;
          capacity?: number | null;
          requires_registration?: boolean;
          registered_count?: number;
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          created_by?: string | null;
        };
      };

      notices: {
        Row: {
          id: string;
          title: string;
          content: string;
          scope: 'all' | 'members' | 'leaders' | 'department' | 'crosspoint' | 'connect-cohort' | 'discipleship-cohort';
          target_id: string | null;
          priority: 'low' | 'medium' | 'high';
          published_at: string;
          expires_at: string | null;
          author_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          scope: 'all' | 'members' | 'leaders' | 'department' | 'crosspoint' | 'connect-cohort' | 'discipleship-cohort';
          target_id?: string | null;
          priority?: 'low' | 'medium' | 'high';
          published_at?: string;
          expires_at?: string | null;
          author_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          scope?: 'all' | 'members' | 'leaders' | 'department' | 'crosspoint' | 'connect-cohort' | 'discipleship-cohort';
          target_id?: string | null;
          priority?: 'low' | 'medium' | 'high';
          published_at?: string;
          expires_at?: string | null;
          author_id?: string | null;
        };
      };

      prayer_requests: {
        Row: {
          id: string;
          user_id: string | null;
          is_anonymous: boolean;
          category: 'healing' | 'provision' | 'guidance' | 'family' | 'thanksgiving' | 'other';
          request: string;
          is_urgent: boolean;
          status: 'pending' | 'praying' | 'answered';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          is_anonymous?: boolean;
          category: 'healing' | 'provision' | 'guidance' | 'family' | 'thanksgiving' | 'other';
          request: string;
          is_urgent?: boolean;
          status?: 'pending' | 'praying' | 'answered';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          is_anonymous?: boolean;
          category?: 'healing' | 'provision' | 'guidance' | 'family' | 'thanksgiving' | 'other';
          request?: string;
          is_urgent?: boolean;
          status?: 'pending' | 'praying' | 'answered';
        };
      };

      suggestions: {
        Row: {
          id: string;
          user_id: string | null;
          is_anonymous: boolean;
          type: 'suggestion' | 'complaint' | 'feedback';
          category: 'general' | 'crosspoint' | 'service' | 'department';
          subject: string;
          message: string;
          status: 'pending' | 'reviewing' | 'resolved';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          is_anonymous?: boolean;
          type: 'suggestion' | 'complaint' | 'feedback';
          category: 'general' | 'crosspoint' | 'service' | 'department';
          subject: string;
          message: string;
          status?: 'pending' | 'reviewing' | 'resolved';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          is_anonymous?: boolean;
          type?: 'suggestion' | 'complaint' | 'feedback';
          category?: 'general' | 'crosspoint' | 'service' | 'department';
          subject?: string;
          message?: string;
          status?: 'pending' | 'reviewing' | 'resolved';
        };
      };

      guests: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string;
          email: string | null;
          visit_date: string;
          source: 'walk-in' | 'invite' | 'online' | 'event';
          invited_by: string | null;
          follow_up_status: 'pending' | 'contacted' | 'converted' | 'declined';
          notes: string | null;
          branch: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          phone: string;
          email?: string | null;
          visit_date: string;
          source: 'walk-in' | 'invite' | 'online' | 'event';
          invited_by?: string | null;
          follow_up_status?: 'pending' | 'contacted' | 'converted' | 'declined';
          notes?: string | null;
          branch?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          email?: string | null;
          visit_date?: string;
          source?: 'walk-in' | 'invite' | 'online' | 'event';
          invited_by?: string | null;
          follow_up_status?: 'pending' | 'contacted' | 'converted' | 'declined';
          notes?: string | null;
          branch?: string;
        };
      };

      food_bank_requests: {
        Row: {
          id: string;
          crosspoint_id: string | null;
          requested_by_id: string | null;
          request_date: string;
          status: 'pending' | 'approved' | 'fulfilled' | 'declined';
          notes: string | null;
        };
        Insert: {
          id?: string;
          crosspoint_id?: string | null;
          requested_by_id?: string | null;
          request_date?: string;
          status?: 'pending' | 'approved' | 'fulfilled' | 'declined';
          notes?: string | null;
        };
        Update: {
          id?: string;
          crosspoint_id?: string | null;
          requested_by_id?: string | null;
          request_date?: string;
          status?: 'pending' | 'approved' | 'fulfilled' | 'declined';
          notes?: string | null;
        };
      };

      food_bank_beneficiaries: {
        Row: {
          id: string;
          request_id: string;
          user_id: string | null;
          name: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          user_id?: string | null;
          name: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          user_id?: string | null;
          name?: string;
        };
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      generate_member_id: {
        Args: { p_is_legacy?: boolean };
        Returns: string;
      };
      generate_connect_admission_number: {
        Args: { p_year: number };
        Returns: string;
      };
      generate_discipleship_admission_number: {
        Args: { p_year: number };
        Returns: string;
      };
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };

    Enums: {
      [_ in never]: never;
    };
  };
}