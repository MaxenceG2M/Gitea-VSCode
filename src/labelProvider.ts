import * as vscode from 'vscode';

import { AbstractProvider } from './abstractProvider';
import { IssueProvider } from './issueProvider';
import { Label } from './label';
import { Logger } from './logger';

export class LabelProvider extends AbstractProvider<Label> {
    public async getData(page: number = 1) : Promise<Label[]> {
        let labels: Label[] = [];
        Logger.log( `Retrieve labels - page ${page}`);
        const labelsOfPage = (await this.giteaConnector.getLabels(this.config.repoApiLabelsUrl, page)).data;
        Logger.log( `Get Labels page ${page}: ${labelsOfPage.length} retrieved`);

        labelsOfPage.forEach((c) => {
            c.label = c.name
            let label = Label.createLabel(c)

            label.labelId = c.id;
            label.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
            label.contextValue = 'label';
            label.issueProvider = new IssueProvider('all', label.name)
            labels.push(label)
        });

        return labels
    }

    protected async createChildNodes(element?: Label) {
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

