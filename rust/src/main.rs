// use hello_world_rust::greet;
// use dotenv::dotenv;
use std::env;

fn main() {
    // dotenv().ok();
    // let port = env::var("PORT").unwrap();

    // println!("Hello World!");
    // println!("{}", greet("world"));
    // println!("{}", port)

    let cli_arg = env::var("PORT");

    match cli_arg {
        Ok(val) => println!("PORT: {:?}", val),
        Err(e) => println!("Error PORT: {}", e),
    }
}
