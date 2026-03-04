use hello_world_rust::greet;

#[test]
fn test_greet_world() {
    assert_eq!(greet("world"), "Hello, world!");
}

#[test]
fn test_greet_custom_name() {
    assert_eq!(greet("Rust"), "Hello, Rust!");
}
