/* eslint-disable @typescript-eslint/no-explicit-any */
import { Cube } from './cube'
import { HierarchyElement } from './element'

interface RuleSyntaxError {
  LineNumber: number
  Message: number
}

interface FedCellDescriptor {
  Cube: Cube
  Tuple: HierarchyElement[]
  Fed: boolean
}

interface ProcessSyntaxError {
  Procedure: string
  LineNumber: number
  Message: string
}

enum ProcessExecuteStatusCode {
  CompletedSuccessfully = 'CompletedSuccessfully',
  Aborted = 'Aborted',
  HasMinorErrors = 'HasMinorErrors',
  QuitCalled = 'QuitCalled',
  CompletedWithMessages = 'CompletedWithMessages',
  RollbackCalled = 'RollbackCalled'
}

interface ErrorLogFile {
  Filename: string
  Content?: string
}

interface ProcessExecuteResult {
  ProcessExecuteStatusCode: ProcessExecuteStatusCode
  ErrorLogFile?: ErrorLogFile
}

interface Configuration {
  ServerName: string
  AdminHost: string
  ProductVersion: string
  PortNumber: number
  ClientMessagePortNumber: number
  HTTPPortNumber: number
  IntegratedSecurityMode: boolean
  SecurityMode: string
  PrincipalName: string
  SecurityPackageName: string
  ClientCAMURIs: string[]
  WebCAMURI: string
  ClientPingCAMPassport: number
  ServerCAMURI: string
  AllowSeparateNandCRules: boolean
  DistributedOutputDir: string
  DisableSandboxing: boolean
  JobQueuing: boolean
  ForceReevaluationOfFeedersForFedCellsOnDataChange: boolean
  DataBaseDirectory: string
  UnicodeUpperLowerCase: boolean
}

interface ServerSettings {
  ServerName: string
  Access: Record<string, any>
  Administration: Record<string, any>
  Modelling: Record<string, any>
  Performance: Record<string, any>
}

export {
  RuleSyntaxError,
  FedCellDescriptor,
  ProcessSyntaxError,
  ProcessExecuteResult,
  ProcessExecuteStatusCode,
  Configuration,
  ServerSettings
}
