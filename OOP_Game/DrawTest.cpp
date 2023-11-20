#include <iostream>
#include <ncurses.h>
#include "Draw.hpp"

using namespace std;

int main(){

    Draw test1(20,40,'A');
    if(test1.getx() != 40){
        cout << "Test1 Failed" << endl;
    }

    Draw test2(30,50,'A');
    if(test2.gety() != 30){
        cout << "Test2 Failed" << endl;
    }

    Draw test3(20,40,'A');
    if(test3.getCh() != 'A'){
        cout << "Test3 Failed" << endl;
    }

    Draw test4(20,40,'A');
        test4.setx(100);
        if(test4.getx()!= 100){
        cout << "Test5 Failed" << endl;
    }

    Draw test5(20,40,'A');
        test5.sety(24);
        if(test5.gety()!= 24){
        cout << "Test5 Failed" << endl;
    }

    Draw test6(20,40,'A');
        test6.setCh('B');
        if(test6.getCh()!= 'B'){
        cout << "Test6 Failed" << endl;
    }

    return 0;
}