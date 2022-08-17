import { Uri, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { IssueProvider } from './providers/issueProvider';

export class Label extends TreeItem {

  static createLabel(element: Label) {
    return new Label(
        element.label,
        element.color,
        element.description,
        element.labelId,
        element.name,element.url,
        element.collapsibleState
    )
  }

  constructor(
    public readonly label: string,
    public color: string,
    public description: string,
    public labelId: number,
    public name: string,
    public url: string,
    public collapsibleState: TreeItemCollapsibleState,
    public issueProvider?: IssueProvider
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
  }

  labelDependentIcon(dark: boolean = false): Uri {
    return createIconWithColor(this.color);
  }

  iconPath = {
    light: this.labelDependentIcon(),
    dark: this.labelDependentIcon(true),
  };
}
