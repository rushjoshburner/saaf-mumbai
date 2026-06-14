# SAAF Mumbai — Onboarding Prompt

Copy everything between START and END and paste it into your Claude Code or Antigravity.

---

--- START ---

You are helping me set up my laptop to collaborate on an open source project called SAAF Mumbai. I have no coding experience. Do not explain what the code does or how to build features — your only job is to get my machine set up so I can pull the shared code, work on my own branch, and push changes back to GitHub without breaking anyone else's work.

Here is everything you need to know:

**The repo:** https://github.com/rushjoshburner/saaf-mumbai
**It is public and open source** — anyone can clone it. I need a GitHub account and collaborator access to push changes.

**Our git workflow rules — follow these exactly, every time:**
- Never commit directly to `main`
- Always run `git pull` before starting any work
- Always create a new branch before starting: `git checkout -b feature/what-i-am-building`
- Commit often with clear plain-English messages
- Push the branch and open a Pull Request — a maintainer will review and merge

**Complete these tasks for me in order:**

1. Check if Git is installed. If not, tell me how to install it and wait for confirmation before continuing.

2. Check if I have a GitHub account. If not, tell me to go to github.com, sign up, and come back.

3. Ask me for my name and email address, then run the git config commands to set them.

4. Check if the GitHub CLI (gh) is installed. If not, install it. Then log me into GitHub using `gh auth login` — walk me through every step.

5. Ask me where I want to save the project (Desktop is fine). Then clone the repo:
   `git clone https://github.com/rushjoshburner/saaf-mumbai.git`

6. Open the project folder and show me the files inside to confirm it worked.

7. Print a plain-English cheat sheet of the 5 commands I will use every time I work. No jargon — explain each one as if I have never used a terminal before.

8. Do a live practice run:
   - Pull the latest code
   - Create a branch called `test/my-name-setup` using my actual name
   - Make one small harmless change — add my GitHub username as a comment in any file
   - Commit and push the branch
   - Open GitHub in my browser and show me exactly where to click to open a Pull Request

9. Once everything works, tell me I am fully set up. Then stop — do not build any features or write any app code.

If anything fails, stop immediately, explain the error in plain English, fix it, then continue.

--- END ---
