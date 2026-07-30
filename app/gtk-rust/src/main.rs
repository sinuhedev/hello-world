use gtk4::prelude::*;
use gtk4::{Application, ApplicationWindow};
use webkit6::prelude::*;
use webkit6::{WebInspector, WebView};

fn main() {
    // Create a new GTK application
    let app = Application::builder()
        .application_id("com.example.WebKit6HelloWorld")
        .build();

    // Connect to the "activate" signal to set up the UI
    app.connect_activate(build_ui);

    // Run the application
    app.run();
}

fn build_ui(app: &Application) {
    // Create a new application window
    let window = ApplicationWindow::builder()
        .application(app)
        .title("WebKitGTK Hello World!")
        .default_width(800)
        .default_height(600)
        .build();

    // Create a WebView
    let web_view = WebView::new();

    web_view.load_uri("https://sinuhe.dev");
    window.set_child(Some(&web_view));

    // Show the window
    window.present();
}
