var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var clouds;
var mountains;
var trees_x;
var collectables;
var canyons;
var flagpole;
var lives;

var enemies;
var platforms;

var game_score;

var stars = [];

function setup()
{
	createCanvas(1024, 576);
	lives = 4;
	textSize(20);
	
	startGame();
	
}

function startGame()
{
	floorPos_y = height * 3/4;
	gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
	clouds =[
		{pos_x: 100, pos_y: 200},
		{pos_x: 600, pos_y: 100},
	    {pos_x: 800, pos_y: 200},
		{pos_x: 1100, pos_y: 100},
		{pos_x: 1600, pos_y: 200},
		{pos_x: 1800, pos_y: 100},
		{pos_x: 2100, pos_y: 200},
		{pos_x: 2600, pos_y: 100},
		{pos_x: 2800, pos_y: 200},
		{pos_x: 3200, pos_y: 100},
	];
	
	mountains =[
		{pos_x: 500, height: 350},
		{pos_x: 900, height: 250},
		{pos_x: 1300, height: 350},
		
		{pos_x: 1700, height: 250},
		{pos_x: 2100, height: 350},
		{pos_x: 2500, height: 250},
		
		{pos_x: 2900, height: 350},
		{pos_x: 3300, height: 250},
		
	];
	 
	trees_x = [100,500,900,1400,1900,2400,2800,3300];
	
	collectables =[
		{x_pos: 100,y_pos: floorPos_y,size:40,isFound:false},
		{x_pos: 1300,y_pos: floorPos_y-100,size:40,isFound:false},
		{x_pos: 2100,y_pos: floorPos_y-100,size:40,isFound:false},
		{x_pos: 2700,y_pos: floorPos_y-150,size:40,isFound:false},
		{x_pos: 3400,y_pos: floorPos_y,size:40,isFound:false},
	]
	
	canyons =[
		{x_pos: 200, width: 110},
		{x_pos: 700, width: 110},
		{x_pos: 1200, width: 110},
		{x_pos: 1700, width: 110},
		{x_pos: 2200, width: 110},
		{x_pos: 2700, width: 110},
		{x_pos: 3200, width: 110},
	];
	
	platforms = [];
	platforms.push(createPlatforms(1000,floorPos_y-100,200));
	platforms.push(createPlatforms(2000,floorPos_y-100,200));
	platforms.push(createPlatforms(2500,floorPos_y-100,100));
	platforms.push(createPlatforms(2600,floorPos_y-150,100));
	
	game_score = 0;
	
	flagpole = {x_pos: 3500, isReached:false, height:300};
	
	lives -= 1;
	
	for (var i = 0; i < 600; i++) {
		stars[i] = new Star();
	}
	 enemies = [];
	 enemies.push(new Enemy(820,floorPos_y-10,325),
				  new Enemy(1820,floorPos_y-10,325),
				  new Enemy(2820,floorPos_y-10,325));	
}

