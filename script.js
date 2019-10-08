var templateEditor = new TemplateEdit();
var userEditor = new UserEdit();
var resultEditor = new ResultEdit();
var imgUser = new Image();

function initTemplateEditor(btnUpload) {
  templateEditor.init('canvas', 'editor', btnUpload);
}
function initUserEditor(btnUpload) {
  userEditor.init('canvas-user', 'userPhoto', btnUpload);
}

document.addEventListener("DOMContentLoaded", function(event) {
  resultEditor.init('canvas-result', 'resultPhoto', 'showResult');
});

function rotateImg(angle = 90) {
  userEditor.rotateImg(angle);
}

function showResult()
{
  imgUser.src = userEditor.canvas.toDataURL();
  resultEditor.getDateImages(templateEditor, userEditor);
  
  resultEditor.canvas.height = templateEditor.image.height;
  resultEditor.canvas.width = templateEditor.image.width;
  resultEditor.context.drawImage(templateEditor.image, 0, 0);
  resultEditor.context.drawImage(imgUser, resultEditor.leftSelect, resultEditor.topSelect, resultEditor.widthUser, resultEditor.heightUser);
  resultEditor.editorWindow.style.width = resultEditor.canvas.offsetWidth + 'px';
}

function el(id) {
  return document.getElementById(id);
}