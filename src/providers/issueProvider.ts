import * as vscode from 'vscode';

import { GiteaConnector } from '../giteaConnector';
import { IGiteaResponse } from '../IGiteaResponse';
import { Issue, IssueState } from '../issue';
import { Logger } from '../logger';
import { AbstractProvider } from './abstractProvider';

export class IssueProvider extends AbstractProvider<Issue> {
    public static readonly DefaultState = IssueState.All;
    private state: string;
    private label?: string;
    private milestone?: string;

    constructor(giteaConnector: GiteaConnector, state: string = "all", label?: string, milestone?: string) {
        super(giteaConnector);
        this.state = state;
        this.label = label
        this.milestone = milestone
    }

    protected getData(page: number): Promise<IGiteaResponse> {
        return this.giteaConnector.getIssues(page, this.state, this.label, this.milestone)
    }

    protected createElement(element: any): Issue {
        element.label = `#${element.number} - ${element.title}`;

        let issue = Issue.createIssue(element)
        issue.issueId = element.number;
        issue.assignee = element.assignee === null ? 'Nobody' : element.assignee;
        issue.creator = element.user.login;
        issue.command = {
            command: 'giteaIssues.openIssue',
            title: '',
            arguments: [issue],
        };
        issue.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        issue.contextValue = 'issue';
        return issue
    }

    protected log(action: string, page: number): void {
        let milestone = this.milestone ? ` - milestone: ${this.milestone}` : '';
        let label = this.label ? ` - label: ${this.label}` : '';
        Logger.log(`${action} issues - state: ${this.state} - page: ${page}${label}${milestone}`)
    }

    protected createChildNodes(element: Issue | undefined): Promise< Issue [] | vscode.TreeItem[]> {
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
        return Promise.resolve(this.elementList);
    }
}

