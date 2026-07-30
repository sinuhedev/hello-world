#include <gtk/gtk.h>
#include <stdlib.h>
#include <string.h>

static void activate(GtkApplication *app, gpointer user_data) {
  GtkWidget *window, *header;

  window = gtk_application_window_new(app);

  char *appdir = getenv("APPDIR");
  char filepath[1024];
  snprintf(filepath, sizeof(filepath), "%s/usr/share/icons", appdir);

  GtkIconTheme *icon_theme = gtk_icon_theme_get_for_display(gtk_widget_get_display(window));
  gtk_icon_theme_add_search_path(icon_theme, filepath);

  gtk_window_set_icon_name(GTK_WINDOW(window), "app");

  gtk_window_set_title(GTK_WINDOW(window), "Window");
  gtk_window_set_default_size(GTK_WINDOW(window), 600, 200);

  // Create a header bar
  header = gtk_header_bar_new();
  gtk_header_bar_set_show_title_buttons(GTK_HEADER_BAR(header), TRUE);
  gtk_window_set_titlebar(GTK_WINDOW(window), header);

  gtk_window_present(GTK_WINDOW(window));
}

int main(int argc, char **argv) {
  GtkApplication *app;
  int status;

  app = gtk_application_new("sinuhe.dev.app", G_APPLICATION_DEFAULT_FLAGS);
  g_signal_connect(app, "activate", G_CALLBACK(activate), NULL);
  status = g_application_run(G_APPLICATION(app), argc, argv);
  g_object_unref(app);

  return status;
}
