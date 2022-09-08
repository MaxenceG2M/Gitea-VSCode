import * as vscode from 'vscode';

import { Issue } from '../issue';
import { Logger } from '../logger';
import { AbstractProvider } from './abstractProvider';

export class IssueProvider extends AbstractProvider<Issue> {
    private state: string;
    private label?: string;
    private milestone?: string;

    constructor(state: string, label?: string, milestone?: string) {
        super();
        this.state = state;
        this.label = label
        this.milestone = milestone
    }

    public async getData(page: number = 1, label?: string) : Promise<Issue[]> {
        let issues: Issue[] = [];

        Logger.log( `Retrieve issues. State: ${this.state} - page ${page}`);
        const issuesOfPage = (await this.giteaConnector.getIssues(
            this.config.repoApiIssuesUrl, this.state, page, this.label, this.milestone)).data;
        Logger.log( `${issuesOfPage.length} issues retrieved (state: ${this.state} - page: ${page})`);

        issuesOfPage.forEach((c) => {
            c.label = `#${c.number} - ${c.title}`;

            let issue = Issue.createIssue(c)
            issue.issueId = c.number;
            issue.assignee = c.assignee === null ? 'Nobody' : c.assignee;
            issue.creator = c.user.login;
            issue.command = {
                command: 'giteaIssues.openIssue',
                title: '',
                arguments: [issue],
            };
            issue.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            Logger.debug('Issue processed', { 'id': issue.issueId, 'state': issue.state })
            issue.contextValue = 'issue';
            issues.push(issue)
        });

        return issues;
    }

    protected createChildNodes(element: Issue | undefined): Issue[] | Promise<vscode.TreeItem[]> {
        for (const issue of this.elementList) {
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
        return this.elementList;
    }
}

