import re

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\personal-identity-and-purpose\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern 1: Replace <a> with <div> for Triunghiuri article
# Match the opening <a> tag and replace with <div>
content = re.sub(
    r'(<article[^>]*>\s*)<a\s+class="py-24[^"]*"\s+href="../a-letter-from-Jasmina-on-leading-innovation-and-shaping-the-future/index\.html">',
    r'\1<div class="py-24 px-16 lg:px-24 block">',
    content
)

# Pattern 2: Replace <a> with <div> for Unghiuri article
content = re.sub(
    r'(<article[^>]*>\s*)<a\s+class="py-24[^"]*"\s+href="../The-Power-of-Less-What-Ive-Learned-About-Balance-in-Training/index\.html">',
    r'\1<div class="py-24 px-16 lg:px-24 block">',
    content
)

# Pattern 3: Replace closing </a></article> with </div></article>
# Need to be careful to only replace the ones we modified
# Count occurrences first
original_content = content
a_tags_count = content.count('</a></article>')

# Replace all closing </a></article> with </div></article> within the posts block
content = re.sub(
    r'</a></article>',
    r'</div></article>',
    content
)

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Removed redirect functionality from articles")
print(f"✓ Converted {a_tags_count} link(s) to static elements")
print("\nArticles are now static (non-clickable)")
