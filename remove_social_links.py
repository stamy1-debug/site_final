import re

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\social-connection-and-longevity\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern 1: Replace <a> with <div> for Radicali article (enhancing-human-connection)
content = re.sub(
    r'(<article[^>]*>\s*)<a\s+class="py-24[^"]*"\s+href="../enhancing-human-connection-through-ai/index\.html">',
    r'\1<div class="py-24 px-16 lg:px-24 block">',
    content
)

# Pattern 2: Replace <a> with <div> for Divizori article (how-empathy-and-innovation)
content = re.sub(
    r'(<article[^>]*>\s*)<a\s+class="py-24[^"]*"\s+href="../how-empathy-and-innovation-fuel-human-potential-a-vision-for-the-future/index\.html">',
    r'\1<div class="py-24 px-16 lg:px-24 block">',
    content
)

# Pattern 3: Replace closing </a></article> with </div></article>
a_tags_count = content.count('</a></article>')
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
print("\nArticles 'Radicali' and 'Divizori' are now static (non-clickable)")
