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

export { RuleSyntaxError, FedCellDescriptor }