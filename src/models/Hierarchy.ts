import Dimension from "./dimension";
import Edge from "./edge";
import Subset from "./subset";
import { HierarchyElement, ElementType } from "./element";
import ElementAttribute from "./element-attribute";
import TupleMap from '../utils/tuple-map';
import CaseAndSpaceInsensitiveMap from "../utils/case-and-space-insensitive-map";


class Hierarchy {
  public name: string;
  public dimensionName: string;
  // public edges?: Edge[] = [];
  public elementAttributes?: ElementAttribute[] = [];
  public subsets?: Subset[] = [];

  private _elements: Map<string, HierarchyElement>;
  private _edges: TupleMap;

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
        const el = HierarchyElement.fromJson(element)
        this._elements.set(el.name, el);
      }
    }

    this._edges = new TupleMap();
    if (edges) {

      for (const edge of edges) {
        // this.edges.push(Edge.fromJson(edge))
        const e = Edge.fromJson(edge);
        this._edges.set([e.parentName, e.componentName], e.weight);
      }
    }

    if (subsets) {
      for (const subset of subsets) {
        this.subsets.push(Subset.fromJson(subset))
      }
    }

    if (elementAttributes) {
      for (const ea of elementAttributes) {
        this.elementAttributes.push(ElementAttribute.fromJson(ea))
      }
    }

  }

  get edges() {
    return this._edges.values();
  }

  get elements() {
    return Array.from(this._elements.values());
  }

  static fromJson(data: any) {
    return new Hierarchy(
      data.Name,
      data.UniqueName.substring(1, data.UniqueName.indexOf('].[')),
      data.Elements,
      data.Edges,
      data.ElementAttributes,
      data.Subsets
    )
  }

  addElement(elementName: string, elementType: string) {
    this._elements.set(elementName, new HierarchyElement(elementName, ElementType[elementType]))
  }

  updateElement(elementName: string, elementType: string) {

    if (!this._elements.has(elementName)) {
      this._elements.set(elementName, new HierarchyElement(elementName, ElementType[elementType]))
    } else {
      this._elements.get(elementName).type = ElementType[elementType];
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

  constructBody() {
    const body = {}
    body['Name'] = this.name;
    body['Elements'] = [];

    this._elements.forEach(
      (elem, name) => {
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