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
        base.image = img;
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
    if (img.width < this.editorWindow.offsetWidth) {
      this.editorWindow.style.width = img.width + 'px';
    }
    canvasElement.height = img.height;
    canvasElement.width = img.width;
    context.drawImage(img, x, y);
  }


  rotateImg(angle = 0)
  {
    this.rotation = this.getAngle(this.rotation, angle);
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
    this.image.src = this.canvas.toDataURL();
    this.context.restore();
  }

  getTransformText(x = null, y = null, r = null, s = null)
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
    str += ') ';

    if (r !== null) {
      str += 'rotate(' + String(r) + 'deg) ';
    }

    if (s !== null) {
      str += 'scale(' + String(s) + ')';
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
  // отрабатывание скролинга на разных браузерах одинакого
  addOnWheel(elem, handler) {
    if (elem.addEventListener) {
      if ('onwheel' in document) {
        // IE9+, FF17+
        elem.addEventListener("wheel", handler);
      } else if ('onmousewheel' in document) {
        // устаревший вариант события
        elem.addEventListener("mousewheel", handler);
      } else {
        // 3.5 <= Firefox < 17, более старое событие DOMMouseScroll пропустим
        elem.addEventListener("MozMousePixelScroll", handler);
      }
    } else { // IE8-
      text.attachEvent("onmousewheel", handler);
    }
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
    };
    document.onmouseup = function () {
      template.isMouseDown = false;
    };

    this.editorWindow.onmousedown = function (event) {
      template.addSelectBlock('select-block', event);
    };

    // перемещение с зажатой ЛКМ
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

class UserEdit extends Base {
  constructor() {
    super();
    this.scale = 1;
    this.scaleKoef = 0.05;
  }

  init(idCanvasElement = false, idEditorWindowElement = false, btnUpload) {
    super.init(idCanvasElement, idEditorWindowElement, btnUpload);
    this.addSelectBlock();
    this.addEvents();
  }


  /**
   * Вывод изображения
   * @param canvasElement canvas
   * @param x integer
   * @param y integer
   */
  drawImage(canvasElement, img, context, x = 0, y = 0) {
    canvasElement.width = img.width;
    canvasElement.height = img.height;
    this.editorWindow.style.width = String(this.canvas.offsetWidth) + 'px';
    context.drawImage(img, x, y);
  }

  addSelectBlock() {
    var h = 300,
        w = 250;
    this.scaleH = h / this.scale;
    this.scaleW = w / this.scale;

    var centerX = this.editorWindow.offsetWidth / 2,
        centerY = this.editorWindow.offsetHeight / 2,
        k = this.editorWindow.offsetWidth / this.editorWindow.offsetHeight;

    var selectBlock = document.createElement("div");

    // если горизонтальная
    if (this.editorWindow.offsetWidth >= this.editorWindow.offsetHeight) {
      selectBlock.style.width = '100%';
      selectBlock.style.height = h / w * this.editorWindow.offsetHeight;
      selectBlock.style.transform = 'translate(' + 0 + 'px, ' + String(centerY - h / w * this.editorWindow.offsetHeight / 2) + 'px)';
    } else {
      selectBlock.style.height = '100%';
      selectBlock.style.width = w / h * this.editorWindow.offsetWidth;
      selectBlock.style.transform = 'translate(' + 0 + 'px, ' + String(centerX - w / h * this.editorWindow.offsetWidth / 2) + 'px)';
    }

    this.koeficient = h / w;
    selectBlock.id = 'select-block-user';
    selectBlock.classList.add('select-block');
    this.selectBlockUser = selectBlock;
    this.editorWindow.append(selectBlock);
  }

  addEvents() {
    var template = this;

    // зажата ли ЛКМ
    document.onmousedown = function () {
      template.isMouseDown = true;
    };
    document.onmouseup = function () {
      template.isMouseDown = false;
    };
    document.ontouchstart = function () {
      template.isMouseDown = true;
    };
    document.ontouchend = function () {
      template.isMouseDown = false;
    };

    this.editorWindow.onmousedown = function (event) {
      template.beginSelectX = event.pageX - template.canvas.offsetLeft;
      template.beginSelectY = event.pageY - template.canvas.offsetTop;
    };

    this.editorWindow.ontouchstart = function (event) {
      console.log(123);
      if (template.isMouseDown) {
        console.log(456);
        var x = event.pageX - template.canvas.offsetLeft,
          y = event.pageY - template.canvas.offsetTop,
          left = x - template.selectBlockUser.offsetWidth / 2,
          top = y - template.selectBlockUser.offsetHeight / 2;

        if (left < 0) {
          left = 0;
        }
        if (top < 0) {
          top = 0;
        }
        if (left + template.selectBlockUser.offsetWidth > template.editorWindow.offsetWidth) {
          left = template.editorWindow.offsetWidth - template.selectBlockUser.offsetWidth;
        }
        if (top + template.selectBlockUser.offsetHeight > template.editorWindow.offsetHeight) {
          top = template.editorWindow.offsetHeight - template.selectBlockUser.offsetHeight;
        }
        template.selectBlockUser.style.transform = template.getTransformText(left, top);
      }
    };

    this.editorWindow.onmousemove = function (event) {
      if (template.isMouseDown) {
        var x = event.pageX - template.canvas.offsetLeft,
            y = event.pageY - template.canvas.offsetTop,
            left = x - template.selectBlockUser.offsetWidth / 2,
            top = y - template.selectBlockUser.offsetHeight / 2;

        if (left < 0) {
          left = 0;
        }
        if (top < 0) {
          top = 0;
        }
        if (left + template.selectBlockUser.offsetWidth > template.editorWindow.offsetWidth) {
          left = template.editorWindow.offsetWidth - template.selectBlockUser.offsetWidth;
        }
        if (top + template.selectBlockUser.offsetHeight > template.editorWindow.offsetHeight) {
          top = template.editorWindow.offsetHeight - template.selectBlockUser.offsetHeight;
        }
        template.selectBlockUser.style.transform = template.getTransformText(left, top);
      }
    };

    // this.addOnWheel(this.selectBlockUser, function (e) {
    //   e.preventDefault();
    //   var delta = e.deltaY || e.detail || e.wheelDelta;
    //   // var min = 30,
    //   //     max = Math.max([template.editorWindow.offsetHeight, template.editorWindow.offsetWidth]),
    //   //     width = template.selectBlockUser.offsetWidth,
    //   //     height = template.selectBlockUser.offsetHeight,
    //   var transform = template.getElementTranslateValues(template.selectBlockUser);
    //
    //   if (delta > 0) {
    //     template.scale += template.scaleKoef;
    //   } else {
    //     template.scale -= template.scaleKoef;
    //   }
    //   console.log(template.getTransformText(transform[0], transform[1], null, template.scale.toFixed(3)));
    //   template.selectBlockUser.style.transform = template.getTransformText(transform[0], transform[1], null, template.scale);

      //
      // if (delta > 0) {
      //   width += template.scaleW;
      //   height += template.scaleH;
      // } else {
      //   width -= template.scaleW;
      //   height -= template.scaleH;
      // }
      //
      // if (width < min || height < min) {
      //   if (template.selectBlockUser.offsetWidth < template.selectBlockUser.offsetHeight) {
      //     width = min;
      //     height = min * template.selectBlockUser.offsetHeight / template.selectBlockUser.offsetWidth;
      //   } else {
      //     width = min * template.selectBlockUser.offsetHeight * template.selectBlockUser.offsetWidth;
      //     height = min;
      //   }
      // }
      //
      // if (width > max || height > max || (transform[0] + width / 2 > template.selectBlockUser.offsetWidth) || (transform[0] + width / 2 > template.selectBlockUser.offsetWidth)) {
      //   if (template.selectBlockUser.offsetWidth < template.selectBlockUser.offsetHeight) {
      //     width = max;
      //     height = max * template.selectBlockUser.offsetWidth / template.selectBlockUser.offsetHeight;
      //   } else {
      //     width = max * template.selectBlockUser.offsetHeight * template.selectBlockUser.offsetWidth;
      //     height = max;
      //   }
      // }
      //   template.selectBlockUser.style.width = String(width) + 'px';
      // template.selectBlockUser.style.height = String(height) + 'px';
    // });
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
