/* COMP SCI 1102 - Object Oriented Programming - Space Invaders Project */
// By Thomas Gehling, Gun (Chris) Park, Patrick Williams
// This is the class definition of the Game class. This is the main class that builds and combines the different elements of the game.

#ifndef GAME_HPP
#define GAME_HPP
#include <ncurses.h>
#include <iostream>
#include <stdlib.h>
#include <time.h>
#include "Display.hpp"
#include "Player.hpp"
#include "Enemy.hpp"
#include "Laser.hpp"
#include "Scoreboard.hpp"
#include "Menu.hpp"
#include "Upgrades.hpp"

using namespace std;

class Game: public Display {

    public:
        Display display_win;
        Scoreboard scoreboard;
        Player player;
        Enemy *enemies;
        Laser *laser;
        Laser *enem_laser;
        Upgrades *upgrade;
        bool game_over;
        int count;
        int laserAmmo = 40;
        int enemyWave = 2;
        int enemyCount = enemyWave;
        int level = 1;
        int score = 0;

    //default constructor which doesn't get used
    Game(){
        /* Game init */
        game_over = false;              // set this to start game
        srand((unsigned)time(NULL));    // set seed for rand

    }

        
    //initiates the display and creates a starting position
    //for the player, each of the enemies and each of the lasers
    Game(int height, int width){
        srand((unsigned)time(NULL));
        game_over = false; // set this to start game
        count = 0;

        int sb_row = display_win.getStartRow()+height;
        int sb_col = display_win.getStartCol();
       
        // initialises display window for gameplay
        display_win = Display(height, width);
        display_win.create();

        // initialises scoreboard for gameplay
        scoreboard = Scoreboard(width, sb_row, sb_col);
        scoreboard.initialise(level, score, player.getHealth());

        //sets player position for middle left of screen
        player.sety(1);
        player.setx((height/2)-1);
        player.setCh('>');
        display_win.draw(player);


        // creates an array of Lasers and sets their position for (-1,-1) 
        // until they are used
        laser = new Laser[laserAmmo];
        for(int i = 0; i<laserAmmo;i++){
            laser[i].sety(-1);
            laser[i].setx(-1);
            laser[i].setCh('-');
            laser[i].set_laserVelocity(2);
            display_win.draw(laser[i]);
        }

        // creates an array of enemy Lasers and sets their position for (-1,-1) 
        // until they are used
        enem_laser = new Laser[laserAmmo];
        for(int i = 0; i<laserAmmo;i++){
            enem_laser[i].sety(-1);
            enem_laser[i].setx(-1);
            enem_laser[i].setCh('~');
            enem_laser[i].set_laserVelocity(2); //laser needs to be +1 more than player as it is moving in same direction as enemy
            display_win.draw(enem_laser[i]);
        }

        // creates an array of enemies and sets their position for (-1,-1) 
        // until they are used
        enemies = new Enemy[enemyWave];
        for(int i =0; i<enemyWave;i++){
            enemies[i].setx(1+rand()%(height-2)); //sets height of enemy between x = 1 to 17
            enemies[i].sety((rand()%width)+width);
            enemies[i].setCh('m');
            display_win.draw(enemies[i]);
        }

        upgrade = new Upgrades[10];
        for(int i =0; i<10;i++){
            upgrade[i].setx(-1);
            upgrade[i].sety(-1);
            upgrade[i].setCh('+');
            display_win.draw(upgrade[i]);
        }
    }


    /* -----Gameplay cycle of major logic and drawing functions: ------
    - process the user input
    - update the state of the game for next frame
    - draw next frame
    - repeat until game over */

    /* Processes user input */
    void processInput() {

        chtype input = display_win.getInput(); // gets user input

        switch (input) {
        case KEY_UP: // up arrow key moves player up
            if(player.getx()>1){
                player.moveUp(1);
                break;
            }
            else{
                break;
            }

         case KEY_DOWN: // up arrow key moves player down
                if(player.getx()<display_win.get_height()-2){
                    player.moveDown(1);
                break;
            }
            else{
                break;
            }

            break;

         case KEY_LEFT:
            if(player.gety()>2){
                player.moveLeft(1);
                break;
            }else{
                break;
            }

        case KEY_RIGHT:
            if(player.gety()<display_win.get_width()-3){
                player.moveRight(1);
                break;
            }

        case ' ':
            {if(count > laserAmmo){
                count = 0;
            }
            //when laser is fired by player, the position is set for one space right of the player
            laser[count].fired = player.fire();
            laser[count].setx(player.getx());
            laser[count].sety(player.gety()+1);
            count ++ ;
            break;}

        case 'p': //pauses game
           {display_win.setTimeout(-1);
            Menu * pause_menu = new Menu;
            game_over = !pause_menu->operate(PAUSE_GAME);
            display_win.setTimeout(200);
            delete pause_menu;
            break;}

        case 'q': // quit game
            {Menu * quit_menu = new Menu;
            game_over = !quit_menu->operate(QUIT_GAME);
            delete quit_menu;
            break;}

        default:
            break;
        }
    }


