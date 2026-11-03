use gtk::{Application, ApplicationWindow, EventControllerKey, PropagationPhase};
use gtk4 as gtk;
use webkit6::prelude::*;
use webkit6::{LoadEvent, UserContentInjectedFrames, UserScript, UserScriptInjectionTime, WebView};

fn main() {
    std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");

    let app = Application::builder()
        .application_id("com.ejemplo.holamundo")
        .build();

    app.connect_activate(build_ui);
    app.run();
}

fn build_ui(app: &Application) {
    let window = ApplicationWindow::builder()
        .application(app)
        .title("Hola Mundo con WebKitGTK 6 (Rust)")
        .default_width(800)
        .default_height(600)
        .build();

    let web_view = WebView::new();

    // Habilitar WebKit Inspector (F12 / Ctrl+Shift+I)
    if let Some(settings) = webkit6::prelude::WebViewExt::settings(&web_view) {
        settings.set_enable_developer_extras(true);
    }

    configurar_mensajes(&web_view);
    inyectar_js(&web_view);

    web_view.connect_load_changed(move |view, event| {
        if event == LoadEvent::Finished {
            println!("Página cargada.");
            ejecutar_js(view);

            view.evaluate_javascript(
                "invocarMetodoEnRust();",
                None,
                None,
                None::<&gio::Cancellable>,
                |_| {},
            );
        }
    });

    // Atajo F12 / Ctrl+Shift+I
    let key_controller = EventControllerKey::new();
    key_controller.set_propagation_phase(PropagationPhase::Capture);

    let web_view_clone = web_view.clone();
    key_controller.connect_key_pressed(move |_, keyval, _keycode, state| {
        use gtk::gdk::{Key, ModifierType};

        let open_inspector = keyval == Key::F12
            || (state.contains(ModifierType::CONTROL_MASK)
                && state.contains(ModifierType::SHIFT_MASK)
                && keyval.to_lower() == Key::i);

        if open_inspector {
            if let Some(inspector) = web_view_clone.inspector() {
                inspector.show();
            }
            return true.into();
        }
        false.into()
    });

    window.add_controller(key_controller);

    let html = r#"
        <html>
        <head><title>WebKitGTK</title></head>
        <body>
            <h1>¡Hola Mundo desde Rust!</h1>
            <button onclick="invocarMetodoEnRust()">Invocar Rust</button>
        </body>
        </html>
    "#;

    web_view.load_html(html, None);
    window.set_child(Some(&web_view));
    window.present();
}

fn ejecutar_js(web_view: &WebView) {
    let script = r#"
        function calcular() { return 5 + 3; }
        calcular();
    "#;

    web_view.evaluate_javascript(script, None, None, None::<&gio::Cancellable>, |result| {
        match result {
            Ok(value) => {
                if value.is_number() {
                    println!("Resultado JS (número): {}", value.to_double());
                } else if value.is_string() {
                    println!("Resultado JS (cadena): {}", value.to_str());
                } else {
                    println!("Resultado JS: {}", value.to_str());
                }
            }
            Err(e) => eprintln!("Error al ejecutar JavaScript: {}", e),
        }
    });
}

fn configurar_mensajes(web_view: &WebView) {
    let content_manager = web_view.user_content_manager().unwrap();
    content_manager.register_script_message_handler("invokeMethod", None);

    content_manager.connect_script_message_received(Some("invokeMethod"), |_, js_value| {
        println!(
            "Método Rust invocado desde JavaScript: {}",
            js_value.to_str()
        );
    });
}

fn inyectar_js(web_view: &WebView) {
    let script = r#"
        function invocarMetodoEnRust() {
            window.webkit.messageHandlers.invokeMethod.postMessage('Invocar Rust');
        }
    "#;

    let user_script = UserScript::new(
        script,
        UserContentInjectedFrames::TopFrame,
        UserScriptInjectionTime::Start,
        &[],
        &[],
    );

    let content_manager = web_view.user_content_manager().unwrap();
    content_manager.add_script(&user_script);
}
