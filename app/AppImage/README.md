# AppImage

## Install

https://github.com/AppImage/appimagetool/releases

```sh

sudo pacman -S zsync

wget https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage

chmod +x appimagetool-x86_64.AppImage

./appimagetool-x86_64.AppImage --version

```

## Building

```sh

gcc src/main.c -o AppDir/usr/bin/app

chmod +x AppDir/AppRun

./appimagetool-x86_64.AppImage AppDir app.AppImage

```

# test

```sh

./app.AppImage

ldd AppDir/usr/bin/app

ldd ./app.AppImage

```


# help
./app.AppImage --appimage-help 