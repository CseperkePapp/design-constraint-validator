# Wiki Setup Instructions

You've already copied the docs to the GitHub Wiki! Here's the complete structure:

## Current Wiki Pages

✅ **[Home](https://github.com/CseperkePapp/design-constraint-validator/wiki)** - Landing page  
✅ **[Getting Started](https://github.com/CseperkePapp/design-constraint-validator/wiki/Getting-Started)**  
✅ **[Constraints](https://github.com/CseperkePapp/design-constraint-validator/wiki/Constraints)**  
✅ **[CLI](https://github.com/CseperkePapp/design-constraint-validator/wiki/CLI)**  
✅ **[Configuration](https://github.com/CseperkePapp/design-constraint-validator/wiki/Configuration)**  
✅ **[Architecture](https://github.com/CseperkePapp/design-constraint-validator/wiki/Architecture)**  

## Missing Wiki Page

📋 **API** - You'll want to add this one too!

### To Add API Page:

1. Go to: https://github.com/CseperkePapp/design-constraint-validator/wiki
2. Click **"New Page"**
3. Title: `API`
4. Copy content from: `docs/API.md`
5. Save

## Updating the Home Page

The Home page content is in `docs/Home.md`. To update the wiki:

1. Go to: https://github.com/CseperkePapp/design-constraint-validator/wiki/Home
2. Click **Edit**
3. Copy content from `docs/Home.md`
4. Save

## Wiki Sidebar (Optional)

Create a custom sidebar for easy navigation:

1. Go to wiki → Click **"Add custom sidebar"**
2. Create a page named `_Sidebar`
3. Add this content:

```markdown
### Documentation

**[Home](./Home)**

### Getting Started
- **[Quick Start](./Getting-Started)**

### Guides
- **[Constraints](./Constraints)**
- **[CLI Reference](./CLI)**
- **[Configuration](./Configuration)**

### Advanced
- **[Architecture](./Architecture)**
- **[API Reference](./API)**

### Links
- [GitHub Repo](https://github.com/CseperkePapp/design-constraint-validator)
- [npm Package](https://www.npmjs.com/package/design-constraint-validator)
- [Issues](https://github.com/CseperkePapp/design-constraint-validator/issues)
```

## Keeping Docs in Sync

The docs live in both places:

1. **`docs/` folder** (in repo) - Version controlled, works offline
2. **Wiki** (on GitHub) - Discoverable, searchable, can be edited by others

To update both:
1. Edit files in `docs/` folder
2. Commit and push
3. Copy updated content to wiki pages

## Benefits of Dual Location

- **Repo docs** - Always available, versioned with code
- **Wiki** - Better discovery, community can contribute, searchable on GitHub

Both link to each other, so users can find either!
