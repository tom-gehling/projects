/* COMP SCI 1102 - Object Oriented Programming - Space Invaders Project */
// By Thomas Gehling, Gun (Chris) Park, Patrick Williams
// This is the class definition of the Menu class. This class defines the menu interface that users can interact with to decide game-start/game-end.

#ifndef MENU_HPP
#define MENU_HPP
#include "Display.hpp"
#include <string.h> // for strcmp function

using namespace std;

#define GAME_OVER   4
#define START       3
#define RESTART     2
#define PAUSE_GAME  1
#define QUIT_GAME   0
#define ENTER       10 // ascii value of 'Enter' letter

class Menu: public Display {

    public:
        Display menu_win;
        int option;

    Menu() { // default ructor
        menu_win = Display(20,40);
        menu_win.create();
    }

    bool operate(int menu_type) { // operates menu and returns run_flag
        int selection = 0;
        char ** options;
        int number_of_options = 0;

        switch (menu_type) { // swaps between different menus depending on selectedtype
            case START: // start menu
                number_of_options = 3;
                options = new char*[number_of_options];
                options[0] = "START GAME";
                options[1] = "HOW TO PLAY";
                options[2] = "QUIT GAME";
                break;
            case PAUSE_GAME:
                number_of_options = 3;
                options = new char*[number_of_options];
                options[0] = "RESUME GAME";
                options[1] = "HOW TO PLAY";
                options[2] = "QUIT GAME";
                break;
            case QUIT_GAME:
                number_of_options = 2;
                options = new char*[number_of_options];
                options[0] = "RESUME GAME";
                options[1] = "QUIT GAME";
                break;
             case GAME_OVER:
                if(run_game_over_display()== true){
                    return false;
                };
                break;
        }

        while (true) { // run menu operation
            menu_win.addText(2,11,"SPACE INVADERS");

            for (int i = 0; i < number_of_options; ++i) {
                if (i == selection) {
                    menu_win.highlight_on(); // highlight if option is selected by user arrow keys
                }
                menu_win.addText(i+menu_win.get_height()-10,menu_win.get_width()/2-7,options[i]); // generates text at those coords
                menu_win.highlight_off();
            }
            chtype user_keyinput = menu_win.getInput(); // get user input
            switch(user_keyinput) { // determine user input result
                case KEY_UP:
                    selection--;
                    if (selection < 0) selection = selection + number_of_options; // to wraparound menu options when going out of range
                    break;
                case KEY_DOWN:
                    selection++;
                    if (selection == number_of_options) selection = 0; // to wraparound menu options when going out of range
                    break;
                case ENTER: // when user confirms selection
                    menu_win.clear();
                    menu_win.refresh();

                    if (strcmp(options[selection],"START GAME") == 0 || strcmp(options[selection],"RESUME GAME") == 0) {
                        menu_win.delete_window();
                        delete[] options;
                        return true;
                    }

                    if (strcmp(options[selection],"HOW TO PLAY") == 0) {
                        run_instruction_menu(); // runs "how to play" menu
                        break;
                    }
                    if (strcmp(options[selection],"QUIT GAME") == 0) {
                        menu_win.delete_window();
                        delete[] options;
                        return false; // run_flag = false means game ends
                    }
                default:
                    break;
            }
        }
    }

    void run_instruction_menu() { // runs "how to play" menu
        int number_of_instructions = 14; // predefined according to instruction texts
        char ** instructions = new char*[number_of_instructions];
        char * list[] = {"Welcome to Space Invaders!","","AIM:","Stop the enemy ships before your","health runs out!","","GAME INSTRUCTIONS:","Your spaceship is '>'", "Enemies are 'm'", "Get the '+' for more health!","", "Move using your arrow keys.","SPACEBAR to destroy your enemies!", "Good luck out there!"};

        for (int i = 0; i < number_of_instructions; i++) {
            instructions[i] = list[i]; // populating instructions as c++ cannot handle mass assignment
            menu_win.addText(i+2,2, instructions[i]); // add instructions at specific coordinates
        }

        menu_win.addText(menu_win.get_height()-2,2,"PRESS 'ENTER' TO RETURN TO MAIN MENU");

        delete[] instructions;
        while (true) {
            chtype user_keyinput = menu_win.getInput();
            if (user_keyinput == ENTER) {
                    menu_win.clear(); // clear window
                    menu_win.refresh();
                    return; // return back to menu operate function
            }
        }
    }

    bool run_game_over_display(){
        menu_win.addText(7,menu_win.get_width()/2-7,"GAME OVER!");
        menu_win.addText(9,menu_win.get_width()/2-11,"Thanks for playing!");
        menu_win.addText(menu_win.get_height()-2,menu_win.get_width()/2-12,"PRESS 'ENTER' TO QUIT");

        while (true) {
            chtype user_keyinput = menu_win.getInput();
            if (user_keyinput == ENTER) {
                    menu_win.clear(); // clear window
                    menu_win.refresh();
                    return true; // return back to menu operate function
            }
        }

    }

    ~Menu(){
    }
};

#endif