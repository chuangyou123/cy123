class Game {
	constructor(d = {}) {
		this.room = D(d.room || 0);
		this.floor = D(d.floor || 0);
		this.dreamLayer = D(d.dreamLayer || 0);
		this.nightmareLayer = D(d.nightmareLayer || 0);

		this.gold = D(d.gold || 0);
		this.nightmareFuel = D(d.nightmareFuel || 0);

		this.currentRoomType = d.currentRoomType || "empty room";
		this.currentEnemy = !d.currentEnemy ? null : new Enemy(d.currentEnemy);

		this.hp = D(d.hp || 100);
		this.dmg = D(d.dmg || 5);
		this.lck = D(d.lck || 1);
		this.nightmarePower = D(d.nightmarePower || 1);

		this.NL = d.NL || false;

		this.justDied = false;

		this.shopTab = 0;

		this.isInStairwell = d.isInStairwell || false;
		this.isInBedroom = d.isInBedroom || false;
		this.isInKitchen = d.isInKitchen || false;
		this.isInCFRoom = d.isInCFRoom || false;
		this.isInLab = d.isInLab || false;
		this.isInFC = d.isInFC || false;
		this.isInCR = d.isInCR || false;

		this.has = d.has || {
			bread: false,
			chocolate: false,
			fuser: false,
			chocbread: false,
		};

		this.potentPot = d.potentPot || [0, 0, 0];
		this.shadowBlood = d.shadowBlood || 0;
		ITEMS[13].cost = ITEMS[13].cost.tetr(this.potentPot[0]);
		ITEMS[14].cost = ITEMS[14].cost.tetr(this.potentPot[1]);
		ITEMS[15].cost = ITEMS[15].cost.tetr(this.potentPot[2]);

		this.paused = false;

		this.upgradesBought = d.upgradesBought || {};
		this.roomWeights = d.roomWeights || {};
	}

	update() {
		if (game.tab == 0) {
			$("normalshop").style.display = "block";
			$("nightmareshop").style.display = "none";
			$("roomeditor").style.display = "none";
		} else if (game.tab == 1) {
			$("normalshop").style.display = "none";
			$("nightmareshop").style.display = "block";
			$("roomeditor").style.display = "none";
		} else if (game.tab == 2) {
			$("normalshop").style.display = "none";
			$("nightmareshop").style.display = "none";
			$("roomeditor").style.display = "block";
		}
		if (game.NL) $("snav").style.display = "flex";
		else $("snav").style.display = "none";
		for (let r in data.rooms) {
			let i = data.rooms[r];
			$(i.name + "_s").style.display = i.vreq() ? "block" : "none";
			if ($(i.name + "_i").value.length > 0 && isNaN(parseFloat($(i.name + "_i").value))) $(i.name + "_i").value = data.defaultWeights[r];
			i.weight = isNaN(parseFloat($(i.name + "_i").value)) ? data.defaultWeights[r] : parseFloat($(i.name + "_i").value);
			game.roomWeights[i.name] = isNaN(parseFloat($(i.name + "_i").value)) ? data.defaultWeights[r] : parseFloat($(i.name + "_i").value);
		}
		if (!game.paused) {
			if (game.hp.isNaN()) game.hp = game.dmg.clone();
			if (game.upgradesBought["autoNightmare"])
				game.nightmareFuel = game.nightmareFuel.add(
					D(0.01)
						.mul(game.dreamLayer.add(2).pow(game.nightmareLayer))
						.mul(game.nightmarePower)
						.pow(D(1).div(game.dreamLayer.add(1)))
				);
			$("deets").innerText = `
        You are currently in room ${f(game.room)} of floor ${f(game.floor)} ${game.dreamLayer.gt(0) ? `of dream layer ${f(game.dreamLayer)}` : ""} ${game.nightmareLayer.gt(0) ? `of nightmare layer ${f(game.nightmareLayer)}` : ""} which is a${beginsVowel(game.currentRoomType) ? "n" : ""} ${game.currentRoomType}
        You have ${f(game.gold)} gold ${game.nightmareFuel.gt(0) ? `and ${f(game.nightmareFuel)} nightmare fuel` : ""}
        You have ${f(game.hp)} hp
        ${game.has.chocbread ? "You have Pain au Chocolat" : `${game.has.bread ? "You have bread" : ""}${game.has.chocolate ? ", chocolate" : ""}${game.has.fuser ? ", fuser" : ""}`}
        `;
			for (let i of ITEMS) i.update();
			if (game.dreamLayer.gt(2)) $("keepUpg").style.display = "inline-block";
			else $("keepUpg").style.display = "none";
			for (let i in UPGRADES) UPGRADES[i].update();
			if (game.upgradesBought.autoBuy) for (let i of ITEMS) if (!i.nightmare) i.buy();
			if (game.currentEnemy instanceof Enemy) {
				$("nr").disabled = "disabled";
				$("fight").innerHTML = `
            You are fighting a${beginsVowel(game.currentEnemy.name) ? "n" : ""} ${game.currentEnemy.name} which has ${f(game.currentEnemy.hp)} health<br>
            `;
				$("attack").style.display = "inline-block";
				if (game.upgradesBought.autoKill) game.attack();
			} else {
				$("fight").innerText = "";
				$("attack").style.display = "none";
				if (game.isInStairwell || game.isInBedroom || game.isInCR) {
					$("nr").disabled = "disabled";
				} else {
					$("nr").disabled = "";
					if (!(game.isInKitchen || game.isInCFRoom || game.isInLab || game.isInFC) && game.upgradesBought.autoProgress) game.nextRoom();
				}
			}
			if (game.isInStairwell) {
				$("stairs").innerText = "Do you want to climb to the next floor of Reinhardt's House?? Enemies will be much stronger but killing them will be even more rewarding!";
				$("climb").style.display = "inline-block";
				$("noclimb").style.display = "inline-block";
				if (game.upgradesBought.autoClimb) game.climb(true);
			} else {
				$("stairs").innerText = "";
				$("climb").style.display = "none";
				$("noclimb").style.display = "none";
			}
			if (game.isInBedroom) {
				$("bed").innerText = "Do you want to take a nap? You shouldn't be out for long...";
				$("sleep").style.display = "inline-block";
				$("nosleep").style.display = "inline-block";
			} else {
				$("bed").innerText = "";
				$("sleep").style.display = "none";
				$("nosleep").style.display = "none";
			}
			if (game.isInCR) {
				$("cr").innerText = "You're in the control room, the darkness creeps around you...";
				$("gn").style.display = "inline-block";
				$("nogn").style.display = "inline-block";
			} else {
				$("cr").innerText = "";
				$("gn").style.display = "none";
				$("nogn").style.display = "none";
			}
			if (game.isInKitchen) {
				$("bread").innerText = "You found some bread, interesting...";
			} else $("bread").innerText = "";
			if (game.isInCFRoom) {
				$("cf").innerText = "You found some chocolate, interesting...";
			} else $("cf").innerText = "";
			if (game.isInLab) {
				$("lab").innerText = "You found a weird device, it says fuser...";
			} else $("lab").innerText = "";
			if (game.isInFC) {
				$("fc").innerText = "You are in a room with an interesting device, there's a slot for the fuser, the bread and the chocolate. Do you want to fuse the bread and chocolate?";
				$("fuse").style.display = "inline-block";
				$("nofuse").style.display = "inline-block";
			} else {
				$("fc").innerText = "";
				$("fuse").style.display = "none";
				$("nofuse").style.display = "none";
			}
			if ($("msglog").innerHTML.length > 1500) $("msglog").innerHTML = $("msglog").innerHTML.substring(0, 1500);
			save();
		}
	}

	pause() {
		this.paused = !this.paused;
	}

	attack() {
		if (this.currentEnemy != null) {
			this.hurt(this.currentEnemy.dmg);
			if (!this.justDied) this.currentEnemy.hurt(this.dmg);
			this.justDied = false;
		}
	}

	hurt(dmg) {
		this.hp = this.hp.sub(dmg);
		if (this.hp.floor().lte(0)) this.die();
	}

	die() {
		this.hp = D(100);
		this.room = D(0);
		this.floor = D(0);
		this.gold = D(0);
		if (game.NL) game.nightmareFuel = game.nightmareFuel.add(1);
		let wake = false;
		if (this.dreamLayer.gt(0) && !this.NL) {
			this.dreamLayer = this.dreamLayer.sub(1);
			wake = true;
		}
		this.justDied = true;
		this.currentEnemy = null;
		this.currentRoomType = "empty room";
		if (game.nightmareLayer.lt(3)) {
			if (this.NL) this.logmsg(`You died and lost your gold, and your worst fear has come true... You haven't woken up. You're still in this nightmare...`, "darkred");
			else if (wake) this.logmsg(`*Yawn* You wake up, though it seems you got thrown out the window and have to start again. It seems you still have the stats you gained in the dream!`, "slateblue");
			else this.logmsg(`You died and lost your gold! You are back at the entrance but you'll keep your upgrades, damage and luck${game.NL ? ", and you will gain nightmare fuel" : ""}!!`, "darkred");
		} else this.logmsg(`You died`, "darkred");
	}

	nextRoom() {
		this.isInKitchen = false;
		this.isInCFRoom = false;
		this.isInLab = false;
		this.room = this.room.add(1);
		this.currentRoomType = chooseWeighted(data.rooms).name;
		switch (this.currentRoomType) {
			case "empty room":
				break;
			case "monster room":
				this.currentEnemy = new Enemy(this.chooseMonster());
				if (!game.upgradesBought.autoKill) this.logmsg(`A wild ${this.currentEnemy.name} appears!!!`);
				break;
			case "money room":
				let reward = chooseWeighted(data.moneyTreasures);
				let gain = randBetween(reward.gold[0], reward.gold[1]).pow(game.lck.pow(0.66));
				game.gold = game.gold.add(gain);
				this.logmsg(`You found a${beginsVowel(reward.name) ? "n" : ""} ${reward.name} worth ${f(gain)} gold!`, "gold");
				break;
			case "potion lab":
				let potion = chooseWeighted(data.potions);
				switch (potion.type) {
					case "heal":
						game.hp = game.hp.add(D(potion.potency).pow(game.floor.add(1)));
						if (!game.upgradesBought.autoBuy) this.logmsg(`You found a${beginsVowel(potion.name) ? "n" : ""} ${potion.name} that healed you for ${f(D(potion.potency).pow(game.floor.add(1)))} hp!!`, "blue");
						break;
				}
				break;
			case "stairwell":
				if (this.room.lt(100) && !game.nightmareLayer.gt(1)) {
					this.room = this.room.sub(1);
					this.nextRoom();
				} else {
					this.isInStairwell = true;
					this.logmsg(`You found tall staircase! Do you want to climb up to the next floor of Reinhardt's House?`, "lime");
				}
				break;
			case "bedroom":
				if (this.gold.lt("eee500") || this.floor.lt(2)) {
					this.room = this.room.sub(1);
					this.nextRoom();
				} else {
					this.isInBedroom = true;
					this.logmsg(`You found Reinhardt's bedroom! Searching through such a big house must be tiring, perhaps you should have a sleep?`, "turquoise");
				}
				break;
			case "kitchen":
				if (this.dreamLayer.lt(5) || this.has.bread || this.has.chocbread) {
					this.room = this.room.sub(1);
					this.nextRoom();
				} else {
					this.isInKitchen = true;
					this.has.bread = true;
					this.logmsg(`You found some bread, interesting...`, "brown");
				}
				break;
			case "chocolate fountain room":
				if (this.dreamLayer.lt(5) || this.has.chocolate || !this.has.bread || this.has.chocbread) {
					this.room = this.room.sub(1);
					this.nextRoom();
				} else {
					this.isInCFRoom = true;
					this.has.chocolate = true;
					this.logmsg(`You found some chocolate, interesting... You also complain about Reinhardt having a chocolate fountain and you don't`, "brown");
				}
				break;
			case "lab":
				if (this.dreamLayer.lt(5) || this.has.fuser || !this.has.bread || !this.has.chocolate || this.has.chocbread) {
					this.room = this.room.sub(1);
					this.nextRoom();
				} else {
					this.isInLab = true;
					this.has.fuser = true;
					this.logmsg(`You found a weird device labelled "fuser", interesting...`, "brown");
				}
				break;
			case "fusion chamber":
				if (this.dreamLayer.lt(10) || !this.has.bread || !this.has.chocolate || !this.has.fuser || this.has.chocbread) {
					this.room = this.room.sub(1);
					this.nextRoom();
				} else {
					this.isInFC = true;
					this.logmsg(`You found the fusion chamber, hmmmm........`, "lightblue");
				}
				break;
			case "control room":
				if (this.dreamLayer.lt(15) || !this.has.chocbread) {
					this.room = this.room.sub(1);
					this.nextRoom();
				} else {
					this.isInCR = true;
					this.logmsg(`You found the control room, there's a box for you to put the Pain au Chocolat in. This room is very dark despite the many windows.`, "purple");
				}
				break;
		}
	}

	climb(bool) {
		game.isInStairwell = false;
		if (bool) {
			game.floor = game.floor.add(1);
			game.room = D(0);
			game.logmsg(`You are now on floor ${f(game.floor)}!`, "hotpink");
		}
		game.nextRoom();
	}

	sleep(bool) {
		game.isInBedroom = false;
		if (bool) {
			game.room = D(0);
			game.floor = D(0);
			game.gold = D(0);
			game.hp = D(100);
			game.dmg = D(5);
			game.lck = D(1);
			game.potentPot = [0, 0, 0];
			game.nightmarePower = D(1);
			game.nightmareFuel = D(0);
			game.shadowBlood = 0;
			if (!game.upgradesBought.keepUpg) for (let i in game.upgradesBought) game.upgradesBought[i] = false;
			game.dreamLayer = game.dreamLayer.add(1);
			game.logmsg(`You fell deeper into the dreams`, "silver");
		}
		game.nextRoom();
	}

	fuse(bool) {
		game.isInFC = false;
		if (bool) {
			game.has = {
				bread: false,
				chocolate: false,
				fuser: false,
				chocbread: true,
			};
		}
		game.nextRoom();
	}

	gn(bool) {
		game.isInCR = false;
		if (bool) {
			game.room = D(0);
			game.floor = D(0);
			game.dreamLayer = D(0);
			game.gold = D(0);
			game.hp = D(100);
			game.dmg = D(5);
			game.lck = D(1);
			game.potentPot = [0, 0, 0];
			game.nightmareFuel = D(0);
			game.nightmarePower = D(1);
			game.shadowBlood = 0;
			game.has = {
				bread: false,
				chocolate: false,
				fuser: false,
				chocbread: false,
			};
			game.NL = true;
			$("theme").href = "dark.css";
			for (let i in game.upgradesBought) game.upgradesBought[i] = false;
			game.nightmareLayer = game.nightmareLayer.add(1);
			game.logmsg(`The chocolate surrounds you, you're covered in its sticky, sweet goodness. You give in. Nothing else matters. Only... Chocolate...`, "darkorchid");
		}
		game.nextRoom();
	}

	chooseMonster() {
		return chooseWeighted(data.monsters).name;
	}

	logmsg(msg, color = "black") {
		$("msglog").innerHTML = `<span style="color:${color}">${msg}</span><br><br>${$("msglog").innerHTML}`;
	}

	tabTo(n) {
		this.tab = n;
	}
}

