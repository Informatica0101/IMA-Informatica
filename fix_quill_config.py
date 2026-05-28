import re

with open('js/teacher.js', 'r') as f:
    js = f.read()

quill_toolbar = '''[
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'image'],
            ['clean']
        ]'''

# Update Quill initialization for all editors
js = re.sub(
    r"new Quill\('#editor-task-container', \{ theme: 'snow', placeholder: '.*?' \}\)",
    f"new Quill('#editor-task-container', {{ theme: 'snow', placeholder: 'Escribe la descripción de la tarea...', modules: {{ toolbar: {quill_toolbar} }} }})",
    js
)

js = re.sub(
    r"new Quill\('#editor-exam-container', \{ theme: 'snow', placeholder: '.*?' \}\)",
    f"new Quill('#editor-exam-container', {{ theme: 'snow', placeholder: 'Escribe las instrucciones del examen...', modules: {{ toolbar: {quill_toolbar} }} }})",
    js
)

js = re.sub(
    r"new Quill\('#editor-edit-container', \{ theme: 'snow' \}\)",
    f"new Quill('#editor-edit-container', {{ theme: 'snow', modules: {{ toolbar: {quill_toolbar} }} }})",
    js
)

js = re.sub(
    r"new Quill\('#editor-news-container', \{ theme: 'snow', placeholder: '.*?' \}\)",
    f"new Quill('#editor-news-container', {{ theme: 'snow', placeholder: 'Contenido de la noticia...', modules: {{ toolbar: {quill_toolbar} }} }})",
    js
)

with open('js/teacher.js', 'w') as f:
    f.write(js)

print("Quill toolbars updated.")
