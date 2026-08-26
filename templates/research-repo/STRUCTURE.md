# Setting this up

1. Create the repo (private). Prefilled link is in the chat.
2. Copy `README.md` and `.gitignore` from this folder into it.
3. Create the empty directories with a placeholder so git tracks them:

       mkdir -p instrument models analysis data docs output
       mkdir -p qualitative/{protocol,guide,memos,reflexivity,coding,propositions}
       touch instrument/.gitkeep models/.gitkeep analysis/.gitkeep docs/.gitkeep
       find qualitative -type d -exec touch {}/.gitkeep \;

4. Write `data/README.md` recording where the real data lives. That file is
   the one exception to the `data/` ignore rule, so it is the only thing in
   that directory git will ever see.
5. Copy the brand banners into `.github/brand/` (generate with
   `assets/brand/make_banners.py` in the site repo, adding a `research`
   surface to `SURFACES`).

## Why private

The instrument and the unpublished models are the contribution. Publishing
them before the dissertation is examined gives away the novel measurement
work and complicates any later journal submission, several of which treat
prior public posting as prior publication. Make it public after the defense,
or open a public subset that carries only what is already published.
