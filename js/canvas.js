//определение основных функций canvas в обьекте
class CH {
	canvas;
	ctx;
	elements;
	active;
	activeName = false;
	dashId = {};
	time = {
		startTime: Date.now(), // начало работы скрипта
		timeCount: 0,
		lastCheck: Date.now() //
	}
	frame = {
		drawNow: false, // нахождение в процессе отрисовки
		lock: 30, // максимальное колличество отрисовок в 1 секунду
		fps: 0, // показатель отрисовок в 1 секунду
		lockCount: 0,
		drawOrder: new Map(), // порядок отрисовки (по уровням)
		allOrder: [] // данные об уровнях отрисовки в порядке возростания
	}
	eventList = {};
	detectPosition = {
		checkPosition: true,
		click: true,
		timeCheck: 30, // минимальный промежуток между проверкой положении мыши
		lastX: 0,
		lastY: 0,
		intervalId: false
	}

	constructor(can, arrel = new Map(), active = new Map()) {
		try {
			this.canvas = can;
			this.ctx = can.getContext("2d");
			// дбавляем элементы
			this.elements = arrel;
			// Способ отслеживания положения мыши
			this.active = active;
			// отрисовка кадров в 1 сек
			this.syncDraw(60);
			// обновление позиции мыши
			this.UpdatelastPoint(this.detectPosition.timeCheck * 1.9);
			// ----------------
		} catch (error) {
			console.log("When initialing the object was error, check arguments.");
		}

	}

