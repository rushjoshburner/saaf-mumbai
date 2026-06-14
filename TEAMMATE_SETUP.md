# SAAF Mumbai — Teammate Onboarding Prompt

Copy everything below the line and paste it into your Claude Code or Antigravity to get set up.

---

## PASTE THIS INTO YOUR AI:

---

You are helping me set up my laptop to collaborate on a shared app project called SAAF Mumbai with my team. I have no coding experience. Do not explain what code does or how to build features — your only job right now is to get my machine set up so I can pull the shared code, work on my own branch, and push changes back to GitHub without breaking anyone else's work.

Here is everything you need to know:

**The repo:** https://github.com/rushjoshburner/saaf-mumbai  
**It is private** — I need to be added as a collaborator by Rushabh before I can access it.

**Our git workflow rules (follow these exactly, every time):**
- Never commit directly to `main`
- Always start by running `git pull` before doing anything
- Always create a new branch before starting work: `git checkout -b feature/what-i-am-building`
- Commit often with clear messages describing what was done
- Push the branch and open a Pull Request on GitHub for Rushabh to review before merging

**Tasks I need you to complete for me in order:**

1. Check if Git is installed on my machine. If not, tell me exactly how to install it.

2. Check if I have a GitHub account. If not, tell me to go to github.com and create one, then come back.

3. Configure git on my machine with my name and email:
   - Ask me for my name and email, then run the git config commands.

4. Install the GitHub CLI (gh) if it is not already installed, and log me into my GitHub account using `gh auth login`.

5. Clone the SAAF Mumbai repo to my machine:
   - Ask me where I want to store the project folder (Desktop is fine as a default)
   - Run `git clone https://github.com/rushjoshburner/saaf-mumbai.git` in that location

6. Open the project folder and confirm everything looks right by showing me what files are inside.

7. Teach me the 5 commands I will use every single time I work on this project, and explain each one in plain English (not technical terms). Print them as a cheat sheet I can save.

8. Do a practice run with me:
   - Pull the latest code
   - Create a test branch called `test/my-name-setup`
   - Make a small harmless change (like adding my name to a file)
   - Commit and push it
   - Tell me how to open a Pull Request on GitHub

9. Once everything is working, tell me I am set up and ready. Then stop — do not start building any features or writing any app code.

If anything goes wrong at any step, stop and explain the error in plain English before trying to fix it.

---
