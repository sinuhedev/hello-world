#include <gtk/gtk.h>
#include <stdlib.h>
#include <webkit/webkit.h>

// ==========================================
// RESULTADO DE EJECUCIÓN JAVASCRIPT
// ==========================================

static void js_result_callback(
    GObject *object,
    GAsyncResult *result,
    gpointer user_data
) {
    WebKitWebView *web_view = WEBKIT_WEB_VIEW(object);
    GError *error = NULL;

    JSCValue *js_value =
        webkit_web_view_evaluate_javascript_finish(
            web_view, result, &error
        );

    if (error) {
        g_print("Error al ejecutar JavaScript: %s\n", error->message);
        g_error_free(error);
        return;
    }

    if (js_value) {
        if (jsc_value_is_number(js_value)) {
            double number = jsc_value_to_double(js_value);
            g_print("Resultado JS (numero): %f\n", number);

        } else if (jsc_value_is_string(js_value)) {
            gchar *str_value = jsc_value_to_string(js_value);
            g_print("Resultado JS (cadena): %s\n", str_value);
            g_free(str_value);

        } else {
            gchar *value = jsc_value_to_string(js_value);
            g_print("Resultado JS: %s\n", value);
            g_free(value);
        }

        g_object_unref(js_value);
    }
}

// ==========================================
// EJECUTAR JAVASCRIPT DESDE C
// ==========================================

void ejecutar_js(WebKitWebView *web_view) {

    const gchar *script =
        "function calcular() { return 5 + 3; }"
        "calcular();";

    webkit_web_view_evaluate_javascript(
        web_view,
        script,
        -1,
        NULL,
        NULL,
        NULL,
        js_result_callback,
        NULL
    );
}

// ==========================================
// COMUNICACION JAVASCRIPT -> C
// ==========================================

static void invoke_c_method(
    WebKitUserContentManager *manager,
    JSCValue *js_result,
    gpointer user_data
) {
    gchar *message = jsc_value_to_string(js_result);

    g_print("Metodo C invocado desde JavaScript: %s\n", message);

    g_free(message);
}

static void configurar_mensajes(WebKitWebView *web_view) {

    WebKitUserContentManager *content_manager =
        webkit_web_view_get_user_content_manager(web_view);

    webkit_user_content_manager_register_script_message_handler(
        content_manager,
        "invokeMethod",
        NULL
    );

    g_signal_connect(
        content_manager,
        "script-message-received::invokeMethod",
        G_CALLBACK(invoke_c_method),
        NULL
    );
}

// ==========================================
// INYECTAR JAVASCRIPT
// ==========================================

void inyectar_js(WebKitWebView *web_view) {

    const gchar *script =
        "function invocarMetodoEnC() {"
        "   window.webkit.messageHandlers.invokeMethod"
        "       .postMessage('Invocar C');"
        "}";

    WebKitUserContentManager *content_manager =
        webkit_web_view_get_user_content_manager(web_view);

    WebKitUserScript *user_script =
        webkit_user_script_new(
            script,
            WEBKIT_USER_CONTENT_INJECT_TOP_FRAME,
            WEBKIT_USER_SCRIPT_INJECT_AT_DOCUMENT_START,
            NULL,
            NULL
        );

    webkit_user_content_manager_add_script(
        content_manager,
        user_script
    );

    webkit_user_script_unref(user_script);
}

// ==========================================
// EVENTO DE CARGA WEBKIT
// ==========================================

static void on_load_changed(
    WebKitWebView *web_view,
    WebKitLoadEvent event,
    gpointer user_data
) {
    if (event == WEBKIT_LOAD_FINISHED) {

        g_print("Pagina cargada.\n");

        ejecutar_js(web_view);

        // Probar comunicacion JavaScript -> C
        const gchar *script = "invocarMetodoEnC();";

        webkit_web_view_evaluate_javascript(
            web_view,
            script,
            -1,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL
        );
    }
}

// ==========================================
// WEBKIT INSPECTOR (F12 / CTRL + SHIFT + I)
// ==========================================

static gboolean on_key_pressed(
    GtkEventControllerKey *controller,
    guint keyval,
    guint keycode,
    GdkModifierType state,
    gpointer user_data
) {
    WebKitWebView *web_view = WEBKIT_WEB_VIEW(user_data);

    gboolean open_inspector =
        keyval == GDK_KEY_F12 ||
        (
            (state & GDK_CONTROL_MASK) &&
            (state & GDK_SHIFT_MASK) &&
            gdk_keyval_to_lower(keyval) == GDK_KEY_i
        );

    if (open_inspector) {

        WebKitWebInspector *inspector =
            webkit_web_view_get_inspector(web_view);

        webkit_web_inspector_show(inspector);

        return TRUE;
    }

    return FALSE;
}

// ==========================================
// GTK APPLICATION
// ==========================================

static void activate(GtkApplication *app, gpointer user_data) {

    // Crear ventana
    GtkWidget *window = gtk_application_window_new(app);

    gtk_window_set_title(
        GTK_WINDOW(window),
        "Hola Mundo con WebKitGTK 6"
    );

    gtk_window_set_default_size(GTK_WINDOW(window), 800, 600);

    // Crear WebView
    WebKitWebView *web_view =
        WEBKIT_WEB_VIEW(webkit_web_view_new());

    // Habilitar WebKit Inspector
    WebKitSettings *settings =
        webkit_web_view_get_settings(web_view);

    webkit_settings_set_enable_developer_extras(
        settings,
        TRUE
    );

    // Configurar comunicacion JS <-> C
    configurar_mensajes(web_view);

    // Inyectar JavaScript
    inyectar_js(web_view);

    // Detectar finalizacion de carga
    g_signal_connect(
        web_view,
        "load-changed",
        G_CALLBACK(on_load_changed),
        NULL
    );

    // Configurar atajos de teclado
    GtkEventController *key_controller =
        gtk_event_controller_key_new();

    gtk_event_controller_set_propagation_phase(
        key_controller,
        GTK_PHASE_CAPTURE
    );

    g_signal_connect(
        key_controller,
        "key-pressed",
        G_CALLBACK(on_key_pressed),
        web_view
    );

    gtk_widget_add_controller(
        window,
        key_controller
    );

    // HTML
    const gchar *html_content =
        "<html>"
        "<head><title>WebKitGTK</title></head>"
        "<body>"
        "<h1>¡Hola Mundo!</h1>"
        "<button onclick='invocarMetodoEnC()'>"
        "Invocar C"
        "</button>"
        "</body>"
        "</html>";

    webkit_web_view_load_html(
        web_view,
        html_content,
        NULL
    );

    // Agregar WebView a ventana
    gtk_window_set_child(
        GTK_WINDOW(window),
        GTK_WIDGET(web_view)
    );

    // Mostrar ventana
    gtk_window_present(GTK_WINDOW(window));
}

// ==========================================
// MAIN
// ==========================================

int main(int argc, char **argv) {

    puts("hola");

    setenv("WEBKIT_DISABLE_DMABUF_RENDERER", "1", 1);

    GtkApplication *app =
        gtk_application_new(
            "com.ejemplo.holamundo",
            G_APPLICATION_DEFAULT_FLAGS
        );

    g_signal_connect(
        app,
        "activate",
        G_CALLBACK(activate),
        NULL
    );

    int status = g_application_run(
        G_APPLICATION(app),
        argc,
        argv
    );

    g_object_unref(app);

    return status;
}
