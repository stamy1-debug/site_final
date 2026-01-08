import os
import re

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\personal-identity-and-purpose\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Update text description for Unghiuri (if still in English)
old_text = "As a competitive fencer, I'm always searching for ways to elevate my performance while preserving my long-term health. I plan on fencing for a long time—not just as a sport, but as a way of life. And recently, I've had a powerful realization: more isn't always better."
new_text = "Unghiurile definesc spațiul din jurul nostru. Fii primul din clasa ta care învață să le clasifice."

content = content.replace(old_text, new_text)

# Add download button for Unghiuri
# Pattern to find the specific section for Unghiuri
pattern = re.compile(
    r'(<h3 class="h5 mb-8 underline-title leading-small"><span>Unghiuri</span></h3><p class="mb-0 laptop:mb-8">Unghiurile definesc spațiul din jurul nostru\. Fii primul din clasa ta care învață să le clasifice\.</p>)(<div class="justify-end pb-16 hidden laptop:flex">)',
    re.DOTALL
)

button_html = '<div class="mt-16 flex justify-center laptop:justify-start"><a href="../../assets/pdf/Clasificarea_unghiurilor___Mate_cu_Succes.pdf" download="Clasificarea_unghiurilor___Mate_cu_Succes.pdf" class="btn btn--primary">Descarcă acum</a></div>'

content = pattern.sub(r'\1' + button_html + r'\2', content)

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated text description for Unghiuri")
print("✓ Added download button for PDF: Clasificarea_unghiurilor___Mate_cu_Succes.pdf")
print("\nChanges completed successfully!")
