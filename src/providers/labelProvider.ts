import * as vscode from 'vscode';

import { IGiteaResponse } from '../IGiteaResponse';
import { Label } from '../label';
import { Logger } from '../logger';
import { AbstractProvider } from './abstractProvider';
import { IssueProvider } from './issueProvider';

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

    protected log(action: string, page: number): void {
        Logger.log(`${action} labels - page: ${page}`)
    }
}

