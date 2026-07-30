#include <gtk/gtk.h>
#include <stdlib.h>
#include <webkit/webkit.h>

// Callback para manejar el resultado de la ejecución de JavaScript
static void js_result_callback(GObject *object, GAsyncResult *result,
                               gpointer user_data) {
  WebKitWebView *web_view = WEBKIT_WEB_VIEW(object);
  GError *error = NULL;
  JSCValue *js_value =
      webkit_web_view_evaluate_javascript_finish(web_view, result, &error);

  if (error) {
    g_print("Error al ejecutar JavaScript: %s\n", error->message);
    g_error_free(error);
    return;
  }

  if (js_value) {
    // Comprobar el tipo de valor devuelto (por ejemplo, si es un número o una
    // cadena)
    if (jsc_value_is_number(js_value)) {
      double number = jsc_value_to_double(js_value);
      g_print("Resultado de JavaScript (número): %f\n", number);
    } else if (jsc_value_is_string(js_value)) {
      gchar *str_value = jsc_value_to_string(js_value);
      g_print("Resultado de JavaScript (cadena): %s\n", str_value);
      g_free(str_value);
    } else {
      g_print("Resultado de JavaScript: Valor no manejado.\n");
    }
    g_object_unref(js_value); // Liberar el valor de JSCValue
  }
}

// Función para ejecutar JavaScript desde C
void ejecutar_js(WebKitWebView *web_view) {
  const gchar *script = "  function calcular() { return 5 + 3; } calcular(); ";
  webkit_web_view_evaluate_javascript(web_view, script, -1, NULL, NULL, NULL,
                                      js_result_callback, NULL);
}

// Función C que se llamará desde JavaScript
static void invoke_c_method(WebKitUserContentManager *manager,
                            WebKitJavascriptError *js_result,
                            gpointer user_data) {
  g_print("Método C invocado desde JavaScript.\n");
}

// Función para configurar el canal de mensajes entre JS y C
static void configurar_mensajes(WebKitWebView *web_view) {
  WebKitUserContentManager *content_manager =
      webkit_web_view_get_user_content_manager(web_view);

  // Registrar un manejador de mensajes para el canal "invokeMethod"
  webkit_user_content_manager_register_script_message_handler(
      content_manager, "invokeMethod", NULL);

  // Conectar el handler que maneja los mensajes desde JavaScript
  g_signal_connect(content_manager, "script-message-received::invokeMethod",
                   G_CALLBACK(invoke_c_method), NULL);
}

// Función para insertar un script que invoque el método C desde JavaScript
void inyectar_js(WebKitWebView *web_view) {
  const gchar *script =
      "function invocarMetodoEnC() {"
      "   window.webkit.messageHandlers.invokeMethod.postMessage('Invocar C');"
      "}";

  WebKitUserContentManager *content_manager =
      webkit_web_view_get_user_content_manager(web_view);
  webkit_user_content_manager_add_script(
      content_manager,
      webkit_user_script_new(script, WEBKIT_USER_CONTENT_INJECT_TOP_FRAME,
                             WEBKIT_USER_SCRIPT_INJECT_AT_DOCUMENT_START, NULL,
                             NULL));
}

static void activate(GtkApplication *app, gpointer user_data) {
  // Crear una ventana
  GtkWidget *window = gtk_application_window_new(app);
  gtk_window_set_title(GTK_WINDOW(window), "Hola Mundo con WebKitGTK 6");
  gtk_window_set_default_size(GTK_WINDOW(window), 800, 600);

  // Crear un contenedor WebKit
  WebKitWebView *web_view = WEBKIT_WEB_VIEW(webkit_web_view_new());

  // Configurar las opciones de WebKitSettings para permitir el inspector
  WebKitSettings *settings = webkit_web_view_get_settings(web_view);
  webkit_settings_set_enable_developer_extras(settings, TRUE);

  // Obtener el inspector y mostrarlo
  WebKitWebInspector *inspector = webkit_web_view_get_inspector(web_view);

  // Cargar un contenido HTML simple
  const char *html_content = "<html><body><h1>¡Hola Mundo!</h1></body></html>";
  webkit_web_view_load_html(web_view, html_content, NULL);

  // Configurar la comunicación entre JS y C
  configurar_mensajes(web_view);

  // Inyectar el script JavaScript que invoca el método C
  inyectar_js(web_view);

  // Ejecutar la función JavaScript después de cargar la página
  g_signal_connect(web_view, "load-changed", G_CALLBACK(ejecutar_js), NULL);

  // Agregar el contenedor WebKit a la ventana
  gtk_window_set_child(GTK_WINDOW(window), GTK_WIDGET(web_view));

  // Mostrar la ventana
  gtk_window_present(GTK_WINDOW(window));
}

int main(int argc, char **argv) {

  puts("hola");

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
