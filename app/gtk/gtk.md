
# install

sudo pacman -S base-devel meson ninja gcc gobject-introspection \
  glib2-devel cairo pango libepoxy gdk-pixbuf2 libx11 libxext \
  libxi libxrandr libxcursor libxinerama wayland wayland-protocols \
  xorgproto libcloudproviders

git clone https://gitlab.gnome.org/GNOME/gtk.git
cd gtk
g checkout 4.16.0

meson setup builddir --prefix=/opt/gtk4
ninja -C builddir
ninja -C builddir install

# config

export PATH=/home/sinuhe/Code/open-source/app/.opt/gtk4/bin:$PATH
export LD_LIBRARY_PATH=/home/sinuhe/Code/open-source/app/.opt/gtk4/lib:$LD_LIBRARY_PATH
export PKG_CONFIG_PATH=/home/sinuhe/Code/open-source/app/.opt/gtk4/lib/pkgconfig:$PKG_CONFIG_PATH
export XDG_DATA_DIRS=/home/sinuhe/Code/open-source/app/.opt/gtk4/share:$XDG_DATA_DIRS

# version

gtk4-demo
pkg-config --modversion gtk4

# clean

ninja -C builddir clean
ninja -C builddir uninstall


git clone https://github.com/WebKit/WebKit.git
cd WebKit
