import { Config } from './config';
import { Issue } from './issue';

export function showIssueHTML(issue: Issue) {
  return `<body>
    <h1>{{label}}</h1>
    <table>
      <tr>
        <td>
          Title
        </td>
        <td >
          {{label}}
        </td>
      </tr>
      <tr>
        <td>
          State
        </td>
        <td>
          {{state}}
        </td>
      </tr>
      <tr >
        <td>
          Assignee
        </td>
        <td>
          {{assignee}}
        </td>
      </tr>
    </table>
    <p style="font-size: 20pt">
      {{description}}
    </p>
    </body>
  `
    .replace('{{label}}', issue.label)
    .replace('{{state}}', issue.state)
    .replace('{{assignee}}', issue.assignee)
    .replace('{{description}}', issue.body)
    .replace('{{label}}', issue.label);
}


export function showIssueMD(issue: Issue) {
    let md_labels = issue.labels.map(label => {
        return '![' + label.name + '](https://img.shields.io/badge/' + label.name.replace(' ', '_') + '-' + label.color + '.svg)'
    }).join(', ')

    let assignees = issue.assignees === null ? "Nobody" : issue.assignees.map(assignee => { return assignee.login }).join(', ');

    const config = new Config()
    let content = issue.body;
    const rExpIssueId : RegExp = /#[0-9]*/g;
    const issueIds = content.match(rExpIssueId)

    if (issueIds) {
        issueIds.forEach(id => {
            content = content.replace(id, `[${id}](${config.baseURL}/issues/${id.replace('#','')})`)
        })
    }

    let md =  `# {{title}} (#{{id}})

{{description}}

---

* State: {{state}}
* Assignee: {{assignee}}
* Labels: {{labels}}
* [See in browser]({{html_url}})
* Milestone: {{milestone}}
* Labels:
    `
    .replace('{{title}}', issue.title)
    .replace('{{id}}', issue.issueId.toString())
    .replace('{{description}}', content)
    .replace('{{state}}', issue.state)
    .replace('{{assignee}}', assignees)
    .replace('{{labels}}', md_labels)
    .replace('{{html_url}}', issue.html_url)
    .replace('{{milestone}}', (issue.milestone? issue.milestone.title : "None"))

    return md
}
