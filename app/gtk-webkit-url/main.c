#include <gtk/gtk.h>
#include <string.h>
#include <webkit/webkit.h>

int main(int argc, char** argv) {
  setenv("WEBKIT_DISABLE_DMABUF_RENDERER", "1", 1);

  const char* input = (argc > 1) ? argv[1] : "google.com";

  char* url = strstr(input, "://") ? g_strdup(input)
                                   : g_strdup_printf("https://%s", input);

  // g_print("%s", url);

  gtk_init();

  // Forzar siempre el modo oscuro
  g_object_set(gtk_settings_get_default(), "gtk-application-prefer-dark-theme",
               TRUE, NULL);

  GtkWidget* window = gtk_window_new();
  gtk_window_set_title(GTK_WINDOW(window), url);
  gtk_window_set_default_size(GTK_WINDOW(window), 800, 600);

  GtkWidget* web_view = webkit_web_view_new();
  webkit_web_view_load_uri(WEBKIT_WEB_VIEW(web_view), url);
  gtk_window_set_child(GTK_WINDOW(window), web_view);

  gtk_window_present(GTK_WINDOW(window));

  while (g_list_model_get_n_items(gtk_window_get_toplevels()) > 0)
    g_main_context_iteration(NULL, TRUE);

  g_free(url);
  return 0;
}