class Enemy {
	constructor(name) {
		if (typeof name == "string") {
			this.name = name;
			this.hp = game.nightmareLayer.gt(0)
				? D(data.monsterStats[this.name].hp)
						.pow(game.floor.add(1))
						.pow(D(1).div(game.dreamLayer.add(1)))
						.arrow(game.nightmareLayer)(game.dreamLayer.add(2))
				: D(data.monsterStats[this.name].hp)
						.pow(game.floor.add(1))
						.pow(D(1).div(game.dreamLayer.add(1)));
			this.dmg = game.nightmareLayer.gt(0)
				? D(data.monsterStats[this.name].dmg)
						.pow(game.floor.add(1))
						.pow(D(1).div(game.dreamLayer.add(1)))
						.arrow(game.nightmareLayer)(game.dreamLayer.add(2))
				: D(data.monsterStats[this.name].dmg)
						.pow(game.floor.add(1))
						.pow(D(1).div(game.dreamLayer.add(1)));
		} else {
			this.name = name.name;
			this.hp = D(name.hp);
			this.dmg = D(name.dmg);
		}
	}

	hurt(dmg) {
		let x = this.hp.clone();
		this.hp = this.hp.sub(dmg);
		if (this.hp.eq(x)) game.die();
		if (this.hp.lte(0)) this.die();
	}

