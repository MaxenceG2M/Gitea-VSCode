import * as vscode from 'vscode';

import { AbstractProvider } from './abstractProvider';
import { IssueProvider } from './issueProvider';
import { Milestone } from '../milestone';
import { Logger } from '../logger';

export class MilestoneProvider extends AbstractProvider<Milestone> {
    public async getData(page: number = 1) : Promise<Milestone[]> {
        let milestones: Milestone[] = [];
        Logger.log( `Retrieve milestones - page ${page}`);
        const milestonesOfPage = (await this.giteaConnector.getMilestones(this.config.repoApiMilestonesUrl, page)).data;
        Logger.log( `Get Milestones page ${page}: ${milestonesOfPage.length} retrieved`);

        milestonesOfPage.forEach((c) => {
            c.milestone = c.title
            let milestone = Milestone.createMilestone(c)

            milestone.milestoneId = c.id;
            milestone.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            milestone.contextValue = 'milestone';
            milestone.issueProvider = new IssueProvider('all', undefined, milestone.title)
            milestones.push(milestone)
        });

        return milestones
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
}

