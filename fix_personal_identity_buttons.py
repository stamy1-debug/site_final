import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\personal-identity-and-purpose\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace 1: Update Triunghiuri text
content = content.replace(
    "I've spent my life exploring science, technology, and human potential. Now, with JasminaDenner.com, I'm creating a space to push boundaries and shape the future—where innovation meets humanity. Join me on this journey!",
    "3 unghiuri, 3 vârfuri și 3 laturi. Tu ce mai găsești cu 3?"
)

# Replace 2: Update Unghiuri text  
content = content.replace(
    "As a competitive fencer, I'm always searching for ways to elevate my performance while preserving my long-term health. I plan on fencing for a long time—not just as a sport, but as a way of life. And recently, I've had a powerful realization: more isn't always better.",
    "Unghiurile definesc spațiul din jurul nostru. Fii primul din clasa ta care învață să le clasifice."
)

# Replace 3: Add button for Triunghiuri (after the Romanian text)
content = content.replace(
    '<p class="mb-0 laptop:mb-8">3 unghiuri, 3 vârfuri și 3 laturi. Tu ce mai găsești cu 3?</p><div class="justify-end pb-16 hidden laptop:flex"><svg class="svgi post-hover-arrow" aria-labelledby="symbol-arrow-right-long-desc-cy"',
    '<p class="mb-0 laptop:mb-8">3 unghiuri, 3 vârfuri și 3 laturi. Tu ce mai găsești cu 3?</p><div class="mt-16 flex justify-center laptop:justify-start"><a href="../../assets/pdf/Clasificarea_Triunghiurilor__Mate_cu_Succes.pdf" download="Clasificarea_Triunghiurilor__Mate_cu_Succes.pdf" class="btn btn--primary">Descarcă acum</a></div><div class="justify-end pb-16 hidden laptop:flex"><svg class="svgi post-hover-arrow" aria-labelledby="symbol-arrow-right-long-desc-cy"'
)

# Replace 4: Add button for Unghiuri (after the Romanian text)
content = content.replace(
    '<p class="mb-0 laptop:mb-8">Unghiurile definesc spațiul din jurul nostru. Fii primul din clasa ta care învață să le clasifice.</p><div class="justify-end pb-16 hidden laptop:flex"><svg class="svgi post-hover-arrow" aria-labelledby="symbol-arrow-right-long-desc-d0"',
    '<p class="mb-0 laptop:mb-8">Unghiurile definesc spațiul din jurul nostru. Fii primul din clasa ta care învață să le clasifice.</p><div class="mt-16 flex justify-center laptop:justify-start"><a href="../../assets/pdf/Clasificarea_unghiurilor___Mate_cu_Succes.pdf" download="Clasificarea_unghiurilor___Mate_cu_Succes.pdf" class="btn btn--primary">Descarcă acum</a></div><div class="justify-end pb-16 hidden laptop:flex"><svg class="svgi post-hover-arrow" aria-labelledby="symbol-arrow-right-long-desc-d0"'
)

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated Triunghiuri text and added download button")
print("✓ Updated Unghiuri text and added download button")
print("\nAll changes completed successfully!")
