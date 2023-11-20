#include <iostream>
#include <ncurses.h>
#include "Player.hpp"
#include "Ship.hpp"
#include "Draw.hpp"

using namespace std;

int main(){

    Player test1(2,4,'A');
    if(test1.getx() != 4){
        cout << "Test1 Failed" << endl;
    }

    Player test2(30,50,'A');
    if(test2.gety() != 30){
        cout << "Test2 Failed" << endl;
    }

    Player test3(20,40,'A');
    if(test3.getCh() != 'A'){
        cout << "Test3 Failed" << endl;
    }

    Player test4(20,40,'A');
        test4.setx(100);
        if(test4.getx()!= 100){
        cout << "Test5 Failed" << endl;
    }

    Player test5(20,40,'A');
        test5.sety(24);
        if(test5.gety()!= 24){
        cout << "Test5 Failed" << endl;
    }

    Player test6(20,40,'A');
        test6.setCh('B');
        if(test6.getCh()!= 'B'){
        cout << "Test6 Failed" << endl;
    }

     Player test7(20,40,'A');
        test7.moveDown(1);
        if(test7.getx()!= 40+1){
        cout << "Test7 Failed" << endl;
    }

     Player test8(20,40,'A');
        test8.moveUp(1);
        if(test8.getx()!= 40-1){
        cout << "Test8 Failed" << endl;
    }

     Player test9(20,40,'A');
        test9.moveLeft(1);
        if(test9.gety()!= 20-1){
        cout << "Test9 Failed" << endl;
    }

     Player test10(20,40,'A');
        test10.moveRight(1);
        if(test10.gety()!= 20+1){
        cout << "Test10 Failed" << endl;
    }

    return 0;
}