    /* Updates the state of game for the next frame */
    void updateState(){
        //updates the postition of each enemy for every frame
        //makes all generated enemies move left
        for (int i=0; i<enemyWave;i++){
            enemies[i].moveLeft(enemies[i].get_speed());
        }

        //updates the postition of each player laser for every frame
        //makes each fired laser by player move right on the screen
        for (int i=0; i<laserAmmo;i++){
            if (laser[i].isFired() == true){
            laser[i].sety(laser[i].gety()+laser[i].get_laserVelocity());
            }
        }

        //updates the postition of each player laser for every frame
        //makes each fired laser by player move left on the screen
        for (int i=0; i<enemyWave;i++){
            if(enemies[i].fire()==true){
                initiate_enemyFire(i);
            }
            enem_laser[i].sety(enem_laser[i].gety()-enem_laser[i].get_laserVelocity());
            // if (enem_laser[i].isFired() == true){
            // enem_laser[i].sety(enem_laser[i].gety()-enem_laser[i].get_laserVelocity());
            // }
        }

       
        // when the enemy wave has ended, this will generate a new wave of enemies, update the level and reset the enemy count
        if(enemyCount == 0){
            level +=1;
            deleteEnemies();
            enemyWave += 1;
            enemies = enemyRespawn(enemyWave);
            srand(time(0));
            for (int i=0; i<enemyWave; i++){
                enemies[i].setx(1+rand()%(display_win.get_height()-2)); //sets height of enemy between x = 1 to 17
                enemies[i].sety((rand()%display_win.get_width())+display_win.get_width());
                enemies[i].setCh('m');
                display_win.draw(enemies[i]);
            }
            enemyCount = enemyWave;
            //initialises a random position for health boost on game screen
            upgrade[0].setx(1+rand()%(display_win.get_height()-2));
            upgrade[0].sety(1+rand()%(display_win.get_width()-10));
        }

        //check interactions with enemy ships and lasers
        checkCollision();
        checkEnemiesPast();
    
        //updates scoreboard for the three integers
        scoreboard.updateScoreboard(level, score, player.getHealth());

        //game over if player's health reaches zero
        if(player.getHealth()==0){
            display_win.clear();
            display_win.refresh();
            Menu * gameover_menu = new Menu;
            game_over = !gameover_menu->operate(GAME_OVER);
        }
    }

    // redraws each drawable element on the screen
    void redraw(){
        display_win.clear();
        display_win.draw(player);

        //draws all lasers that are initailised
        for(int i=0;i<laserAmmo;i++){
            display_win.draw(laser[i]);
        }

        //draws all enemy lasers that are initailised
        for(int i=0;i<laserAmmo;i++){
            display_win.draw(enem_laser[i]);
        }

        //draws all enemies that are initailised
        for(int i=0;i<enemyWave;i++){
            display_win.draw(enemies[i]);
        }

        for(int i=0;i<10;i++){
            display_win.draw(upgrade[i]);
        }


        //refresh both display and scoreboard windows to update states
        scoreboard.refresh();
        display_win.refresh();
    }


    /* ------checks for all possibilities of collision: ---------
    - enemy v laser
    - player v enemy
    - player v enemy laser
    - player v upgrade */

    void checkCollision(){
         for (int i = 0; i<enemyWave; i++){
             for(int j=0; j<laserAmmo; j++){
                if(enemies[i].isHit(laser[j].gety(),laser[j].getx())){
                    if(enemies[i].isAlive()){
                        enemies[i].destroy();
                        laser[j].destroy();
                        enemies[i].dead();
                        enemyCount --;
                        score += 100;
                    }
                }
            }
            if(player.isHit(enemies[i].gety(),enemies[i].getx())){
                enemies[i].destroy();
                player.updateHealth(-20);
                enemies[i].dead();
                enemyCount --;
            }

            if(player.isHit(enem_laser[i].gety(),enem_laser[i].getx())){
                enem_laser[i].destroy();
                player.updateHealth(-20);
            }
        } 

        for (int i = 0; i<10; i++){
            if(player.isHit(upgrade[i].gety(),upgrade[i].getx())){
                upgrade[i].destroy();
                player.updateHealth(20);
            }
        }
    }


    /* ------ Gameplay functionality of enemies including respawning, initiating shooting, and delete array memory ------- */

    // checks to see if enemy is past the left of screen
    void checkEnemiesPast(){
        for(int i=0; i<enemyWave; i++){
            if(enemies[i].gety() == 0){ //need to change to ensure all enemies pass zero exactly
                player.updateHealth(-20);
                enemies[i].dead();
                enemyCount--;
            }
        }
    }

    //creates a new array of enemies to be generated
    Enemy*enemyRespawn(int newEnemies){
        enemies = new Enemy[newEnemies];
        return enemies;
    }

    void initiate_enemyFire(int count){
        enem_laser[count].fired = true;
        enem_laser[count].setx(enemies[count].getx());
        enem_laser[count].sety(enemies[count].gety()-1);
        if(count>laserAmmo){
            count = 0;
        }
    }

    //deletes pointer to enemy ship array
    void deleteEnemies(){
        delete enemies;
    }



    /* ------- Implementation of end of game logic and screen close --------*/
    
    /* Returns game_over result */
    bool gameOver(){
        return game_over;
    }


    /* Close game screen*/
    void closeGame() {
        display_win.clear();
        display_win.refresh();
        endwin();
        delwin(display_win.display_win);
    }

};
#endif