import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\social-connection-and-longevity\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the text
idx = content.find('Empathy is the essence')
if idx != -1:
    # Extract the full paragraph
    end_idx = content.find('</p>', idx)
    excerpt = content[idx:end_idx]
    print("Found text:")
    print(repr(excerpt))
    print("\n" + "="*70)
    
    # Save to file
    with open('empathy_text.txt', 'w', encoding='utf-8') as f:
        f.write(excerpt)
    print("\nSaved to empathy_text.txt")
else:
    print("Text not found!")
