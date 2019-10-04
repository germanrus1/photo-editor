class Base {
  constructor() {
    this.canvas = null;
    this.context = null;
    this.editorWindow = null;
    this.image = null;
    this.TO_RADIANS = Math.PI/180;
    this.rotation = 0;
    this.img = new Image();
    this.isMouseDown = false;
    this.selectBlockX = 0;
    this.selectBlockY = 0;
    // this.btnUpload = false;
  }

  init(idCanvasElement = false, idEditorWindowElement = false, btnUpload) {
     if (idCanvasElement && idEditorWindowElement && btnUpload.files != undefined) {
       this.canvas = this.elById(idCanvasElement);
       this.context = this.canvas.getContext("2d");
       this.editorWindow = this.elById(idEditorWindowElement);
       this.readImage(btnUpload);
    }
  }

  readImage(btnUpload) {
    var FR = new FileReader();
    var img = new Image();
    var base = this;

    FR.onload = function (e) {
      var test = e;
      img.src = test.target.result;
      img.addEventListener("load", function () {
        base.drawImage(base.canvas, img, base.context, 0, 0);
        base.editorWindow.style.height = base.canvas.offsetHeight + "px";
        base.image = img; //todo возможно надо удалить
      });
    };
    if (btnUpload != undefined) {
      FR.readAsDataURL(btnUpload.files[0]);
    }
    this.image = img;
  }

  /**
   * Вывод изображения
   * @param canvasElement canvas
   * @param x integer
   * @param y integer
   */
  drawImage(canvasElement, img, context, x = 0, y = 0) {
    canvasElement.height = img.height;
    canvasElement.width = img.width;
    context.drawImage(img, x, y);
  }


  rotateImg(angle = 0)
  {
    console.log(this.rotation);
    console.log(angle);
    this.rotation = this.getAngle(this.rotation, angle) 
    this.drawRotatedImage();
  }

  /**
   * Поворачивает изображение на angle градусов
   * @param angle integer
   */
  drawRotatedImage() {
    this.context.clearRect(0, 0, this.image.width, this.image.height);
    this.context.save();
    this.context.translate(this.image.width/2, this.image.height/2);
    this.context.rotate(this.rotation * this.TO_RADIANS);
    this.context.drawImage(this.image, -(this.image.width/2), -(this.image.height/2));
    this.context.restore();
  }

  getTransformText(x = null, y = null, r = null)
  {
    var str = 'translate(';

    if (x !== null) {
      str += String(x) + 'px,';
    } else {
      str += '0' + 'px,';
    }
    if (y !== null) {
      str += String(y) + 'px';
    } else {
      str += '0' + 'px';
    }
    str += ')';

    if (r !== null) {
      str += 'rotate(' + String(r) + 'deg)';
    }

    return str;
  }

  getElementTranslateValues(element)
  {
    return element.style.transform.replace(/[^0-9\-.,]/g, '').split(',');
  }

  elById(id) {
    return document.getElementById(id);
  }

  getAngle(curAngle, angle = 90) {
    if (curAngle + angle > 360) {
      return Math.abs(curAngle + angle - 360);
    } else {
      return curAngle + angle;
    }
  }

  mess(message) {
    console.log(message);
  }
}

// редактор шаблона
class TemplateEdit extends Base {
  constructor() {
    super();
    this.selectPointX = 0;
    this.selectPointY = 0;
  }

  init(idCanvasElement = false, idEditorWindowElement = false, btnUpload) {
    super.init(idCanvasElement, idEditorWindowElement, btnUpload);
    this.addEvents();
  }

  addEvents() {
    var template = this;

    // зажата ли ЛКМ
    document.onmousedown = function () {
      template.isMouseDown = true;
    }
    document.onmouseup = function () {
      template.isMouseDown = false;
    }

    this.editorWindow.onmousedown = function (event) {
      template.addSelectBlock('select-block', event);
    }

    this.editorWindow.onmousemove = function () {
      if (template.isMouseDown) {
        var x = event.pageX - canvas.offsetLeft,
          y = event.pageY - canvas.offsetTop,
          block = el('select-block'),
          transform = template.getElementTranslateValues(block),
          left = template.selectBlockX,
          top = template.selectBlockY;

        if (template.selectBlockX - x > 0) {
          left = x;
        }

        if (template.selectBlockY - y > 0) {
          top = y;
        }

        block.style.width = Math.abs(template.selectBlockX - x);
        block.style.height = Math.abs(template.selectBlockY - y);
        block.style.transform = template.getTransformText(left, top);
      }
    }
  }
  
