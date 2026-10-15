 
# Jakub Kowalski — Editorial Portfolio + Picture Manager

A complete static GitHub Pages photography portfolio with a separate upload/manage page.

## Package contents
- `index.html` — responsive editorial portfolio homepage
- `admin/pictures.html` — upload and manage gallery images
- `content/gallery.json` — gallery data file
- `images/` — destination for uploaded photographs

## Install / update your existing repository
1. Download and unzip this package.
2. In `kamila11441/jakub-draftrepo-filemanagementv4`, upload or replace `index.html`.
3. Upload `admin/pictures.html` into the repository's `admin/` folder.
4. Upload `content/gallery.json` into `content/`. If you already have a gallery JSON with photographs, **do not replace it with the empty file in this package**; keep your existing file.
5. Ensure an `images/` folder exists. GitHub does not track empty folders, so it will appear after the first image is uploaded.
6. Commit changes to `main`.
7. Wait for GitHub Pages to deploy, then open:
   - Portfolio: https://kamila11441.github.io/jakub-draftrepo-filemanagementv4/
   - Picture Manager: https://kamila11441.github.io/jakub-draftrepo-filemanagementv4/admin/pictures.html

## Authentication / token setup
GitHub Pages is static, so it cannot keep an access token secret on a server. The manager uses the GitHub Contents API and asks for a token each session. The token is not stored in local storage and is not embedded in the code.

Create a fine-grained token at https://github.com/settings/personal-access-tokens/new:
- Resource owner: `kamila11441`
- Repository access: Only select repositories → `jakub-draftrepo-filemanagementv4`
- Repository permissions: Contents → Read and write

Keep the token private, never commit it, and clear it from the page when finished. It can modify files in the selected repository.

## Gallery JSON structure
The homepage reads `content/gallery.json` and supports:
```json
{
  "photos": [
    { "image": "images/example.jpg", "alt": "Portrait in natural light", "category": "people" }
  ]
}
```
Categories: `people`, `places`, `editorial`, `other`.

## Notes
- The first gallery photo is used as the large hero image.
- The public page has no sample stock photographs; neutral grey placeholders are used until you upload your own images.
- Removing a photo removes it from the gallery json AND repository.
- Max upload size is 20 MB per file. GitHub API limits and browser memory can make very large uploads unreliable.
