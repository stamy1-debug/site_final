import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\personal-identity-and-purpose\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Update text description for Triunghiuri
old_text = "I've spent my life exploring science, technology, and human potential. Now, with JasminaDenner.com, I'm creating a space to push boundaries and shape the future—where innovation meets humanity. Join me on this journey!"
new_text = "3 unghiuri, 3 vârfuri și 3 laturi. Tu ce mai găsești cu 3?"

content = content.replace(old_text, new_text)

# Add download button for Triunghiuri
# Find the position after the paragraph and before the arrow div
import re

# Pattern to find the specific section for Triunghiuri
pattern = re.compile(
    r'(<h3 class="h5 mb-8 underline-title leading-small"><span>Triunghiuri:</span></h3><p class="mb-0 laptop:mb-8">3 unghiuri, 3 vârfuri și 3 laturi\. Tu ce mai găsești cu 3\?</p>)(<div class="justify-end pb-16 hidden laptop:flex">)',
    re.DOTALL
)

button_html = '<div class="mt-16 flex justify-center laptop:justify-start"><a href="../../assets/pdf/Clasificarea_Triunghiurilor__Mate_cu_Succes.pdf" download="Clasificarea_Triunghiurilor__Mate_cu_Succes.pdf" class="btn btn--primary">Descarcă acum</a></div>'

content = pattern.sub(r'\1' + button_html + r'\2', content)

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated text description for Triunghiuri")
print("✓ Added download button for PDF: Clasificarea_Triunghiurilor__Mate_cu_Succes.pdf")
print("\nChanges completed successfully!")
