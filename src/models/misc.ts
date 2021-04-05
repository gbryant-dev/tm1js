import Cube from "./cube";
import { HierarchyElement } from "./element";

interface RuleSyntaxError {
  LineNumber: number;
  Message: number;
}

interface FedCellDescriptor {
  Cube: Cube;
  Tuple: HierarchyElement[];
  Fed: boolean;
}

enum ProcessProcedure {
  Prolog,

  Metadata
}

interface ProcessSyntaxError {
  Procedure: string;
  LineNumber: number;
  Message: string;
}

enum ProcessExecuteStatusCode {
  CompletedSuccessfully = "CompletedSuccessfully",
  Aborted = "Aborted",
  HasMinorErrors = "HasMinorErrors",
  QuitCalled = "QuitCalled",
  CompletedWithMessages = "CompletedWithMessages",
  RollbackCalled = "RollbackCalled"
}

interface ErrorLogFile {
  Filename: string;
  Content?: string
}

interface ProcessExecuteResult {
  ProcessExecuteStatusCode: ProcessExecuteStatusCode,
  ErrorLogFile?: ErrorLogFile
}

export {
  RuleSyntaxError,
  FedCellDescriptor,
  ProcessSyntaxError,
  ProcessExecuteResult,
  ProcessExecuteStatusCode
}