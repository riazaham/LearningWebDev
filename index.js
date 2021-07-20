var level = 0,
	simonArray = [],
	checkArray = [],
	gameStarted = false;

const playAudio = (path) => new Audio("sounds/" + path + ".mp3").play();

const randomInt = () => Math.floor(Math.random() * 4); //0 - 3
const colorBoxes = ["green", "red", "yellow", "blue"];
const chooseColorBox = () => colorBoxes[randomInt()];

const animate = (elementClass, animClasses, duration) => {
	$(elementClass).addClass(animClasses);
	setTimeout(() => $(elementClass).removeClass(animClasses), duration);
};

//Add click event listeners to all color boxes
$(".color-box").click((e) => {
	if (!gameStarted) return;

	//Click sound and animation
	clickedButton = e.currentTarget.id;
	playAudio(clickedButton);
	animate("#" + clickedButton, "click", 200);

	if (clickedButton === checkArray[0]) {
		checkArray.shift();

		//Level cleared
		if (checkArray.length === 0) setTimeout(nextLevel, 500);
	} else restart();
});

//Start and restart game with any keydown
$(document).keydown(() => {
	if (!gameStarted) {
		gameStarted = true;
		nextLevel();
	}
});

const nextLevel = () => {
	$("h1").text("Level " + ++level);

	let clickedColorBox = chooseColorBox();
	simonArray.push(clickedColorBox);
	checkArray = simonArray.slice(); //shallow copy

	//Animate next color box
	animate("#" + clickedColorBox, "next-color-box", 200);
};

const restart = () => {
	gameStarted = false;
	playAudio("wrong");
	$("h1").text("Game Over, Press Any Key to Restart");
	animate("body", "game-over", 200);

	//reset variables
	simonArray = [];
	checkArray = [];
	level = 0;
};
