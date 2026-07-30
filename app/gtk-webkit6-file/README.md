# gtk4

## install

sudo pacman -S pkgconf gtk4 webkitgtk-6.0

## make

gcc main.c `pkg-config --cflags --libs gtk4 webkitgtk-6.0` -o app

## run

./app
