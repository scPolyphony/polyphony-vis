import axios, { AxiosRequestConfig, AxiosInstance } from "axios";
import { ROOT_URL } from "./env";


const API_URL = `${ROOT_URL}/api`;

export class RestClient {
    private server: AxiosInstance;

    // default config for http request
    private requestConfig: AxiosRequestConfig = {
        baseURL: API_URL,
    };

    /**
     *
     * @param config AxiosRequestConfig
     */
    constructor(config: Partial<AxiosRequestConfig>) {
        this.requestConfig = { ...this.requestConfig, ...config };
        this.server = axios.create(this.requestConfig);

        // TODO: add resources
    }
}

export default new RestClient({});
