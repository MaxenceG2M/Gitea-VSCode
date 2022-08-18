import * as vscode from 'vscode';

import { Config } from './config';
import { GiteaConnector } from './giteaConnector';
import { Issue } from './issue';
import { IssueProvider } from './issueProvider';
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

    public async getLabels() {
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
                c.label = c.name
                c.labelId = c.id;
            });
            page++;
            if (labelsOfPage.length < 10) {
                break;
            }
        }
        this.labelList = [];
        labels.forEach((element: Label) => {
            let label = Label.createLabel(element)
            label.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            label.contextValue = 'label';
            label.issueProvider = new IssueProvider('all', this.logger, label.name)
            this.labelList.push(label)
        });
    }

    public async refresh() {
        await this.getLabels();
        this._onDidChangeTreeData.fire();
    }

    public getChildren(element?: Label): vscode.ProviderResult<any[]> {
        if (element === undefined) {
            return this.labelList;
        }

        if (element instanceof Label) {
            return this.createChildNodes(this.labelList, element)
        }
    }

    private async createChildNodes(labels: Label[], element?: Label) {
        for (const label of labels) {
            if (element === label) {
                let issues = await Promise.resolve(label.issueProvider?.getIssues());

                if (!issues) return Promise.resolve([]);

                let childItems: vscode.TreeItem[] = issues;
                childItems.map(issue => issue.collapsibleState = vscode.TreeItemCollapsibleState.None)

                return Promise.resolve(childItems)
            }
        }
        return this.labelList;
    }
}

