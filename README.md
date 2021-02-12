# CH (Canvas Helper)

## Начало работы

Для начала работы нужно подключить скрипт canvas.js (Находиться в */js/canvas.js*). После подключения нужно создать экземпляр класса
```js
CH(can, arrel = new Map(), active = new Map())
```
```js
// Получаем элемент
let canvas = document.querySelector('#c1');
// Получаем объект с интерфейсом для элемента
let can = new CH(canvas);
```
---
##  Описания интерфейса
### Отрисовка:
```js
CH.draw(element = false);
```
Параметр:<br>
1. **element**:
	- Если пуст, то отрисовывает все имеющиеся элементы.
	- Принимает объект, который нужно отрисовать.
	- Принимает имя объекта который нужно отрисовать.
```js
can.draw(); // Если пуст, то отрисовывает все имеющиеся элементы.
can.draw(el); // Принимает объект, который нужно отрисовать.
can.draw("element name"); // Принимает имя объекта который нужно отрисовать.
```
#### Количество кадров
Максимальное количество отрисовок всех элементов в 1 секунду, задаётся функцией
```js
CH.syncDraw(fps);
```
1. **fps** - Максимальное число отрисовок
#### Порядок отрисовки

Отрисованные объекты могут быть закрыты новыми. Чтобы задать приоритет отрисовки объектов используйте функцию:
```js
CH.setOrder(obj, order);
```
1. **obj** - Имя объекта или сам объект.
2. **order** - Порядок отрисовки. Чем больше число тем ниже приоритет элемента, `при 0 - элемент скрывается`.

---
### Создание объекта
#### Тип "l" - Обычный четырёхугольник
```js
CH.drawLine(el = false, x = 0, y = 0, w = 0, h = 0, color = 'black', fill = true, order = 1);
```
Параметр:<br>
1. **x** - Координата x<br>
2. **y** - Координата y<br>
3. **w** - Ширина<br>
4. **h** - Высота<br>
5. **color** - Цвет<br>
6. **fill** - `TRUE` - Залить фигуру, `FALSE` - Не заливать (контур фигуры)<br>
7. **order** - порядок отрисовки.  <br>
8. **el** - Объект состоящий из вышеуказанных параметров, а так же имеет параметр **name** - имя объекта.
```js
can.drawLine(false, 20, 300, 30, 10, "blue", false);
can.drawLine({ name: "элемент" }, 20, 250, 30, 10, "blue", false);
can.drawLine({ x: 140, y: 300, w: 200, h: 40, color: "red", name: "Square", fill: true });
```
---
#### Тип "o" - Произвольная фигура
```js
CH.drawObj(obj, conf = {
	fill: false,
	color: "black",
	widht: 1,
	name: false,
	cap: 'butt',
	join: 'round',
	limit: 1,
	dash: [],
	dashOffset: 0,
	time: false,
	step: 100,
	order = 1
});
```
Параметры:<br>
1. **obj** - Массив точек. Каждая точка состоит из массива `[ [x1,y1], [x2,y2], ... , [xn,yn] ]`.
```js
can.drawObj( [ [100, 200], [400, 200], [400, 400], [280, 400], [280, 250], [220, 250], [220, 400], [100, 400] ] );
```
2. **conf** - Конфигурация объекта. Параметры:<br>
	- **fill** - Заливать контур (`TRUE`) или нет (`FALSE`).<br>
	- **name** - Имя объекта. <br>
	- **color** - Цвет объекта. <br>
	- **widht** - Ширина контура. (**число**)<br>
	- **cap** - Форма отрисовки конечных точек линии ('**butt**','**round**','**square**').<br>
	- **join** - Форма вершин в которых линии сходятся ('**round**','**bevel**','**miter**').<br>
	- **limit** - Длина среза (расстояние между внутренним и внешнем углом, образованным пересечением двух линий). (**число**)<br>
	- **dash** - Патрн штрихов линии. (**массив чисел** от 2 и более - [ 10,20, ...])<br>
	- **dashOffset** - Устанавливает смещение штрихов. (**число**)<br>
	- **order** - порядок отрисовки. <br>
	- **time** - для работы функции ```CH.roundDash()```
	- **step** - для работы функции ```CH.roundDash()```
