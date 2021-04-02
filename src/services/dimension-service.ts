import RestService from './rest-service';
import Dimension from '../models/dimension';
import HierarchyService from './hierarchy-service';

class DimensionService {

    private http: RestService;
    public hierarchies: HierarchyService;

    constructor(http: RestService) {
        this.http = http;
        this.hierarchies = new HierarchyService(this.http);
    }

    async get(dimensionName: string): Promise<Dimension> {
        const response = await this.http.GET(`/api/v1/Dimensions('${dimensionName}')?$expand=Hierarchies($expand=*)`);
        return Dimension.fromJson(response);
    }

    async getAllNames(): Promise<string[]> {
        const response = await this.http.GET('/api/v1/Dimensions?$select=Name');
        return response['value'].map((dimension: any) => dimension['Name']);
    }

    async create(dimension: Dimension): Promise<any> {
        return this.http.POST('/api/v1/Dimensions', dimension.body);
    }

    async update(dimension: Dimension): Promise<any> {
        return this.http.PATCH(`/api/v1/Dimensions('${dimension.name}')`, dimension.body);
    }

    async delete(dimensionName: string): Promise<any> {
        return this.http.DELETE(`/api/v1/Dimensions('${dimensionName}')`);
    }

}

export default DimensionService;