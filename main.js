let game;

function init() {
	if (!load()) game = new Game();

	$("msglog").innerHTML = "====== Log ======";

	setInterval(game.update, 50);

	for (let i of ITEMS) {
		let button = $$("button");
		button.id = i.id;
		button.onclick = () => i.buy();
		button.innerText = `${i.name} - ${f(i.cost)} ${i.nightmare ? "nightmare fuel" : "gold"}`;
		document.getElementById(i.nightmare ? "nitems" : "items").appendChild(button);
	}
	if (game.NL) $("theme").href = "dark.css";
	game.tabTo(0);
	for (let i in game.roomWeights)
		for (let j in data.rooms)
			if (i === data.rooms[j].name) {
				data.rooms[j].weight = game.roomWeights[i];
				break;
			}
	for (let i of data.rooms) {
		let span = $$("div");
		span.id = i.name + "_s";
		span.className = "roomweightthing";
		span.innerHTML = i.name + " ";
		let input = $$("input");
		input.id = i.name + "_i";
		input.value = i.weight;
		span.appendChild(input);
		$("roomeditor").appendChild(span);
	}
}

let D = n => ExpantaNum(n);

let $ = id => document.getElementById(id);
let $$ = id => document.createElement(id);

let UPGRADES = {
	autoProgress: new Upgrade("autoProgress", "Automatically progress through rooms", 240),
	autoKill: new Upgrade("autoKill", "Automatically kill enemies", 1e8),
	autoBuy: new Upgrade("autoBuy", "Automatically buy potions", 1e300),
	autoClimb: new Upgrade("autoClimb", "Automatically climb stairs", "ee100"),
	keepUpg: new Upgrade("keepUpg", "Keep upgrades into your dreams", "eee5000"),
	autoNightmare: new Upgrade("autoNightmare", "Passively generate nightmare fuel", 100, true),
};


	let ITEMS = [new Item("shp", "小型生命药剂", 100, 5), new Item("mhp", "中型生命药剂", 300, 8), new Item("lhp", "大型生命药剂", 800, 12), new Item("suhp", "超大型生命药剂", 1800, Infinity), new Item("ssp", "小型强壮药剂", 500, 9), new Item("msp", "中型强壮药剂", 2500, 14), new Item("lsp", "大型强壮药剂", 1e8, Infinity), new Item("slp", "小型幸运药剂", 1e10, 15), new Item("mlp", "中型幸运药剂", "1e2000", 20), new Item("llp", "大型幸运药剂", "eee3", Infinity), new Item("dhp", "黑暗生命药剂", 1, Infinity, true), new Item("dsp", "黑暗强壮药剂", 1, Infinity, true), new Item("dlp", "黑暗幸运药剂", 1, Infinity, true), new Item("pdhp", "强效黑暗生命药剂", 10, Infinity, true), new Item("pdsp", "强效黑暗强壮药剂", 10, Infinity, true), new Item("pdlp", "强效黑暗幸运药剂", 10, Infinity, true), new Item("np", "噩梦药剂", 1000, Infinity, true), new Item("sb", "暗影之血", "10^^10", Infinity, true)];

function save() {
	let j = JSON.stringify(game);
	let e = btoa(j); 
	localStorage.setItem("rhsave", e);
}

function load(str) {
	let s = str || localStorage.getItem("rhsave");
	if (s != null) {
		s = JSON.parse(atob(s));
		game = new Game(s);
		return true;
	}
	return false;
}

function wipe() {
	if (confirm("你确定要这么做吗?")) {
		game = new Game();
		$("msglog").innerHTML = "======== Log ========<br><br>";
		save();
		$("theme").href = "light.css";
	}
}

function exp() {
	prompt("保存成功", btoa(JSON.stringify(game)));
}

function imp() {
	let x = prompt("请输入存档");
	load(x);
}
