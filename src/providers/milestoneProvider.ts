import * as vscode from 'vscode';

import { AbstractProvider } from './abstractProvider';
import { IssueProvider } from './issueProvider';
import { Milestone } from '../milestone';
import { IGiteaResponse } from '../IGiteaResponse';
import { Logger } from '../logger';

export class MilestoneProvider extends AbstractProvider<Milestone> {
    protected getData(page: number): Promise<IGiteaResponse> {
        return this.giteaConnector.getMilestones(this.config.repoApiMilestonesUrl, page)
    }

    protected createElement(element: any): Milestone {
        element.milestone = element.title
        let milestone = Milestone.createMilestone(element)

        milestone.milestoneId = element.id;
        milestone.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        milestone.contextValue = 'milestone';
        milestone.issueProvider = new IssueProvider('all', undefined, milestone.title)
        return milestone;
    }

    protected async createChildNodes(element?: Milestone) {
        for (const label of this.elementList) {
            if (element === label) {
                let issues = await Promise.resolve(label.issueProvider?.getElements());

                if (!issues) return Promise.resolve([]);

                let childItems: vscode.TreeItem[] = issues;
                childItems.map(issue => issue.collapsibleState = vscode.TreeItemCollapsibleState.None)

                return Promise.resolve(childItems)
            }
        }
        return this.elementList;
    }

    protected log(action: string, page: number): void {
        Logger.log(`${action} milestone - page: ${page}`)
    }
}