function draw()
{
	background(25,25,112); // fill the sky blue
	fill(255,255,255);
	for (var i = 0; i < stars.length; i++) {
		stars[i].draw();
	}

	noStroke();
	fill(255,250,250);
	rect(0, floorPos_y, width, height/4); // draw some green ground
	
	push();
	translate(scrollPos,0);
	drawclouds();
	drawmountains();
	drawtrees();
	
	for(var i = 0; i < platforms.length; i++)
		{
			platforms[i].draw();
		}
	
	// Draw collectable items.
	for(var i = 0; i < collectables.length; i++)
		{
			if(!collectables[i].isFound)
				{
			      drawCollectable(collectables[i]);
				  checkCollectable(collectables[i]);
		        }
		}
	
	// Draw canyons.
	for(var i = 0; i < canyons.length; i++)
		{
		  drawCanyon(canyons[i]);
		  checkCanyon(canyons[i]);     
		}
	
	if(!checkFlagpole.isReached)
		{
			checkFlagpole(flagpole);
		}
	    drawFlagpole(flagpole);
	
	for(var i=0;i<enemies.length;i++)
	{
		enemies[i].draw();
		var isContact = 
		enemies[i].checkContact(gameChar_world_x,gameChar_y);
		
		if(isContact)
			{
				if(lives > 0)
				{
				   startGame();
				   break;
				}
			}
	}
	
	    pop();
	
	
	// Draw game character.
	
	drawGameChar();
	
	text("score:" + game_score,20,40);
	text("lives:" + lives,20,60);
	
	if(lives == 0)
		{
			text("game over - press reload to continue",width/2 - 100,height/2);
			return;
		}
	else if(flagpole.isReached)
		{
			text("level complete - press reload to continue",width/2 - 100,height/2);
			return;
		}
	
	if(gameChar_y > height)
		{
			if(lives > 0)startGame();
		}
	

	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
	if (gameChar_y < floorPos_y)
		{
			var isContact = false;
			for(var i = 0; i < platforms.length; i++)
				{
					if(platforms[i].checkContact(gameChar_world_x,gameChar_y))
						{
							isContact = true;
							gameChar_y = platforms[i].y;
							break;
						}
				}
			if(isContact == false)
				{
					gameChar_y += 2;
			        isFalling = true;
				}		
		}
	else
		{
			isFalling = false;
		}
	if(isPlummeting)
		{
			gameChar_y += 5;
		}

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed(){
	
	if(flagpole.isReached && key == ' ')
		{
			nextlevel();
		}
	else if(lives == 0 && key == ' ')
		{
			returnToStart(); 
		}
	
	if(key == "A" || keyCode == 37)
		{
			isLeft = true;
		}
	if(key == "D" || keyCode == 39)
		{
			isRight = true;
		}
    if(key == " " || key == "W")
	{
		if(!isFalling)
		{
			gameChar_y -= 100;
		}
	}
}

function keyReleased()
{
	
	if(key == "A" || keyCode == 37)
		{
			isLeft = false;
		}
	if(key == "D" || keyCode == 39)
		{
			isRight = false;
		}

}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	// draw game character
		if(isLeft && isFalling)
	{
		// add your jumping-left code
	fill(240,248,255)
	ellipse(gameChar_x,gameChar_y-55,20,25)
	ellipse(gameChar_x,gameChar_y-37,25,25)
	rect(gameChar_x-7,gameChar_y-28,5,9)
	rect(gameChar_x+3,gameChar_y-28,5,13)
	ellipse(gameChar_x+5,gameChar_y-66,10,20)
	
    fill(0,0,0)
	ellipse(gameChar_x-5,gameChar_y-57,2,5)
	
	fill(255,0,0)
	rect(gameChar_x-9,gameChar_y-50,18,5)

	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code
	fill(240,248,255)
	ellipse(gameChar_x,gameChar_y-55,20,25)
	ellipse(gameChar_x,gameChar_y-37,25,25)
	rect(gameChar_x-7,gameChar_y-28,5,13)
	rect(gameChar_x+3,gameChar_y-28,5,9)
	ellipse(gameChar_x-7,gameChar_y-66,10,20)
	
    fill(0,0,0)
	ellipse(gameChar_x+4,gameChar_y-57,2,5)
	
	fill(255,0,0)
	rect(gameChar_x-9,gameChar_y-50,18,5)

	}
	else if(isLeft)
	{
		// add your walking left code
	fill(240,248,255)
	ellipse(gameChar_x,gameChar_y-37,20,25)
	ellipse(gameChar_x,gameChar_y-19,25,25)
	rect(gameChar_x-3,gameChar_y-10,5,13)
	ellipse(gameChar_x+5,gameChar_y-50,10,20)
	
    fill(0,0,0)
	ellipse(gameChar_x-5,gameChar_y-39,2,5)
	
	fill(255,0,0)
	rect(gameChar_x-9,gameChar_y-32,18,5)

	}
	else if(isRight)
	{
		// add your walking right code
    fill(240,248,255)
	ellipse(gameChar_x,gameChar_y-37,20,25)
	ellipse(gameChar_x,gameChar_y-19,25,25)
	rect(gameChar_x-3,gameChar_y-10,5,13)
	ellipse(gameChar_x-7,gameChar_y-50,10,20)
	
    fill(0,0,0)
	ellipse(gameChar_x+4,gameChar_y-39,2,5)
	
	fill(255,0,0)
	rect(gameChar_x-9,gameChar_y-32,18,5)

	}
	else if(isFalling || isPlummeting)
	{
		// add your jumping facing forwards code
		fill(240,248,255)
	ellipse(gameChar_x,gameChar_y-55,25)
	ellipse(gameChar_x,gameChar_y-37,25,25)
	rect(gameChar_x-7,gameChar_y-28,5,13)
	rect(gameChar_x+3,gameChar_y-28,5,9)
	ellipse(gameChar_x-7,gameChar_y-66,10,20)
	ellipse(gameChar_x+5,gameChar_y-66,10,20)
	
    fill(0,0,0)
	ellipse(gameChar_x-5,gameChar_y-57,2,5)
	ellipse(gameChar_x+4,gameChar_y-57,2,5)
	
	fill(255,0,0)
	rect(gameChar_x-10,gameChar_y-50,20,5)
	rect(gameChar_x-5,gameChar_y-45,5,10)

	}
	else
	{
		// add your standing front facing code
	fill(240,248,255)
	ellipse(gameChar_x,gameChar_y-37,25)
	ellipse(gameChar_x,gameChar_y-19,25,25)
	rect(gameChar_x-7,gameChar_y-10,5,13)
	rect(gameChar_x+3,gameChar_y-10,5,13)
	ellipse(gameChar_x-7,gameChar_y-50,10,20)
	ellipse(gameChar_x+5,gameChar_y-50,10,20)
	
    fill(0,0,0)
	ellipse(gameChar_x-5,gameChar_y-39,2,5)
	ellipse(gameChar_x+4,gameChar_y-39,2,5)
	
	fill(255,0,0)
	rect(gameChar_x-10,gameChar_y-30,20,5)
	rect(gameChar_x-5,gameChar_y-25,5,10)

	}

}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawclouds()
{
for(var i = 0; i < clouds.length; i++)
		{
			fill(240,255,240);
	        ellipse(clouds[i].pos_x,clouds[i].pos_y, 55, 55);
			ellipse(clouds[i].pos_x + 25, clouds[i].pos_y, 35, 35);
			ellipse(clouds[i].pos_x + 45, clouds[i].pos_y, 25, 25);
		}
}
// Function to draw mountains objects.
function drawmountains()
{
	for(var i = 0; i < mountains.length; i++)
		{
			fill(230,230,250)
    triangle(mountains[i].pos_x-mountains[i].height/2, 
             floorPos_y, 
             mountains[i].pos_x, 
             floorPos_y-mountains[i].height,
             mountains[i].pos_x+mountains[i].height/2, 
             floorPos_y);
		}

}

