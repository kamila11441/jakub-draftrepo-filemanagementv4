 
# Jakub Kowalski — Editorial Portfolio + Picture Manager

A complete static GitHub Pages photography portfolio with a separate upload/manage page.

## Package contents
- `index.html` — responsive editorial portfolio homepage
- `admin/pictures.html` — upload and manage gallery images
- `content/gallery.json` — gallery data file
- `images/` — destination for uploaded photographs

## Authentication / token setup

- Resource owner: `kamila11441`
- Repository access: Only select repositories → `jakub-draftrepo-filemanagementv4`
- Repository permissions: Contents → Read and write

## Gallery JSON structure
The homepage reads `content/gallery.json` and supports:
```json
{
  "photos": [
    { "image": "images/example.jpg", "alt": "Portrait in natural light", "category": "people" }
  ]
}
```
Categories: `people`, `events`, `editorial`, `other`.

## Notes
- The first gallery photo is used as the large hero image.
- The public page, neutral grey placeholders are used until you upload your own images.
- Removing a photo removes it from the gallery json AND repository.
- Max upload size is 20 MB per file. GitHub API limits and browser memory can make very large uploads unreliable.
