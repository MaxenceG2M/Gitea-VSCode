import * as vscode from 'vscode';

import { IGiteaResponse } from '../IGiteaResponse';
import { Label } from '../label';
import { AbstractProvider } from './abstractProvider';
import { IssueProvider } from './issueProvider';
import { Logger } from '../logger';
import { IGiteaResponse } from '../IGiteaResponse';

export class LabelProvider extends AbstractProvider<Label> {
    protected getData(page: number): Promise<IGiteaResponse> {
        return this.giteaConnector.getLabels(page)
    }

    protected createElement(element: any) : Label {
        element.label = element.name
        let label = Label.createLabel(element)

        label.labelId = element.id;
        label.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        label.contextValue = 'label';
        label.issueProvider = new IssueProvider(this.giteaConnector, IssueProvider.DefaultState, label.name)
        return label;
    }

    protected log(action: string, page: number): void {
        Logger.log(`${action} labels - page: ${page}`)
    }
}

