//определение основных функций canvas в обьекте
function dataCanvas(can, arrel = new Map(), activ = new Map()) {
	return {
		canvas: can,
		ctx: can.getContext("2d"),
		elements: arrel,
		active: activ,
		activeName: false,
		activeId: {},
		check: true,
		// отрисовка
		lock: 30, // максимальное колличество отрисовок в 1 секунду
		time: Date.now(),
		timeCount: 0,
		fps: 0, // показатель отрисовок в 1 секунду
		lockCount: 0,
		// рисуем всё или 1 обьект (по имени или обЪекту) используя на drawEL
		draw: function (element = false, around = false) {
			let show = false;
			let time = Date.now() - this.time;
			let timeNow = time - (this.timeCount * 1000);
			let timePause = 1000 / this.lock;
			if ((!element && (timeNow >= (timePause * this.lockCount) && timeNow <= 1000)) || around) {
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.elements.forEach((el) => {
					this.drawEl(el);
				});
				// счётчик вызовов / сек
				if (timeNow >= 1000) {
					show = true;
					let st = timeNow < 1000 ? 1 : Math.trunc(timeNow / 1000);
					this.timeCount += st;
					this.lockCount = 0;
					// document.querySelector('.FPS').querySelector('span').textContent = ((this.fps + 1) / st) + " | " + st;
				} else {
					this.fps++;
					this.lockCount++;
				}
			}
			else if (element) {
				element = (typeof element == "object") ? element : (typeof element == "string") ? ((this.elements.has(element)) ? this.elements.get(element) : { type: 'false' }) : { type: 'false' };
				this.drawEl(element);
			}
			else {
				// счётчик вызовов / сек
				if (timeNow >= 1000) {
					show = true;
					let st = timeNow < 1000 ? 1 : Math.trunc(timeNow / 1000);
					this.timeCount += st;
				}
			}
			if (show) {
				// для теста
				document.querySelector('.FPS').querySelector('span').textContent = this.fps;
				// -----------------
				this.fps = 0;
				this.lockCount = 0;
			}
		},
		// ресует 1 обьект (по обЪекту)
		drawEl: function (el) {
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
					// p.map.forEach((pp, key) => {
					// 	pp.y.forEach((ppp) => {
					// 		this.test(key, ppp, "green", 5, 5);
					// 	});
					// })
					// this.test(p.x1, p.y1, "red", 5, 5);
				}
				this.ctx.closePath();
				if (conf.fill) this.ctx.fill();
				else this.ctx.stroke();
				// обнуляем lineDash у ctx
				this.ctx.setLineDash([]);
			}
			else if (el.type = 'c') {
				el.arrObj.forEach((e) => {
					this.draw(e);
				});
			}
		},
		//рисует линию и добавляет в список элементов с тмпом "l"
		drawLine: function (el = false, x = 0, y = 0, w = 0, h = 0, color = 'black', fill = true) {
			let name = el.hasOwnProperty('name') ? el.name : this.makeid(32);
			let point = [];
			let allPoint = new Map();
			color = color ? color : "black";
			el = (Object.keys(el).length > 1) ? { x: 0, y: 0, w: 0, h: 0, color: "black", name: name, fill: true, ...el } : false;
			if (!el) {
				point.push({ map: this.pointGet(x, x + w, y, y, name) });
				point.push({ map: this.pointGet(x, x + w, y + h, y + h, name) });
				point.push({ map: this.pointGet(x, x, y, y + h, name) });
				point.push({ map: this.pointGet(x + w, x + w, y, y + h, name) });
				point.forEach(e => {
					for (const key of e.map.keys()) allPoint.set(key, null);
				});

				this.elements.set(name, { name: name, type: 'l', y: y, x: x, w: w, h: h, color: color, fill: fill, point: point, allPoint: allPoint });
			}
			else {
				point.push({ map: this.pointGet(el.x, el.x + el.w, el.y, el.y, el.name) });
				point.push({ map: this.pointGet(el.x, el.x + el.w, el.y + el.h, el.y + el.h, el.name) });
				point.push({ map: this.pointGet(el.x, el.x, el.y, el.y + el.h, el.name) });
				point.push({ map: this.pointGet(el.x + el.w, el.x + el.w, el.y, el.y + el.h, el.name) });
				point.forEach(e => {
					for (const key of e.map.keys()) allPoint.set(key, null);
				});
				this.elements.set(el.name, { name: el.name, type: 'l', y: el.y, x: el.x, w: el.w, h: el.h, color: el.color, fill: el.fill, point: point, allPoint: allPoint });
			}
			this.draw(this.elements.get(name));
		},
		//рисует обьект по точкам и добавляет в список элементов с тмпом "o"
		drawObj: function (obj, conf = { fill: false, color: "black", widht: 1, name: false, cap: 'butt', join: 'round', limit: 1, dash: [], dashOffset: 0 }) {
			conf = { fill: false, color: "black", widht: 1, name: false, cap: 'butt', join: 'round', limit: 1, dash: [], dashOffset: 0, ...conf };
			conf.name = conf.name ? conf.name : this.makeid(32);
			let pointArr = [];
			let allPoint = new Map();
			for (let i = 0; i < obj.length; i++) {
				let p1 = obj[i], p2;
				// для функции нахождения точек
				if (obj.length - i == 1) p2 = obj[0];
				else p2 = obj[i + 1];
				let map = this.pointGet(p1[0], p2[0], p1[1], p2[1], conf.name);
				for (const key of map.keys()) allPoint.set(key, null);
				pointArr.push({ x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], map: map });
			}
			this.elements.set(conf.name, { name: conf.name, type: 'o', point: pointArr, allPoint: allPoint, conf: conf });
			this.draw(this.elements.get(conf.name));
		},
		//генерация id
		makeid: function (length) {
			let name = '';
			while (name.length < length) name += Math.random().toString(36).substring(2);
			return name.substring(0, length);
		},
		// Ивент отслежувающий движение мыши ((и другие эвенты) надо организовать)
		eventGo: function () {
			this.canvas.addEventListener("mousemove", (event) => {
				let cy = Math.floor(this.canvas.offsetTop);
				cy = (cy < 0) ? 0 : cy;
				let y = Math.floor(event.pageY - cy);
				let x = Math.floor(event.pageX - this.canvas.offsetLeft);
				// для теста
				document.querySelectorAll("span").forEach((s) => {
					let py = (y < 0) ? Math.abs(y) : 0;
					if (s.closest("div").className == "x") s.textContent = x + ` | ${event.pageX} |` + `${Math.floor(this.canvas.offsetLeft)}`;
					if (s.closest("div").className == "y") s.textContent = Math.floor(y + py) + ` | ${event.pageY} | ${cy}`;
				});
				// -------------------
				// определяем элемент
				if (this.check) {
					let chX = this.checkPointX(x, y, this.active, this.canvas.width);
					let chXY = chX;
					// для теста
					document.querySelector(".act").querySelector("span").textContent = JSON.stringify(chXY);
					// ------------------------
					let stop = true;
					let nameEl = new Map();
					// считаем колличество элементов
					chXY.forEach((e) => {
						if (e && nameEl) {
							if (nameEl.has(e)) {
								stop = false;
								let buf = nameEl.get(e);
								nameEl.set(e, buf += 1);
							}
							else nameEl.set(e, 0);
						}
						else nameEl = false;
					});
					nameEl = stop ? false : nameEl;
					if (nameEl) {
						let iter = nameEl.entries();
						let winName = '';
						let win = 0;
						for (let i = 0; i < nameEl.size; i++) {
							let b = iter.next().value; // [имя, колличесво]
							if ((b[1] + 1) == 2) {
								winName = b[0];
								break;
							}
							else winName = false;
						}
						if (winName != this.activeName && winName) this.activeName = winName;
					}
					else this.activeName = false;
				}
			});
		},
		// даёт элемент из массива active
		getEl: function (x) {
			if (this.active.has(x)) return this.active.get(x);
			else return false;
		},
		// возвращает массив с точками из линий
		pointGet: function (x1, x2, y1, y2, name = false) {
			let lengthX = x1 - x2;
			let lengthY = y1 - y2;
			let sideX = 'r', sideY = 'b';
			if (lengthX > 0) sideX = 'l';  // в лево = '-' и на обор
			else if (lengthX == 0) sideX = 's';
			if (lengthY > 0) sideY = 't'; // в низ = '+' и на обор
			else if (lengthY == 0) sideY = 's';
			lengthY = Math.abs(lengthY);
			lengthX = Math.abs(lengthX);
			let step = ((lengthX == 0) ? 0 : lengthX) / ((lengthY == 0) ? 1 : lengthY); // колличество px y на 1px x
			if (lengthX == step) step = 1;// если нужно рисовать линию по x
			let arr = new Map();
			let addY = new Map();
			// начало ------------------------------
			for (let i = 0, st = (lengthX == 0) ? 1 : lengthX; i < st; i++) {
				let x = x1 + ((sideX == 'l') ? 0 - i : i);
				// корректируем с связи с направлением
				x = (sideY == 'b' && sideX == 'l') ? x - 1 : (sideY == 't' && sideX == 'r') ? x : (sideX == 'r' && sideY == 'b') ? x + 1 : (sideY == 't' && sideX == 'l') ? x - 1 : x;
				x = (sideY == "s" && sideX == 'r') ? x + 1 : (sideY == "s" && sideX == 'l') ? x - 1 : x;
				//------------------------------
				let arrY = [];
				// получение y
				for (let j = 0, s = Math.ceil((step < 1) ? 1 / step : (step == 1 && lengthY != 0) ? lengthY : step); j < s; j++) {
					let y = ((sideY == 't') ? (y1 + (((0 - 1 / step)) - ((lengthX == 0) ? j : i) / step)) : (sideY == 'b') ? (y1 + (1 / step + ((lengthX == 0) ? j : i) / step)) - 1 : y1);
					y = (j > 1 && sideX != 's') ? y - j / s : y;
					// исправляем неточности
					y = (((j % 2 != 0) && sideX != 's' && sideY != 's') && (y + 1 < ((y1 > y2) ? y1 : y2))) ? y + 1 : y;
					y = (Math.floor(y) < ((y1 < y2) ? y1 : y2)) ? ((y1 < y2) ? y1 : y2) : Math.floor(y);
					if (!addY.has(y)) {
						arrY.push(y);
						addY.set(y, 0);
					}
				}
				// начальные и конечные кординаты
				if (name) {
					arr.set(x, { y: arrY, name: name });
				}
				else {
					arr.set(x, { y: arrY });
				}
			}
			return arr;
		},
		// добавляет элемент в отслеживаемые (active)
		activeEl: function (data) {
			data = (typeof data == 'object') ? data : (typeof data == 'string') ? this.elements.get(data) : {};
			if (data.type == 'c') {
				data.genObj.forEach((e) => {
					this.activeEl(data.arrObj.get(e));
				});
			} else {
				data.point.forEach((point) => {
					point.map.forEach((p, key) => {
						//p = [y1,y2,y3...,yn]
						//key = x;
						if (key < this.canvas.width) {
							if (this.active.has(key)) {
								if (p.y.length != 0) {
									this.active.set(key, [...new Set([p, ...this.active.get(key)])]);
								}
							}
							else {
								if (p.y.length != 0) {
									this.active.set(key, [p]);
								}
							}
						}
					});
				});
			}
		},
		// анимация "бегающие муравьи" для обьектов типа "o"
		roundDash: function (name, time = 30, st = 100, dash = [10, 3]) {
			if (name && this.elements.has(name)) {
				let el = this.elements.get(name);
				if (time) {
					let i = 0;
					el.conf.dash = dash;
					if (!this.activeId.hasOwnProperty(name)) {
						let id = setInterval(() => {
							try {
								if (this.elements.has(name)) {
									el.conf.dashOffset = i;
									this.elements.set(name, el);
									this.draw();
									i = (i == st) ? 0 : i + 1;
								} else {
								}
							}
							catch (err) { clearInterval($id); }
						}, time);
						this.activeId[name] = id;
					}
					else {
						clearInterval(this.activeId[name]);
						delete this.activeId[name];
						this.roundDash(name, time, st, dash);
					}
				}
				else {
					clearInterval(this.activeId[name]);
					delete this.activeId[name];
					el.conf.dash = [];
					this.elements.set(name, el);
				}
			}
			else {
				if (Object.keys(this.activeId).length > 0) {
					for (const key in this.activeId) {
						if (this.activeId.hasOwnProperty(key)) {
							const id = this.activeId[key];
							clearInterval(id);
							let el = this.elements.get(key);
							el.conf.dash = [];
							delete this.activeId[key];
						}
					}
				}
			}
			this.draw(false, true);
			return this.activeId;
		},
		// проверяет над каким элементом находится данная точка
		checkPointX: function (px, py, act, w) {
			let res = [];
			let rs = [];
			let p;
			let s = [px, ''];
			for (let i = 0, bx = px; i < 2; bx = px, i++) {
				while (true) {
					if (p = this.getEl(bx)) {
						p.forEach((e) => {
							// ищем совпадение по y
							if (e.y.indexOf(py) != -1) {
								// предпренимаем действия с y
								if (rs.indexOf(e.name) == -1 && !(e.x1 == bx && e.y1 == py) && !(e.x2 == bx && e.y2 == py)) {
									rs.push(e.name);
									s = [bx, e.name];
									// this.test(bx, py, 'green');
								}
								else if (rs.indexOf(e.name) != -1) {
									rs.splice(rs.indexOf(e.name), 1);
									// this.test(bx, py, 'red', 5, 4);
								}
							}
						});
					}
					if (i == 0 && (bx - 1) >= 0) --bx;
					else if (i == 1 && (bx + 1) <= w) ++bx;
					else {
						res.push(...((rs.length != 0) ? rs : [false]));
						rs = [];
						break;
					}
				}
			}
			return res;
		},
		// отрисовывает прямоугольник на определённой точке (простая отрисовка)
		test: function (x, y, color = 'green', w = 10, h = 10) {
			this.ctx.fillStyle = color;
			this.ctx.fillRect(x - w / 2, y - h / 2, w, h);
		},
		// удалить элемент из elements и event
		remove: function (name, update = true) {
			let obj = this.elements.has(name) ? this.elements.get(name) : { type: false };
			if (obj.type != false) {
				for (const key of obj.allPoint.keys()) {
					let actEl = this.active.has(key) ? this.active.get(key) : false;
					if (actEl) {
						let res = [];
						if (obj.type == 'c') {
							actEl.forEach((el, k) => {
								if (obj.genObj.indexOf(el.name) < 0) res.push(el);
							});
						}
						else {
							actEl.forEach((el, k) => {
								if (name != el.name) res.push(el);
							});
						}
						if (res.length != 0) this.active.set(key, res);
						else this.active.delete(key);
					}
				}
				this.elements.delete(name);
				if (update) this.draw(false, true);
			}
		},
		// обьелиняет элементы в один
		combEl: function (objArr, genObj = false, name = false) {
			let result = {};
			if (name) result.name = name;
			else result.name = this.makeid(32);
			result.arrObj = new Map();
			result.genObj = [];
			result.allPoint = new Map();
			objArr.forEach((n) => {
				if (this.elements.has(n)) {
					let el = this.elements.get(n);
					el.parent = result.name;
					result.arrObj.set(n, el);
					if (genObj) {
						genObj.forEach(gn => {
							if (gn == n) {
								el.point.forEach((g) => {
									for (const key of g.map.keys()) result.allPoint.set(key, null);
								});
							}
						});
					}
				}
			});
			if (genObj) {
				genObj.forEach((n) => {
					result.genObj.push(n);
				});
			}
			else result.genObj = [];
			objArr.forEach((n) => {
				this.remove(n, false);
			})
			result.type = 'c';
			this.elements.set(result.name, result);
			this.draw();
			return true;
		}
	}
}