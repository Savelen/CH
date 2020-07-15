//создание canvas и определение его размера
let canvas = document.querySelector('#graph');
// canvas.width = window.innerWidth - 46;
// canvas.height = window.innerHeight / 100 * 80 - 32;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//----------------------------------------------------------------------
//определение основных функций canvas в обьекте
function dataCanvas(can, arrel = new Map(), activ = new Map()) {
	return {
		canvas: can,
		ctx: can.getContext("2d"),
		elements: arrel,
		active: activ,
		activeName: false,
		activeId: '',
		check: true,
		time: Date.now(),
		timeCount: 1,
		countDrive: 0,
		drive: function () {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.elements.forEach((el) => {
				if (el.type == 'l') {
					this.ctx.fillStyle = el.color;
					this.ctx.fillRect(el.x, el.y, el.w, el.h);
				}
				else if (el.type == 'o') {
					let conf = el.conf;
					let obj = el.point;
					this.ctx.beginPath();
					this.ctx.strokeStyle = conf.color;
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
						// 		this.ctx.fillStyle = "red";
						// 		this.ctx.fillRect(key, ppp, 1, 1);
						// 	});
						// })
						// this.ctx.fillStyle = "green";
						// this.ctx.fillRect(p.x1, p.y1, 1, 1);
					}
					this.ctx.closePath();
					if (conf.type == "f") this.ctx.fill();
					else this.ctx.stroke();
				}
			});
			let tm = Date.now() - this.time;
			if (tm / this.timeCount >= 1000) {
				let st = (tm / this.timeCount) < 1000 ? 1 : Math.trunc((tm / this.timeCount) / 1000);
				this.timeCount += st;
				document.querySelector('.countDrive').querySelector('span').textContent = ((this.countDrive + 1) / st) + " | " + st;
				this.countDrive = 0;
			} else this.countDrive += 1;
		},
		//рисует линию и добавляет в список элементов с тмпом "l"
		driveLine: function (el = false, x = 0, y = 0, w = 0, h = 0, color = 'black',) {
			let name = this.makeid(32);
			let point = [];
			if (!el) {
				point.push({ map: this.pointGet(x, x + w, y, y, name) });
				point.push({ map: this.pointGet(x, x + w, y + h, y + h, name) });
				point.push({ map: this.pointGet(x, x, y, y + h, name) });
				point.push({ map: this.pointGet(x + w, x + w, y, y + h, name) });
				this.elements.set(name, { name: name, type: 'l', y: y, x: x, w: w, h: h, color: color, point: point });
			}
			else if (!el.hasOwnProperty("name")) {
				point.push({ map: this.pointGet(el.x, el.x + el.w, el.y, el.y, el.name) });
				point.push({ map: this.pointGet(el.x, el.x + el.w, el.y + el.h, el.y + el.h, el.name) });
				point.push({ map: this.pointGet(el.x, el.x, el.y, el.y + el.h, el.name) });
				point.push({ map: this.pointGet(el.x + el.w, x + el.w, el.y, el.y + el.h, el.name) });
				this.elements.set(name, { name: name, type: 'l', y: el.y, x: el.x, w: el.w, h: el.h, color: el.color, point: point });
			}
			else if (el.hasOwnProperty("name")) {
				point.push({ map: this.pointGet(el.x, el.x + el.w, el.y, el.y, el.name) });
				point.push({ map: this.pointGet(el.x, el.x + el.w, el.y + el.h, el.y + el.h, el.name) });
				point.push({ map: this.pointGet(el.x, el.x, el.y, el.y + el.h, el.name) });
				point.push({ map: this.pointGet(el.x + el.w, x + el.w, el.y, el.y + el.h, el.name) });
				this.elements.set(el.name, { name: el.name, type: 'l', y: el.y, x: el.x, w: el.w, h: el.h, color: el.color, point: point });
			}
			this.drive();
		},
		//рисует обьект по точкам и добавляет в список элементов с тмпом "o"
		driveObj: function (obj, conf = { default: true, type: 's', color: "black", widht: 1, name: false, cap: 'butt', join: 'round', limit: 1, dash: [], dashOffset: 0 }) {
			conf = conf.default ? conf : { type: 's', color: "black", widht: 1, name: false, cap: 'butt', join: 'round', limit: 1, dash: [], dashOffset: 0, ...conf };
			//el = [[100,200],[300,400]]
			conf.name = conf.name ? conf.name : this.makeid(32);
			let pointArr = [];
			for (let i = 0; i < obj.length; i++) {
				let p1 = obj[i], p2;
				// для функции нахождения точек
				if (obj.length - i == 1) p2 = obj[0];
				else p2 = obj[i + 1];
				let map = this.pointGet(p1[0], p2[0], p1[1], p2[1], conf.name);
				pointArr.push({ x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], map: map });
			}
			this.elements.set(conf.name, { name: conf.name, type: 'o', point: pointArr, conf: conf });
			this.drive();
		},
		//генерация id
		makeid: function (length) {
			let result = '';
			let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
			let charactersLength = characters.length;
			for (let i = 0; i < length; i++) {
				result += characters.charAt(Math.floor(Math.random() * charactersLength));
			}
			return result;
		},
		eventGo: function () {
			this.canvas.addEventListener("mousemove", (event) => {
				this.drive();
				let cy = Math.floor(this.canvas.offsetTop);
				cy = (cy < 0) ? 0 : cy;
				let y = Math.floor(event.pageY - cy);
				let x = Math.floor(event.pageX - this.canvas.offsetLeft);
				document.querySelectorAll("span").forEach((s) => {
					let py = (y < 0) ? Math.abs(y) : 0;
					if (s.closest("div").className == "x") s.textContent = x + ` | ${event.pageX} |` + `${Math.floor(this.canvas.offsetLeft)}`;
					if (s.closest("div").className == "y") s.textContent = Math.floor(y + py) + ` | ${event.pageY} | ${cy}`;
				});
				if (this.check) {
					let chX = this.checkPointX(x, y, this.active, this.canvas.width);
					let chXY = chX;
					document.querySelector(".act").querySelector("span").textContent = JSON.stringify(chXY);
					//================================
					// test --------------------------
					let stop = true;
					let nameEl = new Map();
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
					let add = 5;
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
						if (winName != this.activeName && winName) {
							let wName = this.elements.get(winName);
							let lName = this.elements.get(this.activeName);
							if (lName) {
								if (lName.type == "l") {
									lName.x += (lName.x > 0) ? add / 2 : 0;
									lName.y += (lName.y > 0) ? add / 2 : 0;
									lName.h -= add;
									lName.w -= add;
									this.elements.set(this.activeName, lName);
									this.drive();
								}
								else if (lName.type == "o") this.roundDash(this.activeName, false);
							}
							this.activeName = winName;
							if (wName.type == "l") {
								wName.x -= (wName.x > 0) ? add / 2 : 0;
								wName.y -= (wName.y > 0) ? add / 2 : 0;
								wName.h += add;
								wName.w += add;
								this.elements.set(this.activeName, wName);
								this.drive();
							}
							else if (wName.type == "o") this.roundDash(this.activeName);
						}
					}
					else {
						let nName = this.elements.get(this.activeName);
						if (nName) {
							if (nName.type == "l") {
								nName.x += (nName.x > 0) ? add / 2 : 0;
								nName.y += (nName.y > 0) ? add / 2 : 0;
								nName.h -= add;
								nName.w -= add;
								this.elements.set(this.activeName, nName);
								this.drive();
							}
							else if (nName.type == "o") this.roundDash(this.activeName, false);
						}
						this.activeName = false;
					}
				}
				//-----------------
			});
		},
		getEl: function (x) {
			if (this.active.has(x)) return this.active.get(x);
			else return false;
		},
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
					// let y = ((sideY == 't') ? (y1 + (((0 - 1 / step)) - ((lengthX == 0) ? j : i) / step)) : (sideY == 'b') ? (y1 + (1 / step + ((lengthX == 0) ? j : i) / step)) : y1);
					// y = (sideY == 'b' && sideX == 'l' && (x1 - x) >= 1) ? y - 1 : y;
					// исправляем неточности
					y = (((j % 2 != 0) && sideX != 's' && sideY != 's') && (y + 1 < ((y1 > y2) ? y1 : y2))) ? y + 1 : y;
					// y = (sideX == "s" && sideY == "b") ? y - 1 : y;
					y = (Math.floor(y) < ((y1 < y2) ? y1 : y2)) ? ((y1 < y2) ? y1 : y2) : Math.floor(y);
					// this.test(x, y, 'green', 10, 1);
					if (!addY.has(y)) {
						// if ((!addY.has(y) || (j == 0 && i < 2)) && ((y1 < y2) ? y1 : y2) < y && y < ((y1 > y2) ? y1 : y2)) {
						arrY.push(y);
						addY.set(y, 0);
					}
				}
				// начальные и конечные кординаты
				if (name) {
					// if (i + 1 >= st && x != x2) arr.set(x2, { y: [y2], name: name });
					// else if (i + 1 >= st && x == x2) arr.set(x2, { y: [...new Set(arrY, [y2])], name: name });
					// if (i + 1 >= st && x != x1) arr.set(x1, { y: [y1], name: name });
					// else if (i + 1 >= st && x == x1) arr.set(x1, { y: [...new Set(arrY, [y1])], name: name });
					// else arr.set(x, { y: arrY, name: name });
					arr.set(x, { y: arrY, name: name, x1: x1, y1: y1, x2: x2, y2: y2 });
				}
				else {
					// if (i + 1 >= st && x != x2) arr.set(x2, { y: [y2] });
					// else if (i + 1 >= st && x == x2) arr.set(x2, { y: [...new Set(arrY, [y2])] });
					// if (i + 1 >= st && x != x1) arr.set(x1, { y: [y1] });
					// else if (i + 1 >= st && x == x1) arr.set(x1, { y: [...new Set(arrY, [y1])] });
					// else arr.set(x, { y: arrY });
					arr.set(x, { y: arrY, x1: x1, y1: y1, x2: x2, y2: y2 });
				}
			}
			return arr;
		},
		activeEl: function (data) {
			data = (typeof data == 'object') ? this.elements.get(data.name) : (typeof data == 'string') ? this.elements.get(data) : {};
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
				})
			});
		},
		remove: function (el) { },
		roundDash: function (name, time = 30, st = 100, dash = [10, 3]) {
			if (name) {
				let t;
				t = this.elements.get(name);
				if (time) {
					let i = 0;
					t.conf.dash = dash;
					this.activeId = setInterval(() => {
						t.conf.dashOffset = i;
						this.elements.set(name, t);
						this.drive();
						i = (i == st) ? 0 : i + 1;
					}, time);
				}
				else {
					clearInterval(this.activeId);
					t.conf.dash = [];
					this.elements.set(name, t);
					this.drive();
				}
			}
			else {
				clearInterval(this.activeId);
			}
		},
		checkPointX: function (px, py, act, w) {
			let res = [];
			let rs = [];
			let p;
			let s = [px, ''];
			// br = false;
			for (let i = 0, bx = px; i < 2; bx = px, i++) {
				while (true) {
					// this.test(bx, py, 'blue', 1, 1)
					if (p = this.getEl(bx)) {
						p.forEach((e) => {
							// ищем совпадение по y
							if (e.y.indexOf(py) != -1) {
								// предпренимаем действия с y
									if (rs.indexOf(e.name) == -1 && !(e.x1 == bx && e.y1 == py) && !(e.x2 == bx && e.y2 == py)) {
									// if (!(Math.abs(bx - s[0]) == 1 && s[1] == e.name) && (rs.indexOf(e.name) == -1)) {
									rs.push(e.name);
									s = [bx, e.name];
									// this.test(bx, py, "green", 5, 3);
								}
								// else if (!(Math.abs(bx - s[0]) == 1 && s[1] == e.name)) {
								// 	s = [bx, e.name];
								// }
								// else if (!(Math.abs(bx - s[0]) == 1 && s[1] == e.name) && (rs.indexOf(e.name) != -1)) {
								else if (rs.indexOf(e.name) != -1) {
									rs.splice(rs.indexOf(e.name), 1);
									// this.test(s[0], py, "red");
									// this.test(bx, py, "black");
									// s = [bx, e.name];
								}
								// else if (rs.indexOf(e.name) != -1) {
								// 	rs.splice(rs.indexOf(e.name), 1);
								// 	// this.test(s[0], py, "red");
								// 	this.test(bx, py, "black");
								// 	// s = [bx, e.name];
								// }
								// else {
								// 	s[0] = bx;
								// }
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
		test: function (x, y, color = 'green', w = 10, h = 10) {
			this.ctx.fillStyle = color;
			// this.ctx.fillRect(x, y, 1, 1);
			this.ctx.fillRect(x - w / 2, y - h / 2, w, h);
		}
	}
}
let can = dataCanvas(canvas);
// can.driveLine(false, 0, 0, 10, 10);
// can.driveLine(false, 10, 20, 30, 5, "red");
// can.driveLine(false, 20, 40, 30, 5);
// can.driveLine(false, 30, 60, 30, 5);
// can.driveLine(false, 40, 80, 30, 5);
// can.driveLine(false, 50, 100, 30, 5);
// can.driveLine(false, 60, 120, 30, 5);
// can.driveLine(false, 270, 240, 30, 5);

// can.driveLine(false, 270, 240, 0.5, 50);

can.driveObj([[100, 200], [400, 200], [400, 400], [280, 400], [280, 250], [220, 250], [220, 400], [100, 400]], { type: 's', widht: 1, name: "Стены", color: "#663" });
can.driveObj([[310, 250], [340, 250], [340, 285], [340, 250], [370, 250], [370, 285], [340, 285], [370, 285], [370, 320], [340, 320], [340, 285], [340, 320], [310, 320], [310, 285], [340, 285], [310, 285]], { color: "blue", name: 'Окно с права' });
can.driveObj([[130, 250], [160, 250], [160, 285], [160, 250], [190, 250], [190, 285], [160, 285], [190, 285], [190, 320], [160, 320], [160, 285], [160, 320], [130, 320], [130, 285], [160, 285], [130, 285]], { color: "blue", name: 'Окно с лева' });
can.driveObj([[100, 200], [400, 200], [250, 50]], { name: "Крыша", color: 'gray' });
can.driveObj([[220, 250], [280, 250], [280, 400], [220, 400]], { name: "Дверь", color: '#531' });

can.driveObj([[232, 327], [232, 320], [225, 320], [225, 327]], { name: "Дверная ручка", color: '#531' });
can.driveObj([[1300, 300], [1000, 300], [1000, 500]], { name: 'прямоугольник' });
can.driveObj([[600, 100], [800, 100], [700, 200], [600, 300], [800, 300]], { name: "time", color: "aqua" });
can.eventGo();



can.elements.forEach((e) => {
	can.activeEl(e.name);
});


// for (let i = 0, j = 0; i < 1300; i++, (j < 500) ? j += 2 : j = 0) {
// 	setTimeout(() => {
// 		can.driveObj([[i + 0, i/2], [i, i/2 + 0], [i, 400]], { color: "red" });
// 	}, 10);
// 	setTimeout(() => {
// 		can.driveObj([[i, i/2 + 0], [i + 0, i/2], [i, 400]], { co2or: "green" });
// 	}, 20);
// }

//сделать систему лучей и активный режим.