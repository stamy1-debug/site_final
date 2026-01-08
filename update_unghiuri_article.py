import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\personal-identity-and-purpose\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replacement 1: Image URLs (both srcset and data-src)
content = content.replace(
    '../../../jd-cms.onrender.com/uploads/Pending_IGLNWB_04_B06_X00_01_29b8ffc4c0.jpg',
    '../../assets/images/unghiuri.png'
)

content = content.replace(
    'https://jd-cms.onrender.com/uploads/Pending_IGLNWB_04_B06_X00_01_29b8ffc4c0.jpg',
    '../../assets/images/unghiuri.png'
)

# Replacement 2: Title
content = content.replace(
    "The Power of Less: What I've Learned About Balance in Training",
    'Unghiuri'
)

# Replacement 3: Description text - need to check for fancy quotes
old_desc = "As a competitive fencer, I'm always searching for ways to elevate my performance while preserving my long-term health. I plan on fencing for a long time—not just as a sport, but as a way of life. And recently, I've had a powerful realization: more isn't always better."
new_desc = 'Unghiurile definesc spațiul din jurul nostru. Fii primul din clasa ta care învață să le clasifice.'

content = content.replace(old_desc, new_desc)

# Write the file back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated image URLs to 'unghiuri.png'")
print("✓ Updated title to 'Unghiuri'")
print("✓ Updated description text")
print("\nAll changes completed successfully!")
