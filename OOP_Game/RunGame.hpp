/* COMP SCI 1102 - Object Oriented Programming - Space Invaders Project */
// By Thomas Gehling, Gun (Chris) Park, Patrick Williams
// This is the class definition of the RunGame class. This class handles the game execution process.

#ifndef RUNGAME_HPP
#define RUNGAME_HPP
#include "Game.hpp"
#include <iostream>

using namespace std;

#define START       3
#define RESTART     2
#define PAUSE_GAME  1
#define QUIT_GAME   0
#define ENTER       10 // ascii value of 'Enter' letter

class RunGame {
    public:
        RunGame(){

            /* Initiate start menu */
            Menu open_menu;
            bool start_flag = false;
            start_flag = open_menu.operate(START); // run the start menu

            if (start_flag) { // if user selected START GAME
                Game game(20,40); // sets up game

                while (!game.gameOver()) { // while game still on,
                        game.processInput();
                        game.updateState();
                        game.redraw();
                }
                game.closeGame(); // cleans up window and ends
                getch();
            }
            system("clear"); // clear window
        }
        
};
#endif