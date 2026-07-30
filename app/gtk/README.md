# gtk4

## install
sudo pacman -S pkgconf gtk4

## version
pkg-config --modversion gtk4

## pkg-config
pkg-config --list-all | grep gtk4

## make
gcc src/main.c $(pkg-config --cflags --libs gtk4) -o app 

## run
./app


