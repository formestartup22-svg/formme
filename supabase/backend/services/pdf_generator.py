from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
import requests

def generate_pdf(markdown_text: str, image_url: str = ""):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)

    y = 750
    for line in markdown_text.split("\n"):
        c.drawString(40, y, line)
        y -= 15
        if y < 50:
            c.showPage()
            y = 750

    # Optional: add design image
    if image_url:
        try:
            img_data = requests.get(image_url).content
            img_file = BytesIO(img_data)
            c.drawImage(img_file, 40, 50, width=200, height=200)
        except:
            pass

    c.save()
    return buffer.getvalue()
