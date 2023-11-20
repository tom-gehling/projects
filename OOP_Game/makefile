all: main

main: main-1.cpp RunGame.hpp Display.hpp Game.hpp Draw.hpp Ship.hpp Enemy.hpp Laser.hpp Scoreboard.hpp Menu.hpp
	g++ main-1.cpp -w -lncurses -o main

playertest: PlayerTest.cpp Player.hpp
	g++ PlayerTest.cpp -lncurses -o playertest

enemytest: EnemyTest.cpp Enemy.hpp
	g++ EnemyTest.cpp -lncurses -o enemytest

drawtest: Draw.hpp DrawTest.cpp
	g++ DrawTest.cpp -lncurses -o drawtest

lasertest: LaserTest.cpp Laser.hpp
	g++ LaserTest.cpp -lncurses -o lasertest

upgradestest: UpgradesTest.cpp Upgrades.hpp
	g++ UpgradesTest.cpp -lncurses -o upgradestest