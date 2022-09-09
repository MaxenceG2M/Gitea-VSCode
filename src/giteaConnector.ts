import * as vscode from 'vscode';
import * as https from 'https';
import axios from 'axios';

import { IGiteaResponse } from './IGiteaResponse';
import { Logger } from './logger';

enum GiteaEndpoint {
    Issues = 'issues',
    Labels = 'labels',
    Milestones = 'milestones',
}

export class GiteaConnector {
    private repoUri: string;
    private authToken: string;
    private ssl: boolean;
    private logger: Logger;

    public constructor(repoUri: string, authToken: string, ssl: boolean = false) {
        this.repoUri = repoUri;
        this.authToken = authToken;
        this.ssl = ssl;
        this.logger = logger
    }

    public async getIssues(page: number = 1, state: string = 'all', label? :string, milestone?: string): Promise<IGiteaResponse> {
        let endpoint = `${this.repoUri}/${GiteaEndpoint.Issues}?state=${state}&page=${page}`;
        if (label) {
            endpoint += `&labels=${label}`
        }
        if (milestone) {
            endpoint += `&milestones=${milestone}`
        }
        return this.getEndpoint(endpoint);
    }

    public async getLabels(page: number = 0): Promise<IGiteaResponse> {
        return this.getEndpoint(`${this.repoUri}/${GiteaEndpoint.Labels}?page=${page}`);
    }

    public async getMilestones(page: number = 0): Promise<IGiteaResponse> {
        return this.getEndpoint(`${this.repoUri}/${GiteaEndpoint.Milestones}?page=${page}`);
    }

    public async getMilestones(page: number = 0): Promise<IGiteaResponse> {
        return this.getEndpoint(`${this.repoUri}/${GiteaEndpoint.Milestones}?page=${page}`);
    }

    private async getEndpoint(url: string): Promise<IGiteaResponse> {
        Logger.debug('getEndpoint', 'request', {'url': url})
        return new Promise<IGiteaResponse>((resolve, reject) => {
            return axios.get(url, this.requestOptions).then((data) => {
                resolve(data);
                Logger.debug('getEndpoint', 'response', {'url': url, 'status': data.status, 'size': data.data.length})
            }).catch((err) => {
                this.displayErrorMessage(err);
                Logger.log(err)
                reject(err);
            });
        });
    }

    private async postEndpoint(url: string): Promise<IGiteaResponse> {
        return new Promise<IGiteaResponse>((resolve, reject) => {
            return axios.post(url, this.requestOptions);
        });
    }

    private get requestOptions(): object {
        const agent = new https.Agent({
            rejectUnauthorized: this.ssl,
        });
        return {
            headers: {Authorization: 'token ' + this.authToken},
            httpsAgent: agent,
        };
    }

    private displayErrorMessage(err: string) {
        vscode.window.showErrorMessage("Error occoured. " + err);
    }
}
