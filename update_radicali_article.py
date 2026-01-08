import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\social-connection-and-longevity\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replacement 1: Image URLs (both srcset and data-src)
content = content.replace(
    '../../../jd-cms.onrender.com/uploads/Screenshot_2024_10_29_at_11_23_36_PM_a3549d4e94.png',
    '../../assets/images/poza mare - lectia cu radicali.png'
)

content = content.replace(
    'https://jd-cms.onrender.com/uploads/Screenshot_2024_10_29_at_11_23_36_PM_a3549d4e94.png',
    '../../assets/images/poza mare - lectia cu radicali.png'
)

# Replacement 2: Title
content = content.replace(
    'Enhancing Human Connection through AI: Reflections from Abundance 360',
    'Radicali'
)

# Replacement 3: Description text
content = content.replace(
    'At Abundance 360, Mo Gawdat inspired a vision of how AI can bridge the gap in human connections, deepening conversations and fostering empathy in ways we never thought possible.',
    'Pentru a stăpâni radicalii, înțelege întâi cum se formează: descompune-i corect în factori primi!'
)

# Replacement 4: Remove category spans (the three category labels)
# Find and replace the entire category div section
old_category_section = '<div class="uppercase text-base mb-16 leading-small font-secondary"><span class="post-category">AI &amp; Technology in Human Potential</span><span class="post-category">Social Connection &amp; Longevity</span><span class="post-category">Values &amp; Ethics</span></div>'
new_category_section = '<div class="uppercase text-base mb-16 leading-small font-secondary"></div>'

content = content.replace(old_category_section, new_category_section)

# Write the file back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated image URLs")
print("✓ Updated title to 'Radicali'")
print("✓ Updated description text")
print("✓ Removed category labels")
print("\nAll changes completed successfully!")
