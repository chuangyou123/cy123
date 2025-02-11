class Upgrade {
    constructor(id, name, cost, nightmare = false) {
        this.id = id;
        this.name = name;
        this.cost = D(cost);
        this.nightmare = nightmare;
    }

    buy() {
        if (!game.upgradesBought[this.id] && game[this.nightmare ? 'nightmareFuel' : 'gold'].gte(this.cost)) {
            game[this.nightmare ? 'nightmareFuel' : 'gold'] = game[this.nightmare ? 'nightmareFuel' : 'gold'].sub(this.cost);
            game.upgradesBought[this.id] = true;
        }
    }

    update() {
        if (game.upgradesBought[this.id]) $(this.id).style.display = 'none';
        else {
            if (!(this.id == 'keepUpg' && game.dreamLayer.lt(2))) {
                $(this.id).style.display = 'inline-block';
        
                $(this.id).style.borderColor = game[this.nightmare ? 'nightmareFuel' : 'gold'].gte(this.cost) ? 'green' : 'red';
                $(this.id).style.backgroundColor = game[this.nightmare ? 'nightmareFuel' : 'gold'].gte(this.cost) ? 'lime' : 'pink';
            }
        }
    }
}

class Item {
    constructor(id, name, cost, maxFloor = Infinity, nightmare = false) {
        this.id = id;
        this.name = name;
        this.cost = D(cost);
        this.maxFloor = D(maxFloor);
        this.nightmare = nightmare;
    }

    buy() {
        if (game[this.nightmare ? 'nightmareFuel' : 'gold'].gte(this.cost)) {
            game[this.nightmare ? 'nightmareFuel' : 'gold'] = game[this.nightmare ? 'nightmareFuel' : 'gold'].sub(this.cost);
            this.effect();
        }
    }

    update() {
        switch (this.name) {
            case 'potent dark health potion':
                this.cost = D(10).tetr(game.potentPot[0]);
                break;
            case 'potent dark strength potion':
                this.cost = D(10).tetr(game.potentPot[1]);
                break;
            case 'potent dark luck potion':
                this.cost = D(10).tetr(game.potentPot[2]);
                break;
            case 'shadow blood':
                this.cost = D(10).pent(game.shadowBlood + 2);
                break;
        }
        this.updateText();
        if (game.floor.gt(this.maxFloor) || ((this.name.search(/potent/) > -1 || this.name.search(/nightmare/) > -1)&& game.nightmareLayer.lt(2)) || (this.name.search(/shadow\sblood/) > -1 && game.nightmareLayer.lt(3))) $(this.id).style.display = 'none';
        else $(this.id).style.display = 'inline-block';
        $(this.id).style.borderColor = game[this.nightmare ? 'nightmareFuel' : 'gold'].gte(this.cost) ? 'green' : 'red';
        $(this.id).style.backgroundColor = game[this.nightmare ? 'nightmareFuel' : 'gold'].gte(this.cost) ? 'lime' : 'pink';
    }

    updateText() {
        $(this.id).innerText = `${this.name} - ${f(this.cost)} ${this.nightmare ? 'nightmare fuel' : 'gold'}`;
    }

    effect() {
        switch(this.name) {
            case '小型生命药剂':
                game.hp = game.hp.add(D(10).pow(game.floor.add(1)));
                break;
            case '中型生命药剂':
                game.hp = game.hp.add(D(60).pow(game.floor.add(1)));
                break;
            case '大型生命药剂':
                game.hp = game.hp.add(D(300).pow(game.floor.add(1)));
                break;
            case '超大型生命药剂':
                game.hp = game.hp.add(D(1000).pow(game.floor.add(1)));
                break;
            case '小型强壮药剂':
                game.dmg = game.dmg.add(5);
                break;
            case '中型强壮药剂':
                game.dmg = game.dmg.mul(2);
                break;
            case '大型强壮药剂':
                game.dmg = game.dmg.pow(2);
                break;
            case '小型幸运药剂':
                game.lck = game.lck.add(2);
                break;
            case '中型幸运药剂':
                game.lck = game.lck.mul(2);
                break;
            case '大型幸运药剂':
                game.lck = game.lck.pow(2);
                break;
            case '黑暗生命药剂':
                game.hp = game.hp.add(game.dmg);
                break;
            case '黑暗强壮药剂':
                game.dmg = game.dmg.add(game.lck);
                break;
            case '黑暗幸运药剂':
                game.lck = game.lck.add(game.hp.log10());
                break;
            case '强效黑暗生命药剂':
                game.hp = game.hp.tetr(2);
                game.potentPot[0]++;
                this.cost = D(10).tetr(game.potentPot[0]);
                break;
            case '强效黑暗强壮药剂':
                game.dmg = game.dmg.tetr(2);
                game.potentPot[1]++;
                this.cost = D(10).tetr(game.potentPot[1]);
                break;
            case '强效黑暗幸运药剂':
                game.lck = game.lck.tetr(2);
                game.potentPot[2]++;
                this.cost = D(10).tetr(game.potentPot[2]);
                break;
            case '噩梦药剂':
                if (game.nightmarePower.lte(1)) game.nightmarePower = game.nightmarePower.mul(2);
                else if (game.nightmarePower.lte('ee200')) game.nightmarePower = game.nightmarePower.pow(2);
                else game.nightmarePower = game.nightmarePower.tetr(2);
                break;
            case '暗影之血':
                game.hp = game.nightmareFuel.arrow(game.nightmareLayer)(2);
                game.dmg = game.nightmareFuel.arrow(game.nightmareLayer)(2);
                game.lck = game.nightmareFuel.arrow(game.nightmareLayer)(2);
                game.nightmarePower = game.nightmarePower.arrow(game.nightmareLayer)(2);
                game.shadowBlood++;
                this.cost = D(10).arrow(game.nightmareLayer)(game.shadowBlood + 2);
                break;
        }
    }
}