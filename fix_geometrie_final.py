import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\personal-identity-and-purpose\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and extract the exact text for Triunghiuri
idx1 = content.find("I've spent my life exploring science")
if idx1 != -1:
    end1 = content.find("!", idx1) + 1
    old_text1 = content[idx1:end1]
    print("Found Triunghiuri text:")
    print(repr(old_text1))
    
    # Replace text
    new_text1 = "3 unghiuri, 3 vârfuri și 3 laturi. Tu ce mai găsești cu 3?"
    content = content.replace(old_text1, new_text1)
    
    # Add button after the new Romanian text
    content = content.replace(
        '<p class="mb-0 laptop:mb-8">3 unghiuri, 3 vârfuri și 3 laturi. Tu ce mai găsești cu 3?</p><div class="justify-end pb-16 hidden laptop:flex">',
        '<p class="mb-0 laptop:mb-8">3 unghiuri, 3 vârfuri și 3 laturi. Tu ce mai găsești cu 3?</p><div class="mt-16 flex justify-center laptop:justify-start"><a href="../../assets/pdf/Clasificarea_Triunghiurilor__Mate_cu_Succes.pdf" download="Clasificarea_Triunghiurilor__Mate_cu_Succes.pdf" class="btn btn--primary">Descarcă acum</a></div><div class="justify-end pb-16 hidden laptop:flex">'
    )
    print("✓ Updated Triunghiuri")

# Find and extract the exact text for Unghiuri
idx2 = content.find("As a competitive fencer")
if idx2 != -1:
    end2 = content.find("better.", idx2) + 7
    old_text2 = content[idx2:end2]
    print("\nFound Unghiuri text:")
    print(repr(old_text2))
    
    # Replace text
    new_text2 = "Unghiurile definesc spațiul din jurul nostru. Fii primul din clasa ta care învață să le clasifice."
    content = content.replace(old_text2, new_text2)
    
    # Add button after the new Romanian text
    content = content.replace(
        '<p class="mb-0 laptop:mb-8">Unghiurile definesc spațiul din jurul nostru. Fii primul din clasa ta care învață să le clasifice.</p><div class="justify-end pb-16 hidden laptop:flex">',
        '<p class="mb-0 laptop:mb-8">Unghiurile definesc spațiul din jurul nostru. Fii primul din clasa ta care învață să le clasifice.</p><div class="mt-16 flex justify-center laptop:justify-start"><a href="../../assets/pdf/Clasificarea_unghiurilor___Mate_cu_Succes.pdf" download="Clasificarea_unghiurilor___Mate_cu_Succes.pdf" class="btn btn--primary">Descarcă acum</a></div><div class="justify-end pb-16 hidden laptop:flex">'
    )
    print("✓ Updated Unghiuri")

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✓✓✓ All changes saved successfully!")
