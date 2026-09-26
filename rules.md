# Initialization Directive
Prior to initiating any file modifications, executing new commands, or beginning a new task, you MUST read the `codemapstructure.md` file in the root directory. 

Do not run exploratory directory traversal commands (like `ls`, `dir`, or `tree`) until you have consumed this file.

## Git & GitHub Directive

Prior to executing **any** `git` command (including `status`, `add`, `commit`, `push`,
`pull`, `branch`, `checkout`, `merge`, `rebase`, `stash`, `reset`, `revert`, `tag`) or any
GitHub action, you MUST invoke the `git-github-automation` skill and print its `<git_plan>`
pre-flight block before running the command.

- Policy: `.agents/skills/git-github-automation/SKILL.md`
- Always-on trigger: `.clinerules/git-github-automation.md`
- Playbook reference: `.cline/skills/mohid-playbook/skills.md` → *Skill: Git & GitHub Workflow Automation*

Hard bans, restated because they are easy to violate by accident:

1. **Never** commit to, push to, or merge into `main` or `dev`.
2. **Never** run `git push --force` — no `--force`, no `--force-with-lease`.
3. **Never** create a pull request or run any `gh` command; the GitHub CLI is not installed
   and no PRs are created in this repository.
4. **Never** commit with a failing `npm run build` or `npx tsc --noEmit`.
