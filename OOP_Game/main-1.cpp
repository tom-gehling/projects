/* COMP SCI 1102 - Object Oriented Programming - Space Invaders Project */
// By Thomas Gehling, Gun (Chris) Park, Patrick Williams
// This is the main driver program

#include <ncurses.h>
#include "RunGame.hpp"

using namespace std;

int main() { 

    RunGame(); 
    // Runs game in 40x20 box in terminal.
    // Standard game screen used as gameplay difficulty 
    // would become too warped if display could be any size.

    return 0;
}