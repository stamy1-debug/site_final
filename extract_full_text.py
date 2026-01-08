import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\social-connection-and-longevity\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start
start_idx = content.find('"That brain of mine')
if start_idx == -1:
    print("Could not find start!")
else:
    # Find the end
    end_idx = content.find('</p>', start_idx)
    if end_idx == -1:
        print("Could not find end!")
    else:
        # Extract full text
        full_text = content[start_idx:end_idx]
        print("Full text found:")
        print(repr(full_text))
        print("\n" + "="*70)
        print("\nLength:", len(full_text))
        
        # Save to file for the replacement script
        with open('exact_old_text.txt', 'w', encoding='utf-8') as f:
            f.write(full_text)
        print("\nSaved to exact_old_text.txt")
