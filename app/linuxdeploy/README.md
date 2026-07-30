# Download linuxdeploy
wget https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-x86_64.AppImage
chmod +x linuxdeploy-x86_64.AppImage

# Download appimagetool
wget https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage
chmod +x appimagetool-x86_64.AppImage

# gcc
gcc src/main.c $(pkg-config --cflags --libs gtk4) -o AppDir/usr/bin/app

# run
./AppDir/usr/bin/app

# deploy
export NO_STRIP=true

./linuxdeploy-x86_64.AppImage --appdir AppDir --executable AppDir/usr/bin/app --icon-file AppDir/usr/share/icons/hicolor/256x256/apps/app.png --desktop-file AppDir/usr/share/applications/app.desktop --output appimage
./appimagetool-x86_64.AppImage AppDir
