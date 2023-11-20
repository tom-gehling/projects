#include <ncurses.h>
#include <stdlib.h>
#include <time.h>
#include "Display.hpp"
#include "Player.hpp"
#include "Enemy.hpp"
#include "Laser.hpp"


int main(){
    Display display_win(20,40);
    Player ship(1,2,'A');
    Enemy enemies(2,3,'M');
    Laser laser();
    int count;

    return 0;
}