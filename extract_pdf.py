from pypdf import PdfReader
import sys

def extract_text(pdf_path, max_pages=50):
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for i in range(min(max_pages, len(reader.pages))):
            text += f"--- Page {i+1} ---\n"
            text += reader.pages[i].extract_text() + "\n"
        return text
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        print(extract_text(sys.argv[1]))
