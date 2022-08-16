import * as vscode from 'vscode';

import { Issue } from './issue';
import { Config } from './config';
import { GiteaConnector } from './giteaConnector';
import { Logger } from './logger';

export class IssueProvider implements vscode.TreeDataProvider<Issue> {
    private _onDidChangeTreeData: vscode.EventEmitter<Issue | undefined | null | void> = new vscode.EventEmitter<Issue | undefined | null | void>();

    readonly onDidChangeTreeData: vscode.Event<Issue | undefined | null | void> = this._onDidChangeTreeData.event;

    private state: string;
    private label?: string;
    private issueList: Issue[] = [];

    constructor(state: string, label?: string) {
        this.state = state;
        this.label = label
    }

    public getTreeItem(element: Issue): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    public async getIssues(labelName?: string) : Promise<Issue[]> {
        this.issueList = [];
        const config = new Config();
        const giteaConnector = new GiteaConnector(config.token, config.sslVerify);

        const issues = [];
        let page = 1;
        while (page < 11) {
            Logger.log( `Retrieve issues. State: ${this.state} - page ${page}`);
            const issuesOfPage = (await giteaConnector.getIssues(config.repoApiIssuesUrl, this.state, page, this.label)).data;
            Logger.log( `${issuesOfPage.length} issues retrieved (state: ${this.state} - page: ${page})`);
            issues.push(...issuesOfPage);
            issuesOfPage.forEach((c) => {
                c.label = `#${c.number} - ${c.title}`;
                c.issueId = c.number;
                c.assignee = c.assignee === null ? 'Nobody' : c.assignee.login;
                c.assignees = c.assignees;
                c.creator = c.user.login;
            });
            page++;
            if (issuesOfPage.length < 10) {
                break;
            }
        }

        this.issueList = []
        issues.forEach((element: Issue) => {
            let issue = Issue.createIssue(element)

            issue.command = {
                command: 'giteaIssues.openIssue',
                title: '',
                arguments: [element],
            };
            issue.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            Logger.debug('Issue processed', { 'id': issue.issueId, 'state': issue.state })
            issue.contextValue = 'issue';
            this.issueList.push(issue)
        });

        return this.issueList
    }

    public async refresh() {
        await this.getIssues();
        this._onDidChangeTreeData.fire();
    }

    public getChildren(element?: Issue): vscode.ProviderResult<any[]> {
        return this.createChildNodes(element, this.issueList);
        // return element ? element.nodes : this.issueList
    }

    private createChildNodes(element: Issue | undefined, issues: Issue[]): Issue[] | Promise<vscode.TreeItem[]> {
        for (const issue of issues) {
            if (element === issue) {
                let childItems: vscode.TreeItem[] = [
                    new vscode.TreeItem('Assignee - ' + element.assignee, vscode.TreeItemCollapsibleState.None),
                    new vscode.TreeItem('State - ' + element.state, vscode.TreeItemCollapsibleState.None),
                    new vscode.TreeItem('ID - ' + element.issueId, vscode.TreeItemCollapsibleState.None),
                    new vscode.TreeItem('From - ' + element.creator, vscode.TreeItemCollapsibleState.None),
                ];
                return Promise.resolve(childItems);
            }
        }
        return issues;
    }
}

