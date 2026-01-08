import re

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\personal-identity-and-purpose\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match the entire article for "Discovering AIgai"
# This pattern matches from <article to </article> for the AIgai article
pattern1 = re.compile(
    r'<article[^>]*>\s*<a[^>]*href="../discovering-a-igai-blending-technology-and-wellbeing-for-purposeful-living/index\.html"[^>]*>.*?</a>\s*</article>',
    re.DOTALL
)

# Pattern to match the entire article for "The End of History Illusion"
pattern2 = re.compile(
    r'<article[^>]*>\s*<a[^>]*href="../The-End-of-History-Illusion/index\.html"[^>]*>.*?</a>\s*</article>',
    re.DOTALL
)

# Remove both articles
original_content = content
content = pattern1.sub('', content)
count1 = len(pattern1.findall(original_content))

content = pattern2.sub('', content)
count2 = len(pattern2.findall(original_content))

# Write back
if content != original_content:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Removed 'Discovering AIgai' article: {count1} instance(s)")
    print(f"✓ Removed 'The End of History Illusion' article: {count2} instance(s)")
    print("\nBoth sections successfully deleted!")
else:
    print("No changes made - articles not found")
