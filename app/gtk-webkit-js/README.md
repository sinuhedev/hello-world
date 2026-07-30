# gtk4

## pkg-config

pkg-config --list-all | grep javascript

## install

sudo pacman -S pkgconf gtk4 webkitgtk-6.0

## make

gcc -o app main.c `pkg-config --cflags --libs gtk4 webkitgtk-6.0 javascriptcoregtk-6.0`

## run

./app