	die() {
		let g = data.monsterStats[this.name].gold;
		let gain = randBetween(g[0], g[1]);
		game.gold = game.gold.add(gain.max(gain.mul(game.dreamLayer.add(1).mul(D(10).pow(9.2).pow(game.lck.log10()))).pow(game.floor.mul(2).mul(game.dreamLayer.add(1)))));
		if (!game.upgradesBought.autoKill) game.logmsg(`You kill the ${game.currentEnemy.name} and it drops ${f(gain.max(gain.mul(game.dreamLayer.add(1).mul(D(10).pow(9.2).pow(game.lck.log10()))).pow(game.floor.mul(2).mul(game.dreamLayer.add(1)))))} gold`, "red");
		game.currentEnemy = null;
	}
}

function chooseWeighted(items) {
	// StackOverflow code
	let chances = items.map(e => e.weight);
	var sum = chances.reduce((acc, el) => acc + el, 0);
	var acc = 0;
	chances = chances.map(el => (acc = el + acc));
	var rand = Math.random() * sum;
	return items[chances.filter(el => el <= rand).length] || items[0];
}

function randBetween(min, max) {
	return D(max).sub(min).mul(Math.random()).add(min).floor();
}

function beginsVowel(str) {
	return str.search(/[aeiou]/i) === 0;
}
