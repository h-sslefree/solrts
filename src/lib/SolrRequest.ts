import * as http from 'http';
import { Readable } from 'stream';

export abstract class SolrRequest {
    public execute(host: string, port: number): Promise<any> {
        return new Promise((resolve: any, reject: any) => {
            if (process.env.DEBUG && /solrts/.test(process.env.DEBUG)) {
                // tslint:disable-next-line:no-console
                console.log(`${this.absolutePath()}?${this.httpQueryString()}`);
            }
            try {
                const req = http
                    .request(
                        {
                            hostname: host,
                            port,
                            method: this.httpMethod(),
                            path: `${this.absolutePath()}?${this.httpQueryString()}`,
                            headers: this.httpHeaders(),
                        },
                        (res: http.IncomingMessage) => {
                            let data = '';

                            res.on('data', (chunk) => {
                                data += chunk;
                            });

                            res.on('end', () => {
                                const response = JSON.parse(data);
                                if (response.error) {
                                    reject(response.error.msg);
                                }
                                else {
                                    resolve(JSON.parse(data));
                                }
                            });
                        },
                    )
                    .on('error', (error) => {
                        reject(error);
                    });

                if (this.httpMethod() === 'POST') {
                    this.httpBodyStream().pipe(req);
                } else {
                    req.end();
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * The path that should be called on the endpoint
     */
    protected abstract absolutePath(): string;

    /**
     * The http headers that should be send with the request
     */
    protected abstract httpHeaders(): { 'content-type'?: string };

    /**
     * The http method that should be used to send request to server
     */
    protected abstract httpMethod(): 'GET' | 'POST';

    /**
     * Generates the http query string that will be sent to Solr, regardless of _solrHttpMethod
     *
     * @abstract
     * @returns {string}
     * @memberof SolrRequest
     */
    protected abstract httpQueryString(): string;

    /**
     * Generates the http body that will be sent to Solr in case _solrHttpMethod equals 'POST'
     *
     * @abstract
     * @returns {string}
     * @memberof SolrRequest
     */
    protected abstract httpBodyStream(): Readable;
}
