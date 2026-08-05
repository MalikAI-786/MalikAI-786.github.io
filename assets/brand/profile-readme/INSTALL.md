# Installing the GitHub profile README

GitHub shows a README at the top of your profile page when it lives in a
repository named exactly after your username. That repo does not exist yet, and
this integration is not permitted to create repositories, so it needs one
manual step.

1. Create a **public** repo named exactly `MalikAI-786`
   → https://github.com/new?name=MalikAI-786&visibility=public
   Tick "Add a README file" so the repo initialises.

2. Copy the contents of this folder into it, preserving the directory
   structure:

   ```
   README.md
   .github/brand/banner-dark.png
   .github/brand/banner-light.png
   ```

3. Commit to the default branch. It appears on
   https://github.com/MalikAI-786 immediately.

The banner is a `<picture>` element with light and dark sources, so it follows
the reader's GitHub theme. Regenerate it any time with
`assets/brand/make_banners.py`.
