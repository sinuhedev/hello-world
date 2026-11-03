use eframe::egui;

fn main() -> eframe::Result {
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([400.0, 250.0])
            .with_app_id("hola_egui"),
        renderer: eframe::Renderer::Wgpu,
        ..Default::default()
    };

    eframe::run_native(
        "Hola egui",
        options,
        Box::new(|_cc| Ok(Box::<MiApp>::default())),
    )
}

struct MiApp {
    nombre: String,
    contador: u32,
}

impl Default for MiApp {
    fn default() -> Self {
        Self {
            nombre: "mundo".to_owned(),
            contador: 0,
        }
    }
}

impl eframe::App for MiApp {
    fn ui(&mut self, ui: &mut egui::Ui, _frame: &mut eframe::Frame) {
        egui::CentralPanel::default().show(ui, |ui| {
            ui.heading("¡Hola desde egui!");

            ui.horizontal(|ui| {
                ui.label("Tu nombre:");
                ui.text_edit_singleline(&mut self.nombre);
            });

            if ui.button("Saludar").clicked() {
                self.contador += 1;
            }

            ui.label(format!(
                "Hola, {}. Has pulsado {} veces.",
                self.nombre, self.contador
            ));
        });
    }
}
