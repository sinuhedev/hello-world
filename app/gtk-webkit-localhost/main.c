#include <gtk/gtk.h>
#include <stdlib.h>
#include <webkit/webkit.h>

static void activate(GtkApplication *app, gpointer user_data) {
  // Crear una ventana
  GtkWidget *window = gtk_application_window_new(app);
  gtk_window_set_title(GTK_WINDOW(window), "Hola Mundo con WebKitGTK 6");
  gtk_window_set_default_size(GTK_WINDOW(window), 800, 600);

  // Crear un contenedor WebKit
  WebKitWebView *web_view = WEBKIT_WEB_VIEW(webkit_web_view_new());

  // Cargar una URL
  webkit_web_view_load_uri(web_view, "https://sinuhe.dev");

  // Agregar el contenedor WebKit a la ventana
  gtk_window_set_child(GTK_WINDOW(window), GTK_WIDGET(web_view));

  // Mostrar la ventana
  gtk_window_present(GTK_WINDOW(window));
}

int main(int argc, char **argv) {
  // Establecer la variable de entorno para desactivar DMABUF
  setenv("WEBKIT_DISABLE_DMABUF_RENDERER", "1", 1);

  GtkApplication *app;
  int status;

  // Crear una nueva instancia de GtkApplication
  app =
      gtk_application_new("com.ejemplo.holamundo", G_APPLICATION_DEFAULT_FLAGS);

  // Conectar la señal "activate" con la función activate
  g_signal_connect(app, "activate", G_CALLBACK(activate), NULL);

  // Ejecutar la aplicación
  status = g_application_run(G_APPLICATION(app), argc, argv);

  // Liberar los recursos de la aplicación
  g_object_unref(app);

  return status;
}
