// src/lib/validators.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const recipientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  dateOfBirth: z.string().optional(),
  relationship: z.string().min(1, 'Please select a relationship'),
  primaryConditions: z.string().optional(),
})

export const baselineFieldSchema = z.object({
  category: z.string(),
  field: z.string(),
  value: z.string().min(1, 'Please enter a value'),
  unit: z.string().optional(),
  notes: z.string().optional(),
})

export const observationTextSchema = z.object({
  rawText: z
    .string()
    .min(10, 'Please enter at least 10 characters describing what you observed')
    .max(5000, 'Observation is too long (max 5000 characters)'),
  observedAt: z.string().min(1, 'Please select date and time'),
  severity: z.enum(['routine', 'noteworthy', 'incident']),
})

export const reportDateRangeSchema = z.object({
  startDate: z.string().min(1, 'Please select a start date'),
  endDate: z.string().min(1, 'Please select an end date'),
  summaryNote: z.string().max(2000).optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RecipientFormValues = z.infer<typeof recipientSchema>
export type ObservationFormValues = z.infer<typeof observationTextSchema>
export type ReportDateRangeValues = z.infer<typeof reportDateRangeSchema>
