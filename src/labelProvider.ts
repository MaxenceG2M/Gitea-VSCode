import * as vscode from 'vscode';

import { Config } from './config';
import { GiteaConnector } from './giteaConnector';
import { Label } from './label';
import { Logger } from './logger';

export class LabelProvider implements vscode.TreeDataProvider<Label> {
    private _onDidChangeTreeData: vscode.EventEmitter<Label | undefined | null | void> = new vscode.EventEmitter<Label | undefined | null | void>();

    readonly onDidChangeTreeData: vscode.Event<Label | undefined | null | void> = this._onDidChangeTreeData.event;

    private labelList: Label[] = [];

    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    public getTreeItem(element: Label): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    public async getLabelsAsync() {
        this.labelList = [];
        const config = new Config();
        const giteaConnector = new GiteaConnector(config.token, config.sslVerify);

        const labels = [];
        let page = 1;
        while (page < 11) {
            this.logger.log( `Retrieve labels - page ${page}`);
            const labelsOfPage = (await giteaConnector.getLabels(config.repoApiLabelsUrl, page)).data;
            this.logger.log( `Get Labels page ${page}: ${labelsOfPage.length} retrieved`);
            labels.push(...labelsOfPage);
            labelsOfPage.forEach((c) => {
                c.label = `#${c.id} - ${c.name}`;
                c.label = `${c.name} (#${c.id})`;
                c.labelId = c.id;
            });
            page++;
            if (labelsOfPage.length < 10) {
                break;
            }
        }
        this.labelList = labels as Label[];
        this.labelList.forEach((label: Label) => {
            // label.command = {
            //     command: 'giteaIssues.openIssue',
            //     title: '',
            //     arguments: [label],
            // };
            // label.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            // label.contextValue = 'issue';
        });
    }

    public async refresh() {
        await this.getLabelsAsync();
        this._onDidChangeTreeData.fire();
    }

    public getChildren(element?: Label): vscode.ProviderResult<any[]> {
        return this.createChildNodes(element, this.labelList);
    }

    private createChildNodes(element: Label | undefined, labels: Label[]) {
        return labels;
    }
}

