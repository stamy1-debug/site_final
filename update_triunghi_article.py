import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\personal-identity-and-purpose\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replacement 1: Image URLs (both srcset and data-src)
content = content.replace(
    '../../../jd-cms.onrender.com/uploads/A_Letter_from_our_Founder_on_Leading_Innovation_and_Shaping_the_Future_9e841ba3ad.png',
    '../../assets/images/triunghi.png'
)

content = content.replace(
    'https://jd-cms.onrender.com/uploads/A_Letter_from_our_Founder_on_Leading_Innovation_and_Shaping_the_Future_9e841ba3ad.png',
    '../../assets/images/triunghi.png'
)

# Replacement 2: Title
content = content.replace(
    'A Letter from Jasmina on Leading Innovation and Shaping the Future',
    'Triunghiuri:'
)

# Replacement 3: Description text
content = content.replace(
    "I've spent my life exploring science, technology, and human potential. Now, with JasminaDenner.com, I'm creating a space to push boundaries and shape the future—where innovation meets humanity. Join me on this journey!",
    '3 unghiuri, 3 vârfuri și 3 laturi. Tu ce mai găsești cu 3?'
)

# Write the file back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated image URLs to 'triunghi.png'")
print("✓ Updated title to 'Triunghiuri:'")
print("✓ Updated description text")
print("\nAll changes completed successfully!")
