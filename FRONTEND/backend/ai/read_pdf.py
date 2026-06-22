import sys
import fitz  # PyMuPDF

pdf_path = sys.argv[1]

doc = fitz.open(pdf_path)
text = ""

for page in doc:
    text += page.get_text()

print(text)