import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\social-connection-and-longevity\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replacement 1: Image URLs (both srcset and data-src)
content = content.replace(
    '../../../jd-cms.onrender.com/uploads/How_Empathy_and_Innovation_Fuel_Human_Potential_068cb7bcd8.png',
    '../../assets/images/divizibilitatea.png'
)

content = content.replace(
    'https://jd-cms.onrender.com/uploads/How_Empathy_and_Innovation_Fuel_Human_Potential_068cb7bcd8.png',
    '../../assets/images/divizibilitatea.png'
)

# Replacement 2: Title
content = content.replace(
    'How Empathy and Innovation Fuel Human Potential: A Vision for the Future',
    'Divizori'
)

# Replacement 3: Description text
content = content.replace(
    "Empathy is the essence of humanity—it's what drives us to connect, care, and create meaningful solutions. In a tech-driven world, combining innovation with empathy ensures that the advancements we make improve lives, not just profits.",
    'Tu ai mai auzit de divizorii proprii și improprii? Dacă nu, hai să aflăm împreună'
)

# Replacement 4: Remove category spans (the two category labels)
old_category_section = '<div class="uppercase text-base mb-16 leading-small font-secondary"><span class="post-category">Social Connection &amp; Longevity</span><span class="post-category">AI &amp; Technology in Human Potential</span></div>'
new_category_section = '<div class="uppercase text-base mb-16 leading-small font-secondary"></div>'

content = content.replace(old_category_section, new_category_section)

# Write the file back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated image URLs to 'divizibilitatea.png'")
print("✓ Updated title to 'Divizori'")
print("✓ Updated description text about divizori")
print("✓ Removed category labels")
print("\nAll changes completed successfully!")
