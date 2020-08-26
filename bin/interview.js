const _ = require('lodash')

const argv = require('yargs')
  .array('number')
  .describe('number', '指定生成的面试题')
  .number('count')
  .describe('count', '指定 Label 时，随机生成面试题个数')
  .array('label')
  .boolean(['renumber', 'issue', 'comment'])
  .describe('issue', '是否带有Issue地址')
  .default('issue', true)
  .describe('renumber', '是否指定序号')
  .default('renumber', true)
  .describe('comment', '是否带有答案')
  .default('comment', true)
  .help('help')
  .argv

const issues = require('../data/issues.json')

const issuesById = _.keyBy(issues, 'number')
const flatIssues = _.flatMap(issues, issue => _.map(issue.labels.nodes, label => _.omit({ ...issue, label }, '')))

const issuesByLabel = _.groupBy(flatIssues, 'label.name')

function getComment (question) {
  const comment = question.comments.nodes.find(comment => {
    return _.get(comment, 'author.login') === 'shfshanyue'
  })
  if (comment) {
    const commentBody = comment.body.replace(/\n#/g, '\n##')
    return commentBody
  }
}

function getIssueMd (issue) {
  const title = `## ${issue.title}`
  const body = issue.body && `<blockquote> 更多描述: ${issue.body} </blockquote>`
  const more = argv.issue ? `> 在 Issue 中交流与讨论: [${issue.title}](https://github.com/shfshanyue/Daily-Question/issues/${issue.number})` : ''
  const comment = getComment(issue)
  const md = _.compact([title, body, more, comment]).join('\n\n')
  return md
}

function getIssuesMd (issues) {
  return issues
    .map((issue, i) => {
      return {
        ...issue,
        title: argv.renumber ? `${_.padStart(i + 1, 2, 0)} ${issue.title.slice(6)}` : issue.title.slice(6)
      }
    })
    .map(issue => getIssueMd(issue))
    .join('\n\n')
}

function main() {
  if (argv.number) {
    const ids = argv.number
    const md = getIssuesMd(_.map(ids, id => _.get(issuesById, id)).filter(Boolean))
    console.log(md)
  } else if (argv.label) {
    const labels = argv.label
    const count = argv.count
    const comment = count ? true : argv.comment
    const issues = _.flatMap(labels, label => issuesByLabel[label]).filter(issue => comment ? issue.comment : true)
    const filterIssues = count ? Array.from(Array(count), x => _.random(issues.length-1)).map(x => _.get(issues, x)) : issues
    const md = getIssuesMd(_.sortBy(_.uniqBy(filterIssues, 'number'), 'number'))
    console.log(md)
  }
}

main()
