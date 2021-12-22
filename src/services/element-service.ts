import { HierarchyElement } from "../models/element";
import ElementAttribute from "../models/element-attribute";
import RestService from "./rest-service";
import { fixedEncodeURIComponent } from "../utils/helpers";

class ElementService {

    private http: RestService;
    constructor(http: RestService) {
        this.http = http;
    }

    async get(dimensionName: string, hierarchyName: string, elementName: string): Promise<HierarchyElement> {
        const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/Elements('${fixedEncodeURIComponent(elementName)}')?$expand=*`);
        return HierarchyElement.fromJson(response);
    }

    async getAll(dimensionName: string, hierarchyName: string): Promise<HierarchyElement[]> {
        const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/Elements?$expand=*`);
        return response['value'].map((element: HierarchyElement) => HierarchyElement.fromJson(element));
    }

    async getAllNames(dimensionName: string, hierarchyName: string): Promise<string[]> {
        const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/Elements?$select=Name`);
        return response['value'].map((element: any) => element['Name']);
    }

    async create(dimensionName: string, hierarchyName: string, element: HierarchyElement): Promise<any> {
        return await this.http.POST(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/Elements`, element.body);
    }

    async update(dimensionName: string, hierarchyName: string, element: HierarchyElement): Promise<any> {
        return await this.http.PATCH(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/Elements('${fixedEncodeURIComponent(element.name)}')`, element.body);
    }

    async delete(dimensionName: string, hierarchyName: string, elementName: string): Promise<any> {
        return await this.http.DELETE(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/Elements('${fixedEncodeURIComponent(elementName)}')`);
    }

    async getAllLeaf(dimensionName: string, hierarchyName: string): Promise<HierarchyElement[]> {
        const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/Elements?$expand=*&$filter=Type ne 3`);
        return response['value'].map((element: HierarchyElement) => HierarchyElement.fromJson(element));
    }
    
    async getAllLeafNames(dimensionName: string, hierarchyName: string): Promise<string[]> {
        const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/Elements?$select=Name&$filter=Type ne 3`);
        return response['value'].map((element: any) => element['Name']);
    }

    async getElementAttributes(dimensionName: string, hierarchyName: string): Promise<ElementAttribute[]> {
        const response = await this.http.GET(`/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/ElementAttributes`);
        return response['value'].map((ea: ElementAttribute) => ElementAttribute.fromJson(ea));
    }

    async createElementAttribute(dimensionName: string, hierarchyName: string, elementAttribute: ElementAttribute) {
      const url = `/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/ElementAttributes`;
      return await this.http.POST(url, elementAttribute.body);
    }

    async deleteElementAttribute(dimensionName: string, hierarchyName: string, elementAttribute: string) {
      const url = `/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/ElementAttributes('${fixedEncodeURIComponent(elementAttribute)}')`;
      return await this.http.DELETE(url);
    }

    async getElementsFilteredByAttribute(dimensionName: string, hierarchyName: string, attrName: string, attrValue: string | number): Promise<string[]> {
        const attr = attrName.replace(/\s/g, '');

        let url = `/api/v1/Dimensions('${fixedEncodeURIComponent(dimensionName)}')/Hierarchies('${fixedEncodeURIComponent(hierarchyName)}')/Elements?$select=Name`;

        if (typeof attrValue === 'string') {
            url += `&$filter=Attributes/${attr} eq '${attrValue}'`;
        } else {
            url += `$filter=Attributes/${attr} eq ${attrValue}`;
        }
        const response = await this.http.GET(url);
        return response['value'].map((element: any) => element['Name'])

    }
}

export default ElementService;