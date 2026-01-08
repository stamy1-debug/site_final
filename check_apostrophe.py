import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\personal-identity-and-purpose\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Search for "I've" to check apostrophe type
idx = content.find("I've spent")
if idx != -1:
    excerpt = content[idx:idx+200]
    print("Text found:")
    print(repr(excerpt))
    print("\nChecking apostrophe:")
    apostrophe = excerpt[1]
    print(f"Character: '{apostrophe}' = U+{ord(apostrophe):04X}")
else:
    # Try searching with fancy apostrophe
    idx = content.find("I've spent")
    if idx != -1:
        excerpt = content[idx:idx+200]
        print("Text with fancy quote found:")
        print(repr(excerpt))
    else:
        print("Text not found with either apostrophe")
