import * as vscode from 'vscode';
import { Config } from './config';
import { GiteaConnector } from './giteaConnector';
import { Issue } from './issue';
import { Label } from './label';

import { Logger } from './logger';

export abstract class AbstractProvider<T extends Issue | Label> implements vscode.TreeDataProvider<T> {
    private _onDidChangeTreeData: vscode.EventEmitter<T | undefined | null | void> = new vscode.EventEmitter<T | undefined | null | void>();

    readonly onDidChangeTreeData: vscode.Event<T | undefined | null | void> = this._onDidChangeTreeData.event;

    protected elementList: T[] = [];

    protected readonly config: Config;
    protected readonly logger: Logger;
    protected readonly giteaConnector: GiteaConnector;

    constructor(logger: Logger) {
        this.logger = logger;
        this.config = new Config();
        this.giteaConnector = new GiteaConnector(this.config.token, this.config.sslVerify);
    }

    public getTreeItem(element: T): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    public async getElements() : Promise<T[]> {
        this.elementList = [];

        const elements = [];
        let page = 1;
        while (page < 11) {
            let retData = await Promise.resolve(this.getData(page))
            elements.push(...retData)
            page++

            if (retData.length < 10) {
                break;
            }
        }

        this.elementList = elements

        return this.elementList
    }

    public async refresh() {
        await this.getElements();
        this._onDidChangeTreeData.fire();
    }

    public getChildren(element?: T): vscode.ProviderResult<any[]> {
        return this.createChildNodes(element, this.elementList);
    }

    protected abstract createChildNodes(element: T | undefined, elements: T[]): T[] | Promise<vscode.TreeItem[]>;

    protected abstract getData(page: number): Promise<T[]>
}