  getSelectBlock(x, y)
  {
    selectBlock = document.createElement("div");
    selectBlock.style.transform = 'translate(' + String(x) + 'px, ' + String(y) + 'px)';
    selectBlock.style.width = '0px';
    selectBlock.id = 'select-block';
    selectBlock.classList.add('select-block');

    return selectBlock;
  }

  saveTemplateData(canvas, selectBlockElement, editBlock) {
    var heightImg = canvas.getAttribute('height'),
      widthImg = canvas.getAttribute('width'),
      selectBlockHeight = selectBlockElement.offsetHeight,
      selectBlockWidth = selectBlockElement.offsetWidth,
      transformSelectBlock = getElementTranslateValues(selectBlockElement);

    var x = Number(widthImg) * transformSelectBlock[0] / editBlock.offsetWidth,
        y = Number(heightImg) * transformSelectBlock[1] / editBlock.offsetHeight,
        width = Number(widthImg) * selectBlockWidth / editBlock.offsetWidth;
        height = Number(heightImg) * selectBlockHeight / editBlock.offsetHeight;

    this.selectPointX = x;
    this.selectPointY = y;
  }

  addSelectBlock(idELement = null, event) {
    if (idELement != null && el(idELement)) {
      this.elById(idELement).remove();
    }

    this.selectBlockX = event.pageX - this.canvas.offsetLeft;
    this.selectBlockY = event.pageY - this.canvas.offsetTop;

    var selectBlock = document.createElement("div");
    selectBlock.style.transform = 'translate(' + String(this.selectBlockX) + 'px, ' + String(this.selectBlockY) + 'px)';
    selectBlock.style.width = '0px';
    selectBlock.id = 'select-block';
    selectBlock.classList.add('select-block');

    this.editorWindow.append(selectBlock);
  }
}

class UserEdit extends Base{
  constructor() {
    super();    
  }

  init(idCanvasElement = false, idEditorWindowElement = false, btnUpload) {
    super.init(idCanvasElement, idEditorWindowElement, btnUpload);
    this.addEvents();
  }

  addEvents() {
    
  }
}

class ResultEdit extends Base{
  constructor() {
    super();
    this.leftSelect = 0;
    this.topSelect = 0;
  }

  init(idCanvasElement = false, idEditorWindowElement = false, btnUpload) {
    // super.init(idCanvasElement, idEditorWindowElement, btnUpload);
    this.addEvents();
    if (idCanvasElement && idEditorWindowElement && btnUpload) {
      this.canvas = this.elById(idCanvasElement);
      this.context = this.canvas.getContext("2d");
      this.editorWindow = this.elById(idEditorWindowElement);
      // this.readImage(btnUpload);
      console.log(this.elById(idCanvasElement));
      console.log(idEditorWindowElement);
      console.log(btnUpload);
    }

  }

  getDateImages(template, user, selectBlock = 'select-block') {
    var heightImg = template.canvas.getAttribute('height'),
      widthImg = template.canvas.getAttribute('width'),
      selectBlock = this.elById(selectBlock),
      selectBlockHeight = selectBlock.offsetHeight,
      selectBlockWidth = selectBlock.offsetWidth,
      transformSelectBlock = this.getElementTranslateValues(selectBlock);

    var leftPoint = Number(widthImg) * transformSelectBlock[0] / template.editorWindow.offsetWidth,
        topPoint = Number(heightImg) * transformSelectBlock[1] / template.editorWindow.offsetHeight,
        width = Number(widthImg) * selectBlockWidth / template.editorWindow.offsetWidth,
        height = Number(heightImg) * selectBlockHeight / template.editorWindow.offsetHeight;

    this.leftSelect = leftPoint;
    this.topSelect = topPoint;
    this.widthUser = width;
    this.heightUser = height;

    console.log('высота', template.editorWindow.offsetHeight);
    console.log('высота', selectBlockHeight);
    console.log('высота', heightImg);
    console.log('ширина', this.widthUser);

  }

  drawRotatedImage(user) {
    user.context.clearRect(0, 0, user.image.width, user.image.height);
    user.context.save();
    user.context.translate(user.image.width/2, user.image.height/2);
    user.context.rotate(user.rotation * user.TO_RADIANS);
    user.context.drawImage(user.image, -(user.image.width/2), -(user.image.height/2));
    // user.context.restore();
  }

  addEvents() {

  }  
}
