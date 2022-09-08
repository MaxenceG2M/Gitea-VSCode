import { TreeItem, TreeItemCollapsibleState } from 'vscode';
import { IssueProvider } from './providers/issueProvider';

export class Milestone extends TreeItem {

  static createMilestone(element: Milestone) {
    return new Milestone(
        element.milestone,
        element.milestoneId,
        element.title,
        element.description,
        element.collapsibleState
    )
  }

  constructor(
    public readonly milestone: string,
    public milestoneId: number,
    public title: string,
    public description: string,
    public collapsibleState: TreeItemCollapsibleState,
    public issueProvider?: IssueProvider
  ) {
    super(milestone, collapsibleState);
    this.tooltip = this.milestone;
  }
}