	// рисуем всё или 1 обьект (по имени или обЪекту) используя на drawEL
	draw(element = false) {
		this.frame.drawNow = true;
		let show = false;
		let time = Date.now() - this.time.startTime;
		let timeNow = time - (this.time.timeCount * 1000);
		let timePause = 1000 / this.frame.lock;
		if (!element && (timeNow >= (timePause * this.frame.lockCount) && timeNow <= 1000)) {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.frame.allOrder.forEach(order => {
				this.frame.drawOrder.get(order).forEach((val, name) => {
					this.drawEl(this.elements.get(name));
				});
			});
			// счётчик вызовов / сек
			if (timeNow >= 1000) {
				show = true;
				let st = timeNow < 1000 ? 1 : Math.trunc(timeNow / 1000);
				this.time.timeCount += st;
				this.frame.lockCount = 0;
			} else {
				this.frame.fps++;
				this.frame.lockCount++;
			}
		}
		else if (element) {
			element = this.getEl(element);
			if (element != false) this.drawEl(element);
		}
		else {
			// счётчик вызовов / сек
			if (timeNow >= 1000) {
				show = true;
				let st = timeNow < 1000 ? 1 : Math.trunc(timeNow / 1000);
				this.time.timeCount += st;
			}
		}
		//обнуление сщётчика fps, выбрасывание ивента fps
		if (show) {
			// для теста
			document.dispatchEvent(new CustomEvent("fps", { bubbles: true, detail: { fps: this.frame.fps, canvas: this.canvas } }));
			// -----------------
			this.frame.fps = 0;
			this.frame.lockCount = 0;
		}
		this.frame.drawNow = false;
	}
	// ресует 1 обьект (по обЪекту)
	async drawEl(el) {
		if (el.type == 'l') {
			if (el.fill === true) {
				this.ctx.fillStyle = el.color;
				this.ctx.fillRect(el.x, el.y, el.w, el.h);
			}
			else {
				this.ctx.strokeStyle = el.color;
				this.ctx.strokeRect(el.x, el.y, el.w, el.h);
			}
		}
		else if (el.type == 'o') {
			let conf = el.conf;
			let obj = el.point;
			this.ctx.beginPath();
			this.ctx.strokeStyle = conf.color;
			this.ctx.fillStyle = conf.color;
			this.ctx.lineWidth = conf.widht;
			this.ctx.lineCap = conf.cap;
			this.ctx.lineJoin = conf.join;
			this.ctx.miterLimit = conf.limit;
			this.ctx.setLineDash(conf.dash ? conf.dash : []);
			this.ctx.lineDashOffset = conf.dashOffset;
			for (let i = 0; i < obj.length; i++) {
				let p = obj[i];
				if (i == 0) this.ctx.moveTo(p.x1, p.y1);
				else this.ctx.lineTo(p.x1, p.y1);
			}
			this.ctx.closePath();
			if (conf.fill) this.ctx.fill();
			else this.ctx.stroke();
			// обнуляем lineDash у ctx
			this.ctx.setLineDash([]);
		}
		else if (el.type = "u") {
			el.arrObj.forEach((e) => {
				this.draw(e);
			});
		}
	}
	//рисует линию и добавляет в список элементов с тмпом "l"
	drawLine(el = false, x = 0, y = 0, w = 0, h = 0, color = 'black', fill = true, order = 1) {
		let name = el.hasOwnProperty('name') ? el.name : this.makeid(32);
		color = color ? color : "black";
		el = (Object.keys(el).length > 1) ? { draw: true, x: 0, y: 0, w: 0, h: 0, color: "black", name: name, fill: true, ...el } : false;
		let pointArr = (point) => {
			return [
				{ x1: point.x, y1: point.y, x2: point.x, y2: (point.y + point.h) },
				{ x1: point.x + point.w, y1: point.y, x2: point.x + point.w, y2: (point.y + point.h) }
			]
		}
		if (!el) {
			this.elements.set(name, {
				name: name,
				type: 'l',
				active: false,
				y: y,
				x: x,
				w: w,
				h: h,
				color: color,
				fill: fill,
				point: pointArr({ x: x, y: y, w: w, h: h }),
				allPoint: new Map(),
				order: order
			});
		}
		else {
			this.elements.set(name, {
				name: el.name,
				type: 'l',
				active: false,
				y: el.y,
				x: el.x,
				w: el.w,
				h: el.h,
				color: el.color,
				fill: el.fill,
				point: pointArr(el),
				allPoint: new Map(),
				event: (el.hasOwnProperty('event')) ? el.event : {},
				order: order
			});
		}
		this.setOrder(name, order);
	}
	//рисует обьект по точкам и добавляет в список элементов с тмпом "o"
	drawObj(obj, conf = { fill: false, color: "black", widht: 1, name: false, cap: 'butt', join: 'round', limit: 1, dash: [], dashOffset: 0, time: false, step: 100, order: 1 }, event = {}) {
		conf = {
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
			order: 1,
			...conf
		};
		conf.name = conf.name ? conf.name : this.makeid(32);
		let pointArr = [];
		for (let i = 0; i < obj.length; i++) {
			let p1 = obj[i], p2;
			// для функции нахождения точек
			if (obj.length - i == 1) p2 = obj[0];
			else p2 = obj[i + 1];
			pointArr.push({ x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1] });
		}
		this.elements.set(conf.name, {
			name: conf.name,
			type: 'o',
			active: false,
			point: pointArr,
			allPoint: new Map(),
			conf: conf,
			event: (typeof event == "object") ? event : {}
		});
		this.setOrder(conf.name, conf.order);
	}
	//генерация id
	makeid(length) {
		let name = '';
		while (name.length < length) name += Math.random().toString(36).substring(2);
		return name.substring(0, length);
	}
	// Ивент отслежувающий движение мыши ((и другие эвенты) надо организовать)
	objectDetect(event, click = false) {
		let cy = Math.floor(this.canvas.offsetTop);
		cy = (cy < 0) ? 0 : cy;
		let y = Math.floor(event.pageY - cy);
		let x = Math.floor(event.pageX - this.canvas.offsetLeft);
		//  позиция мыши
		document.dispatchEvent(new CustomEvent('mausePosition', {
			bubbles: true,
			detail: { position: { x: x, y: y }, canvas: this.canvas }
		}));
		// -------------------
		// Прошёл ли минимальный заданный интервал после последней проверкой
		let interval = ((Date.now() - this.time.lastCheck) >= this.detectPosition.timeCheck);
		// последняя позиции мыши
		this.detectPosition.lastX = x;
		this.detectPosition.lastY = y;
		// определяем элемент
		if (this.detectPosition.checkPosition && (interval || click)) {
			// для последней позиции мыши
			this.time.lastCheck = Date.now();

			let findedElements = this.checkPointX(x, y);
			// элементы
			document.dispatchEvent(new CustomEvent('actEl', {
				bubbles: true,
				detail: { actEl: findedElements, canvas: this.canvas }
			}));
			// ----------------
			if (findedElements != 0) {
				let winName = findedElements[0];
				if (winName != this.activeName) {
					this.activeName = winName;
					// Запуск эвента ховер (если он есть)
					if (this.eventList.hasOwnProperty('hover')) {
						this.eventList.hover();
					}
				}
			}
			else this.activeName = false;
		}
	}
	objectDetectEvent() {
		this.canvas.addEventListener("mousemove", this.objectDetect.bind(this));
		this.canvas.addEventListener('click', (event) => {
			let fun = this.objectDetect.bind(this);
			fun(event, this.detectPosition.click);
		});
	}
	getEl(name) {
		if (typeof name === "object" && name.hasOwnProperty("type") && name.hasOwnProperty("name")) return name;
		else if (this.elements.has(name)) return this.elements.get(name);
		else return false;
	}
	// возвращает массив с точками из линий
	pointGet(obj) {
		obj = this.getEl(obj); // Элемент не должен является частью комбинированого элемента ('u')
		if (obj !== false) {
			let result = new Map();
			// проходимся по прямым
			for (let p = 0; p < obj.point.length; p++) {
				let x1 = obj.point[p].x1;
				let x2 = obj.point[p].x2;
				let y1 = obj.point[p].y1;
				let y2 = obj.point[p].y2;
				// Добавляем начальные и конечные элименты
				if (result.has(y1)) result.set(y1, [...result.get(y1), x1]);
				else result.set(y1, [x1]);
				if (result.has(y2)) result.set(y2, [...result.get(y2), x2]);
				else result.set(y2, [x2]);
				// не расщитываем отрезок которая параллельна абcцисc x
				if ((y1 - y2) != 0) {
					let slope = (y2 - y1) / (x2 - x1);
					let c = y1 - x1 * slope;
					let cof = (x1 < x2) ? 1 : -1;
					let newX, newY;
					// Вертикальная линия или нет
					if (Math.abs(x1 - x2) != 0) {
						let lastY = y1;
						for (let i = 0, xc = Math.abs(x1 - x2); i <= xc; i++) {
							newX = x1 + i * cof;
							newY = Math.floor(slope * newX + c);
							if (lastY != newY) {
								lastY = newY;
								if (result.has(newY)) {
									result.set(newY, [...result.get(newY), newX]);
								}
								else {
									result.set(newY, [newX]);
								}
							}
						}
					}
					else {
						newX = x1;
						for (let j = 0, yc = Math.abs(y1 - y2); j < yc; j++) {
							newY = y1 + (j * ((y1 < y2) ? 1 : -1));
							// newY = slope * newX + c;
							if (result.has(newY)) {
								result.set(newY, [...result.get(newY), newX]);
							}
							else {
								result.set(newY, [newX]);
							}
						}
					}
				}
			}
			obj.allPoint = result;
		}
	}
	// добавляет элемент в отслеживаемые (active)
	addActiveEl(data) {
		data = this.getEl(data);
		if (data != false && data.active == false) {
			if (data.type == "u") {
				data.active = true;
				data.actObj.forEach((e) => this.addActiveEl(data.arrObj.get(e)));
			}
			else {
				data.point.forEach((line) => {
					let keyY = Math.min(line.y1, line.y2);
					let keyX = Math.min(line.x1, line.x2);
					let maxY = Math.max(line.y1, line.y2);
					let maxX = Math.max(line.x1, line.x2);
					// новый элемент
					if (!this.active.has(keyY)) {
						let map = new Map();
						let el = new Map();
						el.set(data.name, [line]);
						map.set(keyX, el);
						this.active.set(keyY, map);
					}
					// добовление к существующему элементу
					else {
						let mapX = this.active.get(keyY);
						if (mapX.has(keyX)) {
							let el = mapX.get(keyX);
							if (el.has(data.name)) el.get(data.name).push(line);
							else el.set(data.name, [line]);
						}
						else {
							let el = new Map();
							el.set(data.name, [line]);
							mapX.set(keyX, el);
						}
					}
				});
				data.active = true;
			}

		}
	}
	// анимация "бегающие муравьи" для обьектов типа "o"
	async roundDash(name, time = 30, st = 100, dash = [10, 3], stepDF = 1, dashOffset = 0) {
		if (name && this.elements.has(name)) {
			let el = this.elements.get(name);
			let conf = el.conf;
			if (time) {
				time = (time < 10) ? 10 : time;
				let i = dashOffset;
				conf.dash = dash;
				if (!this.dashId.hasOwnProperty(name)) {
					// записываем полученные данные
					conf.time = time;
					conf.step = st;
					// this.elements.set(name, el);
					let id = setInterval(() => {
						try {
							if (this.elements.has(name)) {
								conf.dashOffset = i;
								el = this.elements.get(name);
								el.conf = conf;
								this.elements.set(name, el);
								i = (i >= st + dashOffset) ? dashOffset : i + stepDF;
							}
						}
						catch (err) { clearInterval(id); }
					}, time);
					this.dashId[name] = id;
				}
				else {
					clearInterval(this.dashId[name]);
					delete this.dashId[name];
					this.roundDash(name, time, st, dash, stepDF, i);
				}
			}
			else {
				clearInterval(this.dashId[name]);
				delete this.dashId[name];
				conf.dash = [];
				conf.time = false;
				el = this.elements.get(name);
				el.conf = conf;
				this.elements.set(name, el);
			}
		}
		else {
			if (Object.keys(this.dashId).length > 0) {
				for (const key in this.dashId) {
					if (this.dashId.hasOwnProperty(key)) {
						const id = this.dashId[key];
						clearInterval(id);
						let el = this.elements.get(key);
						el.conf.dash = [];
						delete this.dashId[key];
					}
				}
			}
		}
		return this.dashId;
	}
	// проверяет над каким элементом находится данная точка
	checkPointX(x, y) {
		let result = [];
		let left = {};
		let right = {};
		this.active.forEach((mxCon, my) => {
			if (my <= y) {
				mxCon.forEach((obj, mx) => {
					obj.forEach((points, name) => {
						points.forEach(point => {
							if (Math.max(point.y1, point.y2) >= y) {
								let maxx = Math.max(point.x1, point.x2);
								if (x >= maxx && x >= mx) {
									left[name] = left.hasOwnProperty(name) ? left[name] + 1 : 1;
								}
								else if (x <= maxx && x <= mx) {
									right[name] = right.hasOwnProperty(name) ? right[name] + 1 : 1;
								}
								else {
									let slope = (point.y2 - point.y1) / (point.x2 - point.x1);
									let c = point.y1 - point.x1 * slope;
									let newY = slope * x + c;
									// направление и сторона прямой
									if (y <= newY) {
										if (c >= 0) {
											right[name] = right.hasOwnProperty(name) ? right[name] + 1 : 1;
										}
										else {
											left[name] = left.hasOwnProperty(name) ? left[name] + 1 : 1;
										}
									}
									else if (y > newY) {
										if (c >= 0) {
											left[name] = left.hasOwnProperty(name) ? left[name] + 1 : 1;
										}
										else {
											right[name] = right.hasOwnProperty(name) ? right[name] + 1 : 1;
										}

									}

								}
							}
						});
					})

				});
			}
		});

		// Отсекаем чётное
		for (const key in left) {
			const quantity = left[key];
			if (right.hasOwnProperty(key) && ((quantity + right[key]) % 2) === 0) {
				result.push(key);
			}
		}
		return result;
	}
	// отрисовывает прямоугольник на определённой точке (простая отрисовка)
	test(x, y, color = 'green', w = 10, h = 10) {
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x - w / 2, y - h / 2, w, h);
	}
	// удалить элемент из elements и event
	remove(name) {
		let obj = this.getEl(name);
		if (obj != false) {
			this.setOrder(name, 0);
			this.removeAct(name);
			this.elements.delete(name);
		}
	}
	// удаление объекта из активных
	removeAct(name) {
		let obj;
		obj = this.getEl(name);
		if (obj != false && obj.active == true) {
			if (obj.type == "u") obj.actObj.forEach(nameObj => {
				let subObj = obj.arrObj.get(nameObj);
				this.removeAct(subObj, true);
			});
			else {
				// начало удаление, получаем кординаты (x,y)
				obj.point.forEach((point) => {
					let my = Math.min(point.y1, point.y2);
					let mx = Math.min(point.x1, point.x2);
					if (this.active.has(my)) {
						let xCon = this.active.get(my);
						xCon.forEach((lineCon, n) => {
							if (n = mx) {
								if (lineCon.has(obj.name)) lineCon.delete(obj.name);
								if (lineCon.size == 0) xCon.delete(n);
							}
						});
						if (xCon.size == 0) {
							this.active.delete(my);
						}
					}
				})
			}
			// помечаем как не активный элемент
			obj.active = false;
		}
	}
	// обьелиняет элементы в один
	combEl(objArr, conf = { actObj: false, name: false, order: 1 }) {
		conf = { actObj: false, name: false, order: 1, ...conf };
		let result = {
			name: conf.name ? conf.name : this.makeid(32),
			active: false,
			arrObj: new Map(),
			actObj: [],
			allPoint: new Map(),
			order: conf.order,
			type: "u"
		};
		objArr.forEach((n) => {
			if (this.elements.has(n)) {
				let el = this.elements.get(n);
				el.parent = result.name;
				result.arrObj.set(n, el);
			}
		});
		if (conf.actObj) {
			conf.actObj.forEach((n) => {
				if (this.elements.has(n)) result.actObj.push(n);
			});
		}
		else result.actObj = [];
		objArr.forEach((n) => {
			this.remove(n, false);
		})
		this.elements.set(result.name, result);
		this.setOrder(result.name, result.order);
		return true;
	}
	// добавление эвентов к обьектам
	addEvent(obj, type, f) {
		// Получаем объект
		obj = this.getEl(obj);
		// Проверка, был ли получен объект
		if (obj == false) return false;
		if (obj.type !== "u") {
			if (!obj.hasOwnProperty("event")) obj.event = {};
			obj.event[type] = f;
			this.elements.set(obj.name, obj);
			return true;
		}
		else {
			obj.actObj.forEach(name => this.addEvent(obj.arrObj.get(name), type, f));
		}
	}
	removeEvent(obj, type) {
		// Получаем объект
		obj = this.getEl(obj);
		// Проверка, был ли получен объект
		if (obj == false) return false;
		if (obj.type !== "u") {
			if (obj.hasOwnProperty("event")) {
				if (obj.event.hasOwnProperty(type)) delete obj.event[type];
			}
		}
		else {
			obj.actObj.forEach(name => this.removeEvent(obj.arrObj.get(name), type));
		}
	}
	// Запуск функции ивента
	runEventFunction(obj, type) {
		obj = this.getEl(obj);
		if (obj != false) {
			if (obj.event.hasOwnProperty(type)) {
				obj.event[type]();
				return true;
			}
			else return false;
		}
		else return false;
	}
	// Добавление слушателя
	activeEventListener(type) {
		try {
			// записываем функции слущателя
			this.eventList[type] = () => this.runEventFunction(this.activeName, type);
			// добавляем слушатель
			this.canvas.addEventListener(type, this.eventList[type]);
			return true;
		}
		catch (e) {
			console.log(e);
			return false
		}
	}
	// Удаления слушателя
	removeEventListener(type) {
		this.canvas.removeEventListener(type, this.eventList[type]);
	}
	moveObj(obj, move = { 'down': 0, 'up': 0, 'left': 0, 'right': 0 }) {
		obj = this.getEl(obj);
		if (obj != false) {
			// сдвиг по ширене и высоте
			let height = (!isNaN(Number(move.down)) ? move.down : 0) - (!isNaN(Number(move.up)) ? move.up : 0);
			let widht = (!isNaN(Number(move.right)) ? move.right : 0) - (!isNaN(Number(move.left)) ? move.left : 0);
			let active = obj.active;
			// сдвиг линии
			if (obj.type == 'l') {
				if (active) this.removeAct(obj.name);
				obj.x += widht;
				obj.y += height;
				obj.point = [
					{ x1: obj.x, y1: obj.y, x2: obj.x, y2: (obj.y + obj.h) },
					{ x1: obj.x + obj.w, y1: obj.y, x2: obj.x + obj.w, y2: (obj.y + obj.h) }
				]
				if (active) this.addActiveEl(obj.name);
			}
			// сдвиг объекта
			else if (obj.type == 'o') {
				if (active) this.removeAct(obj.name);
				obj.point = obj.point.map((point) => {
					return { x1: (point.x1 + widht), y1: (point.y1 + height), x2: (point.x2 + widht), y2: (point.y2 + height) };
				});
				if (active) this.addActiveEl(obj.name);
			}

			else if (obj.type == "u") {
				if (active) this.removeAct(obj.name);
				obj.arrObj.forEach(el => {
					this.moveObj(el, move);
				});
				if (active) this.addActiveEl(this.getEl(obj.name));
			}
		}
		else return false;
	}
	syncDraw(fps) {
		// console.log("SyncDraw");
		if (!isNaN(Number(fps)) && fps > 0) {
			clearInterval(this.syncId);
			this.frame.lock = fps;
			let time = Math.floor(1000 / fps);
			time = Math.floor(((time >= 1000) ? 500 : (time < 5) ? 5 : time) / 2.5);
			this.syncId = setInterval(() => {
				if (!this.frame.drawNow) this.draw();
			}, time);
		}
		else clearInterval(this.syncId);
	}
	UpdatelastPoint(time) {
		time = (time >= 10) ? time : 10;
		// авто-обгавление позиции
		if (this.detectPosition.intervalId === false) clearInterval(this.detectPosition.intervalId);
		this.detectPosition.intervalId = setInterval(() => {
			if (((Date.now() - this.time.lastCheck) >= time)) {
				this.objectDetect({ pageX: this.detectPosition.lastX, pageY: this.detectPosition.lastY }, true);
			}
		}, time);
	}
	setOrder(obj, order) {
		obj = this.getEl(obj);
		if (obj != false && typeof order == "number") {
			// прошлый порядок
			let lastOrder;
			if (obj.type == "o") {
				lastOrder = obj.conf.order;
				obj.conf.order = (order !== 0) ? order : 1;
			}
			else {
				lastOrder = obj.order;
				obj.order = (order !== 0) ? order : 1;
			}
			// удаляем прошлый порядок
			let orderList;
			if (this.frame.drawOrder.has(lastOrder)) {
				orderList = this.frame.drawOrder.get(lastOrder);
				orderList.delete(obj.name);
				if (orderList.size == 0) {
					this.frame.drawOrder.delete(lastOrder);
					this.frame.allOrder.splice(this.frame.allOrder.indexOf(lastOrder), 1);
				}
			}
			// добавляем новый порядок
			if (order != 0) {
				if (this.frame.drawOrder.has(order)) orderList = this.frame.drawOrder.get(order);
				else orderList = new Map();
				orderList.set(obj.name, false);
				this.frame.drawOrder.set(order, orderList);
				if (this.frame.allOrder.indexOf(order) == -1) {
					this.frame.allOrder.push(order);
					this.frame.allOrder.sort((a, b) => { return a - b; });
				}
			}
		}

	}
}