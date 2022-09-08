import * as vscode from 'vscode';

import { IGiteaResponse } from '../IGiteaResponse';
import { Milestone } from '../milestone';
import { AbstractProvider } from './abstractProvider';
import { IssueProvider } from './issueProvider';
import { Logger } from '../logger';
import { IGiteaResponse } from '../IGiteaResponse';

export class MilestoneProvider extends AbstractProvider<Milestone> {
    protected getData(page: number): Promise<IGiteaResponse> {
        return this.giteaConnector.getMilestones(page)
    }

    protected createElement(element: any): Milestone {
        element.milestone = element.title
        let milestone = Milestone.createMilestone(element)

        milestone.milestoneId = element.id;
        milestone.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        milestone.contextValue = 'milestone';
        milestone.issueProvider = new IssueProvider(this.giteaConnector, IssueProvider.DefaultState, undefined, milestone.title)
        return milestone;
    }

    protected log(action: string, page: number): void {
        Logger.log(`${action} milestone - page: ${page}`)
    }
}

