import RestService from './rest-service';
import Cube from '../models/cube';
import ViewService from './view-service';
import { View } from '../models/view';
import { MinimalVersion } from '../utils/decorators';


class CubeService {

    private http: RestService;
    public views: ViewService;
    constructor(http: RestService) {
        this.http = http;
        this.views = new ViewService(http);
    }

    async get(cubeName: string): Promise<Cube> {
        const response = await this.http.GET(`/api/v1/Cubes('${cubeName}')?$expand=Dimensions($select=Name)`);
        return Cube.fromJson(response);
    }

    async getAll(): Promise<Cube[]> {
        const response = await this.http.GET('/api/v1/Cubes?$expand=Dimensions($select=Name)');
        return response['value'].map((cube: any) => Cube.fromJson(cube));
    }

    async create(cube: Cube) {
        return this.http.POST('/api/v1/Cubes', cube.body);
    }

    async update(cube: Cube) {
        return this.http.PATCH(`/api/v1/Cubes('${cube.name}')`, cube.body);
    }

    async delete(cubeName: string) {
        return this.http.DELETE(`/api/v1/Cubes('${cubeName}')`);
    }

}

export default CubeService;