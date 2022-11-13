/*

Rules of Interaction:
- An agent moves closer to an agent it's following
- An agent follows zero or one agents at any given time
- An agent follows the agent the has the greatest
    followers:difference(from self) ratio, above a certain threshold


 */
let sketchName = "molecules";
let numAgents = 50;
let agents = [];
let fmatrix = [];
let diffThreshold;
let diameter = 10;
let blur;
let fps = 60;
let cnv;

//////////////////////////////////////
//////////////Classes/////////////////
//////////////////////////////////////

class Agent {
    constructor(id) {
        this.id = id;
        this.following = -1;
        this.pos = new p5.Vector(random(width), random(height));
        this.vel = new p5.Vector(random(10), random(10));
        this.vel.normalize();
        this.col = color(random(255), 0, random(255));

        this.maxDist = new p5.Vector(0, 0).dist(new p5.Vector(width, height));
    }

    render() {
        push();
        translate(this.pos);
        fill(this.col);
        if (this.following != -1) { // && this.id%20 == 0) {
            // fill(255);
            let x = agents[this.following].pos.x;
            let y = agents[this.following].pos.y;
            stroke(this.col);
            line(x - this.pos.x, y - this.pos.y, 0, 0);
        }
        noStroke();
        ellipse(0, 0, diameter, diameter);
        // stroke(0);
        // text(this.id, 0, 15);
        // if (this.getNumFollowers() > 0)
        //   text(this.getNumFollowers().toString(), 0, -7);
        pop();

    }

    update() {
        this.unfollow();

        // get closest mover not following this
        let candidate = this.getCandidate();

        // follow best candidate or no one at all
        if (candidate != -1) {
            this.follow(candidate);
        } else {
            this.unfollow();
        }

        this.move()
    }

    move() {
        if (this.following == -1) {
            this.leadMove();
        } else {
            this.followMove();
        }
        if (!this.inBounds() && !this.returning) {
            this.returning = true;
            this.vel.rotate(random(PI / 2, PI * 1.5));
        } else
            this.returning = false;
    }

    // move independently
    leadMove() {
        this.pos.add(this.vel);
        this.vel.x += random(-0.1, 0.1);
        this.vel.y += random(-0.1, 0.1);
        this.vel.normalize();
    }

    // move towards who this is following
    followMove() {
        if (this.following == -1)
            return;
        this.pos.add(this.vel);
        let dirVec = new p5.Vector(agents[this.following].pos.x - this.pos.x,
            agents[this.following].pos.y - this.pos.y);
        let angle = this.vel.angleBetween(dirVec);
        this.vel.rotate(angle / fps);
        this.vel.normalize();
    }

    // unfollow everyone
    unfollow() {
        fmatrix.forEach(arr => arr[this.id] = 0);
        this.following = -1;
    }

    // start following id
    follow(id) {
        // print(this.id, "following", id);
        this.unfollow();
        fmatrix[id][this.id] = 1;
        this.following = id;
    }

    // return list of ids of this's followers
    getFollowers() {
        let fs = [];
        for (let i = 0; i < fmatrix[this.id].length; i++) {
            if (fmatrix[this.id][i] == 1)
                fs.push(i);
        }
        return fs;
    }

    // return number of this's followers
    getNumFollowers() {
        let fs = 0;
        for (let i = 0; i < fmatrix[this.id].length; i++) {
            if (fmatrix[this.id][i] == 1)
                fs++;
        }
        return fs;
    }

    getCandidate() {
        let can = -1;
        let cinf = -1;

        for (let i = 0; i < agents.length; i++) {
            if (i == this.id)
                continue;

            else if (this.canFollow(i)) {
                if (can == -1) {
                    can = i;
                    cinf = this.getInfluence(i);
                    continue;
                }

                let inf = this.getInfluence(i);
                if (inf > cinf) {
                    can = i;
                    cinf = inf;
                }
            }
        }

        return can;
    }

    getInfluence(oid) {
        let otherFs = agents[oid].getNumFollowers();
        if (this.following != -1 && agents[oid] == agents[this.following].following) {
            otherFs += getInfluence(agents[this.following]);
        }

        return otherFs == 0 ? map(this.diff(oid), 0, this.maxDist, 0, 1) : otherFs;
    }

    canFollow(oid, debug = false) {
        if (debug)
            print("can", this.id, "follow", oid, "?");
        if (this.diff(oid) > diffThreshold) {
            if (debug)
                print("no, diff to large:", this.diff(oid));
            return false;
        }

        if (agents[oid].getNumFollowers() > this.getNumFollowers()) {
            if (debug)
                print("yes, loop with more followers condition");
            return true;
        }

        let checks = 0;
        let current = oid;
        let checked = [];
        while (checks < numAgents) {
            let cfollow = agents[current].following;

            if (cfollow == this.id) {
                if (debug)
                    print("no, following would form loop");
                return false;
            }

            checked.push(current);
            if (cfollow == -1 || checked.includes(cfollow)) {
                if (debug)
                    print("yes, no loop formed");
                return true;
            }

            current = cfollow;
            checks++;
        }

        if (debug)
            print("yes, end of loop");
        return true;
    }

    // get difference between to agents. a.diff(b) == b.diff(a)
    diff(oid) {
        return this.pos.dist(agents[oid].pos);
    }

    inBounds() {
        let out = true;
        if (this.pos.x - diameter / 2 < 0) {
            this.pos.x = diameter / 2 + 1;
            out = false;
        }
        if (this.pos.x + diameter / 2 > width) {
            this.pos.x = width - diameter / 2 - 1;
            out = false;
        }
        if (this.pos.y - diameter / 2 < 0) {
            this.pos.y = diameter / 2 + 1;
            out = false;
        }
        if (this.pos.y + diameter / 2 > height) {
            this.pos.y = height - diameter / 2 - 1;
            out = false;
        }
        return out;
    }
}

//////////////////////////////////////
//////////////Functions///////////////
//////////////////////////////////////

function setup() {
    cnv = createCanvas(500, 500);
    cnv.id(sketchName + "-canvas");

    ellipseMode(CENTER);
    frameRate(fps);
    activate();
}

function activate() {
    inputElem = document.querySelector("#moleculesInput");
    numAgents = getSliderValue(inputElem, 50);
    inputElem = document.querySelector("#diffThresholdInput");
    diffThreshold = getSliderValue(inputElem, 100);
    inputElem = document.querySelector("#blurInput");
    blur = getSliderValue(inputElem, 100);
    agents = [];
    fmatrix = [];
    for (let i = 0; i < numAgents; i++) {
        agents.push(new Agent(i));
        fmatrix.push([]);
        fmatrix[i].length = numAgents;
        fmatrix[i].fill(0);
    }
}

function reset() { activate(); }

function draw() {

    background(160, 190, 255, blur);

    for (let a of agents) {
        a.render();
        a.update();
        // if (a.getNumFollowers() > numAgents - 2)
        //   setup();
    }
}

function keyPressed() {
    if (key == 'f') {
        print(fmatrix);
    }
    if (key == 'p')
        noLoop();
    if (key == 'l')
        loop();
}

function mousePressed() {
    for (let a of agents) {
        if (abs(mouseX - a.pos.x) < diameter / 2 && abs(mouseY - a.pos.y) < diameter / 2) {
            print("id:", a.id);
            for (let b of agents) {
                if (a != b)
                    print(b.id, a.getInfluence(b.id), a.canFollow(b.id, true));
            }
        }

    }
}