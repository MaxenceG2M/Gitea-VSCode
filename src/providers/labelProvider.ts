import * as vscode from 'vscode';

import { AbstractProvider } from './abstractProvider';
import { IssueProvider } from './issueProvider';
import { Label } from '../label';
import { IGiteaResponse } from '../IGiteaResponse';

export class LabelProvider extends AbstractProvider<Label> {
    protected getData(page: number): Promise<IGiteaResponse> {
        return this.giteaConnector.getLabels(this.config.repoApiLabelsUrl, page)
    }

    protected createElement(element: any) : Label {
        element.label = element.name
        let label = Label.createLabel(element)

        label.labelId = element.id;
        label.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        label.contextValue = 'label';
        label.issueProvider = new IssueProvider('all', label.name)
        return label;
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

