# Rule: Git & GitHub Actions Are Gated

**Applies to:** every `git` command, and every GitHub action, without exception.

## Mandate

Before running **any** git or GitHub command — `status`, `add`, `commit`, `push`, `pull`,
`fetch`, `branch`, `checkout`, `switch`, `merge`, `rebase`, `reset`, `restore`, `stash`,
`tag`, `revert`, `log` — invoke the **`git-github-automation`** skill and emit its
`<git_plan>` pre-flight block first.

Read the full policy at `.agents/skills/git-github-automation/SKILL.md`.
