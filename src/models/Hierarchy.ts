import Dimension from "./dimension";
import Edge from "./edge";
import Subset from "./subset";
import { HierarchyElement, ElementTypeString } from "./element";
import ElementAttribute, { AttributeTypeString } from "./element-attribute";
import TupleMap from '../utils/tuple-map';
import CaseAndSpaceInsensitiveMap from "../utils/case-and-space-insensitive-map";
import { caseAndSpaceInsensitiveEquals } from "../utils/helpers";

const LEAVES_HIERARCHY = 'Leaves';

class Hierarchy {
  public name: string;
  public dimensionName: string;
  public subsets?: Subset[] = [];

  private _elements: CaseAndSpaceInsensitiveMap<string, HierarchyElement>;
  private _elementAttributes?: CaseAndSpaceInsensitiveMap<string, ElementAttribute>;
  public readonly _edges: TupleMap;

  constructor(
    name: string,
    dimensionName: string,
    elements?: HierarchyElement[],
    edges?: Edge[],
    elementAttributes?: ElementAttribute[],
    subsets?: Subset[]
  ) {
    this.name = name;
    this.dimensionName = dimensionName;

    this._elements = new CaseAndSpaceInsensitiveMap();
    if (elements) {

      for (const element of elements) {
        this._elements.set(element.name, element);
      }
    }

    this._edges = new TupleMap();
    if (edges) {

      for (const edge of edges) {
        this._edges.set([edge.parentName, edge.componentName], edge.weight);
      }
    }

    if (subsets) {
      for (const subset of subsets) {
        this.subsets.push(subset)
      }
    }

    this._elementAttributes = new CaseAndSpaceInsensitiveMap();
    if (elementAttributes) {
      for (const ea of elementAttributes) {
        this._elementAttributes.set(ea.name, ea);
      }
    }

  }

  get edges() {
    return this._edges.entries();
  }

  get elements(): HierarchyElement[] {
    return Array.from(this._elements.values());
  }

  get elementAttributes(): ElementAttribute[] {
    return Array.from(this._elementAttributes.values());
  }

  static fromJson(data: any) {
    return new Hierarchy(
      data.Name,
      data.UniqueName.substring(1, data.UniqueName.indexOf('].[')),
      data.Elements.map(element => HierarchyElement.fromJson(element)),
      data.Edges.map(edge => Edge.fromJson(edge)),
      data.ElementAttributes.map(ea => ElementAttribute.fromJson(ea)),
      data.Subsets.map(subset => Subset.fromJson(subset))
    )
  }

  addElement(elementName: string, elementType: ElementTypeString) {
    this._elements.set(elementName, new HierarchyElement(elementName, elementType))
  }

  updateElement(elementName: string, elementType: ElementTypeString) {
    if (!this._elements.has(elementName)) {
      this._elements.set(elementName, new HierarchyElement(elementName, elementType))
    } else {
      this._elements.get(elementName).type = elementType
    }

  }

  deleteElement(elementName: string) {
    if (this._elements.has(elementName)) {
      this._elements.delete(elementName);
    }
  }

  addEdge(parent: string, component: string, weight: number = 1) {
    this._edges.set([parent, component], weight);
  }

  updateEdge(parent: string, component: string, weight: number) {
    this._edges.set([parent, component], weight);
  }

  deleteEdge(parent: string, component: string) {
    if (this._edges.has([parent, component])) {
      this._edges.delete([parent, component]);
    }
  }

  addElementAttribute(name: string, type: AttributeTypeString) {
    this._elementAttributes.set(name, new ElementAttribute(name, type));
  }

  deleteElementAttribute(name: string) {
    // if (this._elementAttributes.has(name)) {
      return this._elementAttributes.delete(name)
    // }
  }

  isLeavesHierarchy(): boolean {
    return caseAndSpaceInsensitiveEquals(this.name, LEAVES_HIERARCHY)
  }

  constructBody() {
    const body = {}
    body['Name'] = this.name;
    body['Elements'] = [];

    this._elements.forEach(
      (elem) => {
        body['Elements'].push(elem.body)
      }
    );

    body['Edges'] = [];
    this._edges.forEach(
      (weight: number, edge) => {
        const [parent, component] = edge;
        const e = new Edge(parent, component, weight)
        body['Edges'].push(e.body);
      }
    );

    // body['ElementAttributes'] = [];
    // for (const ea of this.elementAttributes) {
    //     body['ElementAttributes'].push(ea.body);
    // }

    return body;
  }

  get body() {
    return this.constructBody()
  }
}


export default Hierarchy;