// Function to draw trees objects.
function drawtrees()
{
  for(var i = 0; i < trees_x.length; i++)
		{
	        fill(160,82,45); 
			rect(75 + trees_x[i],-200/2 +floorPos_y,50,200/2);
			
			fill(255,228,225);
			triangle(trees_x[i] + 25, -200/2 + floorPos_y,
			         trees_x[i] + 100,-200 + floorPos_y,
					 trees_x[i] + 175,-200/2 +floorPos_y);
			triangle(trees_x[i], -200/4 + floorPos_y,
					 trees_x[i] + 100, -200*3/4 +floorPos_y,
					 trees_x[i] + 200, -200/4 +floorPos_y)
            
		}
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
	
			fill(255,215,0);
			strokeWeight(6);
			stroke(218,165,32);
			ellipse(t_collectable.x_pos,
			t_collectable.y_pos -20,
			t_collectable.size,t_collectable.size);		

}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
	if(dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos)< 
	   t_collectable.size)
		{
			t_collectable.isFound = true;
			console.log('yay');
			game_score += 1;
		}
   
}


// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
  for(var i = 0; i < canyons.length; i++)
		{
			noStroke();
			fill(175,238,238)
			rect(canyons[i].x_pos,432,canyons[i].width,200)
		}
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{
	if(gameChar_world_x > t_canyon.x_pos && gameChar_world_x < t_canyon.x_pos +
	   t_canyon.width && gameChar_y >= floorPos_y)
		{
			console.log('fall');
			isPlummeting = true;
		}

}

function drawFlagpole(t_flagpole)
{
	push();
	strokeWeight(10);
	stroke(180);
	line(t_flagpole.x_pos, floorPos_y,
    t_flagpole.x_pos,floorPos_y -
	flagpole.height);
	pop();
	
	if(t_flagpole.isReached)
		{
			fill(220,20,60);
			rect(t_flagpole.x_pos, floorPos_y -
			flagpole.height,80,50);
		}
}

function checkFlagpole(t_flagpole)
{
	if(dist(gameChar_world_x,0,
    flagpole.x_pos, 0) < 20)
		{
			t_flagpole.isReached = true;
		}
}

function Enemy(x, y, range)
{
	this.x = x;
	this.y = y;
	this.range = range;
	
	this.currentX = x;
	this.inc = 1;
	
	this.update = function()
	{
		this.currentX += this.inc;
		
		if(this.currentX >= this.x + this.range)
			{
				this.inc = -1;
			}
		else if(this.currentX < this.x)
			{
				this.inc = 1;
			}
	}
	
	this.draw = function()
	{
		this.update();
		fill(255,0,0)
		ellipse(this.currentX,this.y,20,20);
		ellipse(this.currentX,this.y-14,20,20);
		ellipse(this.currentX-6,this.y-25,10,15);
		ellipse(this.currentX+5,this.y-25,10,15);
		fill(0,0,0)
		rect(this.currentX-8,this.y-8,16,4);
		ellipse(this.currentX-3,this.y-16,5,5);
		ellipse(this.currentX+4,this.y-16,5,5)
	}
	
	this.checkContact = function(gc_x,gc_y)
	{
		var d = dist(gc_x,gc_y,this.currentX,this.y) 
		console.log(d);
		if(d < 20)
			{
				return true;
			}
		return false;
	}
}

function createPlatforms(x, y,length)
{
	var p = {
		x: x,
		y: y,
		length:length,
		draw: function(){
			fill(199,21,133);
			rect(this.x,this.y,this.length, 20);
		},
		checkContact: function(gc_x,gc_y)
		{
		    if(gc_x > this.x && gc_x < this.x + this.length)
		 	{
		       var d = this.y - gc_y;
			   if(d >= 0 && d < 5)
			   {
				   return true;
			   }
	     	}
			return false;
	    }
	}
	
	return p;
}

// star class //
class Star {
	constructor() {
		this.x = random(width);
		this.y = random(height);
		this.size = random(0.25, 3);
		this.t = random(TAU);
	}
	
	draw() {
		this.t += 0.1;
		var scale = this.size + sin(this.t) * 2;
		noStroke();
		ellipse(this.x, this.y, scale, scale);
	}
  
}

