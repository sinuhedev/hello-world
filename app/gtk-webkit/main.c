#include <gtk/gtk.h>
#include <stdlib.h>
#include <webkit/webkit.h>

static gboolean on_key_pressed(
    GtkEventControllerKey *controller,
    guint keyval,
    guint keycode,
    GdkModifierType state,
    gpointer user_data
) {
    WebKitWebView *web_view = WEBKIT_WEB_VIEW(user_data);

    if (keyval == GDK_KEY_F12 ||
        ((state & GDK_CONTROL_MASK) &&
         (state & GDK_SHIFT_MASK) &&
         (keyval == GDK_KEY_I || keyval == GDK_KEY_i))) {

        WebKitWebInspector *inspector =
            webkit_web_view_get_inspector(web_view);

        webkit_web_inspector_show(inspector);

        return TRUE;
    }

    return FALSE;
}

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

    // Habilitar herramientas de desarrollo
    WebKitSettings *settings =
        webkit_web_view_get_settings(web_view);

    webkit_settings_set_enable_developer_extras(settings, TRUE);

    // Registrar atajos de teclado
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

    // Cargar HTML
    const char *html_content =
        "<html><body><h1>¡Hola Mundo!</h1></body></html>";

    webkit_web_view_load_html(web_view, html_content, NULL);

    // Agregar WebView a la ventana
    gtk_window_set_child(
        GTK_WINDOW(window),
        GTK_WIDGET(web_view)
    );

    // Mostrar ventana
    gtk_window_present(GTK_WINDOW(window));
}

int main(int argc, char **argv) {
    // Desactivar DMABUF
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

