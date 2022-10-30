import * as vscode from 'vscode';
import MarkdownIt = require('markdown-it');

import { showIssueHTML, showIssueMD } from './template.issues';
import { Issue, IssueState } from './issue';
import { IssueProvider } from './providers/issueProvider';
import { LabelProvider } from './providers/labelProvider';
import { MilestoneProvider } from './providers/milestoneProvider';
import { GiteaConnector } from './giteaConnector';

import { Logger } from './logger';
import { Config } from './config';

export function createIssueWebPanel(issue: Issue) {
    const panel = vscode.window.createWebviewPanel(
        'issue',
        issue.label,
        vscode.ViewColumn.Active,
        {
            enableScripts: true
        }
    );

    const config = new Config();

    if(config.render == 'html') {
        panel.webview.html = showIssueHTML(issue);
    } else {
        let markdownIt = new MarkdownIt()
        panel.webview.html = markdownIt.render(showIssueMD(issue));
    }

    return panel;
}

export function activate(context: vscode.ExtensionContext) {
    Logger.init()
    Logger.log('Starting Gitea ...');

    const config = new Config();
    const connector = new GiteaConnector(config.repoApiUrl, config.token, config.sslVerify)

    // Map of issues; This is used to determine whether an issue is already open
    // in a tab or not, so that it can be opened or reactivated.
    let openIssuePanels: Map<number, vscode.WebviewPanel> = new Map<number, vscode.WebviewPanel>();
    const openIssuesProvider = new IssueProvider(connector, IssueState.Open);
    const closedIssuesProvider = new IssueProvider(connector, IssueState.Closed);
    const labelsProvider = new LabelProvider(connector);
    const milestonesProvider = new MilestoneProvider(connector);

    vscode.window.registerTreeDataProvider('giteaIssues.opened-issues', openIssuesProvider);
    vscode.window.registerTreeDataProvider('giteaIssues.closed-issues', closedIssuesProvider);
    vscode.window.registerTreeDataProvider('giteaIssues.labels', labelsProvider);
    vscode.window.registerTreeDataProvider('giteaIssues.milestones', milestonesProvider);

    vscode.commands.registerCommand('giteaIssues.openIssue', (issue: Issue) => {
        const issueOpenable = !openIssuePanels.has(issue.issueId);
        if (issueOpenable) {
            const panel = createIssueWebPanel(issue);
            openIssuePanels.set(issue.issueId, panel);
            panel.onDidDispose((event) => {
                openIssuePanels.delete(issue.issueId);
            });
        }
        else {
            const panel = openIssuePanels.get(issue.issueId);
            panel?.reveal(panel.viewColumn, false);
        }
    });

    vscode.commands.registerCommand('giteaIssues.refreshIssues', () => {
        openIssuesProvider.refresh();
        closedIssuesProvider.refresh();
    });

    vscode.commands.registerCommand('giteaIssues.refreshOpenIssues', () => { openIssuesProvider.refresh() });
    vscode.commands.registerCommand('giteaIssues.refreshClosedIssues', () => { closedIssuesProvider.refresh() });
    vscode.commands.registerCommand('giteaIssues.refreshLabels', () => { labelsProvider.refresh() });
    vscode.commands.registerCommand('giteaIssues.refreshMilestones', () => { milestonesProvider.refresh() });

    Logger.log('Gitea is ready')
}

export function deactivate() {}
