var templateEditor = new TemplateEdit();
var userEditor = new UserEdit();
var resultEditor = new ResultEdit();

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
  resultEditor.getDateImages(templateEditor, userEditor);
  
  resultEditor.canvas.height = templateEditor.image.height;
  resultEditor.canvas.width = templateEditor.image.width;
  resultEditor.context.drawImage(templateEditor.image, 0, 0);

  // resultEditor.context.translate(userEditor.image.width/2, userEditor.image.height/2);
  resultEditor.context.rotate(userEditor.rotation * resultEditor.TO_RADIANS);

  resultEditor.context.drawImage(userEditor.image, resultEditor.leftSelect, resultEditor.topSelect, resultEditor.widthUser, resultEditor.heightUser);
  resultEditor.editorWindow.style.width = resultEditor.canvas.offsetWidth + 'px';
}

function el(id) {
  return document.getElementById(id);
}