import Hierarchy from "../models/Hierarchy";
import ElementService from "./ElementService";
import RestService from "./RestService";
import SubsetService from "./SubsetService";

class HierarchyService {

    private http: RestService;
    public elements: ElementService;
    public subsets: SubsetService;

    constructor(http: RestService) {
        this.http = http;
        this.elements = new ElementService(this.http);
        this.subsets = new SubsetService(this.http);
    }

    async create(hierarchy: Hierarchy) {
        const response = await this.http.POST(`/api/v1/Dimensions('${hierarchy.dimensionName}')/Hierarchies`, hierarchy.body);
        return response;
    }

    async get(dimensionName: string, hierarchyName: string) {
        const url = `/api/v1/Dimensions('${encodeURIComponent(dimensionName)}')/Hierarchies('${encodeURIComponent(hierarchyName)}')?$expand=Edges,Elements,ElementAttributes,Subsets,DefaultMember`;
        console.log(url);
        const response = await this.http.GET(url);
        console.log(response);
        return Hierarchy.fromJson(response);
    }

    async getAllNames(dimensionName: string): Promise<string[]> {
        const response = await this.http.GET(`/api/v1/Dimensions('${dimensionName}')/Hierarchies?$select=Name`);
        return response['value'].map((hierarchy: any) => hierarchy['Name']);
    }

    async update(hierarchy: Hierarchy) {
        const body = hierarchy.body;
        // del body['Edges'];
        const response = await this.http.PATCH(`/api/v1/Dimensions('${hierarchy.dimensionName}')/Hierarchies('${hierarchy.name}')`, body);

        return response;
    }

    async delete(dimensionName: string, hierarchyName: string) {
        return this.http.DELETE(`/api/v1/Dimensions('${dimensionName}')/Hierarchies('${hierarchyName}')`);
    }
    
}

export default HierarchyService;