```js
can.drawObj([[100, 200], [400, 200], [400, 400], [280, 400], [280, 250], [220, 250], [220, 400], [100, 400]],
 { fill: false, name: "Стены", color: "#663" , widht: 1, cap: 'butt', join: 'round', limit: 1, dash: [], dashOffset: 0});
```
---
#### Тип "u" -  Комбинированная фигура
```js
CH.combEl(objArr, conf = { actObj: false, name: false, order: 1 });
```
Параметры:<br>
1. **objArr** - Список (имён) объектов, которые нужно объединить. **Пример:** ["*Имя 1*", "*Имя 2*", ... , "*Имя n*"]<br>
2. **actObj** - Список имён объектов на которых будет распространяться `CH.activeEl()`. **Пример:** ["*Имя 1*", "*Имя 2*", ... , "*Имя n*"]<br>
3. **name** - Имя нового объекта. <br>
4. **order** - порядок отрисовки. <br>
```js
can.combEl(["окно фон 1","Рама 1"],["окно фон 1"],"Окно 1");
can.combEl(["окно фон 2", "Рама 2"], ["окно фон 2"], "Окно 2");
can.combEl(["Стена", "Крыша", "Окно 1", "Окно 2", "Дверь", "Дверная ручка"], ["Стена", "Крыша"], "Дом");
```
---
### Удаление
#### Удаление объектов
```js
CH.remove(name);
```
Параметры:
1. **name** - Имя объекта или сам объект.
```js
CH.can.remove("элемент");
```
#### Удаление из списка активных объектов
```js
CH.removeAct(name);
```
1. **name** - Имя объекта или сам объект.
---
### Запуск ивентов
#### Начало отслеживания
```js
CH.objectDetectEvent();
```
Начинает отслеживание положение мыши над элементами. Результат (над каким элементом находится указатель)
```js
CH.activeName;
```
**activeName** - Имя объекта над которым находится курсор.
#### Добавление эвентов
```js
CH.addEvent(obj, type, f);
```
1. **obj** - Имя объекта или сам объект
2. **type** - Тип ивента
3. **f** - Функция

```js
CH.addEvent('time', "click", () => {
	console.log("It works!");
});
```
Для удаления:
```js
CH.removeEvent(obj, type);
```
1. **obj** - Имя объекта или сам объект
2. **type** - Тип удаляемого ивента
```js
CH.removeEvent('time', "click");
```
#### Отслеживания эвентов
Функция ```CH.addEvent(obj, type, f)``` Добавляет эвент в объект, но эвент не отслеживается.
Для отслеживания эвентов, определённого типа, используйте функцию:
```js
 CH.activeEventListener(type);
 ```
 Для удаления:
 ```js
  CH.removeEventListener(type)
 ```
 1. **type** - Тип ивента
---
###  Анимация
#### Анимация "бегающие муравьи".
```js
CH.roundDash(name, time = 30, st = 100, dash = [10, 3], stepDF = 1, dashOffset = 0);
```

Параметры:<br>
1. **name** - Имя объекта или сам объект (оставьте пустым если хотите отменить все анимации).<br>
2. **time** - С каким периодом будет сдвигаться рисунок линии. Параметр указать в миллисекундах. (поставьте `FALSE` для отключения анимации на объекте **name** )<br>
3. **st** - Граница сдвига, достигнув которой, рисунок становится в исходное место. (**Число**).<br>
4. **dash** - Шаблон для рисунка. (Массив [10,20]. Если в массиве  нечётное количество элементов, то он удваивается [10,20,30] = [10,20,30,10,20,30]).
5. **stepDF** - Шаг сдвига
6. **dashOffset** - Начальный сдвиг

```js
// Создаём анимацию "бегающие муравьи" у объекта "time"
can.roundDash("time", 10, 60, [40, 20], 2);

// Убираем анимацию "бегающие муравьи" у объекта "time"
can.roundDash("time", false);

// Убираем анимацию "бегающие муравьи" у всех объектов
can.roundDash();
```
#### Передвижение объектов
```js
CH.moveObj(obj, move = { 'down': 0, 'up': 0, 'left': 0, 'right': 0 });
```
1. **obj** - Имя объекта или сам объект
2. **move** - Объект со сторонами движения
	* *down* - Движение вниз
	* *up* - Движение вверх
	* *left* - Движение лево
	* *right* - Движение вправо
---
### Положение мыши
#### Параметры отслеживания положения
```js
CH = {
	detectPosition = {
		checkPosition: true,
		click: true,
		timeCheck: 30
	}
}
```
1. **checkPosition**:
	* `TRUE` - Отслеживать положение указателя
	* `FALSE` -  Не отслеживать положение указателя
2. **click** - Отслеживать положение указателя при клике
3. **timeCheck** - Минимальный временной интервал между проверками положения указателя. в (мс)
#### Обновление информации о последней точке
Изменение временного интервала между проверками положения, для не двигающегося указателя.
```js
CH.UpdatelastPoint(time);
```
1. **time** - Время в миллисекундах
