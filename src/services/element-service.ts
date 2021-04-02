import { HierarchyElement } from "../models/element";
import ElementAttribute from "../models/element-attribute";
import RestService from "./rest-service";

class ElementService {

    private http: RestService;
    constructor(http: RestService) {
        this.http = http;
    }

    async get(dimensionName: string, hierarchyName: string, elementName: string): Promise<HierarchyElement> {
        const response = await this.http.GET(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/Elements('${elementName}')?$expand=*`);
        return HierarchyElement.fromJson(response);
    }

    async getAll(dimensionName: string, hierarchyName: string): Promise<HierarchyElement[]> {
        const response = await this.http.GET(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/Elements?$expand=*`);
        return response['value'].map((element: HierarchyElement) => HierarchyElement.fromJson(element));
    }

    async getAllNames(dimensionName: string, hierarchyName: string): Promise<string[]> {
        const response = await this.http.GET(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/Elements?$select=Name`);
        return response['value'].map((element: any) => element['Name']);
    }

    async create(dimensionName: string, hierarchyName: string, element: HierarchyElement): Promise<any> {
        return await this.http.POST(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/Elements`, element.body);
    }

    async update(dimensionName: string, hierarchyName: string, element: HierarchyElement): Promise<any> {
        return await this.http.PATCH(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/Elements('${element.name}')`, element.body);
    }

    async delete(dimensionName: string, hierarchyName: string, elementName: string): Promise<any> {
        return await this.http.DELETE(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/Elements('${elementName}')`);
    }

    async getAllLeaf(dimensionName: string, hierarchyName: string): Promise<HierarchyElement[]> {
        const response = await this.http.GET(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/Elements?$expand=*&$filter=Type ne 3`);
        return response['value'].map((element: HierarchyElement) => HierarchyElement.fromJson(element));
    }
    
    async getAllLeafNames(dimensionName: string, hierarchyName: string): Promise<string[]> {
        const response = await this.http.GET(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/Elements?$select=Name&$filter=Type ne 3`);
        return response['value'].map((element: any) => element['Name']);
    }

    async getElementAttributes(dimensionName: string, hierarchyName: string): Promise<ElementAttribute[]> {
        const response = await this.http.GET(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/ElementAttributes`);
        return response['value'].map((ea: ElementAttribute) => ElementAttribute.fromJson(ea));
    }

    async getElementsFilteredByAttribute(dimensionName: string, hierarchyName: string, attrName: string, attrValue: string | number): Promise<string[]> {
        const attr = attrName.replace(/\s/g, '');

        let url = '';

        if (typeof attrValue === 'string') {
            url = `/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/Elements?$select=Name&$filter=Attributes/${attr} eq '${attrValue}'`;
        } else {
            url = `/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')/Elements?$select=Name&$filter=Attributes/${attr} eq ${attrValue}`;
        }
        const response = await this.http.GET(url);
        return response['value'].map((element: any) => element['Name'])

    }
}

export default ElementService;