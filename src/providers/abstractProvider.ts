import * as vscode from 'vscode';
import { Config } from '../config';
import { GiteaConnector } from '../giteaConnector';
import { Issue } from '../issue';
import { Label } from '../label';
import { Milestone } from '../milestone';

import { Logger } from '../logger';
import { IGiteaResponse } from '../IGiteaResponse';

export abstract class AbstractProvider<T extends Issue | Label | Milestone> implements vscode.TreeDataProvider<T> {
    private _onDidChangeTreeData: vscode.EventEmitter<T | undefined | null | void> = new vscode.EventEmitter<T | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<T | undefined | null | void> = this._onDidChangeTreeData.event;

    protected elementList: T[] = [];

    protected readonly config: Config;
    protected readonly giteaConnector: GiteaConnector;

    constructor() {
        this.config = new Config();
        this.giteaConnector = new GiteaConnector(this.config.token, this.config.sslVerify);
    }

    public getTreeItem(element: T): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    public async getElements() : Promise<T[]> {
        this.elementList = [];

        let page = 1;
        while (page < 11) {
            this.log('Retrieve', page) // TODO find a better way to log ?
            const elementsOfPage = (await this.getData(page)).data;
            Logger.log(`Fetched ${elementsOfPage.length} elements`)
            elementsOfPage.forEach((c) => {
                c.label = c.name
                let element = this.createElement(c);
                this.elementList.push(element)
            });
            page++

            if (elementsOfPage.length < 10) {
                break;
            }
        }
        return this.elementList
    }

    /**
     * Get data on Gitea
     * @param page page number
     */
    protected abstract getData(page: number): Promise<IGiteaResponse>;

    /**
     * Create an object from a "raw" Gitea data
     * @param element element to convert
     */
    protected abstract createElement(element: any): T;

    protected abstract log(action: string, page: number): void;

    public async refresh() {
        await this.getElements();
        this._onDidChangeTreeData.fire();
    }

    public getChildren(element?: T): vscode.ProviderResult<any[]> {
        return this.createChildNodes(element);
    }

    protected async createChildNodes(element: T | undefined): Promise<T[] | vscode.TreeItem[]> {
        for (const currentEl of this.elementList) {
            if (element === currentEl) {
                if (currentEl instanceof Issue) {
                    throw "Issues need a specific implementation to show children";
                }

                let issues = await Promise.resolve(currentEl.issueProvider?.getElements());
                if (!issues) return Promise.resolve([]);

                let childItems: vscode.TreeItem[] = issues;
                childItems.map(issue => issue.collapsibleState = vscode.TreeItemCollapsibleState.None)

                return Promise.resolve(childItems)
            }
        }
        return this.elementList;
    }
}

