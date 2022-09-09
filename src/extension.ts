import * as vscode from 'vscode';

import { Config } from './config';
import { GiteaConnector } from './giteaConnector';
import { Issue, IssueState } from './issue';
import { Logger } from './logger';
import { IssueProvider } from './providers/issueProvider';
import { LabelProvider } from './providers/labelProvider';
import { MilestoneProvider } from './providers/milestoneProvider';
import { showIssueHTML, showIssueMD } from './template.issues';
import MarkdownIt = require('markdown-it');

export function showIssueInWebPanel(issue: Issue) {
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

    // Array of issues; This is used to determine whether a issue is already open
    // in a tab or not.
    let openIssues: Array<Issue> = [];
    const openIssuesProvider = new IssueProvider(connector, IssueState.Open);
    const closedIssuesProvider = new IssueProvider(connector, IssueState.Closed);
    const labelsProvider = new LabelProvider(connector);
    const milestonesProvider = new MilestoneProvider(connector);

    vscode.window.registerTreeDataProvider('giteaIssues.opened-issues', openIssuesProvider);
    vscode.window.registerTreeDataProvider('giteaIssues.closed-issues', closedIssuesProvider);
    vscode.window.registerTreeDataProvider('giteaIssues.labels', labelsProvider);
    vscode.window.registerTreeDataProvider('giteaIssues.milestones', milestonesProvider);

    vscode.commands.registerCommand('giteaIssues.openIssue', (issue: Issue) => {
        const issueOpenable = openIssues.find((c) => c.issueId === issue.issueId) === undefined;

        if (issueOpenable) {
            const panel = showIssueInWebPanel(issue);
            openIssues.push(issue);
            panel.onDidDispose((event) => {
                openIssues.splice(openIssues.indexOf(issue), 1);
            });
        }
    });

    vscode.commands.registerCommand('giteaIssues.refreshIssues', () => {
        openIssuesProvider.refresh();
        closedIssuesProvider.refresh();
    });

    vscode.commands.registerCommand('giteaIssues.refreshOpenIssues', () => {
        openIssuesProvider.refresh();
    });

    vscode.commands.registerCommand('giteaIssues.refreshClosedIssues', () => {
        closedIssuesProvider.refresh()
    });

    vscode.commands.registerCommand('giteaIssues.refreshLabels', () => {
        labelsProvider.refresh()
    });

    vscode.commands.registerCommand('giteaIssues.refreshMilestones', () => {
        milestonesProvider.refresh()
    });

    Logger.log('Gitea is ready')
}

export function deactivate() {}
