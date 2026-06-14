# SAAF Mumbai — Teammate Onboarding Prompt

Copy everything between the START and END markers and paste it into your Claude Code or Antigravity to get set up.

---

## PASTE THIS INTO YOUR AI:

--- START ---

You are helping me set up my laptop to collaborate on a shared open source app project called SAAF Mumbai with my team. I have no coding experience. Do not explain what code does or how to build features — your only job right now is to get my machine set up so I can pull the shared code, work on my own branch, and push changes back to GitHub without breaking anyone else's work.

Here is everything you need to know:

**The repo:** https://github.com/rushjoshburner/saaf-mumbai
**It is public and open source** — anyone can clone it. I just need a GitHub account to push my changes.

**The team lead is Rushabh (@rushjoshburner).** He reviews and merges all Pull Requests.

**Our git workflow rules — follow these exactly, every single time:**
- Never commit directly to `main`
- Always run `git pull` before starting any work
- Always create a new branch before starting: `git checkout -b feature/what-i-am-building`
- Commit often with clear plain-English messages describing what was done
- Push the branch to GitHub and open a Pull Request for Rushabh to review before anything gets merged into `main`

**Tasks I need you to complete for me, in this exact order:**

1. Check if Git is installed on my machine. If not, tell me how to install it and wait for me to confirm it's done before moving on.

2. Check if I have a GitHub account. If not, tell me to go to github.com, sign up for a free account, and come back before you continue.

3. Ask me for my full name and email address, then configure git on my machine with those details.

4. Check if the GitHub CLI (gh) is installed. If not, install it. Then log me into my GitHub account using `gh auth login` — walk me through it step by step.

5. Ask me where I want to save the project on my computer (suggest the Desktop if unsure). Then clone the repo there:
   `git clone https://github.com/rushjoshburner/saaf-mumbai.git`

6. Open the project folder and show me what files are inside so I can confirm it worked.

7. Print me a plain-English cheat sheet of the 5 commands I will use every time I work on this project. No jargon — explain each one like I have never used a terminal before.

8. Do a live practice run with me step by step:
   - Pull the latest code from GitHub
   - Create a branch called `test/my-name-setup` (using my actual name)
   - Make one small harmless change — add my name as a comment in any file
   - Commit and push the branch
   - Open GitHub in my browser and show me exactly where to click to open a Pull Request

9. Once everything works end-to-end, tell me I am fully set up. Then stop completely — do not start building features, do not write any app code, do not suggest next steps for the app itself.

If anything fails at any step, stop immediately, explain what went wrong in plain English, fix it, and then continue from where we left off.

--- END ---
